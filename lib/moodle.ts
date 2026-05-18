/**
 * Moodle web-service client.
 *
 * Uses Moodle's REST endpoint: `/webservice/rest/server.php`.
 * Every request is POST form-encoded with:
 *   - wstoken:            the admin-issued token
 *   - wsfunction:         the Moodle function name (e.g., core_course_get_courses)
 *   - moodlewsrestformat: "json"
 *
 * Server-to-server only. The token is pulled from env (MOODLE_URL / MOODLE_TOKEN)
 * and never reaches the browser.
 */

export type MoodleConfig = {
  url: string; // e.g. https://fldentalassisting.moodlecloud.com
  token: string; // admin-issued web service token
};

function getConfig(): MoodleConfig {
  const url = process.env.MOODLE_URL?.replace(/\/+$/, "");
  const token = process.env.MOODLE_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Moodle is not configured. Set MOODLE_URL and MOODLE_TOKEN in Vercel env vars."
    );
  }
  return { url, token };
}

/** Shape returned by Moodle when a request fails. */
type MoodleError = {
  exception?: string;
  errorcode?: string;
  message?: string;
};

/**
 * Call any Moodle web service function.
 * Throws on network failure or Moodle-side exception; returns parsed JSON otherwise.
 */
export async function moodleCall<T>(
  wsfunction: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const { url, token } = getConfig();

  const body = new URLSearchParams();
  body.set("wstoken", token);
  body.set("wsfunction", wsfunction);
  body.set("moodlewsrestformat", "json");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) body.set(k, String(v));
  }

  const target = `${url}/webservice/rest/server.php`;
  let res: Response;
  try {
    res = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      // Don't cache webservice responses at the fetch layer.
      cache: "no-store",
    });
  } catch (err) {
    const cause =
      err instanceof Error
        ? err.cause instanceof Error
          ? err.cause.message
          : err.message
        : String(err);
    throw new Error(
      `Network error calling ${wsfunction} at ${target}: ${cause}`
    );
  }

  if (!res.ok) {
    throw new Error(`Moodle HTTP ${res.status} calling ${wsfunction}`);
  }

  const json = (await res.json()) as T & MoodleError;
  if (json && typeof json === "object" && "exception" in json && json.exception) {
    throw new Error(
      `Moodle error (${json.errorcode ?? "unknown"}): ${json.message ?? "no message"}`
    );
  }
  return json as T;
}

// ----- Typed wrappers for the functions we actually use ------------------

export type SiteInfo = {
  sitename: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  lang: string;
  userid: number;
  siteurl: string;
  release: string;
  version: string;
  functions: { name: string; version: string }[];
};

export async function getSiteInfo(): Promise<SiteInfo> {
  return moodleCall<SiteInfo>("core_webservice_get_site_info");
}

export type Course = {
  id: number;
  shortname: string;
  fullname: string;
  displayname?: string;
  categoryid?: number;
  summary?: string;
  format?: string;
  visible?: number;
  startdate?: number;
  enddate?: number;
};

export async function getCourses(): Promise<Course[]> {
  return moodleCall<Course[]>("core_course_get_courses");
}

export type EnrolledUser = {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email?: string;
  roles: { roleid: number; name: string; shortname: string }[];
  lastaccess?: number;
  groups?: { id: number; name: string }[];
};

export async function getEnrolledUsers(courseId: number): Promise<EnrolledUser[]> {
  return moodleCall<EnrolledUser[]>("core_enrol_get_enrolled_users", {
    courseid: courseId,
  });
}

// ----- Grades + completion ------------------------------------------------

export type GradeItem = {
  id?: number;
  itemname?: string;
  itemtype?: string; // "course" for the course total, "mod" for activity grades
  itemmodule?: string;
  gradeformatted?: string; // "87.50" or "-" or "Not graded"
  gradedategraded?: number;
  grademin?: number;
  grademax?: number;
  graderaw?: number | null;
  percentageformatted?: string; // "87.50 %"
};

