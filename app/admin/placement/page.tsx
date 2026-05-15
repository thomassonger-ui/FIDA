/**
 * Job Placement Tracking page.
 *
 * Replaces the static 82% KPI on the Overview dashboard with real
 * (demo) employer records, position titles, start dates, in-field
 * validation, and optional consented wage data.
 *
 * Demo-only. In production, career services staff enter placement
 * data and validate in-field status against accreditor definitions.
 */

import {
  demoPlacements,
  placementStatusLabel,
  placementStatusTone,
  type PlacementStatus,
  type PlacementRecord,
} from "@/lib/demo-placement";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: PlacementStatus }) {
  const tone = placementStatusTone(status);
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
      {placementStatusLabel(status)}
    </span>
  );
}

function Pct({ n, d, label }: { n: number; d: number; label: string }) {
  const pct = d > 0 ? Math.round((n / d) * 100) : 0;
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className="font-display text-3xl text-ink">{pct}%</div>
      <div className="eyebrow mt-1">{label}</div>
      <div className="text-xs text-subtle mt-1">
        {n} / {d}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PlacementPage() {
  const records = demoPlacements(2); // Medical Assisting cohort

  const total = records.length;
  const inField = records.filter((r) => r.status === "placed_in_field").length;
  const outField = records.filter(
    (r) => r.status === "placed_out_of_field"
  ).length;
  const placed = inField + outField;
  const pending = records.filter(
    (r) => r.status === "pending_verification"
  ).length;
  const seeking = records.filter((r) => r.status === "seeking").length;
  const notAvail = records.filter((r) => r.status === "not_available").length;
  const wageCount = records.filter((r) => r.wageConsented && r.hourlyWage).length;
  const avgWage =
    wageCount > 0
      ? (
          records
            .filter((r) => r.wageConsented && r.hourlyWage)
            .reduce((s, r) => s + (r.hourlyWage ?? 0), 0) / wageCount
        ).toFixed(2)
      : null;

  // Sort: seeking first, then pending, out-of-field, in-field, not-available
  const statusOrder: Record<PlacementStatus, number> = {
    seeking: 0,
    pending_verification: 1,
    placed_out_of_field: 2,
    placed_in_field: 3,
    not_available: 4,
  };
  const sorted = [...records].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div>
      <div className="eyebrow mb-3">Outcomes</div>
      <h1 className="text-3xl md:text-4xl mb-2">Job Placement</h1>
      <p className="text-muted max-w-prose mb-8">
        Graduate employment outcomes with employer verification, in-field
        validation, and optional consented wage data. Replaces the static
        82% KPI with tracked, auditable placement records.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <Pct n={placed} d={total} label="Overall placement" />
        <Pct n={inField} d={total} label="In-field rate" />
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-amber-700">{pending}</div>
          <div className="eyebrow mt-1">Pending verification</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div
            className={`font-display text-3xl ${
              seeking > 0 ? "text-red-700" : "text-ink"
            }`}
          >
            {seeking}
          </div>
          <div className="eyebrow mt-1">Still seeking</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-ink">{notAvail}</div>
          <div className="eyebrow mt-1">Not available</div>
        </div>
        {avgWage && (
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="font-display text-3xl text-ink">${avgWage}</div>
            <div className="eyebrow mt-1">Avg hourly wage</div>
            <div className="text-xs text-subtle mt-1">
              {wageCount} consented
            </div>
          </div>
        )}
      </div>

      {/* Accreditor definition warning */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mb-10">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          Accreditor definitions differ
        </div>
        <p className="text-sm text-amber-950 leading-relaxed">
          ACCSC and COE define &ldquo;in-field&rdquo; placement differently.
          ACCSC requires the position to be in the trained occupation or a
          related field; COE uses broader criteria. The in-field
          justification must be documented at data-entry time, not
          retroactively. Pick your accreditor target early and encode its
          definition into the validation workflow.
        </p>
      </div>

      {/* Placement records */}
      <section className="mb-14">
        <div className="eyebrow mb-4">
          Graduate outcomes &middot; Medical Assisting cohort
        </div>
        <div className="space-y-3">
          {sorted.map((rec) => (
            <PlacementCard key={rec.id} record={rec} />
          ))}
        </div>
      </section>

      {/* Wage data note */}
      <section className="mb-10">
        <div className="eyebrow mb-4">Wage data &amp; privacy</div>
        <div className="border border-rule bg-paper-subtle rounded-sm p-6">
          <p className="text-sm text-ink leading-relaxed mb-3">
            Wage data is optional and requires explicit written consent from
            the graduate. It is never required for accreditation reporting
            but strengthens Gainful Employment (GE) disclosures and program
            viability assessments.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            When collected, wage data is stored separately from the placement
            record and surfaced only in aggregate or to authorized staff.
            Graduates may revoke consent at any time; revocation deletes the
            wage record and retains only the consent-revoked flag.
          </p>
        </div>
      </section>

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Career services staff enter placement records when a graduate
          reports employment. The staff member records employer name,
          position title, start date, and whether the role is in-field
          per the accreditor&rsquo;s definition. A verification step
          (employer phone call or offer letter upload) confirms the data
          before it counts toward the published rate.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Placement records are stored in a{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">
            placements
          </code>{" "}
          table with an append-only audit trail. The in-field justification
          is locked once verified &mdash; changes require a new verification
          cycle. Aggregate rates are computed live from verified records,
          never from a static number.
        </p>
      </div>

      <p className="text-xs text-subtle">
        Demo data &middot; employers and wage figures are illustrative.
        In-field definitions follow ACCSC standards unless accreditor
        target is changed.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Placement card                                                     */
/* ------------------------------------------------------------------ */

function PlacementCard({ record: rec }: { record: PlacementRecord }) {
  const hasEmployer = rec.employer && rec.positionTitle;

  return (
    <article className="border border-rule bg-paper rounded-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-ink">
              {rec.studentName}
            </h3>
            <StatusBadge status={rec.status} />
          </div>
          <div className="text-xs text-muted mt-0.5">{rec.studentEmail}</div>
        </div>
        <div className="text-right text-xs text-muted shrink-0">
          <div>Graduated {rec.graduationDate}</div>
        </div>
      </div>

      {hasEmployer && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 text-xs">
          <div>
            <span className="text-muted">Employer</span>
            <div className="text-ink font-medium">{rec.employer}</div>
          </div>
          <div>
            <span className="text-muted">Position</span>
            <div className="text-ink font-medium">{rec.positionTitle}</div>
          </div>
          <div>
            <span className="text-muted">Start date</span>
            <div className="text-ink">{rec.startDate ?? "\u2014"}</div>
          </div>
          <div>
            <span className="text-muted">In-field</span>
            <div
              className={
                rec.isInField === true
                  ? "text-green-800 font-medium"
                  : rec.isInField === false
                  ? "text-amber-700"
                  : "text-subtle"
              }
            >
              {rec.isInField === true
                ? "Yes"
                : rec.isInField === false
                ? "No"
                : "TBD"}
            </div>
          </div>
        </div>
      )}

      {rec.inFieldJustification && (
        <div className="mt-2 text-[11px] text-muted bg-green-50/50 border border-green-100 rounded-sm px-3 py-1.5">
          <span className="font-medium text-green-900">
            In-field justification:
          </span>{" "}
          {rec.inFieldJustification}
        </div>
      )}

      {rec.wageConsented && rec.hourlyWage && (
        <div className="mt-2 text-[11px] text-muted">
          Wage (consented):{" "}
          <span className="text-ink font-medium">
            ${rec.hourlyWage.toFixed(2)}/hr
          </span>
        </div>
      )}

      {rec.notes && (
        <div className="mt-2 text-[11px] text-muted italic">{rec.notes}</div>
      )}

      {rec.verifiedBy && (
        <div className="mt-2 text-[10px] text-subtle">
          Verified by {rec.verifiedBy} on {rec.verifiedOn}
        </div>
      )}
    </article>
  );
}
