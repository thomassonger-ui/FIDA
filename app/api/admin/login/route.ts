import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, isAllowedAdminEmail } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * POST /api/admin/login
 *
 * Accepts either:
 *   (a) email + password — validated against Supabase auth.users.
 *   (b) password only — validated against ADMIN_PASSWORD env var.
 *
 * On success: sets fida_admin cookie = ADMIN_SESSION_SECRET and 303 to /admin.
 * On failure: 303 to /login?error=bad-password.
 */
export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!adminPassword || !sessionSecret) {
    return NextResponse.json(
      {
        error:
          "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel.",
      },
      { status: 500 }
    );
  }

  let email = "";
  let password = "";
  let next = "/admin/leads";
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      next?: string;
    };
    email = (body.email ?? "").trim().toLowerCase();
    password = body.password ?? "";
    if (body.next) next = body.next;
  } else {
    const form = await req.formData();
    email = String(form.get("email") ?? "").trim().toLowerCase();
    password = String(form.get("password") ?? "");
    const n = form.get("next");
    if (typeof n === "string" && n) next = n;
  }

  if (!password) {
    return badPassword(req, next);
  }

  // ── Mode A: email + password → Supabase auth.users (allowlisted only) ────
  // Student portal invites create auth.users rows for students, so a valid
  // Supabase login is NOT sufficient on its own — the email must also be on
  // the ADMIN_EMAILS allowlist. If the allowlist is empty, Mode A is off.
  if (email && supabaseUrl && anonKey) {
    if (!isAllowedAdminEmail(email)) {
      console.warn("[admin/login] email not on ADMIN_EMAILS allowlist");
    } else {
      try {
        const sb = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await sb.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data?.user) {
          console.log("[admin/login] supabase signin ok");
          return grantAdmin(req, next, sessionSecret);
        }
        console.warn(
          "[admin/login] supabase signin failed",
          error?.status,
          error?.code
        );
      } catch (err) {
        console.error(
          "[admin/login] supabase signin threw:",
          err instanceof Error ? err.message : err
        );
      }
    }
    // Fall through — maybe they typed the shared admin password into the
    // password field instead and didn't realize email is optional.
  }

  // ── Mode B: shared admin password ────────────────────────────────────────
  if (safeEqual(password, adminPassword)) {
    console.log("[admin/login] shared password ok");
    return grantAdmin(req, next, sessionSecret);
  }

  return badPassword(req, next);
}

function grantAdmin(req: NextRequest, next: string, sessionSecret: string) {
  const safeNext = next.startsWith("/admin") ? next : "/admin/leads";
  const redirect = NextResponse.redirect(new URL(safeNext, req.url), {
    status: 303,
  });
  redirect.cookies.set(ADMIN_COOKIE, sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return redirect;
}

function badPassword(req: NextRequest, next: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "?error=bad-password";
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url, { status: 303 });
}
