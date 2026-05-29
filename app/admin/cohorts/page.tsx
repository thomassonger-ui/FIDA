import { getDemoCohorts } from "@/lib/demo-cohorts";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function CohortsPage() {
  let cohorts: Awaited<ReturnType<typeof getDemoCohorts>> = [];
  let error: string | null = null;
  try {
    cohorts = await getDemoCohorts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  const activeCount = cohorts.length;
  const totalStudents = cohorts.reduce((s, c) => s + c.studentCount, 0);
  const totalAtRisk = cohorts.reduce((s, c) => s + c.atRiskCount, 0);

  return (
    <div>
      <div className="eyebrow mb-3">Cohorts</div>
      <h1 className="text-3xl md:text-4xl mb-2">Active cohorts</h1>
      <p className="text-muted mb-8">
        {activeCount} {activeCount === 1 ? "cohort" : "cohorts"} · {totalStudents}{" "}
        students enrolled
        {totalAtRisk > 0 ? ` · ${totalAtRisk} at risk` : ""} · synced from Moodle
        just now
      </p>

      {error ? (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm text-sm text-muted">
          Unable to load cohorts: {error}
        </div>
      ) : cohorts.length === 0 ? (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm text-sm text-muted">
          No cohorts tracked yet. Add one on the{" "}
          <a href="/admin/moodle" className="text-teal hover:underline">
            Moodle page
          </a>{" "}
          and it&rsquo;ll appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohorts.map((c) => (
            <div
              key={c.id}
              className="border border-rule bg-paper p-5 rounded-sm flex flex-col"
            >
              <div className="eyebrow text-teal-deep mb-1">{c.shortname}</div>
              <div className="font-display text-xl text-ink leading-tight mb-3">
                {c.fullname}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-subtle">
                    Started
                  </div>
                  <div className="text-ink">{fmtDate(c.startDate)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-subtle">
                    Students
                  </div>
                  <div className="text-ink font-semibold">{c.studentCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-subtle">
                    Avg attendance
                  </div>
                  <div className="text-ink">
                    {Math.round(c.avgAttendance)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-subtle">
                    Avg grade
                  </div>
                  <div className="text-ink">{Math.round(c.avgGrade)}%</div>
                </div>
              </div>
              {c.atRiskCount > 0 && (
                <div className="mt-4 pt-3 border-t border-rule text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-full border bg-rose-50 text-rose-800 border-rose-200">
                    {c.atRiskCount} at risk
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
