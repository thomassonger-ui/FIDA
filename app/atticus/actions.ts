"use server";

import { getServerClient } from "@/lib/supabase";
import { headers } from "next/headers";

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Capture a prospect's inquiry from the public /atticus landing.
 * No auth required — this runs over the gate-exempt /atticus path.
 *
 * Writes a row to atticus_sessions with the source attribution intact.
 */
export async function submitInquiry(formData: FormData): Promise<InquiryResult> {
  const name = String(formData.get("name") || "").trim().slice(0, 120);
  const phoneRaw = String(formData.get("phone") || "").trim().slice(0, 30);
  const phone = phoneRaw.replace(/[^\d+()\-\s]/g, "");
  const question = String(formData.get("question") || "").trim().slice(0, 1000);
  const source = String(formData.get("source") || "").trim().slice(0, 80) || null;

  if (!name || !phone) {
    return { ok: false, error: "Please add your name and phone number." };
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return { ok: false, error: "That phone number looks too short — try again." };
  }

  try {
    const sb = getServerClient();
    const h = await headers();
    const userAgent = (h.get("user-agent") || "").slice(0, 500);

    await sb.from("atticus_sessions").insert({
      id: crypto.randomUUID(),
      source,
      user_agent: userAgent,
      lead_name: name,
      lead_phone: phone,
      // Store the prospect's first question as a system note on the session.
      // When the real chat ships, this becomes the first user message.
      program_interest: question || null,
      message_count: question ? 1 : 0,
    });

    return { ok: true };
  } catch (err) {
    console.error("[atticus inquiry] insert failed:", err);
    return { ok: false, error: "Something glitched on our end. Try again, or text us directly." };
  }
}
