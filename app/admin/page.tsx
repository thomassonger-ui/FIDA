import { getDemoCohorts, getOverviewKpis } from "@/lib/demo-cohorts";
import { demoStudents } from "@/lib/demo-students";

export const dynamic = "force-dynamic";

function Kpi({
  value,
  label,
  tone,
  sub,
}: {
  value: string | number;
  label: string;
  tone?: "default" | "warn" | "risk";
  sub?: string;
}) {
  const color =
    tone === "risk"
      ? "text-red-700"
      : tone === "warn"
      ? "text-amber-700"
      : "text-ink";
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className={`font-display text-3xl ${color}`}>{value}</div>
      <div className="eyebrow mt-1">{label}</div>
      {sub && <div className="text-xs text-subtle mt-1">{sub}</div>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [kpis, cohorts] = await Promise.all([
    getOverviewKpis(),
    getDemoCohorts(),
  ]);

  // Pull the top at-risk students across every cohort for the watchlist.
  type WatchRow = {
    courseId: number;
    cohortName: string;
    name: string;
    email: string;
    attendance: number;
    grade: number;
  };
  const watchlist: WatchRow[] = [];
  for (const c of cohorts) {
    const students = demoStudents(c.courseId);
    for (const s of students) {
      if (s.riskTier === "risk") {
        watchlist.push({
          courseId: c.courseId,
          cohortName: c.shortname || c.fullname,
          name: s.fullname,
          email: s.email,
          attendance: s.attendancePct,
          grade: s.gradePct,
        });
      }
    }
  }
  // Worst attendance first.
  watchlist.sort((a, b) => a.attendance - b.attendance);

  return (
    <div>
      <div className="eyebrow mb-3">Overview</div>
      <h1 className="text-3xl md:text-4xl mb-2">Operations dashboard</h1>
      <p className="text-muted max-w-prose mb-10">
        Live view of the FIDA demo school &mdash; enrollment,
        attendance, grades, and compliance rolled up across every active
        cohort.
      </p>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi
          value={kpis.studentsEnrolled}
          label="Students enrolled"
          sub={
            kpis.activeCohorts > 0
              ? `across ${kpis.activeCohorts} cohort${
                  kpis.activeCohorts === 1 ? "" : "s"
                }`
              : undefined
          }
        />
        <Kpi value={kpis.activeCohorts} label="Active cohorts" />
        <Kpi
          value={kpis.placement90Day !== null ? `${kpis.placement90Day}%` : "—"}
          label="Placement (90-day)"
          sub="of recent grads"
        />
        <Kpi
          value={kpis.complianceFlags}
          label="Compliance flags"
          tone={kpis.complianceFlags > 0 ? "warn" : "default"}
          sub="expiring certs + at-risk"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <Kpi
          value={
            kpis.avgAttendance !== null
              ? `${Math.round(kpis.avgAttendance)}%`
              : "—"
          }
          label="Avg attendance"
        />
        <Kpi
          value={
            kpis.avgGrade !== null ? `${Math.round(kpis.avgGrade)}%` : "—"
          }
          label="Avg grade"
        />
        <Kpi
          value={kpis.atRiskCount}
          label="Students at risk"
          tone={kpis.atRiskCount > 0 ? "risk" : "default"}
          sub="attendance <75% or grade <70%"
        />
      </div>

      {/* Cohort breakdown */}
      {cohorts.length > 0 && (
        <section className="card bg-white p-6 mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Active cohorts</div>
              <div className="text-xs text-subtle">
                {cohorts.length} cohort{cohorts.length === 1 ? "" : "s"} currently in session
              </div>
            </div>
          </div>
          <div className="overflow-x-auto border border-rule rounded-sm">
            <table className="w-full text-sm">
              <thead className="bg-paper-subtle">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Cohort
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Started
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Students
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Avg grade
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    At risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.id} className="border-t border-rule">
                    <td className="px-4 py-3">
                      <div className="text-ink font-medium">
                        {c.shortname || c.fullname}
                      </div>
                      {c.shortname && (
                        <div className="text-xs text-subtle">{c.fullname}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(c.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-ink">{c.studentCount}</td>
                    <td className="px-4 py-3 text-ink">
                      {Math.round(c.avgAttendance)}%
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {Math.round(c.avgGrade)}%
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        c.atRiskCount > 0 ? "text-red-700" : "text-muted"
                      }`}
                    >
                      {c.atRiskCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* At-risk watchlist */}
      {watchlist.length > 0 && (
        <section className="card bg-white p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">At-risk watchlist</div>
              <div className="text-xs text-subtle">
                Students flagged for intervention this week
              </div>
            </div>
          </div>
          <div className="overflow-x-auto border border-rule rounded-sm">
            <table className="w-full text-sm">
              <thead className="bg-paper-subtle">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Student
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Cohort
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Grade
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((w) => (
                  <tr
                    key={`${w.courseId}-${w.email}`}
                    className="border-t border-rule"
                  >
                    <td className="px-4 py-3 text-ink">{w.name}</td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {w.cohortName}
                    </td>
                    <td className="px-4 py-3 text-red-700">{w.attendance}%</td>
                    <td className="px-4 py-3 text-red-700">{w.grade}%</td>
                    <td className="px-4 py-3 text-muted">{w.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {cohorts.length === 0 && (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-2">
            No cohorts yet
          </div>
          <p className="text-sm text-muted max-w-md mx-auto">
            Track a Moodle course on the{" "}
            <a
              href="/admin/moodle"
              className="underline underline-offset-2 hover:text-ink"
            >
              Moodle page
            </a>{" "}
            and it&rsquo;ll show up here as a cohort with a full roster, grades,
            attendance, and compliance flags.
          </p>
        </div>
      )}
    </div>
  );
}
