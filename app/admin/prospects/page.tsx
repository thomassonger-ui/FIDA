import Link from "next/link";
import {
  listProspects,
  skipTracedToday,
  sentToday,
  summarize,
  DAILY_SKIP_TRACE_LIMIT,
  DAILY_DRIP_EMAIL_LIMIT,
  MAILING_ADDRESS,
} from "@/lib/prospects-db";
import { ProspectsTable } from "./prospects-table";

export const dynamic = "force-dynamic";

export const metadata = { title: "Prospects · FIDA Admin" };

export default async function ProspectsPage() {
  const prospects = await listProspects({ showRemoved: true }, 1000);
  const [traced, sent] = await Promise.all([skipTracedToday(), sentToday()]);
  const stats = summarize(prospects);

  return (
    <div>
      {/* DAILY SAFETY LIMITS — kept deliberately loud. FIDA is a
          CIE-licensed institution; cold outreach here carries advertising
          exposure a brokerage doesn't have. Small, reviewed batches. */}
      <div className="border-l-4 border-amber-700 bg-amber-50 text-amber-900 px-4 py-3 text-sm mb-6">
        <strong>Daily safety limits:</strong> hold outreach to{" "}
        <strong>{DAILY_SKIP_TRACE_LIMIT} skip traces</strong> and{" "}
        <strong>{DAILY_DRIP_EMAIL_LIMIT} drip emails</strong> per day. Small,
        steady batches protect the FIDA sending domain and keep every contact
        reviewed before a call or an email goes out.{" "}
        <span className="tabular-nums">
          Today: {traced}/{DAILY_SKIP_TRACE_LIMIT} traced ·{" "}
          {sent}/{DAILY_DRIP_EMAIL_LIMIT} sent.
        </span>
      </div>

      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="eyebrow mb-1">Recruiting</div>
          <h1 className="text-3xl md:text-4xl mb-2">Prospects</h1>
          <p className="text-muted max-w-2xl text-sm">
            Prospective students before they apply — imported from a list or
            added by hand. Work the ones worth a conversation, then move them
            onto the{" "}
            <Link
              href="/admin/prospects/pipeline"
              className="text-teal underline"
            >
              pipeline board
            </Link>
            . Anyone who registers is promoted into{" "}
            <Link href="/admin/students" className="text-teal underline">
              Students
            </Link>{" "}
            — this page never becomes a second student list.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/admin/prospects/pipeline" className="btn-outline">
            Pipeline
          </Link>
          <Link href="/admin/prospects/import" className="btn-primary">
            Import CSV
          </Link>
          <a
            href="/api/admin/prospects/export"
            className="btn-outline"
            download
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="card p-5">
          <div className="eyebrow text-muted">In pipeline</div>
          <div className="font-display text-4xl tabular-nums mt-2">
            {stats.inPipeline}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-muted">Follow-ups overdue</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.overdue}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-muted">No touch in 7d</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.stale7d}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-muted">Registered</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.registered}
          </div>
        </div>
      </div>

      <ProspectsTable initial={prospects} skipTracedToday={traced} />

      {/* HOW THIS WORKS — written for Debbie & Ashley. */}
      <details className="mt-8 border border-rule bg-paper-subtle rounded-sm">
        <summary className="cursor-pointer px-5 py-3 font-semibold text-ink select-none">
          How this list works — and the rules we follow
        </summary>
        <div className="px-5 pb-5 pt-1 text-sm text-muted space-y-3 max-w-3xl">
          <p>
            <strong className="text-ink">Prospects are not students.</strong>{" "}
            A prospect is someone who has not applied yet. The moment they pay
            the $150 registration fee, use{" "}
            <em>Move to stage → Registered</em> and the record is promoted into{" "}
            <Link href="/admin/students" className="text-teal underline">
              Students
            </Link>
            . From then on Students is the record — you never keep two.
          </p>
          <p>
            <strong className="text-ink">The funnel.</strong> Identified →
            Nurture → Applied (finished the Atticus application) → Registered
            ($150 paid) → Enrolled (in a Moodle course) → Graduated. Anyone who
            says no goes to <em>Lost</em>, which stays out of the board but
            keeps the history.
          </p>
          <p>
            <strong className="text-ink">Consent is a column, not a
            footnote.</strong> Every row records where the contact came from,
            whether they have unsubscribed, and whether the number is on a
            do-not-call list. Struck-through phone numbers and email addresses
            mean <em>do not contact</em> — the drip skips them automatically.
          </p>
          <p>
            <strong className="text-ink">Every email carries our
            address.</strong> CAN-SPAM requires a real postal address in
            commercial mail, so all drip sends include{" "}
            <span className="text-ink">{MAILING_ADDRESS}</span> plus a working
            one-click unsubscribe.
          </p>
          <p>
            <strong className="text-ink">Why the daily cap?</strong> A new
            sending domain that suddenly emails hundreds of strangers gets
            filtered as spam, and the damage is hard to undo. Ten a day, every
            day, is slower on paper and far faster in practice.
          </p>
        </div>
      </details>

      {/* SETUP — honest about what is not wired yet. */}
      <div className="mt-6 border border-rule rounded-sm bg-paper px-5 py-4 text-sm">
        <div className="eyebrow text-teal-deep mb-2">Still to connect</div>
        <ul className="text-muted space-y-1.5 list-disc pl-5">
          <li>
            <strong className="text-ink">Skip trace account</strong> — the
            button is in place and capped at {DAILY_SKIP_TRACE_LIMIT}/day; it
            turns on once the vendor account and API key are set.
          </li>
          <li>
            <strong className="text-ink">Resend sending domain</strong> — drip
            sends are logged and capped at {DAILY_DRIP_EMAIL_LIMIT}/day, and go
            live once the FIDA domain is verified in Resend.
          </li>
        </ul>
      </div>
    </div>
  );
}
