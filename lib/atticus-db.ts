/**
 * Atticus persistence helpers.
 *
 * Every call to /api/atticus logs a session row (upsert) and the latest
 * user + assistant messages. Failure modes are soft — if Supabase is down
 * we still let the chat proceed, but we log to the server console.
 */

import crypto from "node:crypto";
import { getServerClient } from "./supabase";

export type Role = "user" | "assistant" | "system";

export type LeadFields = {
  name?: string;
  email?: string;
  phone?: string;
  programInterest?: string;
  timeline?: string;
};

/** SHA-256 hash of IP — we don't need to store raw IPs to rate-limit. */
export function hashIp(ip: string | null | undefined) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/* What Atticus just asked for. A bare reply like "Tom Songer" or "904 555
   0101" carries no grammar to match on — the only thing that tells us what it
   IS, is the question it answers. This is why leads were landing in /admin as
   "Unknown" with no phone: the patterns below only fired on "my name is X",
   and nobody types that when they've just been asked their name. */
function lastQuestionAsked(assistantText?: string | null):
  | "name"
  | "email"
  | "phone"
  | null {
  if (!assistantText) return null;
  const t = assistantText.toLowerCase();
  /* Order matters: the phone ask often repeats the word "email" ("we can do
     it all over email if you'd rather"), so phone is tested first. */
  if (/(phone|number to (?:call|reach)|best number|cell)/.test(t)) return "phone";
  if (/(e-?mail)/.test(t)) return "email";
  if (/(your name|what should i call you|who am i (?:speaking|chatting) with|first name)/.test(t))
    return "name";
  return null;
}

/** A reply that is plausibly just a person's name — two or three words, no
 *  digits, no @, not a sentence. Deliberately strict: a wrong name in the CRM
 *  is worse than a blank one, because staff will read it out loud on a call. */
