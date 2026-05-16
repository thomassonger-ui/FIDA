import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login — self-service sign-in link.
 *
 * Uses resetPasswordForEmail (not signInWithOtp) because this project has
 * Email OTP disabled at the Supabase level. The recovery flow is not
 * blocked, uses Supabase's built-in mailer, and produces a normal session
 * (user is never forced to set a password).
 *
 * Always returns { ok: true } to the browser regardless of internal state
 * (we never leak which emails are on file). Internal failures are logged
 * to Vercel logs so we can debug rate limits / config without revealing
 * anything to the caller.
 */
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const form = await req.formData();
    email = String(form.get("email") ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!email || !EMAIL_RE.test(email)) {
    console.warn("[portal/login] rejected invalid email shape");
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = getServerClient();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://fida-eight.vercel.app";
    const redirectTo = `${origin}/auth/callback?next=/portal`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      // Most likely cause here is the free-tier rate limit.
      console.error(
        "[portal/login] resetPasswordForEmail error:",
        error.status,
        error.code,
        error.message
      );
    } else {
      console.log("[portal/login] recovery email queued for", email);
    }
  } catch (err) {
    console.error("[portal/login] threw:", err);
  }

  return NextResponse.json({ ok: true });
}
