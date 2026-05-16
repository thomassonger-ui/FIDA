"use client";

import { useEffect, useState } from "react";

// ---------- DATA ----------
type Task = {
  day: number;
  theme: string;
  task: string;
  channel: string;
  owner: string;
  asset: string;
  kpi: string;
};

const TASKS: Task[] = [
  // ---- WEEK 1 — FOUNDATION ----
  { day: 1, theme: "Local awareness", task: "Print 250 break-room flyers w/ QR → Atticus™M", channel: "Print + QR", owner: "Admissions", asset: "8.5x11 flyer (PDF)", kpi: "QR scans" },
  { day: 2, theme: "Local awareness", task: "Drop flyers at 10 dental offices on Beach/Atlantic", channel: "Field", owner: "Admissions", asset: "Drop list (sheet)", kpi: "Offices visited" },
  { day: 3, theme: "Social proof", task: "Post grad spotlight reel #1 (Debbie's class)", channel: "IG + TikTok", owner: "Marketing", asset: "30-sec reel", kpi: "Views / saves" },
  { day: 4, theme: "Local awareness", task: "Coffee-shop bulletin boards — 5 locations downtown JAX", channel: "Print", owner: "Admissions", asset: "Mini-flyer 4x6", kpi: "QR scans by code" },
  { day: 5, theme: "Community", task: "Post in 4 Jacksonville Mom Facebook groups (value-first)", channel: "Facebook", owner: "Marketing", asset: "Group-safe post copy", kpi: "Comments / DMs" },
  { day: 6, theme: "Activation", task: "Atticus™M QR table at Riverside Arts Market", channel: "Event", owner: "Admissions", asset: "Tabletop banner", kpi: "Live chats started" },
  { day: 7, theme: "Recap", task: "Week 1 metrics review — which QR codes scanned most?", channel: "Internal", owner: "Tom", asset: "Dashboard snapshot", kpi: "Top 3 channels" },
  // ---- WEEK 2 — ACTIVATION ----
  { day: 8, theme: "Referral", task: "Email past inquiries: \"Know someone? $250 referral bonus\"", channel: "Email", owner: "Admissions", asset: "Email template", kpi: "Forwards / replies" },
  { day: 9, theme: "Local awareness", task: "Drop flyers at 6 CNA programs / nursing assistant schools", channel: "Field", owner: "Admissions", asset: "Same flyer", kpi: "Reception accepted?" },
  { day: 10, theme: "Storytelling", task: "Post \"Day in the life of an EFDA\" Reel — Ashley narrating", channel: "IG + TikTok", owner: "Marketing", asset: "60-sec reel", kpi: "Saves / shares" },
  { day: 11, theme: "Activation", task: "Atticus™M auto-reply tested on 5 night-shift inquiries", channel: "Atticus™M", owner: "Tom", asset: "Prompt tuning log", kpi: "Avg reply time" },
  { day: 12, theme: "Community", task: "Reply to every dental-career Reddit thread (r/Jacksonville, r/dentalassistant)", channel: "Reddit", owner: "Marketing", asset: "Reddit-safe answer template", kpi: "Upvotes / DMs" },
  { day: 13, theme: "Activation", task: "Beaches Farmers Market — Atticus™M QR table", channel: "Event", owner: "Admissions", asset: "Tabletop banner", kpi: "Chats started" },
  { day: 14, theme: "Recap", task: "Week 2 review — conversion rate by channel", channel: "Internal", owner: "Tom", asset: "Funnel chart", kpi: "Apps started" },
  // ---- WEEK 3 — REFERRAL & UGC ----
  { day: 15, theme: "Referral", task: "DM 20 current students: ask for 1 referral each", channel: "SMS / IG", owner: "Admissions", asset: "Personalized DM script", kpi: "Replies" },
  { day: 16, theme: "Local awareness", task: "Yard sign campaign — 5 alumni driveways w/ QR", channel: "Field", owner: "Marketing", asset: "18x24 yard signs", kpi: "Scans per sign" },
  { day: 17, theme: "Authority", task: "Post Debbie & Ashley intro video (YouTube XLbxK-NOG_E)", channel: "YouTube + IG", owner: "Marketing", asset: "Cut-down 90s version", kpi: "Watch time" },
  { day: 18, theme: "Activation", task: "\"Apply by Friday\" countdown post w/ Atticus™M link", channel: "All social", owner: "Marketing", asset: "Story template (3 frames)", kpi: "Apps started" },
  { day: 19, theme: "Mid-funnel close", task: "Atticus™M nurtures all stalled apps — personalized nudge", channel: "Atticus™M", owner: "Tom", asset: "Nudge prompt", kpi: "Re-engaged %" },
  { day: 20, theme: "UGC", task: "\"Why I chose FIDA\" student takeover on IG", channel: "IG Stories", owner: "Marketing", asset: "Brief + 5 prompts", kpi: "Story reach" },
  { day: 21, theme: "Recap", task: "Week 3 review — cost-per-app (should be ~$0)", channel: "Internal", owner: "Tom", asset: "CPA breakdown", kpi: "CPA" },
  // ---- WEEK 4 — CLOSE ----
  { day: 22, theme: "Urgency", task: "\"7 seats left\" post — cohort starts in 14 days", channel: "All social", owner: "Marketing", asset: "Static graphic", kpi: "DMs / clicks" },
  { day: 23, theme: "Close", task: "Atticus™M \"finish your app\" reminder — all incomplete leads", channel: "Atticus™M", owner: "Tom", asset: "Sequence v2", kpi: "Completions" },
  { day: 24, theme: "Authority", task: "Live Q&A on IG — Ashley answers everything for 30 min", channel: "IG Live", owner: "Marketing", asset: "Promo + recap reel", kpi: "Live viewers" },
  { day: 25, theme: "Activation", task: "Final flyer drop — 5 fresh dental offices", channel: "Field", owner: "Admissions", asset: "Same flyer", kpi: "QR scans" },
  { day: 26, theme: "Close", task: "\"Last call\" email to all warm leads w/ Atticus™M link", channel: "Email", owner: "Admissions", asset: "Email template v2", kpi: "Opens / clicks" },
  { day: 27, theme: "Community", task: "Open house at FIDA — walk-ins welcome 10a-2p", channel: "Event", owner: "Admissions", asset: "Door signage + check-in", kpi: "Walk-ins" },
  { day: 28, theme: "Close", task: "Personalized Atticus™M follow-ups to every unconverted lead", channel: "Atticus™M", owner: "Tom", asset: "Per-lead context note", kpi: "Replies" },
  { day: 29, theme: "Close", task: "Final 48hr reminder — \"seats filling tomorrow\"", channel: "SMS + email", owner: "Admissions", asset: "SMS copy", kpi: "Click-throughs" },
  { day: 30, theme: "Recap", task: "Cohort fill review — attribute every enrolled student", channel: "Internal", owner: "Tom", asset: "Attribution sheet", kpi: "Seats filled / source" },
];