function looksLikeBareName(text: string): string | null {
  const t = text.trim().replace(/^(?:it(?:'|’)s|this is|i(?:'|’)m|i am)\s+/i, "").replace(/[.!]$/, "");
  if (t.length < 2 || t.length > 60) return null;
  if (/[@\d]/.test(t)) return null;
  const words = t.split(/\s+/);
  if (words.length > 3) return null;
  if (!words.every((w) => /^[\p{L}][\p{L}'’.-]*$/u.test(w))) return null;
  /* Common one-word replies that are not names. */
  if (/^(yes|no|yeah|yep|nope|sure|ok|okay|thanks|hi|hello|hey|maybe|none|nothing|skip|later)$/i.test(t))
    return null;
  return t;
}

/**
 * Extract lead fields from the latest user message.
 *
 * `priorAssistant` is the message Atticus sent immediately before — pass it
 * whenever it's available. Without it, only self-describing replies ("my name
 * is …", a string containing an @) can be captured, which is how a lead ends
 * up with an email and nothing else.
 */
export function extractLeadFields(
  userText: string,
  priorAssistant?: string | null
): LeadFields {
  const out: LeadFields = {};
  const asked = lastQuestionAsked(priorAssistant);

  const emailMatch = userText.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  );
  if (emailMatch) out.email = emailMatch[0];

  // Phone: tolerant match for US-style numbers
  const phoneMatch = userText.match(
    /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );
  if (phoneMatch) out.phone = phoneMatch[0];

  /* Answering the phone question with bare digits — "9045550101", "904 555
     0101" — after the formatted pattern above has had its chance. */
  if (!out.phone && asked === "phone") {
    const digits = userText.replace(/\D/g, "");
    if (digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))) {
      out.phone = userText.trim().slice(0, 40);
    }
  }

  // Name: look for "my name is X" / "I'm X" / "I am X"
  const nameMatch = userText.match(
    /\b(?:my name is|i(?:'|’)m|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i
  );
  if (nameMatch) out.name = nameMatch[1];

  /* Answering the name question with just the name. This is the normal case
     and it used to capture nothing at all. */
  if (!out.name && asked === "name") {
    const bare = looksLikeBareName(userText);
    if (bare) out.name = bare;
  }

  /* A reply to the email question that carries a name too — "Tom Songer,
     tom@example.com" — gives us the name for free. */
  if (!out.name && out.email) {
    const withoutEmail = userText.replace(out.email, " ").replace(/[,;|]/g, " ");
    const bare = looksLikeBareName(withoutEmail);
    if (bare) out.name = bare;
  }

  // Program interest: FIDA-specific keywords (EFDA + RDP-CE).
  const programRegex =
    /(expanded functions|efda|rdp-?ce|rdp|radiography|radiology|x-?ray|dental assisting|dental assistant)/i;
  const programMatch = userText.match(programRegex);
  if (programMatch) {
    const t = programMatch[1].toLowerCase();
    if (
      t.includes("rdp") ||
      t.includes("radio") ||
      t.includes("x-ray") ||
      t.includes("xray")
    ) {
      out.programInterest = "RDP-CE (Radiography)";
    } else if (t.includes("efda") || t.includes("expanded functions")) {
      out.programInterest = "EFDA";
    } else {
      // Generic "dental assistant/assisting" — leave as-is so staff can route.
      out.programInterest = "Dental Assisting (program TBD)";
    }
  }

  // Timeline: catchphrases
  if (/\b(asap|right away|immediately|this month)\b/i.test(userText))
    out.timeline = "ASAP";
  else if (/\b(next cohort|summer|june)\b/i.test(userText))
    out.timeline = "Summer 2026";
  else if (/\b(within (?:a |one )?year|this year)\b/i.test(userText))
    out.timeline = "Within a year";

  return out;
}

/** Upsert session row (create on first message, update on subsequent).
 *  Also marks the session as handed off the moment we capture an email,
 *  so the lead appears on /admin/leads even if the model never said the
 *  sentinel closing phrase. */
export async function upsertSession(params: {
  sessionId: string;
  ipHash: string | null;
  userAgent: string | null;
  lead?: LeadFields;
}) {
  try {
    const supabase = getServerClient();
    const { sessionId, ipHash, userAgent, lead } = params;

    // Read the current row so we know whether this is the first time we've
    // seen an email/phone for this session (to set handed_off_at exactly once).
    const { data: existing } = await supabase
      .from("atticus_sessions")
      .select("id, lead_email, handed_off_at")
      .eq("id", sessionId)
      .maybeSingle();

    const captureFirstEmail =
      !!lead?.email && !existing?.lead_email && !existing?.handed_off_at;

    // Try update first; if no row, insert.
    const patch: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
    };
    if (lead?.name) patch.lead_name = lead.name;
    if (lead?.email) patch.lead_email = lead.email;
    if (lead?.phone) patch.lead_phone = lead.phone;
    if (lead?.programInterest) patch.program_interest = lead.programInterest;
    if (lead?.timeline) patch.lead_timeline = lead.timeline;
    if (captureFirstEmail) patch.handed_off_at = new Date().toISOString();

    if (existing) {
      const { error: updateErr } = await supabase
        .from("atticus_sessions")
        .update(patch)
        .eq("id", sessionId);
      if (updateErr) {
        console.error("[atticus-db] update session failed:", updateErr.message);
      }
      return;
    }

    // No row yet — insert. If we already captured an email on the very first
    // message (unusual but possible), mark handoff at insert time too.
    const { error: insertErr } = await supabase.from("atticus_sessions").insert({
      id: sessionId,
      ip_hash: ipHash,
      user_agent: userAgent,
      lead_name: lead?.name ?? null,
      lead_email: lead?.email ?? null,
      lead_phone: lead?.phone ?? null,
      program_interest: lead?.programInterest ?? null,
      lead_timeline: lead?.timeline ?? null,
      handed_off_at: lead?.email ? new Date().toISOString() : null,
    });
    if (insertErr) {
      console.error("[atticus-db] insert session failed:", insertErr.message);
    }
  } catch (err) {
    console.error(
      "[atticus-db] upsertSession threw:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function logMessage(params: {
  sessionId: string;
  role: Role;
  content: string;
  flagged?: boolean;
  flagReason?: string | null;
}) {
  try {
    const supabase = getServerClient();
    const { sessionId, role, content, flagged = false, flagReason = null } =
      params;
    const { error } = await supabase.from("atticus_messages").insert({
      session_id: sessionId,
      role,
      content,
      flagged,
      flag_reason: flagReason,
    });
    if (error) {
      console.error("[atticus-db] logMessage failed:", error.message);
      return;
    }

    // Increment counters on the session row.
    const incPatch: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
    };
    // Supabase-js has no atomic increment via client; use rpc if you need one.
    // For a demo, a soft-race is fine — read + write.
    const { data: row } = await supabase
      .from("atticus_sessions")
      .select("message_count, flagged_count")
      .eq("id", sessionId)
      .maybeSingle();
    if (row) {
      incPatch.message_count = (row.message_count ?? 0) + 1;
      incPatch.flagged_count = (row.flagged_count ?? 0) + (flagged ? 1 : 0);
    }
    await supabase
      .from("atticus_sessions")
      .update(incPatch)
      .eq("id", sessionId);
  } catch (err) {
    console.error(
      "[atticus-db] logMessage threw:",
      err instanceof Error ? err.message : err
    );
  }
}

/** Mark a session as handed off to a human advisor. */
export async function markHandoff(sessionId: string) {
  try {
    const supabase = getServerClient();
    await supabase
      .from("atticus_sessions")
      .update({ handed_off_at: new Date().toISOString() })
      .eq("id", sessionId);
  } catch (err) {
    console.error(
      "[atticus-db] markHandoff threw:",
      err instanceof Error ? err.message : err
    );
  }
}
