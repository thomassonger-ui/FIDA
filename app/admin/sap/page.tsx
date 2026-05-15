/**
 * SAP (Satisfactory Academic Progress) engine page.
 *
 * Shows the full SAP dashboard for a tracked cohort:
 *   \u2022 Summary KPIs (good standing, warning, probation, termination counts)
 *   \u2022 Per-student SAP table with GPA, pace %, current status, checkpoint history
 *   \u2022 State machine reference diagram
 *   \u2022 Compliance callouts (evaluation windows, advisor sign-off, appeal process)
 *
 * Demo-only. In a real SoR this would read from a `sap_evaluations` table
 * with append-only transitions and required advisor sign-off at every step.
 */

import {
  demoSapRecords,
  sapStatusLabel,
  sapStatusTone,
  SAP_THRESHOLDS,
  type SapStatus,
  type SapRecord,
} from "@/lib/demo-sap";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SapBadge({ status }: { status: SapStatus }) {
  const tone = sapStatusTone(status);
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
      {sapStatusLabel(status)}
    </span>
  );
}

function ThresholdBar({
  label,
  value,
  threshold,
  unit,
}: {
  label: string;
  value: number;
  threshold: number;
  unit: string;
}) {
  const passing = value >= threshold;
  const pct = Math.min(100, Math.round((value / (threshold * 1.5)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className={passing ? "text-ink" : "text-red-700 font-medium"}>
          {value}
          {unit}
          <span className="text-subtle ml-1">/ {threshold}{unit} min</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-paper-subtle overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            passing ? "bg-green-500" : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SapPage() {
  // Use courseId 2 (Medical Assisting) as the default tracked cohort
  const records = demoSapRecords(2);

  const counts = {
    good: records.filter((r) => r.currentStatus === "good_standing").length,
    warning: records.filter((r) => r.currentStatus === "warning").length,
    probation: records.filter((r) => r.currentStatus === "probation").length,
    appeal: records.filter((r) => r.currentStatus === "appeal_approved").length,
    termination: records.filter((r) => r.currentStatus === "termination").length,
  };

  // Sort: termination first, then probation, warning, appeal, good
  const statusOrder: Record<SapStatus, number> = {
    termination: 0,
    probation: 1,
    warning: 2,
    appeal_approved: 3,
    good_standing: 4,
  };
  const sorted = [...records].sort(
    (a, b) => statusOrder[a.currentStatus] - statusOrder[b.currentStatus]
  );

  return (
    <div>
      <div className="eyebrow mb-3">Academic progress</div>
      <h1 className="text-3xl md:text-4xl mb-2">
        Satisfactory Academic Progress
      </h1>
      <p className="text-muted max-w-prose mb-8">
        SAP evaluation engine for the current term. Every student is evaluated
        at three checkpoints (weeks 4, 8, 12) against federal minimum
        thresholds. State transitions require advisor sign-off and generate
        an immutable audit record.
      </p>

      {/* Thresholds reference */}
      <div className="flex flex-wrap gap-6 mb-8 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted">GPA minimum</span>
          <span className="font-mono text-ink font-medium">
            {SAP_THRESHOLDS.gpaMin.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted">Pace minimum</span>
          <span className="font-mono text-ink font-medium">
            {SAP_THRESHOLDS.paceMin}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted">Max timeframe</span>
          <span className="font-mono text-ink font-medium">
            {SAP_THRESHOLDS.maxTimeframe}%
          </span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-green-800">
            {counts.good}
          </div>
          <div className="eyebrow mt-1">Good standing</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-amber-700">
            {counts.warning}
          </div>
          <div className="eyebrow mt-1">Warning</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-red-700">
            {counts.probation}
          </div>
          <div className="eyebrow mt-1">Probation</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-amber-700">
            {counts.appeal}
          </div>
          <div className="eyebrow mt-1">Appeal approved</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-red-900">
            {counts.termination}
          </div>
          <div className="eyebrow mt-1">Terminated</div>
        </div>
      </div>

      {/* State machine reference */}
      <section className="mb-10">
        <div className="eyebrow mb-4">State machine</div>
        <div className="border border-rule bg-paper-subtle rounded-sm p-6">
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="px-3 py-1.5 rounded-sm border border-green-200 bg-green-50 text-green-900">
              Good standing
            </span>
            <span className="text-muted">&rarr;</span>
            <span className="px-3 py-1.5 rounded-sm border border-amber-200 bg-amber-50 text-amber-900">
              Warning
            </span>
            <span className="text-muted">&rarr;</span>
            <span className="px-3 py-1.5 rounded-sm border border-red-200 bg-red-50 text-red-900">
              Probation
            </span>
            <span className="text-muted">&rarr;</span>
            <span className="px-3 py-1.5 rounded-sm border border-red-300 bg-red-100 text-red-900 font-medium">
              Termination
            </span>
          </div>
          <p className="text-xs text-muted mt-3 max-w-prose">
            Each transition requires advisor sign-off with a timestamped note.
            Students may appeal at the Probation stage; approved appeals reset
            to a conditional Warning with bi-weekly check-ins. Termination
            is absorbing &mdash; financial aid eligibility cannot be restored
            without a formal readmission process.
          </p>
        </div>
      </section>

      {/* Student SAP table */}
      <section className="mb-14">
        <div className="eyebrow mb-4">
          Student evaluations &middot; Medical Assisting cohort
        </div>

        <div className="space-y-4">
          {sorted.map((rec) => (
            <StudentSapCard key={rec.student.id} record={rec} />
          ))}
        </div>
      </section>

      {/* Compliance callouts */}
      <section className="mb-14">
        <div className="eyebrow mb-4">Compliance notes</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-rule bg-paper rounded-sm p-5">
            <h4 className="text-sm text-ink font-medium mb-2">
              Evaluation windows
            </h4>
            <p className="text-sm text-muted leading-relaxed">
              Federal regulations require SAP evaluations at least once per
              payment period. For clock-hour programs, this often means
              every 450 clock hours or every academic term &mdash; whichever
              comes first. The evaluation date and the student&rsquo;s
              metrics at that point must be preserved as audit evidence.
            </p>
          </div>
          <div className="border border-rule bg-paper rounded-sm p-5">
            <h4 className="text-sm text-ink font-medium mb-2">
              Advisor sign-off
            </h4>
            <p className="text-sm text-muted leading-relaxed">
              Every status change (Good &rarr; Warning, Warning &rarr;
              Probation, etc.) must carry a named advisor, a timestamp,
              and a narrative note explaining the decision. This is the
              record auditors review most closely &mdash; unsigned transitions
              are a finding.
            </p>
          </div>
          <div className="border border-rule bg-paper rounded-sm p-5">
            <h4 className="text-sm text-ink font-medium mb-2">
              Appeal process
            </h4>
            <p className="text-sm text-muted leading-relaxed">
              Students placed on Probation must be informed in writing and
              given the right to appeal. The appeal, the committee decision,
              and any conditions must all be documented. An approved appeal
              typically results in an academic plan with specific milestones.
            </p>
          </div>
          <div className="border border-rule bg-paper rounded-sm p-5">
            <h4 className="text-sm text-ink font-medium mb-2">
              Title IV impact
            </h4>
            <p className="text-sm text-muted leading-relaxed">
              Students who fail to maintain SAP lose eligibility for federal
              financial aid. The school must notify the student and the
              Department of Education. R2T4 (Return to Title IV) calculations
              apply if the student withdraws while on a payment period
              &mdash; this is a separate but related compliance requirement.
            </p>
          </div>
        </div>
      </section>

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          SAP evaluations are triggered automatically by the academic
          calendar at each checkpoint date. GPA is calculated from
          Moodle gradebook snapshots; pace is credits-attempted vs.
          credits-completed from the enrollment record. The system
          proposes a status transition, but an advisor must review and
          sign off before it takes effect &mdash; unsigned transitions
          are blocked.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Every evaluation writes to an append-only{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">
            sap_evaluations
          </code>{" "}
          table: student ID, checkpoint date, GPA, pace, prior status,
          new status, advisor name, timestamp, and narrative note. This
          is the record auditors review &mdash; the current page is
          demo-only and generates deterministic data from the demo
          student roster.
        </p>
      </div>

      <p className="text-xs text-subtle">
        SAP thresholds follow 34 CFR 668.34. Update when accreditor
        target (ACCSC / COE / regional) is confirmed.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Student card                                                       */
/* ------------------------------------------------------------------ */

function StudentSapCard({ record }: { record: SapRecord }) {
  const { student: stu, checkpoints } = record;

  return (
    <article className="border border-rule bg-paper rounded-sm p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-ink">{stu.fullname}</h3>
            <SapBadge status={record.currentStatus} />
          </div>
          <div className="text-xs text-muted mt-0.5">{stu.email}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted">Max timeframe</div>
          <div
            className={`font-mono text-sm ${
              record.maxTimeframePct > SAP_THRESHOLDS.maxTimeframe
                ? "text-red-700 font-medium"
                : "text-ink"
            }`}
          >
            {record.maxTimeframePct}%
          </div>
        </div>
      </div>

      {/* GPA + Pace bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ThresholdBar
          label="Cumulative GPA"
          value={record.currentGpa}
          threshold={SAP_THRESHOLDS.gpaMin}
          unit=""
        />
        <ThresholdBar
          label="Pace (completion rate)"
          value={record.currentPacePct}
          threshold={SAP_THRESHOLDS.paceMin}
          unit="%"
        />
      </div>

      {/* Checkpoint history */}
      <div className="border-t border-rule pt-3">
        <div className="text-[10px] uppercase tracking-wider text-subtle mb-2">
          Evaluation history
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              className="bg-paper-subtle border border-rule rounded-sm px-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-ink font-medium">
                  {cp.label}
                </span>
                <SapBadge status={cp.sapStatus} />
              </div>
              <div className="flex gap-4 text-xs text-muted mb-1">
                <span>
                  GPA{" "}
                  <span
                    className={
                      cp.gpa < SAP_THRESHOLDS.gpaMin
                        ? "text-red-700 font-medium"
                        : "text-ink"
                    }
                  >
                    {cp.gpa.toFixed(2)}
                  </span>
                </span>
                <span>
                  Pace{" "}
                  <span
                    className={
                      cp.pacePct < SAP_THRESHOLDS.paceMin
                        ? "text-red-700 font-medium"
                        : "text-ink"
                    }
                  >
                    {cp.pacePct}%
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-muted leading-snug">
                {cp.advisorNote}
              </p>
              <div className="text-[10px] text-subtle mt-1">
                {cp.advisorName} &middot; {cp.evaluatedOn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
