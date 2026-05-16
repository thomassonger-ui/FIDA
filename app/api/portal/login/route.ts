import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login
 *
 * Email-as-passcode sign-in, fully server-side.
 *
 * Strategy:
 *   1. Lookup email in public.students. Reject if not enrolled / withdrawn / paused.
 *   2. Find or create the corresponding auth.users record (email_confirm: true).
 *   3. Rotate that user's password to a fresh random value (admin API).
 *   4. Immediately signInWithPassword using that random password through a
 *      cookie-bound ssr server client — Supabase session cookies land on the
 *      outgoing response.
 *   5. Also set fida_site_auth=1 cookie so the site-wide gate passes.
 *   6. 303 redirect to /portal.
 *
 * Why this works where verifyOtp didn't: signInWithPassword is the most
 * battle-tested Supabase auth path and doesn't depend on token-hash semantics
 * that vary between SDK and server versions. We never store the password;
 * each login rotates it again, so the previous password is invalidated.
 *
 * Security trade-off: anyone with a student email can sign in as that student.
 * Documented and accepted by the operator.
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

    // 1. Verify enrollment.
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

    // 2. Find or create auth.users record.
    let userId: string | null = null;
    const createRes = await admin.auth.admin.createUser({
      email: student.email,
      email_confirm: true,
    });
    if (createRes.data?.user?.id) {
      userId = createRes.data.user.id;
      console.log("[portal/login] created auth user for", email);
    } else if (createRes.error) {
      // Already exists — find via listUsers (small-school scale).
      const listRes = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const found = listRes.data?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === email
      );
      userId = found?.id ?? null;
      if (!userId) {
        console.error(
          "[portal/login] createUser failed AND lookup failed:",
          createRes.error.message
        );
        return redirect("/portal/login?error=link-failed");
      }
    }
    if (!userId) {
      console.error("[portal/login] no user id resolved for", email);
      return redirect("/portal/login?error=link-failed");
    }

    // 3. Rotate password to a fresh random value.
    const tempPassword =
      crypto.randomUUID() + "-" + crypto.randomUUID() + "-Aa1!";
    const updateRes = await admin.auth.admin.updateUserById(userId, {
      password: tempPassword,
    });
    if (updateRes.error) {
      console.error(
        "[portal/login] updateUserById failed:",
        updateRes.error.status,
        updateRes.error.code,
        updateRes.error.message
      );
      return redirect("/portal/login?error=link-failed");
    }

    // 4. Build response and sign in via cookie-bound ssr client.
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
    const { data: signinData, error: signinError } =
      await supabase.auth.signInWithPassword({
        email: student.email,
        password: tempPassword,
      });
    if (signinError || !signinData?.session) {
      console.error(
        "[portal/login] signInWithPassword failed:",
        signinError?.status,
        signinError?.code,
        signinError?.message
      );
      return redirect("/portal/login?error=verify-failed");
    }

    // 5. Site-wide gate cookie.
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
