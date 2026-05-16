import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login
 *
 * Email-as-passcode sign-in via server-side OTP verification.
 *
 * 1. Lookup email in public.students. Reject if not enrolled / inactive.
 * 2. Ensure auth.users record exists (admin.createUser, email_confirm).
 * 3. admin.generateLink({ type: 'magiclink' }) — returns properties.email_otp
 *    (a 6-digit one-time code). No email is sent.
 * 4. supabase.auth.verifyOtp({ email, token: email_otp, type: 'email' }) via
 *    a cookie-bound ssr server client — Supabase issues a session and our
 *    setAll callback writes auth cookies onto the response.
 * 5. Set fida_site_auth=1.
 * 6. 303 redirect to /portal.
 *
 * If anything in 3–4 errors, the full Supabase error (status/code/message)
 * is logged to Vercel for diagnosis without ambiguity.
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

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY || !PUBLIC_URL) {
    console.error("[portal/login] missing supabase env vars");
    return redirect("/portal/login?error=link-failed");
  }

  try {
    const admin = createAdmin(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Enrollment check.
    const { data: student, error: lookupError } = await admin
      .from("students")
      .select("id, email, status")
      .ilike("email", email)
      .maybeSingle();
    if (lookupError) {
      console.error("[portal/login] students lookup:", lookupError.message);
      return redirect("/portal/login?notice=submitted");
    }
    if (!student) {
      console.log("[portal/login] no student row for", email);
      return redirect("/portal/login?notice=submitted");
    }
    if (student.status === "withdrawn" || student.status === "paused") {
      console.warn("[portal/login] inactive student:", email, student.status);
      return redirect("/portal/login?error=not-active");
    }

    // 2. Ensure auth user (no email sent).
    try {
      await admin.auth.admin.createUser({
        email: student.email,
        email_confirm: true,
      });
      console.log("[portal/login] auth user ensured for", email);
    } catch (err) {
      // Already exists — fine.
      const msg = err instanceof Error ? err.message : String(err);
      if (!/already|registered|exists/i.test(msg)) {
        console.log("[portal/login] createUser non-fatal:", msg);
      }
    }

    // 3. Generate a one-time magic-link OTP (no email sent).
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: student.email,
      });
    if (linkError || !linkData?.properties?.email_otp) {
      console.error(
        "[portal/login] generateLink failed:",
        linkError?.status,
        linkError?.code,
        linkError?.message
      );
      return redirect("/portal/login?error=link-failed");
    }
    const otp = linkData.properties.email_otp;
    console.log("[portal/login] otp generated for", email);

    // 4. Build response + ssr server client bound to its cookie jar.
    const response = NextResponse.redirect(new URL("/portal", origin), {
      status: 303,
    });
    const supabase = createServerClient(PUBLIC_URL, ANON_KEY, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          toSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // 5. Verify the OTP — this is the standard documented path.
    //    email + token (6-digit) + type 'email' is the v2 universal verify call.
    const { data: signinData, error: verifyError } =
      await supabase.auth.verifyOtp({
        email: student.email,
        token: otp,
        type: "email",
      });
    if (verifyError || !signinData?.session) {
      console.error(
        "[portal/login] verifyOtp(email) failed:",
        verifyError?.status,
        verifyError?.code,
        verifyError?.message
      );
      return redirect("/portal/login?error=verify-failed");
    }

    // 6. Site gate cookie.
    response.cookies.set("fida_site_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("[portal/login] signed in", email);
    return response;
  } catch (err) {
    console.error(
      "[portal/login] unexpected:",
      err instanceof Error ? err.message : err
    );
    return redirect("/portal/login?error=unexpected");
  }
}
