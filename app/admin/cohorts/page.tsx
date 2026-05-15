import { getDemoCohorts } from "@/lib/supabase";

export default async function CohortsPage() {
  const { data, error } = await getDemoCohorts();

  return (
    <div>
      <div className="eyebrow mb-3">Cohorts</div>
      <h1 className="text-3xl md:text-4xl mb-2">Active cohorts</h1>
      <p className="text-muted mb-8">
        {data.length} {data.length === 1 ? "cohort" : "cohorts"}.
      </p>

      {error ? (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm text-sm text-muted">
          Unable to load cohorts: {error}
        </div>
      ) : data.length === 0 ? (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm text-sm text-muted">
          No active cohorts yet. Create one in your Moodle and tracked cohorts will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((c, i) => {
            const row = c as Record<string, unknown>;
            return (
              <div key={(row.id as string) ?? i} className="border border-rule bg-paper p-5 rounded-sm">
                <div className="eyebrow mb-2">{(row.program as string) ?? "Program"}</div>
                <div className="font-display text-xl mb-1">
                  {(row.name as string) ?? `Cohort ${i + 1}`}
                </div>
                <div className="text-sm text-muted">
                  Starts: {(row.start_date as string) ?? "&mdash;"}
                </div>
                <div className="text-sm text-muted">
                  Ends: {(row.end_date as string) ?? "&mdash;"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
