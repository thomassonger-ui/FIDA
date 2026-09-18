/**
 * Drip campaign engine — prospects only.
 *
 * Students: three emails (day 0, +3, +7). Dentists: the five-email CE
 * sequence in lib/drip-ce.ts (weekly). Sends go out through
 * Resend from DRIP_FROM (reply@fldentalassisting.com), capped per day by
 * PROSPECT_DAILY_EMAIL_LIMIT (default 10) so a brand-new sending domain
 * warms up instead of getting filtered by Gmail.
 *
 * Who gets mail: drip_status = 'active', a usable email (email_ok, not
 * unsubscribed), stage Identified or Nurture, not removed. Sending does NOT
 * change the stage; a click on any link in the email does (→ nurture, drip
 * paused — see /api/drip/click). The cap counts
 * rows in prospect_sends with status 'sent' since midnight UTC.
 *
 * Every message carries the CAN-SPAM postal address and a one-click
 * unsubscribe (RFC 8058 List-Unsubscribe headers + a footer link). The
 * unsubscribe link is signed with UNSUBSCRIBE_SECRET so nobody can
 * unsubscribe someone else by guessing an email.
 *
 * Server-only. Never import from a client component.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { getServerClient } from "./supabase";
import { logTouch, sentToday } from "./prospects-db";
import {
  MAILING_ADDRESS,
  currentLimits,
  displayName,
  emailBlocked,
  type Prospect,
} from "./prospects-shared";
import { COHORTS } from "./cohort";
import { siteOrigin } from "./site-url";
import { CE_SCHEDULE_LABEL, CE_STEP_COUNT, CE_STEP_DELAYS_DAYS, renderCeDrip } from "./drip-ce";

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const RESEND_API_URL = "https://api.resend.com/emails";

/** Student track: days to wait after the previous step. Index 0 is the first email. */
export const STEP_DELAYS_DAYS = [0, 3, 4]; // day 0, +3, +7 cumulative
/** Longest sequence of any track — the API clamps test steps against this. */
export const STEP_COUNT = Math.max(STEP_DELAYS_DAYS.length, CE_STEP_COUNT);

export const SCHEDULE_LABEL = `dentists: ${CE_SCHEDULE_LABEL} · students: 3 emails — day 0, day 3, day 7`;

function isEmployer(p: Prospect): boolean {
  return p.segment === "dentist_employer";
}
/** Number of steps in this prospect's sequence. */
export function stepCountFor(p: Prospect): number {
  return isEmployer(p) ? CE_STEP_COUNT : STEP_DELAYS_DAYS.length;
}
function stepDelaysFor(p: Prospect): number[] {
  return isEmployer(p) ? CE_STEP_DELAYS_DAYS : STEP_DELAYS_DAYS;
}

function fromAddress(): string {
  return (
    process.env.DRIP_FROM ||
    process.env.RESEND_FROM ||
    "FIDA Admissions <reply@fldentalassisting.com>"
  );
}

function replyTo(): string | undefined {
  return process.env.DRIP_REPLY_TO || undefined;
}

/** Bare address out of "Name <addr>" — used for the mailto: unsubscribe. */
function bareAddress(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).trim();
}

// ------------------------------------------------------------
// Unsubscribe tokens
// ------------------------------------------------------------

function unsubscribeSecret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("Set UNSUBSCRIBE_SECRET (or ADMIN_SESSION_SECRET) in Vercel.");
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", unsubscribeSecret())
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

export function unsubscribeTokenValid(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(unsubscribeToken(email));
    const given = Buffer.from((token ?? "").trim());
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

// ------------------------------------------------------------
// Click tracking. Every http(s) link in the HTML part (except unsubscribe)
// is routed through /api/drip/click, which records the click, moves the
// prospect into the pipeline and pauses their drip — a person who clicked
// is a lead for a human, not a target for email 3. Signed so a link can't
// be forged for someone else's row.
// ------------------------------------------------------------

export function clickToken(prospectId: string): string {
  return createHmac("sha256", unsubscribeSecret())
    .update(`click:${prospectId}`)
    .digest("hex")
    .slice(0, 32);
}

export function clickTokenValid(prospectId: string, token: string): boolean {
  try {
    const expected = Buffer.from(clickToken(prospectId));
    const given = Buffer.from((token ?? "").trim());
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

/** Destinations a click link may redirect to. Anything else is dropped. */
export function clickTargetAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    const site = new URL(siteOrigin()).host;
    return (
      u.protocol === "https:" &&
      (u.host === site || u.host === "www.youtube.com" || u.host === "youtu.be")
    );
  } catch {
    return false;
  }
}

export function trackLinks(html: string, prospectId: string): string {
  const origin = siteOrigin();
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (m, url: string) => {
    if (url.includes("/unsubscribe") || url.includes("/api/unsubscribe")) return m;
    if (!clickTargetAllowed(url)) return m;
    const q = new URLSearchParams({ p: prospectId, t: clickToken(prospectId), u: url });
    return `href="${origin}/api/drip/click?${q.toString()}"`;
  });
}

