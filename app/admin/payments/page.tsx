/**
 * Payments Ledger — PayPal, QuickBooks and Square in one place.
 *
 * Placeholder for now: the page exists so staff can find it and so the
 * provider connections have a home. Nothing here reads live data yet.
 * When a provider is wired up, its card flips from "Not connected" to a
 * live summary and the ledger table below starts filling.
 */

export const dynamic = "force-static";

type Provider = {
  name: string;
  used_for: string;
  status: "not_connected";
  note: string;
};

const PROVIDERS: Provider[] = [
  {
    name: "QuickBooks",
    used_for: "Diploma program — $150 registration and $600 seat deposit (Buy Buttons)",
    status: "not_connected",
    note: "QuickBooks Payments API · reads paid invoices and Buy Button receipts",
  },
  {
    name: "PayPal",
    used_for: "CE courses — Radiography and EFDA enrollment through Moodle",
    status: "not_connected",
    note: "PayPal Transaction Search API · matches payments to Moodle enrollments",
  },
  {
    name: "Square",
    used_for: "In-person payments at the campus",
    status: "not_connected",
    note: "Square Payments API · card, cash and check taken at the desk",
  },
];

export default function PaymentsLedgerPage() {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <div className="eyebrow mb-3">Financial</div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl">Payments Ledger</h1>
          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-amber-50 text-amber-800 border-amber-200 font-semibold">
            Coming soon
          </span>
        </div>
        <p className="text-muted max-w-2xl">
          Every payment FIDA takes — QuickBooks, PayPal and Square — reconciled in
          one ledger against the student or dentist who paid it. The three
          connections below are the work still to do.
        </p>
      </div>

      {/* PROVIDER CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        {PROVIDERS.map((p) => (
          <div key={p.name} className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-display text-lg text-ink">{p.name}</div>
              <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border bg-paper-subtle text-subtle border-rule">
                Not connected
              </span>
            </div>
            <div className="text-sm text-ink">{p.used_for}</div>
            <div className="text-xs text-subtle mt-auto">{p.note}</div>
          </div>
        ))}
      </div>

      {/* LEDGER (empty state) */}
      <div className="card p-5">
        <div className="eyebrow text-teal-deep mb-2">Ledger</div>
        <div className="grid grid-cols-6 gap-2 text-[10px] uppercase tracking-wider text-subtle border-b border-rule pb-2 mb-3">
          <div>Date</div>
          <div>Payer</div>
          <div>Program</div>
          <div>Provider</div>
          <div className="text-right">Amount</div>
          <div>Status</div>
        </div>
        <div className="py-10 text-center text-sm text-muted">
          No payments yet. Rows appear here once a provider is connected.
        </div>
      </div>

      {/* WHAT IT WILL DO */}
      <div className="card p-5">
        <div className="eyebrow text-teal-deep mb-2">What this page will do</div>
        <ul className="text-sm text-muted space-y-1.5 list-disc pl-5">
          <li>Show every payment from all three providers in one list, newest first.</li>
          <li>Match each payment to a student or prospect by email, and link to their record.</li>
          <li>Mark the $150 registration and $600 deposit as paid automatically instead of a staff click.</li>
          <li>Flag CE payments that have no matching Moodle enrollment, and the reverse.</li>
          <li>Daily and monthly totals per provider, exportable to CSV for the bookkeeper.</li>
        </ul>
      </div>
    </div>
  );
}
