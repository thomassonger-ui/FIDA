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
