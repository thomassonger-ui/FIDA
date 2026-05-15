import {
  getCourseGrades,
  getCourses,
  getEnrolledUsers,
  getSiteInfo,
  getTrackedCourseIds,
  getUserActivityCompletion,
  isMoodleConfigured,
  type Course,
  type EnrolledUser,
  type SiteInfo,
  type UserGrades,
} from "@/lib/moodle";

export const dynamic = "force-dynamic";

function fmtDate(unix?: number) {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtLastAccess(unix?: number) {
  if (!unix) return "Never";
  const now = Date.now() / 1000;
  const diff = now - unix;
  if (diff < 60 * 60) return "Within the hour";
  if (diff < 60 * 60 * 24) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 60 * 60 * 24 * 30)
    return `${Math.floor(diff / (60 * 60 * 24))}d ago`;
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function roleBadges(roles: EnrolledUser["roles"]) {
  if (!roles || roles.length === 0) {
    return <span className="text-xs text-subtle">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => (
        <span
          key={r.shortname}
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-paper-subtle border border-rule rounded-sm text-muted"
        >
          {r.shortname}
        </span>
      ))}
    </div>
  );
}

function TrackButton({
  course,
  isTracked,
}: {
  course: Course;
  isTracked: boolean;
}) {
  return (
    <form action="/api/admin/moodle/track" method="post" className="inline">
      <input
        type="hidden"
        name="action"
        value={isTracked ? "untrack" : "track"}
      />
      <input type="hidden" name="courseId" value={course.id} />
      <input type="hidden" name="shortname" value={course.shortname} />
      <input type="hidden" name="fullname" value={course.fullname} />
      <button
        type="submit"
        className={
          isTracked
            ? "text-xs px-2.5 py-1 rounded-sm border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
            : "text-xs px-2.5 py-1 rounded-sm border border-rule text-ink hover:bg-paper-subtle transition-colors"
        }
      >
        {isTracked ? "Untrack" : "Track"}
      </button>
    </form>
  );
}

type StudentRow = {
  user: EnrolledUser;
  isStudent: boolean;
  completionPct: number | null; // 0–100, null if tracking unavailable
  completedCount: number;
  totalActivities: number;
  courseGradePct: number | null; // 0–100, null if no grade recorded
  courseGradeLabel: string; // e.g. "87.50", "—"
};

/**
 * Moodle sometimes returns gradeformatted as HTML (e.g. a Font-Awesome
 * icon + number). Strip tags so we don't print raw markup in the table.
 */
function cleanGradeLabel(raw?: string): string {
  if (!raw) return "—";
  const stripped = raw.replace(/<[^>]*>/g, "").trim();
  if (!stripped || stripped === "-") return "—";
  return stripped;
}

function parseCourseGrade(ug: UserGrades | undefined): {
  pct: number | null;
  label: string;
} {
  if (!ug) return { pct: null, label: "—" };
  const courseItem = ug.gradeitems.find((g) => g.itemtype === "course");
  if (!courseItem) return { pct: null, label: "—" };
  const cleanedLabel = cleanGradeLabel(courseItem.gradeformatted);

  // Prefer graderaw (numeric) with grademax for percent; fall back to percentageformatted.
  if (
    typeof courseItem.graderaw === "number" &&
    typeof courseItem.grademax === "number" &&
    courseItem.grademax > 0
  ) {
    const pct = (courseItem.graderaw / courseItem.grademax) * 100;
    return {
      pct,
      label: cleanedLabel !== "—" ? cleanedLabel : pct.toFixed(1),
    };
  }
  // Try percentageformatted ("87.50 %")
  const pctStr = courseItem.percentageformatted?.replace("%", "").trim();
  const parsed = pctStr ? Number.parseFloat(pctStr) : NaN;
  if (!Number.isNaN(parsed)) {
    return { pct: parsed, label: cleanedLabel !== "—" ? cleanedLabel : `${parsed}%` };
  }
  // Graded but can't parse a percent — show the formatted label only.
  if (cleanedLabel !== "—") {
    return { pct: null, label: cleanedLabel };
  }
  return { pct: null, label: "—" };
}

