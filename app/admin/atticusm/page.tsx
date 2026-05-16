import Link from "next/link";

export const metadata = {
  title: "AtticusM · Admin · FIDA",
};

// ---------- CYCLE (edit monthly when you reset the playbook) ----------
const CYCLE = {
  start: "May 16, 2026",
  end: "June 14, 2026",
  resetOn: "June 15, 2026",
  cohort: "July 6, 2026",
};

// ---------- CONTENT MODEL ----------

type Day = {
  day: number;
  date: string;        // "Mon Jun 1"
  theme: string;       // "Local awareness"
  task: string;        // primary tactic
  channel: string;     // FB Group / Flyer / etc
  owner: string;       // Who
  asset: string;       // What to make
  kpi: string;         // What to track
};

const CALENDAR: Day[] = [
  // ---- WEEK 1 — FOUNDATION ----
  { day: 1, date: "Mon Jun 1", theme: "Local awareness", task: "Print 250 break-room flyers w/ QR → AtticusM", channel: "Print + QR", owner: "Admissions", asset: "8.5x11 flyer (PDF)", kpi: "QR scans" },
  { day: 2, date: "Tue Jun 2", theme: "Local awareness", task: "Drop flyers at 10 dental offices on Beach/Atlantic", channel: "Field", owner: "Admissions", asset: "Drop list (sheet)", kpi: "Offices visited" },
  { day: 3, date: "Wed Jun 3", theme: "Social proof", task: "Post grad spotlight reel #1 (Debbie's class)", channel: "IG + TikTok", owner: "Marketing", asset: "30-sec reel", kpi: "Views / saves" },
  { day: 4, date: "Thu Jun 4", theme: "Local awareness", task: "Coffee-shop bulletin boards — 5 locations downtown JAX", channel: "Print", owner: "Admissions", asset: "Mini-flyer 4x6", kpi: "QR scans by code" },
  { day: 5, date: "Fri Jun 5", theme: "Community", task: "Post in 4 Jacksonville Mom Facebook groups (value-first)", channel: "Facebook", owner: "Marketing", asset: "Group-safe post copy", kpi: "Comments / DMs" },
  { day: 6, date: "Sat Jun 6", theme: "Activation", task: "AtticusM QR table at Riverside Arts Market", channel: "Event", owner: "Admissions", asset: "Tabletop banner", kpi: "Live chats started" },
  { day: 7, date: "Sun Jun 7", theme: "Recap", task: "Week 1 metrics review — which QR codes scanned most?", channel: "Internal", owner: "Tom", asset: "Dashboard snapshot", kpi: "Top 3 channels" },

  // ---- WEEK 2 — ACTIVATION ----
  { day: 8, date: "Mon Jun 8", theme: "Referral", task: "Email past inquiries: \"Know someone? $250 referral bonus\"", channel: "Email", owner: "Admissions", asset: "Email template", kpi: "Forwards / replies" },
  { day: 9, date: "Tue Jun 9", theme: "Local awareness", task: "Drop flyers at 6 CNA programs / nursing assistant schools", channel: "Field", owner: "Admissions", asset: "Same flyer", kpi: "Reception accepted?" },
  { day: 10, date: "Wed Jun 10", theme: "Storytelling", task: "Post \"Day in the life of an EFDA\" Reel — Ashley narrating", channel: "IG + TikTok", owner: "Marketing", asset: "60-sec reel", kpi: "Saves / shares" },
  { day: 11, date: "Thu Jun 11", theme: "Activation", task: "AtticusM auto-reply tested on 5 night-shift inquiries", channel: "AtticusM", owner: "Tom", asset: "Prompt tuning log", kpi: "Avg reply time" },
  { day: 12, date: "Fri Jun 12", theme: "Community", task: "Reply to every dental-career Reddit thread (r/Jacksonville, r/dentalassistant)", channel: "Reddit", owner: "Marketing", asset: "Reddit-safe answer template", kpi: "Upvotes / DMs" },
  { day: 13, date: "Sat Jun 13", theme: "Activation", task: "Beaches Farmers Market — AtticusM QR table", channel: "Event", owner: "Admissions", asset: "Tabletop banner", kpi: "Chats started" },
  { day: 14, date: "Sun Jun 14", theme: "Recap", task: "Week 2 review — conversion rate by channel", channel: "Internal", owner: "Tom", asset: "Funnel chart", kpi: "Apps started" },

  // ---- WEEK 3 — REFERRAL & UGC ----
  { day: 15, date: "Mon Jun 15", theme: "Referral", task: "DM 20 current students: ask for 1 referral each", channel: "SMS / IG", owner: "Admissions", asset: "Personalized DM script", kpi: "Replies" },
  { day: 16, date: "Tue Jun 16", theme: "Local awareness", task: "Yard sign campaign — 5 alumni driveways w/ QR", channel: "Field", owner: "Marketing", asset: "18x24 yard signs", kpi: "Scans per sign" },
  { day: 17, date: "Wed Jun 17", theme: "Authority", task: "Post Debbie & Ashley intro video (YouTube XLbxK-NOG_E)", channel: "YouTube + IG", owner: "Marketing", asset: "Cut-down 90s version", kpi: "Watch time" },
  { day: 18, date: "Thu Jun 18", theme: "Activation", task: "\"Apply by Friday\" countdown post w/ AtticusM link", channel: "All social", owner: "Marketing", asset: "Story template (3 frames)", kpi: "Apps started" },
  { day: 19, date: "Fri Jun 19", theme: "Mid-funnel close", task: "AtticusM nurtures all stalled apps — personalized nudge", channel: "AtticusM", owner: "Tom", asset: "Nudge prompt", kpi: "Re-engaged %" },
  { day: 20, date: "Sat Jun 20", theme: "UGC", task: "\"Why I chose FIDA\" student takeover on IG", channel: "IG Stories", owner: "Marketing", asset: "Brief + 5 prompts", kpi: "Story reach" },
  { day: 21, date: "Sun Jun 21", theme: "Recap", task: "Week 3 review — cost-per-app (should be ~$0)", channel: "Internal", owner: "Tom", asset: "CPA breakdown", kpi: "CPA" },

  // ---- WEEK 4 — CLOSE ----
  { day: 22, date: "Mon Jun 22", theme: "Urgency", task: "\"7 seats left\" post — cohort starts in 14 days", channel: "All social", owner: "Marketing", asset: "Static graphic", kpi: "DMs / clicks" },
  { day: 23, date: "Tue Jun 23", theme: "Close", task: "AtticusM \"finish your app\" reminder — all incomplete leads", channel: "AtticusM", owner: "Tom", asset: "Sequence v2", kpi: "Completions" },
  { day: 24, date: "Wed Jun 24", theme: "Authority", task: "Live Q&A on IG — Ashley answers everything for 30 min", channel: "IG Live", owner: "Marketing", asset: "Promo + recap reel", kpi: "Live viewers" },
  { day: 25, date: "Thu Jun 25", theme: "Activation", task: "Final flyer drop — 5 fresh dental offices", channel: "Field", owner: "Admissions", asset: "Same flyer", kpi: "QR scans" },
  { day: 26, date: "Fri Jun 26", theme: "Close", task: "\"Last call\" email to all warm leads w/ AtticusM link", channel: "Email", owner: "Admissions", asset: "Email template v2", kpi: "Opens / clicks" },
  { day: 27, date: "Sat Jun 27", theme: "Community", task: "Open house at FIDA — walk-ins welcome 10a-2p", channel: "Event", owner: "Admissions", asset: "Door signage + check-in", kpi: "Walk-ins" },
  { day: 28, date: "Sun Jun 28", theme: "Close", task: "Personalized AtticusM follow-ups to every unconverted lead", channel: "AtticusM", owner: "Tom", asset: "Per-lead context note", kpi: "Replies" },
  { day: 29, date: "Mon Jun 29", theme: "Close", task: "Final 48hr reminder — \"seats filling tomorrow\"", channel: "SMS + email", owner: "Admissions", asset: "SMS copy", kpi: "Click-throughs" },
  { day: 30, date: "Tue Jun 30", theme: "Recap", task: "Cohort fill review — attribute every enrolled student", channel: "Internal", owner: "Tom", asset: "Attribution sheet", kpi: "Seats filled / source" },
];