export type UserGrades = {
  courseid: number;
  userid: number;
  userfullname?: string;
  gradeitems: GradeItem[];
};

export type GradesResponse = {
  usergrades: UserGrades[];
};

/**
 * Returns grade items for every enrolled user in the course (userid=0 means all).
 * Each UserGrades entry includes a "course" itemtype row that is the overall grade.
 */
export async function getCourseGrades(courseId: number): Promise<UserGrades[]> {
  const res = await moodleCall<GradesResponse>(
    "gradereport_user_get_grade_items",
    { courseid: courseId, userid: 0 }
  );
  return res.usergrades ?? [];
}

export type ActivityCompletionStatus = {
  cmid: number;
  modname?: string;
  instance?: number;
  state: number; // 0=incomplete, 1=complete, 2=complete-pass, 3=complete-fail
  timecompleted?: number;
  tracking?: number;
};

export type ActivityCompletionResponse = {
  statuses: ActivityCompletionStatus[];
};

/**
 * Returns per-activity completion state for one user in the course.
 * Safe to call in parallel for each enrolled user.
 */
export async function getUserActivityCompletion(
  courseId: number,
  userId: number
): Promise<ActivityCompletionStatus[]> {
  try {
    const res = await moodleCall<ActivityCompletionResponse>(
      "core_completion_get_activities_completion_status",
      { courseid: courseId, userid: userId }
    );
    return res.statuses ?? [];
  } catch {
    return [];
  }
}

/** True when both env vars are present — cheap synchronous check for the UI. */
export function isMoodleConfigured(): boolean {
  return Boolean(process.env.MOODLE_URL && process.env.MOODLE_TOKEN);
}

// ----- Tracked-course helpers (Supabase-backed) --------------------------

import { getServerClient } from "@/lib/supabase";

export type TrackedCourse = {
  course_id: number;
  shortname: string | null;
  fullname: string | null;
  tracked_at: string;
};

/** IDs of courses the admin has chosen to "track" in FIDA. */
export async function getTrackedCourseIds(): Promise<Set<number>> {
  try {
    const sb = getServerClient();
    const { data, error } = await sb
      .from("moodle_tracked_courses")
      .select("course_id");
    if (error) return new Set();
    return new Set((data ?? []).map((r) => Number(r.course_id)));
  } catch {
    return new Set();
  }
}