export function unsubscribeUrl(email: string, oneClick = false): string {
  const e = email.trim().toLowerCase();
  const path = oneClick ? "/api/unsubscribe" : "/unsubscribe";
  return `${siteOrigin()}${path}?e=${encodeURIComponent(e)}&t=${unsubscribeToken(e)}`;
}

// ------------------------------------------------------------
// Templates — plain text on purpose. Personal-looking mail from a small
// school lands better than HTML marketing, and it is what a human would
// actually type. Keep each under ~120 words.
// ------------------------------------------------------------

export type DripMessage = { subject: string; text: string; html?: string };

function firstName(p: Prospect): string {
  if (p.first_name?.trim()) return p.first_name.trim();
  const n = displayName(p);
  return n === "—" || n.includes("@") ? "there" : n.split(" ")[0];
}

function programLine(p: Prospect): string {
  switch (p.program_interest) {
    case "efda":
      return "Our EFDA course is $1,049 total, hybrid (online theory plus clinical hours in your own office), and you can start any time.";
    case "radiography":
      return "Our Radiography for Dental Personnel course is $499 total, fully online with a short capstone under your supervising dentist, and you can start any time.";
    default: {
      const next = COHORTS[0];
      return `Our next Entry Level Dental Assisting class starts ${next.date.en} (${next.schedule.en}) at our Jacksonville campus. Tuition is $9,700 plus a $150 registration fee, with interest-free payment plans.`;
    }
  }
}

function signature(): string {
  return [
    "",
    "Debbie & Ashley Sanders",
    "Florida Institute of Dental Assisting",
    "(reply to this email and a real person answers)",
  ].join("\n");
}

function footer(p: Prospect): string {
  return [
    "",
    "—",
    MAILING_ADDRESS,
    `Don't want these emails? Unsubscribe here: ${unsubscribeUrl(p.email!)}`,
  ].join("\n");
}

export function renderDrip(step: number, p: Prospect): DripMessage {
  if (isEmployer(p)) return renderCeDrip(step, p, unsubscribeUrl(p.email!));
  const origin = siteOrigin();
  const name = firstName(p);
  const body: Record<number, DripMessage> = {
    0: {
      subject: "A dental assisting career in Jacksonville — quick question",
      text: [
        `Hi ${name},`,
        "",
        "I run admissions at the Florida Institute of Dental Assisting here in Jacksonville. We're a small school — one classroom, two instructors, and graduates working in offices all over Duval, Clay and St. Johns.",
        "",
        programLine(p),
        "",
        "Would it help to see what a week in the program looks like? Reply with \"yes\" and I'll send it over, or take the two-minute application here:",
        `${origin}/atticus`,
        signature(),
        footer(p),
      ].join("\n"),
    },
    1: {
      subject: "What it actually costs (and how people pay for it)",
      text: [
        `Hi ${name},`,
        "",
        "The question we get most is money, so here it is plainly.",
        "",
        programLine(p),
        "",
        "Nobody pays it all up front. For the diploma it's $150 to register (which counts toward the $750 seat deposit after admissions), and the rest on a 6- or 8-month in-house plan with no interest. Books, scrubs, CPR certification and your clinical kit are all included.",
        "",
        `Full breakdown: ${origin}/tuition`,
        "",
        "If a payment plan is what's been holding you back, reply and tell me — we'll work it out.",
        signature(),
        footer(p),
      ].join("\n"),
    },
    2: {
      subject: "Last note from me — seats for the next class",
      text: [
        `Hi ${name},`,
        "",
        "I won't keep emailing — this is my last note unless you'd like to talk.",
        "",
        `${COHORTS[0].label.en} starts ${COHORTS[0].date.en}, and the ${COHORTS[1].label.en} follows on ${COHORTS[1].date.en}. Classes are small on purpose, so seats do fill.`,
        "",
        "If dental assisting is something you want, the application takes two minutes and a real advisor calls you back within one business day:",
        `${origin}/atticus`,
        "",
        "Or just reply to this email with a question. Either way, I hope we meet.",
        signature(),
        footer(p),
      ].join("\n"),
    },
  };
  return body[step] ?? body[STEP_DELAYS_DAYS.length - 1];
}

