import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login — email-as-passcode sign-in, fully server-side.
 *
 * Flow:
 *   1. Look up email in public.students.
 *   2. If enrolled (status invited/active):
 *      a. Ensure auth.users row exists (admin.createUser, no email sent).
 *      b. admin.generateLink({type:"magiclink"}) — returns properties.hashed_token.
 *      c. verifyOtp({token_hash, type:"magiclink"}) using an ssr server client
 *         whose cookie writes are bound to the outgoing response. This issues
 *         a real session and lands Supabase auth cookies directly on the response.
 *      d. Also set fida_site_auth=1 cookie so the site gate passes.
 *      e. 303 redirect to /portal.
 *   3. If not enrolled or inactive: silent 303 back to /portal/login.
 *
 * No client-side callback processing. No URL fragments. No email sent.
 */
export async function POST(req: NextRequest) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://fida-eight.vercel.app";

  function redirect(path: string, response?: NextResponse) {
    const url = new URL(path, origin);
    if (response) {
      // Merge: we want the cookies already on `response` to flow with the redirect.
      const r = NextResponse.redirect(url, { status: 303 });
      response.cookies.getAll().forEach((c) => r.cookies.set(c));
      return r;
    }
    return NextResponse.redirect(url, { status: 303 });
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
    // Admin client — for students lookup + admin.createUser + admin.generateLink.
    const admin = createAdmin(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Is this an enrolled student?
    const { data: student, error: lookupError } = await admin
      .from("students")
      .select("id, email, status")
      .ilike("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("[portal/login] students lookup error:", lookupError.message);
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

    // 2. Ensure auth user exists (auto-confirmed, no email).
    try {
      await admin.auth.admin.createUser({
        email: student.email,
        email_confirm: true,
      });
      console.log("[portal/login] created auth user for", email);
    } catch (err) {
      // Already exists is fine.
      const msg = err instanceof Error ? err.message : String(err);
      if (!/already|registered|exists/i.test(msg)) {
        console.log("[portal/login] createUser non-fatal:", msg);
      }
    }

    // 3. Generate magic link (no email sent).
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: student.email,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error(
        "[portal/login] generateLink failed:",
        linkError?.status,
        linkError?.code,
        linkError?.message
      );
      return redirect("/portal/login?error=link-failed");
    }

    // 4. Build the response we'll send. ssr client writes auth cookies onto it.
    const response = NextResponse.redirect(new URL("/portal", origin), {
      status: 303,
    });

    const supabase = createServerClient(PUBLIC_URL, ANON_KEY, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // 5. Verify the hashed token server-side. This validates the OTP and
    //    stores the resulting session in our cookie jar (the response).
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: "magiclink",
      });

    if (verifyError || !verifyData?.session) {
      console.error(
        "[portal/login] verifyOtp failed:",
        verifyError?.status,
        verifyError?.code,
        verifyError?.message
      );
      return redirect("/portal/login?error=verify-failed");
    }

    // 6. Also pass the site-wide gate.
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
      "[portal/login] unexpected error:",
      err instanceof Error ? err.message : err
    );
    return redirect("/portal/login?error=unexpected");
  }
}