// ---------- HELPERS ----------
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

/** Cycle starts on the 15th of the current month. If today is before the 15th,
 *  cycle started on the 15th of the previous month. */
function getCycleStart(): Date {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  if (day >= 15) return new Date(year, month, 15);
  return new Date(year, month - 1, 15);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtShort(d: Date): string {
  // "Thu May 15"
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function fmtLong(d: Date): string {
  // "May 15, 2026"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ---------- CYCLE BANNER ----------
export function CycleInfo({ cohort }: { cohort: string }) {
  const [start, setStart] = useState<Date | null>(null);
  useEffect(() => { setStart(getCycleStart()); }, []);

  return (
    <section className="mt-8 rounded-sm border-l-4 border-teal bg-teal-50 px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <div className="eyebrow text-teal-deep">Monthly reset cycle</div>
        {start ? (
          <p className="text-sm text-ink mt-1">
            Current cycle: <span className="font-semibold">{fmtLong(start)} – {fmtLong(addDays(start, 29))}</span>
            {" · "}
            Next reset: <span className="font-semibold">{fmtLong(addDays(start, 30))}</span>
          </p>
        ) : (
          <p className="text-sm text-muted mt-1">Loading cycle…</p>
        )}
        <p className="text-xs text-muted mt-1 leading-snug">
          Every 30 days this playbook is rewritten with a revised action plan — new calendar,
          refreshed tactics, and updated targets based on the previous cycle&rsquo;s results.
          Billing & reset land on the 15th.
        </p>
      </div>
      <div className="text-right md:text-left md:border-l md:border-rule md:pl-5">
        <div className="eyebrow text-muted">Cohort filling</div>
        <div className="font-display text-lg text-ink leading-tight">{cohort}</div>
        <div className="text-[11px] text-subtle">Owner review monthly</div>
      </div>
    </section>
  );
}

// ---------- CALENDAR CHECKLIST ----------
export function CalendarChecklist() {
  const [start, setStart] = useState<Date | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const s = getCycleStart();
    setStart(s);
    const key = `atticusm-checked-${s.toISOString().slice(0, 10)}`;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) setChecked(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (day: number) => {
    if (!start) return;
    const id = String(day);
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    const key = `atticusm-checked-${start.toISOString().slice(0, 10)}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const resetAll = () => {
    if (!start) return;
    if (!window.confirm("Reset all checkboxes for the current cycle?")) return;
    setChecked({});
    const key = `atticusm-checked-${start.toISOString().slice(0, 10)}`;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  if (!start) {
    return <div className="text-sm text-muted">Loading checklist…</div>;
  }

  const weeks = [
    { label: "Week 1 — Foundation", days: TASKS.slice(0, 7) },
    { label: "Week 2 — Activation", days: TASKS.slice(7, 14) },
    { label: "Week 3 — Referral & UGC", days: TASKS.slice(14, 21) },
    { label: "Week 4 — Close", days: TASKS.slice(21, 30) },
  ];

  const completed = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((completed / 30) * 100);

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-4 flex items-center justify-between text-sm flex-wrap gap-2">
        <div className="text-muted">
          Cycle: <span className="font-semibold text-ink">{fmtShort(start)}</span>
          {" → "}
          <span className="font-semibold text-ink">{fmtShort(addDays(start, 29))}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">Progress:</span>
            <span className="font-display text-base text-ink">{completed} / 30</span>
            <div className="w-24 h-1.5 bg-rule rounded-full overflow-hidden">
              <div
                className="h-full bg-teal transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-subtle hover:text-ink underline underline-offset-2"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {weeks.map((w) => (
          <div key={w.label}>
            <div className="font-display text-xl text-ink mb-3">{w.label}</div>
            <div className="overflow-x-auto border border-rule rounded-sm bg-paper">
              <table className="w-full text-sm">
                <thead className="bg-paper-subtle">
                  <tr className="text-left">
                    <th className="px-3 py-2 eyebrow text-muted w-10">Done</th>
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
                  {w.days.map((d) => {
                    const isDone = !!checked[String(d.day)];
                    return (
                      <tr
                        key={d.day}
                        className={`border-t border-rule align-top transition-colors ${
                          isDone ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => toggle(d.day)}
                            aria-pressed={isDone}
                            aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[11px] font-bold transition ${
                              isDone
                                ? "bg-teal border-teal text-white"
                                : "bg-paper border-rule hover:border-teal hover:bg-teal-50"
                            }`}
                          >
                            {isDone ? "✓" : ""}
                          </button>
                        </td>
                        <td className="px-3 py-2 font-display text-base text-ink">{d.day}</td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">
                          {fmtShort(addDays(start, d.day - 1))}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-[10px] uppercase tracking-eyebrow font-semibold px-2 py-0.5 rounded-sm ${themeClass(
                              d.theme
                            )}`}
                          >
                            {d.theme}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 ${
                            isDone ? "line-through text-muted" : "text-ink"
                          }`}
                        >
                          {d.task}
                        </td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">{d.channel}</td>
                        <td className="px-3 py-2 text-muted whitespace-nowrap">{d.owner}</td>
                        <td className="px-3 py-2 text-muted">{d.asset}</td>
                        <td className="px-3 py-2 text-muted">{d.kpi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-subtle mt-4 italic">
        Checkbox state saves to this browser only. On the 15th each month the cycle key rolls
        forward and the checklist starts fresh.
      </p>
    </div>
  );
}