type Tactic = {
  tag: string;        // tag color
  title: string;
  what: string;       // 1-liner
  why: string;        // why this works for FIDA's audience
  cost: string;
};

const TACTICS: Tactic[] = [
  { tag: "Print", title: "Break-room flyers at dental offices", what: "QR → AtticusM, posted in staff lounges at offices on Beach/Atlantic/San Jose.", why: "Front-desk and assistant staff already know the work — they just need a path to credential up. Their colleagues are the warm intro.", cost: "$30 printing" },
  { tag: "Print", title: "CNA program break rooms", what: "Same flyer at 6 local CNA / nursing-assistant schools.", why: "CNAs working 12-hr shifts are the highest-converting audience for evening dental programs.", cost: "$15 printing" },
  { tag: "Field", title: "Yard signs at alumni homes", what: "5 grads agree to a 30-day yard sign w/ QR → AtticusM.", why: "Same-neighborhood signals trust. Every scan is pre-qualified by geography.", cost: "$60 signs" },
  { tag: "Field", title: "Coffee-shop bulletin boards", what: "5 downtown JAX cafes, mini-flyer with tear-off QR tabs.", why: "Career-changers spend their decision-window in third places. Catch them there.", cost: "$10" },
  { tag: "Event", title: "AtticusM QR table at Riverside Arts Market", what: "Folding table + tabletop banner + iPad showing live AtticusM demo.", why: "Saturday market is wall-to-wall career-changing 25-40 year olds.", cost: "$0 (FIDA table)" },
  { tag: "Event", title: "Beaches Farmers Market table", what: "Same table, beachside crowd, more retail/hospitality workers.", why: "Restaurant and retail staff are dental-school's #2 source nationally.", cost: "$0" },
  { tag: "Social", title: "Jacksonville Mom Facebook groups", what: "Value-first posts — not promo. Answer career-change questions, link AtticusM when asked.", why: "Career-changing moms are 38% of dental school enrollments nationally. They live in these groups.", cost: "$0" },
  { tag: "Social", title: "Day-in-the-life Reels", what: "Ashley/Debbie narrate a real day at FIDA. No script.", why: "Authenticity outperforms polish on TikTok/IG for trade education.", cost: "$0" },
  { tag: "Social", title: "Reddit answer strategy", what: "Reply to every dental-career thread in r/Jacksonville, r/dentalassistant, r/CareerChange.", why: "Reddit DMs convert at 4x Facebook DM rates for skilled-trade schools.", cost: "$0" },
  { tag: "Referral", title: "Alumni $250 referral bonus", what: "Pay $250 to any current or former student whose referral enrolls.", why: "CAC ceiling is $250. Far cheaper than paid media — and converts at 3-5x the rate.", cost: "$250 per enroll" },
  { tag: "Referral", title: "Student takeovers", what: "Pass IG to 1 student per week to post 5 Stories about their day.", why: "Prospects trust students more than admissions. Free — students love it.", cost: "$0" },
  { tag: "AtticusM", title: "Off-shift response", what: "AtticusM auto-answers inquiries 6pm-7am with context-aware replies about tuition, hours, aid.", why: "84% of dental-school inquiries come outside business hours. Every other school makes them wait.", cost: "Included" },
  { tag: "AtticusM", title: "Stalled-app nudge sequence", what: "AtticusM personalizes follow-ups to leads who started but didn't finish.", why: "Average school recovers 4% of stalled apps. AtticusM should hit 18-25%.", cost: "Included" },
  { tag: "AtticusM", title: "QR attribution tracking", what: "Each flyer / sign / table has its own QR — AtticusM tracks source of every chat.", why: "Tells you which $30 flyer drop produced the enroll. Cuts losers, doubles winners.", cost: "Included" },
];

