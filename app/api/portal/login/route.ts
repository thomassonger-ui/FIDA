import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login
 *
 * Self-service "forgot my sign-in link" endpoint.
 *
 * Why this uses resetPasswordForEmail instead of signInWithOtp:
 *   Our Supabase project has Email OTP signups disabled at the project
 *   level (returns otp_disabled error code). The "Reset Password" flow is
 *   a different code path that is NOT blocked, uses Supabase's built-in
 *   mailer (no third-party SMTP), and produces a single-click sign-in
 *   link that lands the user inside the portal. Recovery sessions are
 *   normal sessions — the user is never forced to set a password.
 *
 * Always returns { ok: true } regardless of whether the email exists, to
 * avoid leaking which emails are FIDA students.
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
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = getServerClient();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://fida-eight.vercel.app";
    const redirectTo = `${origin}/auth/callback?next=/portal`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  } catch {
    // Silent — never reveal which emails are on file.
  }

  return NextResponse.json({ ok: true });
}