// ------------------------------------------------------------
// Resend
// ------------------------------------------------------------

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  unsubscribeMailto: string;
  unsubscribeUrl: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set in Vercel." };

  const payload: Record<string, unknown> = {
    from: fromAddress(),
    to: [opts.to],
    subject: opts.subject,
    text: opts.text,
    ...(opts.html ? { html: opts.html } : {}),
    headers: {
      "List-Unsubscribe": `<${opts.unsubscribeUrl}>, <mailto:${opts.unsubscribeMailto}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
  const rt = replyTo();
  if (rt) payload.reply_to = rt;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) return { ok: false, error: json.message || `HTTP ${res.status}` };
    return { ok: true, id: json.id ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

// ------------------------------------------------------------
// Eligibility
// ------------------------------------------------------------

const DRIP_STAGES = ["identified", "nurture"];

export function dripEligible(p: Prospect): boolean {
  return (
    p.drip_status === "active" &&
    !p.removed_at &&
    !emailBlocked(p) &&
    DRIP_STAGES.includes(p.stage) &&
    p.drip_step < stepCountFor(p)
  );
}

/** True when the next step's wait has elapsed. */
export function dripDue(p: Prospect, now = Date.now()): boolean {
  if (!dripEligible(p)) return false;
  if (p.drip_step === 0 || !p.drip_last_sent_at) return true;
  const waitDays = stepDelaysFor(p)[p.drip_step] ?? 0;
  const last = new Date(p.drip_last_sent_at).getTime();
  return now - last >= waitDays * 24 * 60 * 60 * 1000;
}

// ------------------------------------------------------------
// Batch runner — called by /api/cron/drip and the admin "send now" button
// ------------------------------------------------------------

export type DripRunResult = {
  limit: number;
  alreadySentToday: number;
  due: number;
  sent: number;
  failed: number;
  skipped: number;
  details: { prospect: string; email: string; step: number; ok: boolean; error?: string }[];
};

export async function runDripBatch(opts: { dryRun?: boolean } = {}): Promise<DripRunResult> {
  const limit = currentLimits().email;
  const alreadySentToday = await sentToday();
  const remaining = Math.max(0, limit - alreadySentToday);

  const result: DripRunResult = {
    limit,
    alreadySentToday,
    due: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("drip_status", "active")
    .is("removed_at", null)
    .is("unsubscribed_at", null)
    .eq("email_ok", true)
    .not("email", "is", null)
    .in("stage", DRIP_STAGES)
    .order("drip_step", { ascending: false }) // follow-ups before cold intros
    .order("score", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);

  const now = Date.now();
  const due = ((data as Prospect[]) ?? []).filter((p) => dripDue(p, now));
  result.due = due.length;

  // The daily cap is an INTAKE cap: it limits how many new dentists get
  // their first email today. Follow-ups to people already in the sequence
  // always go out, so the intake never shrinks as the sequence fills up.
  const followUps = due.filter((p) => p.drip_step > 0);
  const intros = due.filter((p) => p.drip_step === 0);
  const batch = [...followUps, ...intros.slice(0, remaining)];
  result.skipped = intros.length - Math.min(intros.length, remaining);
  if (opts.dryRun) {
    result.details = batch.map((p) => ({
      prospect: displayName(p),
      email: p.email!,
      step: p.drip_step,
      ok: true,
    }));
    return result;
  }

  const mailto = bareAddress(fromAddress());

  for (const p of batch) {
    const step = p.drip_step;
    const msg = renderDrip(step, p);
    const to = p.email!.trim().toLowerCase();
    const send = await sendViaResend({
      to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html ? trackLinks(msg.html, p.id) : undefined,
      unsubscribeMailto: mailto,
      unsubscribeUrl: unsubscribeUrl(to, true),
    });

    await supabase.from("prospect_sends").insert({
      prospect_id: p.id,
      step,
      subject: msg.subject,
      to_email: to,
      provider_id: send.ok ? send.id : null,
      status: send.ok ? "sent" : "failed",
      error: send.ok ? null : send.error,
    });

    if (send.ok) {
      const nextStep = step + 1;
      await supabase
        .from("prospects")
        .update({
          drip_step: nextStep,
          drip_last_sent_at: new Date().toISOString(),
          drip_status: nextStep >= stepCountFor(p) ? "finished" : "active",
        })
        .eq("id", p.id);
      await logTouch(p.id, {
        kind: "email",
        outcome: "sent",
        body: `Drip ${step + 1}/${stepCountFor(p)}: ${msg.subject}`,
        actor: "drip",
      });
      result.sent++;
    } else {
      result.failed++;
      // A hard failure from the provider (bad address, suppression list)
      // should not be retried every day. Pause and let a human look.
      if (/not.*valid|suppress|bounce|invalid/i.test(send.error)) {
        await supabase.from("prospects").update({ drip_status: "paused" }).eq("id", p.id);
      }
    }

    result.details.push({
      prospect: displayName(p),
      email: to,
      step,
      ok: send.ok,
      error: send.ok ? undefined : send.error,
    });

    // Resend allows ~2 requests/second. Space sends out a little.
    await new Promise((r) => setTimeout(r, 600));
  }

  return result;
}

// ------------------------------------------------------------
// Headline numbers for /admin/prospects
// ------------------------------------------------------------

export type DripStats = {
  active: number;
  dueNow: number;
  paused: number;
  sentToday: number;
  limit: number;
  completed: number;
  unsubscribed: number;
  fencedOff: number;
  sentAllTime: number;
  failed: number;
};

export async function dripStats(): Promise<DripStats> {
  const supabase = getServerClient();
  const head = () => supabase.from("prospects").select("id", { count: "exact", head: true });
  const [activeRows, paused, completed, unsubscribed, fenced, sentAll, failed, sentTodayN] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("id,drip_status,drip_step,drip_last_sent_at,stage,email,email_ok,unsubscribed_at,removed_at")
        .eq("drip_status", "active")
        .is("removed_at", null)
        .limit(5000),
      head().eq("drip_status", "paused").is("removed_at", null),
      head().eq("drip_status", "finished").is("unsubscribed_at", null),
      head().not("unsubscribed_at", "is", null),
      head().is("removed_at", null).or("email.is.null,email_ok.eq.false,unsubscribed_at.not.is.null"),
      supabase.from("prospect_sends").select("id", { count: "exact", head: true }).eq("status", "sent"),
      supabase.from("prospect_sends").select("id", { count: "exact", head: true }).eq("status", "failed"),
      sentToday(),
    ]);
  const now = Date.now();
  const active = (activeRows.data as Prospect[] | null) ?? [];
  return {
    active: active.length,
    dueNow: active.filter((p) => dripDue(p, now)).length,
    paused: paused.count ?? 0,
    sentToday: sentTodayN,
    limit: currentLimits().email,
    completed: completed.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
    fencedOff: fenced.count ?? 0,
    sentAllTime: sentAll.count ?? 0,
    failed: failed.count ?? 0,
  };
}

/** Send step N of the sequence to an arbitrary address — for checking setup. */
export async function sendDripTest(
  to: string,
  step = 0,
  track: "student" | "employer" = "student"
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const fake = {
    id: "test",
    first_name: "Test",
    last_name: track === "employer" ? "Sample" : null,
    full_name: "Test Prospect",
    email: to,
    segment: track === "employer" ? "dentist_employer" : null,
    program_interest: track === "employer" ? "staff_training" : "entry_level",
    drip_step: step,
    stage: "identified",
  } as unknown as Prospect;
  const msg = renderDrip(step, fake);
  return sendViaResend({
    to,
    subject: `[TEST] ${msg.subject}`,
    text: msg.text,
    html: msg.html,
    unsubscribeMailto: bareAddress(fromAddress()),
    unsubscribeUrl: unsubscribeUrl(to, true),
  });
}

/** Turn the drip on or off for a set of prospects. */
export async function setDrip(
  ids: string[],
  status: "active" | "paused"
): Promise<{ changed: number; blocked: number }> {
  const supabase = getServerClient();
  let changed = 0;
  let blocked = 0;
  for (const id of ids) {
    const { data } = await supabase.from("prospects").select("*").eq("id", id).maybeSingle();
    const p = data as Prospect | null;
    if (!p) continue;
    if (status === "active" && (emailBlocked(p) || p.removed_at)) {
      blocked++;
      continue;
    }
    const patch: Record<string, unknown> = { drip_status: status };
    // Re-starting someone who finished restarts from the top.
    if (status === "active" && p.drip_step >= stepCountFor(p)) {
      patch.drip_step = 0;
      patch.drip_last_sent_at = null;
    }
    const { error } = await supabase.from("prospects").update(patch).eq("id", id);
    if (!error) changed++;
  }
  return { changed, blocked };
}