function statusOf(row: StudentRow): {
  label: string;
  tone: "ok" | "warn" | "risk" | "done" | "muted";
} {
  if (!row.isStudent) return { label: "Staff", tone: "muted" };
  if (row.completionPct !== null && row.completionPct >= 100) {
    return { label: "Complete", tone: "done" };
  }
  const gradeRisk = row.courseGradePct !== null && row.courseGradePct < 70;
  const stalled =
    (row.totalActivities > 0 && row.completedCount === 0) ||
    (row.courseGradePct === null && row.completedCount === 0);
  const stale =
    typeof row.user.lastaccess === "number" &&
    Date.now() / 1000 - row.user.lastaccess > 60 * 60 * 24 * 14; // 14d
  if (gradeRisk || (stalled && stale)) return { label: "At risk", tone: "risk" };
  if (stalled) return { label: "Not started", tone: "warn" };
  if (row.completionPct !== null && row.completionPct < 50 && stale) {
    return { label: "Behind", tone: "warn" };
  }
  return { label: "On track", tone: "ok" };
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "risk" | "done" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-green-50 text-green-900 border-green-200"
      : tone === "done"
      ? "bg-teal-50 text-teal-900 border-teal-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "risk"
      ? "bg-red-50 text-red-900 border-red-200"
      : "bg-paper-subtle text-muted border-rule";
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {children}
    </span>
  );
}

function ProgressCell({
  pct,
  done,
  total,
}: {
  pct: number | null;
  done: number;
  total: number;
}) {
  if (pct === null || total === 0) {
    return <span className="text-xs text-subtle">—</span>;
  }
  const width = Math.max(0, Math.min(100, pct));
  const barColor =
    pct >= 80
      ? "bg-green-500"
      : pct >= 40
      ? "bg-amber-400"
      : "bg-red-400";
  return (
    <div className="min-w-[140px]">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs text-ink font-medium">{Math.round(pct)}%</span>
        <span className="text-[10px] text-subtle">
          {done}/{total}
        </span>
      </div>
      <div className="w-full h-1.5 bg-paper-subtle rounded-sm overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function GradeCell({
  pct,
  label,
}: {
  pct: number | null;
  label: string;
}) {
  if (pct === null && label === "—") {
    return <span className="text-xs text-subtle">—</span>;
  }
  const color =
    pct === null
      ? "text-muted"
      : pct >= 90
      ? "text-green-700"
      : pct >= 80
      ? "text-green-600"
      : pct >= 70
      ? "text-amber-700"
      : "text-red-700";
  return (
    <div className="flex flex-col">
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      {pct !== null && (
        <span className="text-[10px] text-subtle">{Math.round(pct)}%</span>
      )}
    </div>
  );
}

