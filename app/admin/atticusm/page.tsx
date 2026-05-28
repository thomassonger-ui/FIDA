import Link from "next/link";
import { CycleInfo, CalendarChecklist } from "./checklist";
import { getServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atticus™M · Admin · FIDA",
};

// ---------- TACTIC LIBRARY ----------

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

// ---------- LIVE METRICS ----------

type Metrics = {
  qrScans: number;
  chatsStarted: number;
  visitors: number;
  seatsFilled: number;
  topChannels: { source: string; count: number }[];
};

/** Cycle starts on the 15th. If today is before the 15th, prior month's 15th. */
function getCycleStart(): Date {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  if (d >= 15) return new Date(y, m, 15);
  return new Date(y, m - 1, 15);
}

async function getMetrics(): Promise<Metrics> {
  const empty: Metrics = {
    qrScans: 0,
    chatsStarted: 0,
    visitors: 0,
    seatsFilled: 0,
    topChannels: [],
  };

  try {
    const sb = getServerClient();
    const cycleStart = getCycleStart().toISOString();

    // Parallel queries
    const [qrRes, sessionsRes, chatsRes, seatsRes] = await Promise.all([
      // QR scans this cycle
      sb
        .from("qr_scans")
        .select("slug", { count: "exact", head: false })
        .gte("scanned_at", cycleStart),
      // All Atticus sessions this cycle (visitors)
      sb
        .from("atticus_sessions")
        .select("source, message_count", { count: "exact", head: false })
        .gte("created_at", cycleStart),
      // Chats started = sessions with at least one message
      sb
        .from("atticus_sessions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", cycleStart)
        .gt("message_count", 0),
      // Seats filled = real students this cycle with a tracked acquisition source.
      // Demo data is excluded — only Atticus-attributed enrollments count.
      sb
        .from("students")
        .select("id", { count: "exact", head: true })
        .gte("created_at", cycleStart)
        .not("acquisition_source", "is", null),
    ]);

    // Channel breakdown: combine QR scans by slug + atticus session sources
    const channelCounts: Record<string, number> = {};
    for (const row of (qrRes.data ?? []) as Array<{ slug: string }>) {
      if (row.slug) channelCounts[row.slug] = (channelCounts[row.slug] || 0) + 1;
    }
    const topChannels = Object.entries(channelCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Seats filled — only count real students with a tracked acquisition source.
    // If the students table doesn't exist or query errors, show 0 (not demo data).
    const seatsFilled = seatsRes.error ? 0 : seatsRes.count ?? 0;

    return {
      qrScans: qrRes.count ?? (qrRes.data?.length ?? 0),
      chatsStarted: chatsRes.count ?? 0,
      visitors: sessionsRes.count ?? (sessionsRes.data?.length ?? 0),
      seatsFilled,
      topChannels,
    };
  } catch (err) {
    console.error("[atticusm metrics] failed:", err);
    return empty;
  }
}

// ---------- COMPONENTS ----------

function StaticKpi({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className="font-display text-3xl text-ink">{value}</div>
      <div className="eyebrow mt-1">{label}</div>
      {sub && <div className="text-xs text-subtle mt-1">{sub}</div>}
    </div>
  );
}

function LiveKpi({
  count,
  label,
  sub,
}: {
  count: number;
  label: string;
  sub?: string;
}) {
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className="font-display text-4xl text-ink leading-none">{count.toLocaleString()}</div>
      <div className="eyebrow mt-2 text-teal-deep">{label}</div>
      {sub && <div className="text-xs text-subtle mt-1">{sub}</div>}
    </div>
  );
}

// ---------- PAGE ----------

