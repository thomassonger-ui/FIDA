/**
 * Drip campaign engine — prospects only.
 *
 * Three emails per prospect: day 0, +3 days, +7 days. Sends go out through
 * Resend from DRIP_FROM (reply@fldentalassisting.com), capped per day by
 * PROSPECT_DAILY_EMAIL_LIMIT (default 10) so a brand-new sending domain
 * warms up instead of getting filtered by Gmail.
 *
 * Who gets mail: drip_status = 'active', a usable email (email_ok, not
 * unsubscribed), stage Identified or Nurture, not removed. The cap counts
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

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const RESEND_API_URL = "https://api.resend.com/emails";

/** Days to wait after the previous step. Index 0 is the first email. */
export const STEP_DELAYS_DAYS = [0, 3, 4]; // day 0, +3, +7 cumulative
export const STEP_COUNT = STEP_DELAYS_DAYS.length;

export const SCHEDULE_LABEL = "3 emails — day 0, day 3, day 7";

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

export type DripMessage = { subject: string; text: string };

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

/**
 * Dentist / employer track — for the FL DOH licensed-dentist list. The buyer
 * is the practice owner; the product is Radiography + EFDA for their
 * assistants, online, no time away from the chair.
 */
function renderEmployerDrip(step: number, p: Prospect): DripMessage {
  const origin = siteOrigin();
  const last = p.last_name?.trim();
  const greeting = last ? `Dr. ${last},` : "Doctor,";
  const body: Record<number, DripMessage> = {
    0: {
      subject: "Radiography certification for your assistants — without losing chair time",
      text: [
        greeting,
        "",
        "We're the Florida Institute of Dental Assisting in Jacksonville. Two things we hear from practice owners every week: an assistant who still can't take x-rays, and one who could be doing expanded functions but isn't certified.",
        "",
        "We fix both without pulling anyone out of your office:",
        "",
        "• Radiography for Dental Personnel — $499, fully online, capstone signed off by you as the supervising dentist.",
        "• Expanded Functions (EFDA) — $1,049, online theory plus clinical hours in your own operatory.",
        "",
        "Both are open enrollment — an assistant can start this week. Reply with how many assistants you'd want certified and I'll send the enrollment link and answer any questions.",
        signature(),
        footer(p),
      ].join("\n"),
    },
    1: {
      subject: "What an EFDA actually does for your schedule",
      text: [
        greeting,
        "",
        "Quick follow-up. A Florida-certified expanded functions assistant can place and finish restorations and take on the chairside tasks that currently wait on you — which is the difference between a full column and a backed-up one.",
        "",
        "The course is $1,049 per assistant, online theory at their own pace, and the clinical component happens chairside in your office under your supervision — so the training is on your patients, your materials, your standards.",
        "",
        `Course details: ${origin}/programs`,
        "",
        "If you'd rather talk it through, reply with a good time and one of us will call.",
        signature(),
        footer(p),
      ].join("\n"),
    },
    2: {
      subject: "Last note — the x-ray gap",
      text: [
        greeting,
        "",
        "I'll leave you alone after this one.",
        "",
        "If nothing else, get every assistant in the office radiography-certified. It's $499, it's online, and Florida requires it before an assistant can expose radiographs. It is the single credential that lets your team handle imaging without waiting on a hygienist or on you.",
        "",
        `Enroll an assistant here: ${origin}/programs`,
        "",
        "Or reply with a question. Thanks for reading — and thanks for what you do for your patients.",
        signature(),
        footer(p),
      ].join("\n"),
    },
  };
  return body[step] ?? body[STEP_COUNT - 1];
}

export function renderDrip(step: number, p: Prospect): DripMessage {
  if (p.segment === "dentist_employer") return renderEmployerDrip(step, p);
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
        "Nobody pays it all up front. For the diploma it's $150 to register, a $750 seat deposit after admissions, and the rest on a 6- or 8-month in-house plan with no interest. Books, scrubs, CPR certification and your clinical kit are all included.",
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
  return body[step] ?? body[STEP_COUNT - 1];
}

// ------------------------------------------------------------
// Resend
// ------------------------------------------------------------

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
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
    p.drip_step < STEP_COUNT
  );
}

/** True when the next step's wait has elapsed. */
export function dripDue(p: Prospect, now = Date.now()): boolean {
  if (!dripEligible(p)) return false;
  if (p.drip_step === 0 || !p.drip_last_sent_at) return true;
  const waitDays = STEP_DELAYS_DAYS[p.drip_step] ?? 0;
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

  const batch = due.slice(0, remaining);
  result.skipped = due.length - batch.length;
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
          drip_status: nextStep >= STEP_COUNT ? "finished" : "active",
          ...(p.stage === "identified" ? { stage: "nurture" } : {}),
        })
        .eq("id", p.id);
      await logTouch(p.id, {
        kind: "email",
        outcome: "sent",
        body: `Drip ${step + 1}/${STEP_COUNT}: ${msg.subject}`,
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
    if (status === "active" && p.drip_step >= STEP_COUNT) {
      patch.drip_step = 0;
      patch.drip_last_sent_at = null;
    }
    const { error } = await supabase.from("prospects").update(patch).eq("id", id);
    if (!error) changed++;
  }
  return { changed, blocked };
}