async function CourseRoster({ course }: { course: Course }) {
  let users: EnrolledUser[] = [];
  let grades: UserGrades[] = [];
  let rosterError: string | null = null;

  try {
    [users, grades] = await Promise.all([
      getEnrolledUsers(course.id),
      getCourseGrades(course.id).catch(() => [] as UserGrades[]),
    ]);
  } catch (err) {
    rosterError = err instanceof Error ? err.message : "Unknown error";
  }

  // Pull per-user activity completion in parallel (graceful on failure).
  const completions = await Promise.all(
    users.map((u) => getUserActivityCompletion(course.id, u.id))
  );

  const rows: StudentRow[] = users.map((u, i) => {
    const statuses = completions[i] ?? [];
    const tracked = statuses.filter((s) => s.tracking !== 0);
    const completed = tracked.filter((s) => s.state > 0).length;
    const total = tracked.length;
    const completionPct = total > 0 ? (completed / total) * 100 : null;
    const ug = grades.find((g) => g.userid === u.id);
    const { pct: courseGradePct, label: courseGradeLabel } =
      parseCourseGrade(ug);
    const isStudent = (u.roles ?? []).some(
      (r) => r.shortname === "student"
    );
    return {
      user: u,
      isStudent,
      completionPct,
      completedCount: completed,
      totalActivities: total,
      courseGradePct,
      courseGradeLabel,
    };
  });

  // Sort students first, then by grade desc then name.
  rows.sort((a, b) => {
    if (a.isStudent !== b.isStudent) return a.isStudent ? -1 : 1;
    const ag = a.courseGradePct ?? -1;
    const bg = b.courseGradePct ?? -1;
    if (ag !== bg) return bg - ag;
    return a.user.fullname.localeCompare(b.user.fullname);
  });

  // Summary metrics (students only).
  const studentRows = rows.filter((r) => r.isStudent);
  const gradedStudents = studentRows.filter((r) => r.courseGradePct !== null);
  const avgGrade =
    gradedStudents.length > 0
      ? gradedStudents.reduce((s, r) => s + (r.courseGradePct ?? 0), 0) /
        gradedStudents.length
      : null;
  const trackedStudents = studentRows.filter(
    (r) => r.completionPct !== null
  );
  const avgCompletion =
    trackedStudents.length > 0
      ? trackedStudents.reduce((s, r) => s + (r.completionPct ?? 0), 0) /
        trackedStudents.length
      : null;
  const activeThisWeek = studentRows.filter(
    (r) =>
      typeof r.user.lastaccess === "number" &&
      Date.now() / 1000 - r.user.lastaccess < 60 * 60 * 24 * 7
  ).length;
  const atRisk = studentRows.filter(
    (r) => statusOf(r).tone === "risk"
  ).length;

  return (
    <div className="mt-6 border-t border-rule pt-6">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="eyebrow mb-1">Roster</div>
          <div className="text-sm text-muted">
            {users.length} enrolled &middot; {studentRows.length} student
            {studentRows.length === 1 ? "" : "s"} &middot;{" "}
            {rows.length - studentRows.length} staff
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {studentRows.length > 0 && (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-paper-subtle rounded-sm border border-rule">
          <div>
            <dt className="eyebrow mb-1">Avg grade</dt>
            <dd className="text-lg text-ink">
              {avgGrade !== null ? `${Math.round(avgGrade)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Avg completion</dt>
            <dd className="text-lg text-ink">
              {avgCompletion !== null ? `${Math.round(avgCompletion)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Active this week</dt>
            <dd className="text-lg text-ink">
              {activeThisWeek} / {studentRows.length}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">At risk</dt>
            <dd
              className={`text-lg ${
                atRisk > 0 ? "text-red-700" : "text-ink"
              }`}
            >
              {atRisk}
            </dd>
          </div>
        </dl>
      )}

      {rosterError ? (
        <p className="text-sm text-red-900 bg-red-50 border border-red-200 rounded-sm p-3">
          Failed to load roster: {rosterError}
        </p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted">
          No users enrolled yet. Enroll a student in Moodle and refresh.
        </p>
      ) : (
        <div className="overflow-x-auto border border-rule rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Name
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Email
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Progress
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Grade
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Last access
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = statusOf(row);
                return (
                  <tr key={row.user.id} className="border-t border-rule">
                    <td className="px-4 py-3 text-ink">{row.user.fullname}</td>
                    <td className="px-4 py-3 text-muted">
                      {row.user.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.isStudent ? (
                        <ProgressCell
                          pct={row.completionPct}
                          done={row.completedCount}
                          total={row.totalActivities}
                        />
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.isStudent ? (
                        <GradeCell
                          pct={row.courseGradePct}
                          label={row.courseGradeLabel}
                        />
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {fmtLastAccess(row.user.lastaccess)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function MoodlePage({
  searchParams,
}: {
  searchParams: Promise<{ showAll?: string }>;
}) {
  const params = await searchParams;
  const showAll = params.showAll === "1";
  const configured = isMoodleConfigured();

  let site: SiteInfo | null = null;
  let courses: Course[] = [];
  let trackedIds: Set<number> = new Set();
  let error: string | null = null;

  if (configured) {
    try {
      const [s, c, t] = await Promise.all([
        getSiteInfo(),
        getCourses(),
        getTrackedCourseIds(),
      ]);
      site = s;
      courses = c.filter((x) => x.id !== 1 && x.visible !== 0);
      trackedIds = t;
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
    }
  }

  const trackedCourses = courses.filter((c) => trackedIds.has(c.id));
  const otherCourses = courses.filter((c) => !trackedIds.has(c.id));

  return (
    <div>
      <div className="eyebrow mb-3">Integrations</div>
      <h1 className="text-3xl md:text-4xl mb-2">Moodle</h1>
      <p className="text-muted max-w-prose mb-8">
        Server-to-server connection to{" "}
        <code className="text-xs bg-paper-subtle px-1">
          {process.env.MOODLE_URL ?? "colemiddleton.moodlecloud.com"}
        </code>
        . Uses a web-service token stored in Vercel env.
      </p>

      {/* --- Connection status --- */}
      <section className="card bg-white p-6 mb-8">
        <div className="eyebrow mb-3">Connection status</div>
        {!configured ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Not configured
            </div>
            <p className="text-sm text-muted">
              Set <code className="text-xs bg-paper-subtle px-1">MOODLE_URL</code> and{" "}
              <code className="text-xs bg-paper-subtle px-1">MOODLE_TOKEN</code> in Vercel,
              then redeploy.
            </p>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-red-800 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Connection failed
            </div>
            <p className="text-sm text-red-900 bg-red-50 border border-red-200 rounded-sm p-3">
              {error}
            </p>
          </div>
        ) : site ? (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-green-900 bg-green-50 border border-green-200 rounded-sm px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              Connected
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="eyebrow mb-1">Site</dt>
                <dd className="text-ink">{site.sitename}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">Moodle version</dt>
                <dd className="text-ink">{site.release}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">Token user</dt>
                <dd className="text-ink">{site.fullname}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">Tracked courses</dt>
                <dd className="text-ink">
                  {trackedCourses.length} of {courses.length}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      {/* --- Tracked courses (pinned) --- */}
      {configured && !error && trackedCourses.length > 0 && (
        <section className="card bg-white p-6 mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Tracked</div>
              <div className="text-sm text-muted">
                Roster, attendance, and grades flow from these courses into the
                rest of FIDA.
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {trackedCourses.map((c) => (
              <div key={c.id}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="text-xs text-subtle font-mono mb-1">
                      #{c.id} &middot; {c.shortname}
                    </div>
                    <h3 className="text-lg text-ink">{c.fullname}</h3>
                    <div className="text-xs text-muted mt-1">
                      {fmtDate(c.startdate)} &rarr; {fmtDate(c.enddate)}
                    </div>
                  </div>
                  <TrackButton course={c} isTracked={true} />
                </div>
                <CourseRoster course={c} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Available courses (collapsed or expanded) --- */}
      {configured && !error && (
        <section className="card bg-white p-6 mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">
                {trackedCourses.length > 0 ? "Other courses" : "Courses"}
              </div>
              <div className="text-xs text-subtle">
                {otherCourses.length} not tracked
              </div>
            </div>
            {trackedCourses.length > 0 && (
              <a
                href={showAll ? "/admin/moodle" : "/admin/moodle?showAll=1"}
                className="text-xs text-muted hover:text-ink underline underline-offset-2"
              >
                {showAll ? "Hide" : `Show all ${otherCourses.length}`}
              </a>
            )}
          </div>

          {trackedCourses.length === 0 || showAll ? (
            otherCourses.length === 0 ? (
              <p className="text-sm text-muted">
                No other courses. Check that the token&rsquo;s user has access
                to the courses you expect.
              </p>
            ) : (
              <div className="overflow-x-auto border border-rule rounded-sm">
                <table className="w-full text-sm">
                  <thead className="bg-paper-subtle">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                        ID
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                        Short name
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                        Full name
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                        Starts
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                        Ends
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherCourses.map((c) => (
                      <tr key={c.id} className="border-t border-rule">
                        <td className="px-4 py-2 text-muted font-mono text-xs">
                          {c.id}
                        </td>
                        <td className="px-4 py-2 text-ink">{c.shortname}</td>
                        <td className="px-4 py-2 text-ink">{c.fullname}</td>
                        <td className="px-4 py-2 text-muted">
                          {fmtDate(c.startdate)}
                        </td>
                        <td className="px-4 py-2 text-muted">
                          {fmtDate(c.enddate)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <TrackButton course={c} isTracked={false} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <p className="text-sm text-muted">
              {otherCourses.length} courses are hidden.{" "}
              <a
                href="/admin/moodle?showAll=1"
                className="underline underline-offset-2 hover:text-ink"
              >
                Show all
              </a>{" "}
              to track more.
            </p>
          )}
        </section>
      )}

      {/* --- Setup instructions (shown only when not yet connected) --- */}
      {(!configured || error) && (
        <section className="card bg-white p-6">
          <div className="eyebrow mb-3">Setup</div>
          <ol className="list-decimal pl-5 space-y-3 text-sm text-ink">
            <li>
              Log into{" "}
              <code className="text-xs bg-paper-subtle px-1">
                colemiddleton.moodlecloud.com
              </code>{" "}
              as admin.
            </li>
            <li>
              Site administration &rarr; Server &rarr; Web services &rarr;{" "}
              <strong>Overview</strong>. Follow steps 1&ndash;5: enable web
              services, enable the REST protocol, create a service (or use
              &ldquo;Moodle mobile web service&rdquo;), add functions, add a
              user.
            </li>
            <li>
              Site administration &rarr; Plugins &rarr; Web services &rarr;{" "}
              <strong>Manage tokens</strong>. Create a token tied to your admin
              user and that service.
            </li>
            <li>
              In Vercel, add Production env vars{" "}
              <code className="text-xs bg-paper-subtle px-1">MOODLE_URL</code>{" "}
              and{" "}
              <code className="text-xs bg-paper-subtle px-1">MOODLE_TOKEN</code>
              , then redeploy.
            </li>
          </ol>
        </section>
      )}
    </div>
  );
}
