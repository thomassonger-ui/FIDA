import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SESSION_TTL_DAYS,
  createPortalSession,
} from "@/lib/portal-auth";
import { siteOrigin } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

/**
 * POST /api/portal/login
 *
 * Email-as-passcode sign-in. DB-backed session, no Supabase Auth involvement.
 *
 *   1. Lookup email in public.students.
 *   2. If found and status is invited/active:
 *      - Insert a row in public.portal_sessions, get the id (uuid).
 *      - Set cookie fida_portal_session=<id> (httpOnly, secure, sameSite=lax).
 *      - Set cookie fida_site_auth=1 (passes the site-wide gate).
 *      - 303 redirect to /portal.
 *   3. Otherwise: silent redirect to /portal/login?notice=submitted.
 *
 * Security trade-off: anyone who knows a student's email can sign in as them.
 * Documented and accepted.
 */
export async function POST(req: NextRequest) {
  const origin = siteOrigin();

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
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("[portal/login] missing supabase env vars");
    return redirect("/portal/login?error=link-failed");
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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

    const created = await createPortalSession(student.id, {
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    if (!created) {
      console.error("[portal/login] createPortalSession failed for", email);
      return redirect("/portal/login?error=link-failed");
    }

    const response = NextResponse.redirect(new URL("/portal", origin), {
      status: 303,
    });
    response.cookies.set(PORTAL_SESSION_COOKIE, created.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PORTAL_SESSION_TTL_DAYS * 24 * 60 * 60,
    });
    response.cookies.set("fida_site_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("[portal/login] signed in", email, "session", created.id);
    return response;
  } catch (err) {
    console.error(
      "[portal/login] unexpected:",
      err instanceof Error ? err.message : err
    );
    return redirect("/portal/login?error=unexpected");
  }
}
