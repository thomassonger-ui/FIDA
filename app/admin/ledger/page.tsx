/**
 * Financial Ledger page.
 *
 * Per-student tuition, payments, aid, running balance, and R2T4
 * scenarios. This is demo-only \u2014 the real financial ledger should
 * live in a third-party system (Regent, CampusNexus, Populi) with
 * Apex SIS reading summary views.
 */

import {
  demoLedger,
  entryKindLabel,
  entryKindTone,
  type StudentLedger,
  type LedgerEntryKind,
} from "@/lib/demo-ledger";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function currency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return n < 0 ? `(${formatted})` : formatted;
}

function KindBadge({ kind }: { kind: LedgerEntryKind }) {
  const tone = entryKindTone(kind);
  const cls =
    tone === "charge"
      ? "bg-paper-subtle text-ink border-rule"
      : tone === "credit"
      ? "bg-green-50 text-green-900 border-green-200"
      : "bg-red-50 text-red-900 border-red-200";
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {entryKindLabel(kind)}
    </span>
  );
}

function BalanceBadge({ balance }: { balance: number }) {
  if (balance === 0) {
    return (
      <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-green-50 text-green-900 border-green-200">
        Paid in full
      </span>
    );
  }
  if (balance > 2000) {
    return (
      <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-red-50 text-red-900 border-red-200">
        Balance due
      </span>
    );
  }
  return (
    <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-amber-50 text-amber-900 border-amber-200">
      Balance due
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LedgerPage() {
  const ledgers = demoLedger(2); // Medical Assisting cohort

  const totalCharges = ledgers.reduce((s, l) => s + l.tuitionTotal, 0);
  const totalPaid = ledgers.reduce((s, l) => s + l.paidTotal, 0);
  const totalBalance = ledgers.reduce((s, l) => s + l.balance, 0);
  const totalAid = ledgers.reduce((s, l) => s + l.aidAwarded, 0);
  const r2t4Count = ledgers.filter((l) => l.hasR2T4).length;
  const paidInFull = ledgers.filter((l) => l.balance === 0).length;

  // Sort: largest balance first
  const sorted = [...ledgers].sort((a, b) => b.balance - a.balance);

  return (
    <div>
      <div className="eyebrow mb-3">Financial</div>
      <h1 className="text-3xl md:text-4xl mb-2">Student Ledger</h1>
      <p className="text-muted max-w-prose mb-8">
        Per-student financial record: tuition charges, financial aid
        disbursements, payments, and running balance. Includes R2T4
        (Return to Title&nbsp;IV) calculations for withdrawn students.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-2xl text-ink">
            {currency(totalCharges)}
          </div>
          <div className="eyebrow mt-1">Total charges</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-2xl text-green-800">
            {currency(totalAid)}
          </div>
          <div className="eyebrow mt-1">Aid awarded</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-2xl text-green-800">
            {currency(totalPaid)}
          </div>
          <div className="eyebrow mt-1">Total credits</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-2xl text-red-700">
            {currency(totalBalance)}
          </div>
          <div className="eyebrow mt-1">Outstanding</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-2xl text-ink">{paidInFull}</div>
          <div className="eyebrow mt-1">Paid in full</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div
            className={`font-display text-2xl ${
              r2t4Count > 0 ? "text-red-700" : "text-ink"
            }`}
          >
            {r2t4Count}
          </div>
          <div className="eyebrow mt-1">R2T4 returns</div>
        </div>
      </div>

      {/* R2T4 warning */}
      <div className="border-l-2 border-red-300 bg-red-50/60 rounded-r-sm px-4 py-3 mb-10">
        <div className="text-[10px] uppercase tracking-wider text-red-900 font-medium mb-1">
          R2T4 compliance note
        </div>
        <p className="text-sm text-red-950 leading-relaxed">
          Return to Title&nbsp;IV (R2T4) is a federal formula that calculates
          how much financial aid must be returned when a student withdraws
          before completing 60% of a payment period. The math must be exact
          and audit-reproducible &mdash; don&rsquo;t roll your own. Use a
          vetted vendor (Regent, CampusNexus, Populi) for the calculation
          engine and wire Apex SIS on top as the reporting layer.
        </p>
      </div>

      {/* Student ledger cards */}
      <section className="mb-14">
        <div className="eyebrow mb-4">
          Student accounts &middot; Medical Assisting cohort
        </div>
        <div className="space-y-4">
          {sorted.map((ledger) => (
            <StudentLedgerCard key={ledger.student.id} ledger={ledger} />
          ))}
        </div>
      </section>

      {/* Third-party integration callout */}
      <section className="mb-10">
        <div className="eyebrow mb-4">Integration architecture</div>
        <div className="border border-rule bg-paper-subtle rounded-sm p-6">
          <p className="text-sm text-ink leading-relaxed mb-3">
            The financial ledger should live in a dedicated third-party system
            &mdash; not inside Apex SIS. Recommended providers: Regent
            (tuition management + R2T4), CampusNexus (full SIS with ledger),
            or Populi (lightweight alternative with built-in billing).
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Apex SIS reads summary views from the ledger vendor via API:
            balance, payment status, aid status, R2T4 flags. This keeps
            financial data in its own service boundary &mdash; when the
            auditor asks &ldquo;where does financial data live and who can
            change it,&rdquo; the answer is one system, one set of controls,
            not the same app that runs attendance and admissions.
          </p>
        </div>
      </section>

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Tuition charges are generated automatically when a student is
          enrolled in a program term. Financial aid disbursements sync from
          the school&rsquo;s Title&nbsp;IV processor (e.g., COD/SAIG).
          Student payments are recorded by the bursar in the ledger vendor.
          Apex SIS pulls a read-only summary per student on each page load.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          R2T4 calculations are triggered when a student&rsquo;s enrollment
          status changes to Withdrawn. The ledger vendor runs the federal
          formula; Apex SIS surfaces the result and flags the student.
          All financial records are immutable once posted &mdash;
          corrections are entered as new contra entries, never as edits.
        </p>
      </div>

      <p className="text-xs text-subtle">
        Demo data &middot; tuition and aid amounts are illustrative, not
        based on real program costs. R2T4 percentages are simplified.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Student card                                                       */
/* ------------------------------------------------------------------ */

function StudentLedgerCard({ ledger }: { ledger: StudentLedger }) {
  const { student: stu, entries } = ledger;

  return (
    <article className="border border-rule bg-paper rounded-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-ink">{stu.fullname}</h3>
            <BalanceBadge balance={ledger.balance} />
            {ledger.hasR2T4 && (
              <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-red-50 text-red-900 border-red-200">
                R2T4
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-0.5">{stu.email}</div>
          {ledger.withdrawalDate && (
            <div className="text-xs text-red-700 mt-0.5">
              Withdrawn {ledger.withdrawalDate}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted">Balance</div>
          <div
            className={`font-display text-lg ${
              ledger.balance > 0 ? "text-red-700" : "text-green-800"
            }`}
          >
            {currency(ledger.balance)}
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
        <div>
          <span className="text-muted">Charges</span>
          <div className="text-ink font-medium">
            {currency(ledger.tuitionTotal)}
          </div>
        </div>
        <div>
          <span className="text-muted">Aid awarded</span>
          <div className="text-green-800 font-medium">
            {currency(ledger.aidAwarded)}
          </div>
        </div>
        <div>
          <span className="text-muted">Total credits</span>
          <div className="text-green-800 font-medium">
            {currency(ledger.paidTotal)}
          </div>
        </div>
      </div>

      {/* Transaction log */}
      <div className="border-t border-rule pt-3">
        <div className="text-[10px] uppercase tracking-wider text-subtle mb-2">
          Transaction history
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left">
              <th className="pb-1 text-muted font-medium">Date</th>
              <th className="pb-1 text-muted font-medium">Type</th>
              <th className="pb-1 text-muted font-medium">Description</th>
              <th className="pb-1 text-muted font-medium text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const tone = entryKindTone(e.kind);
              const amtClass =
                tone === "credit"
                  ? "text-green-800"
                  : tone === "warn"
                  ? "text-red-700 font-medium"
                  : "text-ink";
              return (
                <tr key={e.id} className="border-t border-rule">
                  <td className="py-1.5 text-muted whitespace-nowrap">
                    {e.date}
                  </td>
                  <td className="py-1.5">
                    <KindBadge kind={e.kind} />
                  </td>
                  <td className="py-1.5 text-muted">{e.description}</td>
                  <td className={`py-1.5 text-right font-mono ${amtClass}`}>
                    {e.amount < 0 ? "\u2212" : ""}
                    {currency(Math.abs(e.amount))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-rule">
              <td colSpan={3} className="py-2 font-medium text-ink">
                Balance
              </td>
              <td
                className={`py-2 text-right font-mono font-medium ${
                  ledger.balance > 0 ? "text-red-700" : "text-green-800"
                }`}
              >
                {currency(ledger.balance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </article>
  );
}
