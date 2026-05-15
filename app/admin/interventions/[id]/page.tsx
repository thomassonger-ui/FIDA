import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getIntervention,
  statusLabel,
  statusTone,
  type Intervention,
  type TimelineEvent,
} from "@/lib/demo-interventions";

export const dynamic = "force-dynamic";

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function StatusBadge({
  status,
}: {
  status: Intervention["status"];
}) {
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

function SeverityPill({
  severity,
}: {
  severity: Intervention["severity"];
}) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  const cls =
    severity === "critical"
      ? "bg-red-50 text-red-900 border-red-200"
      : severity === "high"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-amber-50 text-amber-900 border-amber-200";
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {label} severity
    </span>
  );
}

/**
 * Colored dot + icon for each timeline event. Colors match the presentation
 * mockup: amber for risk, blue for assignment, teal/green for outreach &
 * resolution, red for escalation.
 */
function EventDot({ kind }: { kind: TimelineEvent["kind"] }) {
  const palette: Record<
    TimelineEvent["kind"],
    { bg: string; ring: string; icon: string }
  > = {
    risk_flagged: {
      bg: "bg-amber-400",
      ring: "ring-amber-100",
      icon: "!",
    },
    staff_assigned: {
      bg: "bg-blue-500",
      ring: "ring-blue-100",
      icon: "\u2713",
    },
    outreach_attempted: {
      bg: "bg-teal-500",
      ring: "ring-teal-100",
      icon: "\u2709",
    },
    meeting_booked: {
      bg: "bg-teal-500",
      ring: "ring-teal-100",
      icon: "\u25CB",
    },
    plan_drafted: {
      bg: "bg-teal-500",
      ring: "ring-teal-100",
      icon: "\u270E",
    },
    followup_logged: {
      bg: "bg-teal-600",
      ring: "ring-teal-100",
      icon: "\u2713",
    },
    resolved: {
      bg: "bg-green-600",
      ring: "ring-green-100",
      icon: "\u2713",
    },
    escalated: {
      bg: "bg-red-600",
      ring: "ring-red-100",
      icon: "\u2191",
    },
  };
  const p = palette[kind];
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${p.bg} ${p.ring} ring-4 text-white text-[11px] font-medium shrink-0`}
      aria-hidden
    >
      {p.icon}
    </span>
  );
}

function StatSnapshot({
  label,
  value,
  tone = "default",
  sub,
}: {
  label: string;
  value: string;
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
    <div className="flex items-baseline justify-between border-b border-rule last:border-0 py-3">
      <div>
        <div className="eyebrow">{label}</div>
        {sub && <div className="text-[11px] text-subtle mt-0.5">{sub}</div>}
      </div>
      <div className={`font-display text-xl ${color}`}>{value}</div>
    </div>
  );
}

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const iv = await getIntervention(id);
  if (!iv) notFound();

  const isActive = iv.status !== "resolved" && iv.status !== "escalated";
  const attendanceTone =
    iv.attendancePct < 65 ? "risk" : iv.attendancePct < 75 ? "warn" : "default";
  const gradeTone =
    iv.gradePct < 60 ? "risk" : iv.gradePct < 70 ? "warn" : "default";
  const loginTone =
    iv.lastAccessDaysAgo > 14
      ? "risk"
      : iv.lastAccessDaysAgo > 7
      ? "warn"
      : "default";

  const flaggedDay = new Date(iv.flaggedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/interventions"
          className="text-xs text-muted hover:text-teal transition-colors"
        >
          &larr; All interventions
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-2">
        <div>
          <div className="eyebrow mb-3 flex items-center gap-2">
            Live intervention &middot; {flaggedDay}
            {isActive && (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-green-800">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl mb-2">{iv.studentName}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={iv.status} />
            <SeverityPill severity={iv.severity} />
            <span className="text-xs text-muted">
              &middot; {iv.cohortName}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger callout */}
      <div className="mt-6 mb-10 border border-rule bg-paper-subtle rounded-sm p-4 flex items-start gap-3">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-base font-semibold shrink-0"
          aria-hidden
        >
          !
        </span>
        <div>
          <div className="eyebrow mb-1">Why this fired</div>
          <div className="text-sm text-ink">{iv.trigger.label}</div>
          <div className="text-xs text-subtle mt-1">
            Flagged by Atticus on {fmtDateTime(iv.flaggedAt)}.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="eyebrow mb-4">Timeline</div>
          <ol className="relative">
            {/* The vertical rail */}
            <span
              className="absolute left-3 top-2 bottom-2 w-px bg-rule"
              aria-hidden
            />
            {iv.timeline.map((ev) => (
              <li
                key={ev.id}
                className="relative pl-10 pb-6 last:pb-0"
              >
                <span className="absolute left-0 top-0">
                  <EventDot kind={ev.kind} />
                </span>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-sm font-medium text-ink">
                    {ev.title}
                  </div>
                  <div className="text-xs text-subtle whitespace-nowrap font-mono">
                    {fmtTime(ev.at)}
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed mt-1">
                  {ev.detail}
                </p>
                <div className="text-[11px] text-subtle mt-1">
                  {ev.actor} &middot; {fmtDateTime(ev.at)}
                </div>
              </li>
            ))}
          </ol>

          {/* Next action for active interventions */}
          {isActive && (
            <div className="mt-6 border border-dashed border-rule rounded-sm p-4 bg-paper-subtle">
              <div className="eyebrow mb-1">Next</div>
              <div className="text-sm text-ink">
                {iv.status === "open"
                  ? `Awaiting first outreach from ${iv.assignedTo}.`
                  : iv.status === "assigned"
                  ? `${iv.assignedTo} attempting contact. Auto-reminder in 24h if no response logged.`
                  : `Weekly check-in scheduled with ${iv.assignedTo}. Attendance + grades monitored continuously.`}
              </div>
            </div>
          )}
        </div>

        {/* Student snapshot */}
        <aside className="card bg-paper p-5 h-fit">
          <div className="eyebrow mb-3">Student snapshot</div>
          <div className="text-sm text-ink mb-1">{iv.studentName}</div>
          <div className="text-xs text-muted mb-1">{iv.studentEmail}</div>
          <div className="text-xs text-subtle mb-4">{iv.cohortName}</div>

          <div className="border-t border-rule">
            <StatSnapshot
              label="Attendance"
              value={`${iv.attendancePct}%`}
              tone={attendanceTone}
              sub="Threshold 75%"
            />
            <StatSnapshot
              label="Grade"
              value={`${iv.gradePct}%`}
              tone={gradeTone}
              sub="Threshold 70%"
            />
            <StatSnapshot
              label="Last LMS login"
              value={
                iv.lastAccessDaysAgo === 0
                  ? "Today"
                  : `${iv.lastAccessDaysAgo}d ago`
              }
              tone={loginTone}
              sub="Stale > 10 days"
            />
          </div>

          <div className="border-t border-rule pt-4 mt-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Advisor</span>
              <span className="text-ink font-medium">{iv.assignedTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Severity</span>
              <span className="text-ink capitalize">{iv.severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span className="text-ink">{statusLabel(iv.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Opened</span>
              <span className="text-ink">{fmtDateTime(iv.flaggedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Last activity</span>
              <span className="text-ink">
                {fmtDateTime(iv.lastActivityAt)}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-subtle mt-4">
            Intervention ID: <code className="font-mono">{iv.id}</code> &middot;
            demo data
          </p>
        </aside>
      </div>
    </div>
  );
}
