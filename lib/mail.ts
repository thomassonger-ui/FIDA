/**
 * One place to send transactional mail (Resend).
 *
 * Lifted verbatim out of lib/enrollment.ts, which had it as a private helper,
 * so the registration routes can send staff notices without duplicating it.
 * Behaviour is unchanged — same env vars, same payload shape.
 *
 * Env:
 *   RESEND_API_KEY         required, or every send fails closed
 *   ENROLLMENT_FROM        from address (falls back to DRIP_FROM, RESEND_FROM)
 *   DRIP_REPLY_TO          optional reply-to
 *   ENROLLMENT_NOTIFY_EMAIL  where staff notices go (default success@)
 */

import { SCHOOL } from "@/lib/enrollment-agreement-text";

export type MailResult = { ok: true } | { ok: false; error: string };

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string }[]; // content = base64
}): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set." };
  const from =
    process.env.ENROLLMENT_FROM ||
    process.env.DRIP_FROM ||
    process.env.RESEND_FROM ||
    "FIDA Admissions <reply@fldentalassisting.com>";
  const payload: Record<string, unknown> = {
    from,
    to: [opts.to],
    subject: opts.subject,
    text: opts.text,
  };
  if (opts.attachments?.length) payload.attachments = opts.attachments;
  const rt = process.env.DRIP_REPLY_TO;
  if (rt) payload.reply_to = rt;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, error: j.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

/** Where staff notices go. Same resolution the signed-agreement notice uses. */
export function staffNotifyAddress(): string {
  return process.env.ENROLLMENT_NOTIFY_EMAIL?.trim() || SCHOOL.email;
}
