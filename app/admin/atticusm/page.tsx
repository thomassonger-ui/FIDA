import Link from "next/link";
import { CycleInfo, CalendarChecklist } from "./checklist";

export const metadata = {
  title: "Atticus™M · Admin · FIDA",
};

// ---------- TACTIC LIBRARY (server-rendered, static) ----------

type Tactic = {
  tag: string;
  title: string;
  what: string;
  why: string;
  cost: string;
};

const TACTICS: Tactic[] = [
  { tag: "Print", title: "Break-room flyers at dental offices", what: "QR → Atticus™M, posted in staff lounges at offices on Beach/Atlantic/San Jose.", why: "Front-desk and assistant staff already know the work — they just need a path to credential up. Their colleagues are the warm intro.", cost: "$30 printing" },
  { tag: "Print", title: "CNA program break rooms", what: "Same flyer at 6 local CNA / nursing-assistant schools.", why: "CNAs working 12-hr shifts are the highest-converting audience for evening dental programs.", cost: "$15 printing" },
  { tag: "Field", title: "Yard signs at alumni homes", what: "5 grads agree to a 30-day yard sign w/ QR → Atticus™M.", why: "Same-neighborhood signals trust. Every scan is pre-qualified by geography.", cost: "$60 signs" },
  { tag: "Field", title: "Coffee-shop bulletin boards", what: "5 downtown JAX cafes, mini-flyer with tear-off QR tabs.", why: "Career-changers spend their decision-window in third places. Catch them there.", cost: "$10" },
  { tag: "Event", title: "Atticus™M QR table at Riverside Arts Market", what: "Folding table + tabletop banner + iPad showing live Atticus™M demo.", why: "Saturday market is wall-to-wall career-changing 25-40 year olds.", cost: "$0 (FIDA table)" },
  { tag: "Event", title: "Beaches Farmers Market table", what: "Same table, beachside crowd, more retail/hospitality workers.", why: "Restaurant and retail staff are dental-school's #2 source nationally.", cost: "$0" },
  { tag: "Social", title: "Jacksonville Mom Facebook groups", what: "Value-first posts — not promo. Answer career-change questions, link Atticus™M when asked.", why: "Career-changing moms are 38% of dental school enrollments nationally. They live in these groups.", cost: "$0" },
  { tag: "Social", title: "Day-in-the-life Reels", what: "Ashley/Debbie narrate a real day at FIDA. No script.", why: "Authenticity outperforms polish on TikTok/IG for trade education.", cost: "$0" },
  { tag: "Social", title: "Reddit answer strategy", what: "Reply to every dental-career thread in r/Jacksonville, r/dentalassistant, r/CareerChange.", why: "Reddit DMs convert at 4x Facebook DM rates for skilled-trade schools.", cost: "$0" },
  { tag: "Referral", title: "Alumni $250 referral bonus", what: "Pay $250 to any current or former student whose referral enrolls.", why: "CAC ceiling is $250. Far cheaper than paid media — and converts at 3-5x the rate.", cost: "$250 per enroll" },
  { tag: "Referral", title: "Student takeovers", what: "Pass IG to 1 student per week to post 5 Stories about their day.", why: "Prospects trust students more than admissions. Free — students love it.", cost: "$0" },
  { tag: "Atticus™M", title: "Off-shift response", what: "Atticus™M auto-answers inquiries 6pm-7am with context-aware replies about tuition, hours, aid.", why: "84% of dental-school inquiries come outside business hours. Every other school makes them wait.", cost: "Included" },
  { tag: "Atticus™M", title: "Stalled-app nudge sequence", what: "Atticus™M personalizes follow-ups to leads who started but didn't finish.", why: "Average school recovers 4% of stalled apps. Atticus™M should hit 18-25%.", cost: "Included" },
  { tag: "Atticus™M", title: "QR attribution tracking", what: "Each flyer / sign / table has its own QR — Atticus™M tracks source of every chat.", why: "Tells you which $30 flyer drop produced the enroll. Cuts losers, doubles winners.", cost: "Included" },
];

function tagClass(tag: string) {
  switch (tag) {
    case "Print": return "bg-amber-50 text-amber-800 border-amber-200";
    case "Field": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Event": return "bg-teal/10 text-teal-deep border-teal/30";
    case "Social": return "bg-navy-50 text-navy border-navy-100";
    case "Referral": return "bg-rose-50 text-rose-800 border-rose-200";
    case "Atticus™M": return "bg-violet-50 text-violet-800 border-violet-200";
    default: return "bg-paper-subtle text-muted border-rule";
  }
}

function Kpi({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className="font-display text-3xl text-ink">{value}</div>
      <div className="eyebrow mt-1">{label}</div>
      {sub && <div className="text-xs text-subtle mt-1">{sub}</div>}
    </div>
  );
}

// ---------- PAGE ----------

