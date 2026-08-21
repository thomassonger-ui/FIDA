import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SESSION_TTL_DAYS,
  createPortalSession,
} from "@/lib/portal-auth";
import { resolvePortalStudent } from "@/lib/students-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/finalize
 *
 * Called by /auth/callback right after a Supabase magic link / OTP has been
 * verified in the browser. Bridges the Supabase Auth session into the
 * portal's own DB-backed session so the student actually lands in /portal:
 *
 *   1. Read the Supabase session from the auth cookies (@supabase/ssr).
 *   2. Resolve the student by user_id, falling back to email (this also
 *      lazily links user_id and flips status invited -> active).
 *   3. Insert a portal_sessions row and set fida_portal_session.
 *
 * Before this existed, the magic link verified fine and then bounced the
 * student straight back to /portal/login because middleware only honours
 * fida_portal_session, which nothing had set.
 *
 * Returns { ok: true } on success, { ok: false, reason } otherwise. The
 * caller redirects to /portal either way; middleware will send them to the
 * login form if no session was created.
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: "not-configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // Read-only here; we don't need to refresh the Supabase session.
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, reason: "no-supabase-session" }, { status: 401 });
  }

  const student = await resolvePortalStudent({
    userId: user.id,
    email: user.email ?? null,
  });
  if (!student) {
    console.warn("[auth/finalize] no student row for supabase user", user.id);
    return NextResponse.json({ ok: false, reason: "no-student" }, { status: 403 });
  }
  if (student.status === "withdrawn" || student.status === "paused") {
    return NextResponse.json({ ok: false, reason: "not-active" }, { status: 403 });
  }

  const created = await createPortalSession(student.id);
  if (!created) {
    return NextResponse.json({ ok: false, reason: "session-failed" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(PORTAL_SESSION_COOKIE, created.id, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: PORTAL_SESSION_TTL_DAYS * 24 * 60 * 60,
  });
  // Legacy site-gate cookie; harmless, kept for any flow still reading it.
  response.cookies.set("fida_site_auth", "1", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  console.log("[auth/finalize] portal session created for student", student.id);
  return response;
}
