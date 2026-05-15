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

/** Extract lead fields from the most recent user messages with best-effort regex. */
export function extractLeadFields(userText: string): LeadFields {
  const out: LeadFields = {};

  const emailMatch = userText.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  );
  if (emailMatch) out.email = emailMatch[0];

  // Phone: tolerant match for US-style numbers
  const phoneMatch = userText.match(
    /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );
  if (phoneMatch) out.phone = phoneMatch[0];

  // Name: look for "my name is X" / "I'm X" / "I am X"
  const nameMatch = userText.match(
    /\b(?:my name is|i(?:'|’)m|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i
  );
  if (nameMatch) out.name = nameMatch[1];

  // Program interest: coarse keyword match
  const programRegex =
    /(medical assisting|medical billing|medical coding|billing (?:and|&) coding|patient care|phlebotomy|ccma|cpc|cpct)/i;
  const programMatch = userText.match(programRegex);
  if (programMatch) {
    const t = programMatch[1].toLowerCase();
    if (t.includes("patient")) out.programInterest = "Patient Care Technology";
    else if (t.includes("billing") || t.includes("coding") || t === "cpc")
      out.programInterest = "Medical Billing & Coding";
    else out.programInterest = "Medical Assisting";
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

/** Upsert session row (create on first message, update on subsequent). */
export async function upsertSession(params: {
  sessionId: string;
  ipHash: string | null;
  userAgent: string | null;
  lead?: LeadFields;
}) {
  try {
    const supabase = getServerClient();
    const { sessionId, ipHash, userAgent, lead } = params;

    // Try update first; if no row, insert.
    const patch: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
    };
    if (lead?.name) patch.lead_name = lead.name;
    if (lead?.email) patch.lead_email = lead.email;
    if (lead?.phone) patch.lead_phone = lead.phone;
    if (lead?.programInterest) patch.program_interest = lead.programInterest;
    if (lead?.timeline) patch.lead_timeline = lead.timeline;

    const { data: updated, error: updateErr } = await supabase
      .from("atticus_sessions")
      .update(patch)
      .eq("id", sessionId)
      .select("id")
      .maybeSingle();

    if (updateErr) {
      console.error("[atticus-db] update session failed:", updateErr.message);
    }
    if (updated) return;

    // No row yet — insert.
    const { error: insertErr } = await supabase.from("atticus_sessions").insert({
      id: sessionId,
      ip_hash: ipHash,
      user_agent: userAgent,
      lead_name: lead?.name ?? null,
      lead_email: lead?.email ?? null,
      lead_phone: lead?.phone ?? null,
      program_interest: lead?.programInterest ?? null,
      lead_timeline: lead?.timeline ?? null,
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