export default function Atticus_M_Page() {
  return (
    <div className="max-w-6xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="eyebrow">Marketing playbook</span>
        <span className="text-xs text-subtle">· 30-day cohort fill · resets the 15th</span>
      </div>
      <h1 className="font-display text-5xl text-ink tracking-tight leading-tight">
        Atticus™M
      </h1>
      <p className="font-display text-xl text-muted mt-2 max-w-3xl leading-snug">
        The AI admissions advisor who actually shows up at 11pm — when your future
        students are finally off shift.
      </p>

      {/* CYCLE BANNER (client) */}
      <CycleInfo cohort="July 6, 2026" />

      {/* KPI ROW */}
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <Kpi value="18" label="Seats to fill" sub="Next cohort — July 6, 2026" />
        <Kpi value="$0" label="Paid media budget" sub="Every play is free or near-zero" />
        <Kpi value="14" label="Guerrilla plays" sub="Each targeted at a specific moment" />
        <Kpi value="0" label="Forms before a real answer" sub="That’s the whole campaign" />
      </div>

      {/* INSIGHT */}
      <section className="mt-10 rounded-sm border border-rule bg-navy-deep text-white p-8 md:p-10">
        <div className="eyebrow text-teal-soft">The insight driving the campaign</div>
        <p className="font-display text-2xl md:text-3xl mt-3 leading-tight">
          A 32-year-old dental front-desk staffer finishes her shift at 6:14pm, picks up
          her kid, opens her phone in the school pickup line, and types{" "}
          <span className="text-teal-soft">&ldquo;dental radiography certification Jacksonville&rdquo;</span> into Google.
        </p>
        <p className="font-display text-xl mt-4 leading-snug text-navy-100">
          Every other school makes her fill a form. We make her talk to{" "}
          <span className="text-teal-soft">Atticus™M</span>.
        </p>
        <p className="mt-5 text-navy-100 max-w-3xl text-sm leading-relaxed">
          She is not going to read a brochure. She is not going to wait for a call back
          Monday at 9am. She has questions right now — about tuition, evening cohorts,
          whether her dental-office hours count, whether she qualifies for aid. Atticus™M
          is the only one who answers. And because she came in through a QR code a
          colleague showed her, a Facebook group post, or a flyer at her CNA program, the
          lead arrived for $0. All signal, no spend.
        </p>
      </section>

      {/* ENGINE */}
      <section className="mt-10">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display text-3xl text-ink">Atticus™M — the acquisition engine</h2>
          <span className="text-xs px-2 py-1 rounded-sm bg-violet-50 text-violet-800 border border-violet-200">à la carte add-on</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="eyebrow">Acquisition strategy</div>
            <p className="text-sm text-ink mt-2">School-specific student acquisition playbook tuned to FIDA’s programs.</p>
          </div>
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="eyebrow">Campaign templates</div>
            <p className="text-sm text-ink mt-2">AI-generated social, email, and SMS templates ready to ship.</p>
          </div>
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="eyebrow">Funnel tracking</div>
            <p className="text-sm text-ink mt-2">Enrollment funnel attribution — where leads drop and why.</p>
          </div>
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="eyebrow">Market analysis</div>
            <p className="text-sm text-ink mt-2">Jacksonville-area dental labor & demographic signals.</p>
          </div>
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="eyebrow">Program messaging</div>
            <p className="text-sm text-ink mt-2">Program-specific copy for RDP-CE and EFDA.</p>
          </div>
          <div className="border border-rule bg-paper p-5 rounded-sm">
            <div className="eyebrow">Seasonal planning</div>
            <p className="text-sm text-ink mt-2">Cohort-by-cohort enrollment calendar for the whole year.</p>
          </div>
        </div>
        <p className="text-xs text-subtle mt-3 italic">
          Atticus™M ties directly to AtticusEnroll conversion data so you see exactly which campaigns are filling seats.
        </p>
      </section>

      {/* 30-DAY CALENDAR (client) */}
      <section className="mt-12">
        <h2 className="font-display text-3xl text-ink">30-day calendar</h2>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          A daily to-do list for one full cohort cycle. Starts the 15th of each month and
          auto-rolls on reset. Tap the checkbox to mark a task done — progress saves to
          this browser.
        </p>

        <div className="mt-6">
          <CalendarChecklist />
        </div>
      </section>

      {/* TACTICS GRID */}
      <section className="mt-12">
        <h2 className="font-display text-3xl text-ink">Guerrilla play library</h2>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          14 distinct zero-budget tactics. Each one targeted at the exact moment a
          working adult considers a career change.
        </p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {TACTICS.map((t) => (
            <div key={t.title} className="border border-rule bg-paper p-5 rounded-sm hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase tracking-eyebrow font-semibold px-2 py-0.5 rounded-sm border ${tagClass(t.tag)}`}>
                  {t.tag}
                </span>
                <span className="text-[11px] text-subtle">{t.cost}</span>
              </div>
              <div className="font-display text-lg text-ink leading-tight">{t.title}</div>
              <p className="text-sm text-muted mt-2">{t.what}</p>
              <p className="text-xs text-subtle italic mt-2">Why: {t.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WEEKLY KPIS */}
      <section className="mt-12">
        <h2 className="font-display text-3xl text-ink">What to measure each Sunday</h2>
        <div className="mt-4 grid md:grid-cols-4 gap-4">
          <Kpi value="QR scans" label="Per channel" sub="Which flyer / sign / table drove chats" />
          <Kpi value="Chats started" label="Atticus™M" sub="Live conversations initiated" />
          <Kpi value="Apps started" label="Funnel" sub="Inquiry → application" />
          <Kpi value="Seats filled" label="North star" sub="Attribution back to source" />
        </div>
      </section>

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-rule flex items-center justify-between text-xs text-subtle">
        <div>
          Atticus™M playbook · v2 · Built for FIDA · Edit at{" "}
          <code className="font-mono">app/admin/atticusm/page.tsx</code>
        </div>
        <Link href="/admin" className="hover:text-ink">&larr; Back to overview</Link>
      </div>
    </div>
  );
}
