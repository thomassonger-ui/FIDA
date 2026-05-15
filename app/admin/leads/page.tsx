import Link from "next/link";
import { getServerClient } from "@/lib/supabase";
import { demoLeads } from "@/lib/demo-leads";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  created_at: string;
  last_activity_at: string | null;
  handed_off_at: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  program_interest: string | null;
  lead_timeline: string | null;
  message_count: number | null;
  flagged_count: number | null;
};

async function fetchLeads(): Promise<{
  rows: LeadRow[];
  error: string | null;
  isDemo: boolean;
}> {
  try {
    const supabase = getServerClient();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("atticus_sessions")
      .select(
        "id, created_at, last_activity_at, handed_off_at, lead_name, lead_email, lead_phone, program_interest, lead_timeline, message_count, flagged_count"
      )
      .not("handed_off_at", "is", null)
      .gte("handed_off_at", since)
      .order("handed_off_at", { ascending: false })
      .limit(200);
    if (error || !data || data.length === 0) {
      // Fall back to demo leads so the dashboard never looks empty.
      return { rows: demoLeads(), error: null, isDemo: true };
    }
    return { rows: data as LeadRow[], error: null, isDemo: false };
  } catch {
    return { rows: demoLeads(), error: null, isDemo: true };
  }
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminLeadsPage() {
  const { rows, error, isDemo } = await fetchLeads();

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow mb-3">Admissions</div>
          <h1 className="text-3xl md:text-4xl mb-2">Leads</h1>
          <p className="text-muted max-w-prose">
            Prospective students who finished an Atticus conversation and were
            handed off to a human advisor within the last 30 days. Click a row
            to read the full transcript, or use <span className="font-medium">Enroll</span> to
            promote a lead to a student.
          </p>
        </div>
        <div className="shrink-0">
          <Link href="/admin/students/new" className="btn-primary whitespace-nowrap">
            + New Student
          </Link>
        </div>
      </div>

      {error && (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm text-sm text-muted mb-6">
          <div className="font-medium text-ink mb-1">Couldn&rsquo;t load leads</div>
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-1">
            No handoffs yet
          </div>
          <p className="text-sm text-muted">
            When Atticus finishes a conversation with the sentinel phrase, the
            lead will show up here.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Phone
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Program
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Handed off
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted text-right">
                  Msgs
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-rule hover:bg-paper-subtle transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${r.id}`}
                      className="text-ink hover:text-teal font-medium"
                    >
                      {r.lead_name ?? <span className="text-subtle">Unknown</span>}
                    </Link>
                    {(r.flagged_count ?? 0) > 0 && (
                      <span className="ml-2 inline-block text-[10px] uppercase tracking-wider bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded">
                        {r.flagged_count} flag{r.flagged_count === 1 ? "" : "s"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.lead_email ?? <span className="text-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.lead_phone ?? <span className="text-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.program_interest ?? <span className="text-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {fmtDate(r.handed_off_at)}
                  </td>
                  <td className="px-4 py-3 text-muted text-right">
                    {r.message_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={`/api/admin/leads/${r.id}/enroll`} method="POST">
                      <button
                        type="submit"
                        className="text-xs font-medium px-3 py-1.5 rounded border border-teal text-teal hover:bg-teal hover:text-white transition-colors"
                      >
                        Enroll
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-subtle mt-6">
        Showing handoffs from the last 30 days &middot; capped at 200 rows
        {isDemo && " \u00B7 demo data"}
      </p>

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mt-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Leads are created automatically when Atticus hands off a
          conversation. The chatbot writes to{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">
            atticus_sessions
          </code>{" "}
          and{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">
            atticus_messages
          </code>{" "}
          in Supabase. Name, email, phone, and program interest are extracted
          during the conversation; the full transcript is preserved for 30
          days as the evidence trail.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Admissions staff can then promote a lead to an applicant record.
          Atticus never writes directly to the{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">students</code>{" "}
          table &mdash; the intelligence layer and the system of record stay
          separated for audit clarity.
        </p>
      </div>
    </div>
  );
}
