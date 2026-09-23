/**
 * Spam guard for the public ticket intake (POST /api/tickets — used by the
 * /contact form and /tickets).
 *
 * Two layers, two outcomes:
 *
 *   DROP        — obvious bots (honeypot filled, submitted faster than a human
 *                 can type, or no form timestamp at all = scripted POST). We
 *                 answer 200 so the bot thinks it worked and moves on, and we
 *                 save nothing.
 *
 *   QUARANTINE  — things a human *might* have sent: gibberish bodies, dotted
 *                 Gmail throwaways, sales pitches, blocked senders. Saved with
 *                 status "spam" so they never hit the Open inbox but staff can
 *                 still review them under the Spam tab and rescue a real one.
 *
 * Tuned 2026-09-22 against the 18 spam submissions received 2026-08-19 →
 * 2026-09-22 (the 2 real inquiries in that window pass).
 */

import { getServerClient } from "./supabase";

export const HONEYPOT_FIELD = "website";
export const STARTED_FIELD = "_t";

/** Humans can't read the form and type a message in under this. */
const MIN_FILL_MS = 3_000;

export type GuardVerdict =
  | { action: "allow" }
  | { action: "drop"; reason: string }
  | { action: "quarantine"; reason: string };

// ------------------------------------------------------------
// Bot checks (DROP)
// ------------------------------------------------------------

export function botCheck(form: FormData): GuardVerdict {
  const hp = String(form.get(HONEYPOT_FIELD) ?? "").trim();
  if (hp) return { action: "drop", reason: "honeypot" };

  const startedRaw = String(form.get(STARTED_FIELD) ?? "").trim();
  const started = Number(startedRaw);
  if (!startedRaw || !Number.isFinite(started)) {
    return { action: "drop", reason: "no-timestamp" };
  }
  const elapsed = Date.now() - started;
  if (elapsed < MIN_FILL_MS) return { action: "drop", reason: "too-fast" };

  return { action: "allow" };
}

// ------------------------------------------------------------
// Content checks (QUARANTINE)
// ------------------------------------------------------------

/**
 * Sales-pitch phrases seen in (or typical of) contact-form spam. Lower-case,
 * matched as substrings. Two or more hits = pitch; one of the STRONG ones
 * alone = pitch.
 */
const STRONG_PHRASES = [
  "tried emailing you",
  "didn't go through",
  "didn’t go through",
  "reply stop",
  "reply \"stop\"",
  "to opt out",
  "virtual assistant",
  "expand your student enrollment",
  "expanding your student enrollment",
  "increase your enrollment",
  "first page of google",
  "backlinks",
  "guest post",
  "optout",
  "opt out",
  "cleaning bid",
  "student leads",
  "boost enrollment",
  "grow enrollment",
  "connect you with more students",
  "double your student inquiries",
  "periódicos digitales",
];

const WEAK_PHRASES = [
  "seo",
  "cold calling",
  "lead generation",
  "social media management",
  "bookkeeping",
  "web design",
  "website redesign",
  "digital marketing",
  "marketing agency",
  "our agency",
  "our services",
  "our team can",
  "free audit",
  "help many local companies",
  "commercial cleaning",
  "janitorial",
  "propuesta",
  "small and mid-sized businesses",
  "i came across your",
  "grow your business",
  "more clients",
  "complimentary",
  "free trial",
  "30-day trial",
  "no credit card",
  "quick audit",
  "business development",
  "prospecting",
  "hola, es un placer",
];

const FREE_MAIL = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "msn.com",
  "me.com",
  "proton.me",
  "protonmail.com",
]);

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export function isFreeMail(domain: string): boolean {
  return FREE_MAIL.has(domain);
}

export function contentCheck(email: string, body: string): GuardVerdict {
  const lower = body.toLowerCase();
  const text = body.replace(/\[Phone:[^\]]*\]/gi, "").trim();

  // Gibberish: one long run of letters, no spaces — "gBiyjksUUPCYdHofMnr".
  if (/^[A-Za-z]{10,}$/.test(text)) {
    return { action: "quarantine", reason: "gibberish" };
  }

  // Dotted Gmail throwaways — "x.i.m.e.na.v.i.p.80.1@gmail.com".
  const [local, domain] = email.toLowerCase().split("@");
  if (
    (domain === "gmail.com" || domain === "googlemail.com") &&
    (local?.match(/\./g)?.length ?? 0) >= 4
  ) {
    return { action: "quarantine", reason: "dotted-gmail" };
  }

  const strong = STRONG_PHRASES.find((p) => lower.includes(p));
  if (strong) return { action: "quarantine", reason: `pitch: "${strong}"` };

  const weakHits = WEAK_PHRASES.filter((p) =>
    p === "seo" ? /\bseo\b/.test(lower) : lower.includes(p),
  );
  if (weakHits.length >= 2) {
    return { action: "quarantine", reason: `pitch: ${weakHits.slice(0, 3).join(", ")}` };
  }

  return { action: "allow" };
}

// ------------------------------------------------------------
// Blocked senders (QUARANTINE) — table public.blocked_senders
// ------------------------------------------------------------

/** Matches an exact email OR the whole domain. Fails open on DB error. */
export async function isBlockedSender(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  const d = emailDomain(e);
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("blocked_senders")
      .select("id")
      .in("value", [e, d])
      .limit(1);
    if (error) return false;
    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Block a sender. Company domains are blocked whole (the pitch shops rotate
 * first names: meredith@, presley@, lachlan@…); free-mail addresses are
 * blocked individually so we never block all of gmail.com.
 */
export async function blockSender(
  email: string,
  note: string | null,
): Promise<{ ok: boolean; value?: string; error?: string }> {
  const e = email.trim().toLowerCase();
  const d = emailDomain(e);
  if (!d) return { ok: false, error: "No domain" };
  const value = isFreeMail(d) ? e : d;
  try {
    const supabase = getServerClient();
    const { error } = await supabase
      .from("blocked_senders")
      .upsert({ value, note }, { onConflict: "value", ignoreDuplicates: true });
    if (error) return { ok: false, error: error.message };
    return { ok: true, value };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "err" };
  }
}

// ------------------------------------------------------------
// Per-IP rate limit for the contact form. In-memory per worker (same
// trade-off as lib/rate-limit.ts); the Vercel firewall rule is the
// cross-instance backstop.
// ------------------------------------------------------------

const TEN_MIN = 10 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const PER_10_MIN = 3;
const PER_DAY = 10;
const hits = new Map<string, number[]>();

export function contactRateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < DAY);
  const recent = list.filter((t) => now - t < TEN_MIN).length;
  if (recent >= PER_10_MIN || list.length >= PER_DAY) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5_000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < DAY)) hits.delete(k);
  }
  return false;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || "unknown";
}
