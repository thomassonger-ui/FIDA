import Link from "next/link";
import {
  allInterventions,
  statusLabel,
  statusTone,
  type Intervention,
  type InterventionStatus,
} from "@/lib/demo-interventions";

export const dynamic = "force-dynamic";

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < hour) return `${Math.max(1, Math.floor(diff / min))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 14 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function SeverityDot({
  severity,
}: {
  severity: Intervention["severity"];
}) {
  const color =
    severity === "critical"
      ? "bg-red-500"
      : severity === "high"
      ? "bg-red-400"
      : "bg-amber-400";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${color} align-middle mr-2`}
      aria-label={severity}
    />
  );
}

function StatusBadge({ status }: { status: InterventionStatus }) {
  const tone = statusTone(status);
  const cls =
    tone === "ok"
      ? "bg-green-50 text-green-900 border-green-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "risk"
      ? "bg-red-50 text-red-900 border-red-200"
      : "bg-paper-subtle text-muted border-rule";
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function Kpi({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "warn" | "risk" | "ok";
}) {
  const color =
    tone === "risk"
      ? "text-red-700"
      : tone === "warn"
      ? "text-amber-700"
      : tone === "ok"
      ? "text-green-800"
      : "text-ink";
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className={`font-display text-3xl ${color}`}>{value}</div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
}

export default async function InterventionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const all = await allInterventions();

  // Filters.
  const validStatuses: InterventionStatus[] = [
    "open",
    "assigned",
    "in_progress",
    "resolved",
    "escalated",
  ];
  const activeFilter =
    statusFilter && validStatuses.includes(statusFilter as InterventionStatus)
      ? (statusFilter as InterventionStatus)
      : null;
  const bucketFilter =
    statusFilter === "active" || statusFilter === "resolved"
      ? statusFilter
      : null;

  const filtered = all.filter((iv) => {
    if (activeFilter) return iv.status === activeFilter;
    if (bucketFilter === "active")
      return iv.status !== "resolved" && iv.status !== "escalated";
    if (bucketFilter === "resolved")
      return iv.status === "resolved" || iv.status === "escalated";
    return true;
  });

  // KPIs across the full set (not the filtered view).
  const kpis = {
    total: all.length,
    open: all.filter((i) => i.status === "open" || i.status === "assigned")
      .length,
    inProgress: all.filter((i) => i.status === "in_progress").length,
    resolved: all.filter((i) => i.status === "resolved").length,
    escalated: all.filter((i) => i.status === "escalated").length,
  };

  const tabs: { key: string | null; label: string; count: number }[] = [
    { key: null, label: "All", count: all.length },
    {
      key: "active",
      label: "Active",
      count: all.filter(
        (i) => i.status !== "resolved" && i.status !== "escalated"
      ).length,
    },
    {
      key: "open",
      label: "Open",
      count: all.filter((i) => i.status === "open").length,
    },
    {
      key: "in_progress",
      label: "In progress",
      count: kpis.inProgress,
    },
    {
      key: "resolved",
      label: "Resolved",
      count: kpis.resolved,
    },
    {
      key: "escalated",
      label: "Escalated",
      count: kpis.escalated,
    },
  ];

  const currentKey = activeFilter ?? bucketFilter ?? null;

  return (
    <div>
      <div className="eyebrow mb-3">Student success</div>
      <h1 className="text-3xl md:text-4xl mb-2">Interventions</h1>
      <p className="text-muted max-w-prose mb-8">
        Every student Atticus has flagged for risk &mdash; auto-assigned to a
        retention advisor, with the full outreach and follow-up history on
        record. The promise is simple: no one falls through the cracks.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <Kpi value={kpis.total} label="Total interventions" />
        <Kpi value={kpis.open} label="Open" tone={kpis.open > 0 ? "risk" : "default"} />
        <Kpi value={kpis.inProgress} label="In progress" tone="warn" />
        <Kpi value={kpis.resolved} label="Resolved" tone="ok" />
        <Kpi
          value={kpis.escalated}
          label="Escalated"
          tone={kpis.escalated > 0 ? "risk" : "default"}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => {
          const active = currentKey === t.key;
          const href = t.key
            ? `/admin/interventions?status=${t.key}`
            : "/admin/interventions";
          return (
            <Link
              key={t.label}
              href={href}
              className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                active
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-rule hover:text-ink"
              }`}
            >
              {t.label}
              <span className="ml-2 opacity-60">{t.count}</span>
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-1">
            Nothing in this view
          </div>
          <p className="text-sm text-muted">
            No interventions match the current filter.
          </p>
        </div>
      ) : (
        <div className="border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Student
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Trigger
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Cohort
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Advisor
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted whitespace-nowrap">
                  Last activity
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((iv) => (
                <tr
                  key={iv.id}
                  className="border-t border-rule hover:bg-paper-subtle transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/interventions/${iv.id}`}
                      className="text-ink hover:text-teal font-medium"
                    >
                      <SeverityDot severity={iv.severity} />
                      {iv.studentName}
                    </Link>
                    <div className="text-xs text-subtle mt-0.5 ml-4">
                      {iv.studentEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <div className="text-xs">{iv.trigger.label}</div>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {iv.cohortName}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {iv.assignedTo}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={iv.status} />
                  </td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {fmtRelative(iv.lastActivityAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-subtle mt-6">
        Severity: <SeverityDot severity="critical" /> critical &middot;{" "}
        <SeverityDot severity="high" /> high &middot;{" "}
        <SeverityDot severity="medium" /> medium &middot; demo data
      </p>

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mt-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Interventions are created automatically when Atticus detects a risk
          signal &mdash; attendance drops below 75%, grade falls below 70%,
          or LMS login goes stale for 10+ days. Atticus writes the flag to
          an{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">
            interventions
          </code>{" "}
          table; the retention advisor is auto-assigned based on cohort
          roster rules. Every outreach attempt, meeting, and status change
          appends to the timeline as an immutable record.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Once SAP is live, intervention timelines double as compliance
          evidence &mdash; proof that the school acted on warning signals.
          That means intervention records must be append-only from day one;
          no silent edits or deletions.
        </p>
      </div>
    </div>
  );
}
