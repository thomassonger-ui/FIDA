/**
 * Prospecting types and constants that are safe on both sides of the wire.
 *
 * Client components import from HERE, never from prospects-db.ts — that module
 * pulls in the service-role Supabase client and has no business in a browser
 * bundle. Anything needing the database lives there; anything a table or board
 * needs to render lives here.
 */

// ------------------------------------------------------------
// Funnel
// ------------------------------------------------------------

export const STAGES = [
  "identified",
  "nurture",
  "applied",
  "registered",
  "enrolled",
  "graduated",
] as const;

export type Stage = (typeof STAGES)[number] | "lost";

export const STAGE_LABELS: Record<string, string> = {
  identified: "Identified",
  nurture: "Nurture",
  applied: "Applied",
  registered: "Registered",
  enrolled: "Enrolled",
  graduated: "Graduated",
  lost: "Lost",
};

/** One line of plain-English help per stage, shown on the board. */
export const STAGE_HELP: Record<string, string> = {
  identified: "On the list. Nobody has reached out yet.",
  nurture: "Drip is running or a call has gone out. No application yet.",
  applied: "Finished the Atticus application. Advisor follow-up due.",
  registered: "Paid the $150 registration fee. Seat is held.",
  enrolled: "In a Moodle course. Also lives in Students.",
  graduated: "Completed the program.",
  lost: "Not moving forward. Kept for the record.",
};

export type DripStatus = "not_started" | "active" | "paused" | "finished";

export type Prospect = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  program_interest: string | null;
  segment: string | null;
  current_employer: string | null;
  score: number;
  notes: string | null;
  stage: Stage;
  next_followup_at: string | null;
  last_touch_at: string | null;
  touch_count: number;
  drip_status: DripStatus;
  drip_step: number;
  drip_last_sent_at: string | null;
  consent_source: string | null;
  consent_at: string | null;
  unsubscribed_at: string | null;
  dnc: boolean;
  email_ok: boolean;
  sms_ok: boolean;
  source: string | null;
  source_batch: string | null;
  skip_traced_at: string | null;
  removed_at: string | null;
  student_id: string | null;
  created_at: string;
  updated_at: string;
};

// ------------------------------------------------------------
// Daily sending limits
//
// These are a WARM-UP setting, not a permanent rule. A new sending domain
// has no reputation, so the first few weeks are about proving to inbox
// providers that FIDA sends mail people want. Once the domain is
// established the ceiling rises — see RAMP below for the schedule.
//
// Change them in Vercel, not here:
//   PROSPECT_DAILY_EMAIL_LIMIT       (default 10)
//   PROSPECT_DAILY_SKIP_TRACE_LIMIT  (default 10)
//
// Server-only: these are read on the server and passed to client components
// as props, because a non-NEXT_PUBLIC env var is undefined in the browser.
// ------------------------------------------------------------

export const DEFAULT_DAILY_EMAIL_LIMIT = 10;
export const DEFAULT_DAILY_SKIP_TRACE_LIMIT = 10;

export type Limits = { email: number; skipTrace: number };

function readLimit(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Server-side only. Client components receive the result as a prop. */
export function currentLimits(): Limits {
  return {
    email: readLimit(
      process.env.PROSPECT_DAILY_EMAIL_LIMIT,
      DEFAULT_DAILY_EMAIL_LIMIT
    ),
    skipTrace: readLimit(
      process.env.PROSPECT_DAILY_SKIP_TRACE_LIMIT,
      DEFAULT_DAILY_SKIP_TRACE_LIMIT
    ),
  };
}

/**
 * The warm-up schedule we're following. Shown on the page so the cap reads
 * as a stage we're passing through rather than a permanent ceiling.
 *
 * Roughly doubling each week is the conventional pace. Hold — or step back —
 * if bounces climb past 2% or complaints past 0.1% in any week.
 */
export const RAMP: { week: string; perDay: number; note: string }[] = [
  { week: "Weeks 1–2", perDay: 10, note: "Cold start. Every send reviewed by hand." },
  { week: "Weeks 3–4", perDay: 25, note: "Only if bounces stay under 2%." },
  { week: "Weeks 5–6", perDay: 50, note: "Watch complaint rate, not just delivery." },
  { week: "Weeks 7–8", perDay: 100, note: "Domain is established at this point." },
  { week: "Week 9+", perDay: 250, note: "Raise as far as list quality supports." },
];

export const SKIP_TRACE_COST_PER_HIT = 0.1;

/** CAN-SPAM requires a real postal address in every commercial email. */
export const MAILING_ADDRESS =
  "Florida Institute of Dental Assisting · 8761 Perimeter Park Blvd, Ste. 107, Jacksonville, FL 32216";

// ------------------------------------------------------------
// Display helpers — pure, used on both sides
// ------------------------------------------------------------

export function displayName(p: Prospect): string {
  if (p.full_name && p.full_name.trim()) return p.full_name.trim();
  const joined = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return joined || p.email || "—";
}

/** True when this prospect must not receive a marketing email. */
export function emailBlocked(p: Prospect): boolean {
  return Boolean(!p.email || !p.email_ok || p.unsubscribed_at);
}

/** True when this prospect must not be called. */
export function callBlocked(p: Prospect): boolean {
  return Boolean(!p.phone || p.dnc);
}