// ---------- HELPERS ----------

function tagClass(tag: string) {
  switch (tag) {
    case "Print": return "bg-amber-50 text-amber-800 border-amber-200";
    case "Field": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Event": return "bg-teal/10 text-teal-deep border-teal/30";
    case "Social": return "bg-navy-50 text-navy border-navy-100";
    case "Referral": return "bg-rose-50 text-rose-800 border-rose-200";
    case "AtticusM": return "bg-violet-50 text-violet-800 border-violet-200";
    default: return "bg-paper-subtle text-muted border-rule";
  }
}

function themeClass(theme: string) {
  switch (theme) {
    case "Local awareness": return "bg-amber-50 text-amber-800";
    case "Social proof": return "bg-emerald-50 text-emerald-800";
    case "Community": return "bg-teal/10 text-teal-deep";
    case "Activation": return "bg-violet-50 text-violet-800";
    case "Referral": return "bg-rose-50 text-rose-800";
    case "Storytelling": return "bg-navy-50 text-navy";
    case "Authority": return "bg-navy-50 text-navy";
    case "UGC": return "bg-emerald-50 text-emerald-800";
    case "Urgency": return "bg-rose-50 text-rose-800";
    case "Close": return "bg-amber-50 text-amber-800";
    case "Mid-funnel close": return "bg-amber-50 text-amber-800";
    case "Recap": return "bg-paper-subtle text-muted";
    default: return "bg-paper-subtle text-muted";
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

export default function AtticusMPage() {
  const weeks = [
    { label: "Week 1 — Foundation", days: CALENDAR.slice(0, 7) },
    { label: "Week 2 — Activation", days: CALENDAR.slice(7, 14) },
    { label: "Week 3 — Referral & UGC", days: CALENDAR.slice(14, 21) },
    { label: "Week 4 — Close", days: CALENDAR.slice(21, 30) },
  ];

  return (
    <div className="max-w-6xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="eyebrow">Marketing playbook</span>
        <span className="text-xs text-subtle">· 30-day cohort fill</span>
      </div>
      <h1 className="font-display text-5xl text-ink tracking-tight leading-tight">
        AtticusM
      </h1>
      <p className="font-display text-xl text-muted mt-2 max-w-3xl leading-snug">
        The AI admissions advisor who actually shows up at 11pm — when your future
        students are finally off shift.
      </p>

      {/* MONTHLY RESET BANNER */}
      <section className="mt-8 rounded-sm border-l-4 border-teal bg-teal-50 px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="eyebrow text-teal-deep">Monthly reset cycle</div>
          <p className="text-sm text-ink mt-1">
            Current cycle: <span className="font-semibold">{CYCLE.start} – {CYCLE.end}</span>
            {" · "}
            Next reset: <span className="font-semibold">{CYCLE.resetOn}</span>
          </p>
          <p className="text-xs text-muted mt-1 leading-snug">
            Every 30 days this playbook is rewritten with a revised action plan — new calendar,
            refreshed tactics, and updated targets based on the previous cycle&rsquo;s results.
          </p>
        </div>
        <div className="text-right md:text-left md:border-l md:border-rule md:pl-5">
          <div className="eyebrow text-muted">Cohort filling</div>
          <div className="font-display text-lg text-ink leading-tight">{CYCLE.cohort}</div>
          <div className="text-[11px] text-subtle">Owner review monthly</div>
        </div>
      </section>

      {/* KPI ROW */}
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <Kpi value="18" label="Seats to fill" sub="Next cohort — July 6, 2026" />
        <Kpi value="$0" label="Paid media budget" sub="Every play is free or near-zero" />
        <Kpi value="14" label="Guerrilla plays" sub="Each targeted at a specific moment" />
        <Kpi value="0" label="Forms before a real answer" sub="That’s the whole campaign" />
      </div>

      {/* THE INSIGHT */}
      <section className="mt-10 rounded-sm border border-rule bg-navy-deep text-white p-8 md:p-10">
        <div className="eyebrow text-teal-soft">The insight driving the campaign</div>
        <p className="font-display text-2xl md:text-3xl mt-3 leading-tight">
          A 32-year-old dental front-desk staffer finishes her shift at 6:14pm, picks up
          her kid, opens her phone in the school pickup line, and types{" "}
          <span className="text-teal-soft">&ldquo;dental radiography certification Jacksonville&rdquo;</span> into Google.
        </p>
        <p className="font-display text-xl mt-4 leading-snug text-navy-100">
          Every other school makes her fill a form. We make her talk to{" "}
          <span className="text-teal-soft">AtticusM</span>.
        </p>
        <p className="mt-5 text-navy-100 max-w-3xl text-sm leading-relaxed">
          She is not going to read a brochure. She is not going to wait for a call back
          Monday at 9am. She has questions right now — about tuition, evening cohorts,
          whether her dental-office hours count, whether she qualifies for aid. AtticusM
          is the only one who answers. And because she came in through a QR code a
          colleague showed her, a Facebook group post, or a flyer at her CNA program, the
          lead arrived for $0. All signal, no spend.
        </p>
      </section>

      {/* ATTICUSM ENGINE */}
      <section className="mt-10">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display text-3xl text-ink">AtticusM — the acquisition engine</h2>
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
          AtticusM ties directly to AtticusEnroll conversion data so you see exactly which campaigns are filling seats.
        </p>
      </section>

      {/* 30-DAY CALENDAR */}
      <section className="mt-12">
        <h2 className="font-display text-3xl text-ink">30-day calendar</h2>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          A daily to-do list for one full cohort cycle. Every row is a real tactic with
          an owner, an asset, and a metric to watch.
        </p>

        <div className="mt-6 space-y-8">
          {weeks.map((w) => (
            <div key={w.label}>
              <div className="font-display text-xl text-ink mb-3">{w.label}</div>
              <div className="overflow-x-auto border border-rule rounded-sm bg-paper">
                <table className="w-full text-sm">
                  <thead className="bg-paper-subtle">
                    <tr className="text-left">
                      <th className="px-3 py-2 eyebrow text-muted">Day</th>
                      <th className="px-3 py-2 eyebrow text-muted">Date</th>
                      <th className="px-3 py-2 eyebrow text-muted">Theme</th>
                      <th className="px-3 py-2 eyebrow text-muted">Task</th>
                      <th className="px-3 py-2 eyebrow text-muted">Channel</th>
                      <th className="px-3 py-2 eyebrow text-muted">Owner</th>
                      <th className="px-3 py-2 eyebrow text-muted">Asset</th>
                      <th className="px-3 py-2 eyebrow text-muted">KPI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.days.map((d) => (
                      <tr key={d.day} className="border-t border-rule align-top">
                        <td className="px-3 py-2 font-display text-base text-ink">{d.day}</td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">{d.date}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] uppercase tracking-eyebrow font-semibold px-2 py-0.5 rounded-sm ${themeClass(d.theme)}`}>
                            {d.theme}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-ink">{d.task}</td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">{d.channel}</td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">{d.owner}</td>
                        <td className="px-3 py-2 text-muted">{d.asset}</td>
                        <td className="px-3 py-2 text-muted">{d.kpi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TACTICS GRID */}
      <section className="mt-12">
        <h2 className="font-display text-3xl text-ink">Guerrilla play library</h2>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          14 distinct zero-budget tactics. Each one targeted at the exact moment a
          working adult considers a career change. Tap any tile to expand once we wire
          the detail pages.
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
          <Kpi value="Chats started" label="AtticusM" sub="Live conversations initiated" />
          <Kpi value="Apps started" label="Funnel" sub="Inquiry → application" />
          <Kpi value="Seats filled" label="North star" sub="Attribution back to source" />
        </div>
      </section>

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-rule flex items-center justify-between text-xs text-subtle">
        <div>
          AtticusM playbook · v1 · Built for FIDA · Edit at{" "}
          <code className="font-mono">app/admin/atticusm/page.tsx</code>
        </div>
        <Link href="/admin" className="hover:text-ink">&larr; Back to overview</Link>
      </div>
    </div>
  );
}