export default async function AtticusMPage() {
  const metrics = await getMetrics();
  const cycleStart = getCycleStart();
  const cycleLabel = cycleStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl">
      {/* HEADER ROW — eyebrow + title + tagline + action buttons on the left,
          training-video card on the right (lg+). Markup mirrors the Bear Team
          OS portal ExplainerVideo convention exactly (1fr_400px, gap-8,
          youtube-nocookie, modestbranding, inline 16/9 aspect ratio, eyebrow
          caption + Watch on YouTube link). */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="eyebrow">Marketing playbook</span>
            <span className="text-xs text-subtle">· 30-day cohort fill · resets the 15th</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-5xl text-ink tracking-tight leading-tight">Atticus™M</h1>
              <p className="font-display text-xl text-muted mt-2 max-w-3xl leading-snug">
                The AI admissions advisor who actually shows up at 11pm — when your future
                students are finally off shift.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/admin/atticusm/market"
                className="inline-block border border-teal text-teal-deep text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal/10 transition"
              >
                Market analysis →
              </Link>
              <Link
                href="/admin/atticusm/templates"
                className="inline-block border border-teal text-teal-deep text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal/10 transition"
              >
                Campaign templates →
              </Link>
              <Link
                href="/admin/atticusm/qr"
                className="inline-block bg-teal text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal-deep transition"
              >
                Manage QR codes →
              </Link>
            </div>
          </div>
        </div>

        {/* Training video — Atticus™M explainer. */}
        <div className="border border-rule rounded-sm bg-paper-subtle overflow-hidden">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/_D7nmIQYjgc?rel=0&modestbranding=1"
              title="Atticus™M — explainer"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="px-3 py-2 flex items-center justify-between text-[11px] text-muted border-t border-rule">
            <span className="uppercase tracking-wider text-teal-deep font-semibold">
              Atticus™M — explainer
            </span>
            <a
              href="https://www.youtube.com/watch?v=_D7nmIQYjgc"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>

      {/* CYCLE BANNER */}
      <CycleInfo cohort="July 6, 2026" />

      {/* PLANNING KPIs (static targets) */}
      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <StaticKpi value="18" label="Seats to fill" sub="Next cohort — July 6, 2026" />
        <StaticKpi value="$0" label="Paid media budget" sub="Every play is free or near-zero" />
        <StaticKpi value="14" label="Guerrilla plays" sub="Each targeted at a specific moment" />
        <StaticKpi value="0" label="Forms before a real answer" sub="That’s the whole campaign" />
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

      {/* 30-DAY CALENDAR */}
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

      {/* LIVE METRICS — what to measure each Sunday */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display text-3xl text-ink">Live cycle metrics</h2>
          <div className="text-xs text-subtle">Since {cycleLabel} (auto-resets the 15th)</div>
        </div>
        <p className="text-sm text-muted max-w-3xl mb-4">
          Real counts from the live database — QR scans, Atticus™M visitors, chats started,
          and seats filled this cycle. Each Sunday, Debbie & Ashley review these to decide
          what to double down on next week.
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          <LiveKpi count={metrics.qrScans} label="QR scans" sub="Across all printed codes" />
          <LiveKpi count={metrics.visitors} label="Atticus™M visitors" sub="Attributed page sessions" />
          <LiveKpi count={metrics.chatsStarted} label="Chats started" sub="Sessions w/ ≥1 message" />
          <LiveKpi count={metrics.seatsFilled} label="Seats filled" sub="Students enrolled this cycle" />
        </div>

        {/* Top channels */}
        {metrics.topChannels.length > 0 ? (
          <div className="mt-6 border border-rule rounded-sm bg-paper p-5">
            <div className="eyebrow text-muted mb-3">Top channels this cycle</div>
            <div className="space-y-2">
              {metrics.topChannels.map((c) => (
                <div key={c.source} className="flex items-center gap-3">
                  <code className="font-mono text-xs text-muted w-48 truncate">{c.source}</code>
                  <div className="flex-1 h-2 bg-paper-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal"
                      style={{ width: `${Math.min(100, (c.count / metrics.topChannels[0].count) * 100)}%` }}
                    />
                  </div>
                  <div className="font-display text-base text-ink w-12 text-right">{c.count}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 border border-dashed border-rule rounded-sm p-6 text-center">
            <p className="text-sm text-muted">
              No scans yet this cycle. <Link href="/admin/atticusm/qr" className="text-teal hover:text-teal-deep underline">Mint your first QR code</Link>{" "}
              to start collecting data.
            </p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-rule flex items-center justify-between text-xs text-subtle">
        <div>
          Atticus™M playbook · v3 · Built for FIDA · Edit at{" "}
          <code className="font-mono">app/admin/atticusm/page.tsx</code>
        </div>
        <Link href="/admin" className="hover:text-ink">&larr; Back to overview</Link>
      </div>
    </div>
  );
}
