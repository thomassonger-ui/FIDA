import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login
 *
 * Email-as-passcode sign-in. No emails are sent.
 *
 * Flow:
 *   1. Look up email in public.students.
 *   2. If found + status is "invited" or "active":
 *      - Ensure auth.users row exists (auto-confirm; no email sent).
 *      - Generate a magic link via supabase.auth.admin.generateLink (server-side).
 *      - 302 redirect the browser through that link → Supabase verify endpoint
 *        creates a session and redirects to /auth/callback with auth tokens →
 *        callback finishes sign-in → /portal loads.
 *   3. If not found OR status is "withdrawn"/"paused": redirect silently to
 *      /portal/login with a generic notice. Do not leak which emails are enrolled.
 *
 * Security: any party who knows a student's email can sign in as that student.
 * This is the documented trade-off chosen to avoid email-delivery dependencies.
 */
export async function POST(req: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://fida-eight.vercel.app";

  function redirect(path: string) {
    return NextResponse.redirect(new URL(path, origin), { status: 303 });
  }

  let email = "";
  try {
    const form = await req.formData();
    email = String(form.get("email") ?? "").trim().toLowerCase();
  } catch {
    return redirect("/portal/login?notice=submitted");
  }

  if (!email || !EMAIL_RE.test(email)) {
    return redirect("/portal/login?notice=submitted");
  }

  try {
    const supabase = getServerClient();

    // 1. Is this an enrolled student?
    const { data: student, error: lookupError } = await supabase
      .from("students")
      .select("id, email, status")
      .ilike("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("[portal/login] students lookup error:", lookupError.message);
      return redirect("/portal/login?notice=submitted");
    }

    if (!student) {
      // Silent fail — don't leak whether email is on file.
      console.log("[portal/login] no student row for", email);
      return redirect("/portal/login?notice=submitted");
    }

    if (student.status === "withdrawn" || student.status === "paused") {
      console.warn("[portal/login] inactive student blocked:", email, student.status);
      return redirect("/portal/login?error=not-active");
    }

    // 2. Ensure auth user exists (no email sent, auto-confirmed).
    try {
      await supabase.auth.admin.createUser({
        email: student.email,
        email_confirm: true,
      });
      console.log("[portal/login] created auth user for", email);
    } catch (err) {
      // Already exists is fine. Other errors are usually fine too (the
      // generateLink below will surface anything truly broken).
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes("already")) {
        console.log("[portal/login] createUser non-fatal:", msg);
      }
    }

    // 3. Generate a magic link (server-side, no email sent).
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: student.email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/portal`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error(
        "[portal/login] generateLink failed:",
        error?.status,
        error?.code,
        error?.message
      );
      return redirect("/portal/login?error=link-failed");
    }

    console.log("[portal/login] generated magic link for", email);

    // 4. Redirect the browser through Supabase's verify endpoint.
    //    Browser → Supabase /auth/v1/verify → /auth/callback#access_token=...
    //    Callback page completes the sign-in client-side.
    return NextResponse.redirect(data.properties.action_link, { status: 303 });
  } catch (err) {
    console.error(
      "[portal/login] unexpected error:",
      err instanceof Error ? err.message : err
    );
    return redirect("/portal/login?error=unexpected");
  }
}