export async function getTrackedCourses(): Promise<TrackedCourse[]> {
  try {
    const sb = getServerClient();
    const { data, error } = await sb
      .from("moodle_tracked_courses")
      .select("*")
      .order("tracked_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as TrackedCourse[];
  } catch {
    return [];
  }
}

export async function trackCourse(c: {
  id: number;
  shortname?: string;
  fullname?: string;
}): Promise<void> {
  const sb = getServerClient();
  const { error } = await sb.from("moodle_tracked_courses").upsert(
    {
      course_id: c.id,
      shortname: c.shortname ?? null,
      fullname: c.fullname ?? null,
      tracked_at: new Date().toISOString(),
    },
    { onConflict: "course_id" }
  );
  if (error) throw new Error(`Failed to track course: ${error.message}`);
}

export async function untrackCourse(courseId: number): Promise<void> {
  const sb = getServerClient();
  const { error } = await sb
    .from("moodle_tracked_courses")
    .delete()
    .eq("course_id", courseId);
  if (error) throw new Error(`Failed to untrack course: ${error.message}`);
}

// ----- Attendance (mod_attendance plugin) --------------------------------
// Requires the third-party `mod_attendance` plugin to be installed on the
// Moodle site and its functions added to the web-service. All helpers return
// empty arrays / null on failure (never throw) so pages render even when the
// plugin is missing — the UI then shows a setup card.

export type AttendanceSession = {
  id: number;
  attendanceid: number;
  groupid?: number;
  sessdate: number; // unix seconds
  duration?: number;
  lasttaken?: number;
  lasttakenby?: number;
  timemodified?: number;
  description?: string;
  studentscanmark?: number;
  statusset?: number;
};

export type AttendanceLogEntry = {
  id: number;
  studentid: number;
  statusid: number;
  statusset?: string;
  timetaken?: number;
  takenby?: number;
  remarks?: string;
};

export type AttendanceStatus = {
  id: number;
  attendanceid?: number;
  acronym: string; // "P", "A", "L", "E"
  description: string; // "Present", "Absent", "Late", "Excused"
  grade?: number;
  setnumber?: number;
};

export type AttendanceSessionDetail = {
  session: AttendanceSession;
  statuses: AttendanceStatus[];
  log: AttendanceLogEntry[];
};

/** True if any mod_attendance_* function is exposed by the token's service. */
export async function attendancePluginAvailable(): Promise<boolean> {
  try {
    const info = await getSiteInfo();
    return (info.functions ?? []).some((f) =>
      f.name.startsWith("mod_attendance_")
    );
  } catch {
    return false;
  }
}

export type CourseModule = {
  id: number;
  name: string;
  modname: string;
  instance: number;
};

type CourseSection = {
  id: number;
  name: string;
  modules?: CourseModule[];
};

/**
 * Find attendance-plugin instances inside a course by scanning its modules.
 */
export async function getCourseAttendanceInstances(
  courseId: number
): Promise<{ cmid: number; instance: number; name: string }[]> {
  try {
    const sections = await moodleCall<CourseSection[]>(
      "core_course_get_contents",
      { courseid: courseId }
    );
    const out: { cmid: number; instance: number; name: string }[] = [];
    for (const s of sections ?? []) {
      for (const m of s.modules ?? []) {
        if (m.modname === "attendance") {
          out.push({ cmid: m.id, instance: m.instance, name: m.name });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** All sessions for one attendance instance. */
export async function getAttendanceSessions(
  attendanceId: number
): Promise<AttendanceSession[]> {
  try {
    const res = await moodleCall<AttendanceSession[]>(
      "mod_attendance_get_sessions",
      { attendanceid: attendanceId }
    );
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/**
 * Detail for one session — who was marked which status. Moodle returns an
 * object with session, statuses, and users[] (each with a log[]). We flatten
 * users.log into a single array with studentid populated.
 */
export async function getAttendanceSession(
  sessionId: number
): Promise<AttendanceSessionDetail | null> {
  try {
    const res = await moodleCall<{
      session: AttendanceSession;
      statuses: AttendanceStatus[];
      users?: { id: number; log?: AttendanceLogEntry[] }[];
    }>("mod_attendance_get_session", { sessionid: sessionId });
    const log: AttendanceLogEntry[] = [];
    for (const u of res.users ?? []) {
      for (const entry of u.log ?? []) {
        log.push({ ...entry, studentid: u.id });
      }
    }
    return { session: res.session, statuses: res.statuses ?? [], log };
  } catch {
    return null;
  }
}

// ============================================================
// Cohort aggregation — live Moodle, role-aware classification
// Appended 2026-05-18. Replaces the demo-data dashboard stub.
// ============================================================

/** Moodle role shortnames that mean "staff", not "student". */
const STAFF_ROLE_SHORTNAMES = new Set([
  "manager",
  "editingteacher",
  "teacher",
  "coursecreator",
]);

/**
 * Classify an enrolled user as "student" or "staff" based on their role set.
 * Mixed roles like "Student + Manager" are treated as staff.
 */
export function classifyEnrollee(user: EnrolledUser): "student" | "staff" {
  return (user.roles ?? []).some((r) =>
    STAFF_ROLE_SHORTNAMES.has(r.shortname)
  )
    ? "staff"
    : "student";
}

/**
 * Per-user attendance % for one course, derived from every mod_attendance
 * instance + session in the course. Returns Map<userid, percent>.
 * Empty map if plugin unavailable, no instances, or no sessions logged.
 * Counts a session as "attended" when status acronym is P (present) or L (late).
 */
export async function getCohortAttendance(
  courseId: number
): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  try {
    const instances = await getCourseAttendanceInstances(courseId);
    if (instances.length === 0) return result;

    const totals = new Map<number, { attended: number; total: number }>();

    for (const inst of instances) {
      const sessions = await getAttendanceSessions(inst.instance);
      for (const sess of sessions) {
        const detail = await getAttendanceSession(sess.id);
        if (!detail) continue;
        const statusAcronym = new Map<number, string>();
        for (const st of detail.statuses ?? []) {
          statusAcronym.set(st.id, (st.acronym || "").toUpperCase());
        }
        for (const log of detail.log ?? []) {
          const acr = statusAcronym.get(log.statusid) ?? "";
          const attended = acr === "P" || acr === "L";
          const t = totals.get(log.studentid) ?? { attended: 0, total: 0 };
          t.total += 1;
          if (attended) t.attended += 1;
          totals.set(log.studentid, t);
        }
      }
    }

    for (const [uid, t] of totals.entries()) {
      result.set(uid, t.total > 0 ? (t.attended / t.total) * 100 : 100);
    }
  } catch {
    // mod_attendance unavailable or transient failure — return empty
  }
  return result;
}

export type CohortStudent = {
  id: number;
  fullname: string;
  firstname: string;
  lastname: string;
  email: string;
  attendancePct: number;   // 0–100; defaults to 100 if no attendance data
  gradePct: number;        // 0–100; 0 if not graded yet
  completionPct: number;   // 0–100 fraction of activities marked complete
  lastaccess: number;      // unix seconds
  riskTier: "ok" | "watch" | "risk";
};

/**
 * Live Moodle roster for one course, filtered to pure students.
 * Anyone with a staff role (manager/teacher/editingteacher/coursecreator) is
 * excluded — they can still appear in Moodle's enrollment list, but they
 * don't count toward "students enrolled" or at-risk metrics.
 *
 * Risk tiers (FIDA spec, 2026-05-18):
 *   risk  = completion < 75% OR grade < 70%
 *   watch = completion 75–89% OR grade 72–84%
 *   ok    = everything else
 */
export async function getCohortStudents(
  courseId: number
): Promise<CohortStudent[]> {
  const [enrolled, gradesList, attendance] = await Promise.all([
    getEnrolledUsers(courseId),
    getCourseGrades(courseId),
    getCohortAttendance(courseId),
  ]);

  const students = enrolled.filter((u) => classifyEnrollee(u) === "student");

  const gradeByUser = new Map<number, number>();
  for (const ug of gradesList) {
    const courseGrade = ug.gradeitems?.find((gi) => gi.itemtype === "course");
    if (courseGrade?.percentageformatted) {
      const pct = parseFloat(courseGrade.percentageformatted);
      if (!isNaN(pct)) gradeByUser.set(ug.userid, pct);
    }
  }

  const completions = await Promise.all(
    students.map((u) => getUserActivityCompletion(courseId, u.id))
  );

  return students.map((u, i) => {
    const cs = completions[i];
    const completedCount = cs.filter((c) => c.state === 1 || c.state === 2).length;
    const completionPct = cs.length > 0 ? (completedCount / cs.length) * 100 : 0;
    const gradePct = gradeByUser.get(u.id) ?? 0;
    const attendancePct = attendance.get(u.id) ?? 100;

    let riskTier: "ok" | "watch" | "risk";
    if (completionPct < 75 || gradePct < 70) {
      riskTier = "risk";
    } else if (
      (completionPct >= 75 && completionPct < 90) ||
      (gradePct >= 72 && gradePct < 85)
    ) {
      riskTier = "watch";
    } else {
      riskTier = "ok";
    }

    return {
      id: u.id,
      fullname: u.fullname,
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email ?? "",
      attendancePct: Math.round(attendancePct),
      gradePct: Math.round(gradePct),
      completionPct: Math.round(completionPct),
      lastaccess: u.lastaccess ?? 0,
      riskTier,
    };
  });
}
