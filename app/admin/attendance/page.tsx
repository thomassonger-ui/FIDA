import {
  getTrackedCourses,
  isMoodleConfigured,
  type TrackedCourse,
} from "@/lib/moodle";
import {
  breakdownFromPct,
  demoStudents,
  type DemoStudent,
} from "@/lib/demo-students";

export const dynamic = "force-dynamic";

// How many past sessions to simulate for each tracked course.
const SIMULATED_SESSIONS = 16;
const DAYS_BETWEEN_SESSIONS = 7; // one session/week (class met weekly)

function fmtDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtShortDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fmtLastAccess(unix: number) {
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

function ProgressBar({ pct }: { pct: number }) {
  const width = Math.max(0, Math.min(100, pct));
  const bar =
    pct >= 90
      ? "bg-green-500"
      : pct >= 75
      ? "bg-amber-400"
      : "bg-red-400";
  return (
    <div className="min-w-[120px]">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-ink font-medium">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-paper-subtle rounded-sm overflow-hidden">
        <div
          className={`h-full ${bar} transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "risk";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-green-50 text-green-900 border-green-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : "bg-red-50 text-red-900 border-red-200";
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {children}
    </span>
  );
}

function toneForTier(tier: DemoStudent["riskTier"]) {
  return tier === "ok" ? "ok" : tier === "watch" ? "warn" : "risk";
}

function labelForTier(tier: DemoStudent["riskTier"]) {
  return tier === "ok" ? "On track" : tier === "watch" ? "Watch" : "At risk";
}

type SessionRow = {
  id: number;
  date: number; // unix seconds
  present: number;
  late: number;
  absent: number;
  total: number;
};

/**
 * Simulate `SIMULATED_SESSIONS` weekly sessions ending today. For each
 * session, compute the class-wide attendance using each student's overall
 * attendance % as a prior (deterministic per sessionIdx+courseId).
 */
function simulateSessions(
  courseId: number,
  students: DemoStudent[]
): SessionRow[] {
  const now = Math.floor(Date.now() / 1000);
  const day = 60 * 60 * 24;
  const rows: SessionRow[] = [];
  for (let i = 0; i < SIMULATED_SESSIONS; i++) {
    // oldest session first → most recent last
    const date = now - (SIMULATED_SESSIONS - 1 - i) * DAYS_BETWEEN_SESSIONS * day;
    let present = 0;
    let late = 0;
    let absent = 0;
    for (const s of students) {
      // Deterministic per-session probability: student's avg ± jitter.
      // We don't use Math.random so numbers stay stable across refreshes.
      const seed = Math.sin(courseId * 31 + i * 7 + s.id) * 10000;
      const jitter = (seed - Math.floor(seed)) * 20 - 10; // ±10 pts
      const p = Math.max(0, Math.min(100, s.attendancePct + jitter));
      if (p < 50) {
        absent += 1;
      } else if (p < 80) {
        // ~10% of attended marked as late
        if ((Math.abs(seed) * 1000) % 10 < 1) late += 1;
        else present += 1;
      } else {
        present += 1;
      }
    }
    rows.push({
      id: courseId * 1000 + i,
      date,
      present,
      late,
      absent,
      total: students.length,
    });
  }
  return rows;
}

async function TrackedCourseAttendance({
  course,
}: {
  course: TrackedCourse;
}) {
  const students = await demoStudents(course.course_id);
  const sessions = simulateSessions(course.course_id, students);

  // Per-student totals from overall attendance %.
  const rows = students
    .map((s) => {
      const bd = breakdownFromPct(s.attendancePct, SIMULATED_SESSIONS);
      return {
        student: s,
        ...bd,
        totalMarked: bd.present + bd.late + bd.excused + bd.absent,
      };
    })
    // Worst first so at-risk surfaces immediately.
    .sort((a, b) => a.student.attendancePct - b.student.attendancePct);

  const avgPct =
    students.reduce((s, r) => s + r.attendancePct, 0) / students.length;
  const atRisk = students.filter((s) => s.attendancePct < 75).length;
  const onTrack = students.filter((s) => s.attendancePct >= 90).length;

  const recent = sessions.slice().sort((a, b) => b.date - a.date);
  const lastSession = recent[0];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs text-subtle font-mono mb-1">
            #{course.course_id} &middot; {course.shortname}
          </div>
          <h3 className="text-lg text-ink">{course.fullname}</h3>
          <div className="text-xs text-muted mt-1">
            {students.length} students &middot; {SIMULATED_SESSIONS} sessions
            {lastSession && ` · last session ${fmtDate(lastSession.date)}`}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-paper-subtle rounded-sm border border-rule">
        <div>
          <dt className="eyebrow mb-1">Avg attendance</dt>
          <dd className="text-lg text-ink">{Math.round(avgPct)}%</dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">Sessions held</dt>
          <dd className="text-lg text-ink">{SIMULATED_SESSIONS}</dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">On track (&ge;90%)</dt>
          <dd className="text-lg text-ink">
            {onTrack} / {students.length}
          </dd>
        </div>
        <div>
          <dt className="eyebrow mb-1">At risk (&lt;75%)</dt>
          <dd
            className={`text-lg ${atRisk > 0 ? "text-red-700" : "text-ink"}`}
          >
            {atRisk}
          </dd>
        </div>
      </dl>

      {/* Per-student table */}
      <div className="overflow-x-auto border border-rule rounded-sm mb-6">
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
                Attendance
              </th>
              <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                Present
              </th>
              <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                Late
              </th>
              <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                Absent
              </th>
              <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                Last active
              </th>
              <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student.id} className="border-t border-rule">
                <td className="px-4 py-3 text-ink">{r.student.fullname}</td>
                <td className="px-4 py-3 text-muted">{r.student.email}</td>
                <td className="px-4 py-3">
                  <ProgressBar pct={r.student.attendancePct} />
                </td>
                <td className="px-4 py-3 text-ink">{r.present}</td>
                <td className="px-4 py-3 text-amber-700">{r.late}</td>
                <td
                  className={`px-4 py-3 ${
                    r.absent > 0 ? "text-red-700" : "text-muted"
                  }`}
                >
                  {r.absent}
                </td>
                <td className="px-4 py-3 text-muted text-xs">
                  {fmtLastAccess(r.student.lastaccess)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={toneForTier(r.student.riskTier)}>
                    {labelForTier(r.student.riskTier)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="eyebrow mb-2">Recent sessions</div>
        <div className="overflow-x-auto border border-rule rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Date
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Present
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Late
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Absent
                </th>
                <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.slice(0, 10).map((s) => {
                const rate = ((s.present + s.late) / s.total) * 100;
                return (
                  <tr key={s.id} className="border-t border-rule">
                    <td className="px-4 py-2 text-ink">
                      {fmtShortDate(s.date)}
                    </td>
                    <td className="px-4 py-2 text-ink">{s.present}</td>
                    <td className="px-4 py-2 text-amber-700">{s.late}</td>
                    <td
                      className={`px-4 py-2 ${
                        s.absent > 0 ? "text-red-700" : "text-muted"
                      }`}
                    >
                      {s.absent}
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {Math.round(rate)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default async function AttendancePage() {
  const configured = isMoodleConfigured();
  const trackedCourses = configured ? await getTrackedCourses() : [];

  return (
    <div>
      <div className="eyebrow mb-3">Attendance</div>
      <h1 className="text-3xl md:text-4xl mb-2">Attendance</h1>
      <p className="text-muted max-w-prose mb-2">
        Session-level attendance for every tracked course. Instructors take
        attendance in Moodle; school leadership sees it here &mdash; flagged
        early, not at the end of term.
      </p>
      <p className="text-xs text-subtle mb-8">
        Demo data: 25 students per course with a realistic risk distribution
        (15 on-track, 7 watch, 3 at-risk) across 16 weekly sessions.
      </p>

      {!configured ? (
        <section className="card bg-white p-6">
          <div className="eyebrow mb-2">Moodle not connected</div>
          <p className="text-sm text-muted">
            Connect Moodle first on the{" "}
            <a
              href="/admin/moodle"
              className="underline underline-offset-2 hover:text-ink"
            >
              Moodle page
            </a>
            , then track a course.
          </p>
        </section>
      ) : trackedCourses.length === 0 ? (
        <section className="card bg-white p-6">
          <div className="eyebrow mb-2">No tracked courses</div>
          <p className="text-sm text-muted">
            Track a course on the{" "}
            <a
              href="/admin/moodle"
              className="underline underline-offset-2 hover:text-ink"
            >
              Moodle page
            </a>{" "}
            to see attendance here.
          </p>
        </section>
      ) : (
        <section className="card bg-white p-6">
          <div className="space-y-12">
            {trackedCourses.map((c) => (
              <TrackedCourseAttendance key={c.course_id} course={c} />
            ))}
          </div>
        </section>
      )}

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mt-8">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Attendance is recorded by instructors inside Moodle (the LMS). FIDA
          SIS pulls daily snapshots from Moodle&rsquo;s attendance plugin via
          API and stores its own audit-grade copy. The instructor marks
          present, late, or absent per student per session &mdash; the SIS
          never fabricates or modifies attendance records.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          For clock-hour programs (common in allied health), the system must
          also track cumulative clock hours, not just session counts. This
          determines both SAP pace and Title&nbsp;IV eligibility.
          The attendance model (clock-hour vs. credit-hour) should be
          configured per program before any real data enters the system.
        </p>
      </div>
    </div>
  );
}
