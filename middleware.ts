import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieIsValid,
  isAllowedAdminEmail,
} from "@/lib/admin-auth";

const SITE_COOKIE = "fida_site_auth";
const PORTAL_SESSION_COOKIE = "fida_portal_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Always allow: gate, login, auth callback, static assets ───────────────
  if (
    pathname === "/gate" ||
    pathname === "/login" ||
    pathname === "/login/forgot" ||
    pathname === "/login/reset" ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/api/gate") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/tickets" ||
    pathname.startsWith("/tickets/") ||
    pathname.startsWith("/api/tickets") ||
    pathname === "/portal/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout" ||
    pathname.startsWith("/api/portal/login") ||
    pathname.startsWith("/api/portal/logout") ||
    pathname === "/atticus" ||
    pathname.startsWith("/atticus/") ||
    pathname.startsWith("/api/atticus") ||
    pathname.startsWith("/qr/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|svg|jpg|ico|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // ── Portal — DB-backed session cookie. No Supabase Auth dependency. ───────
  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    const sessionId = req.cookies.get(PORTAL_SESSION_COOKIE)?.value;
    if (sessionId && /^[0-9a-f-]{36}$/i.test(sessionId)) {
      // Cookie shape is plausible. The downstream page (and the route handler
      // for any /api/portal/* mutation) will validate the session against the
      // DB. Middleware only enforces the presence of a syntactically valid
      // cookie — this keeps middleware fast and avoids per-request DB calls
      // for static assets etc., while still gating navigation.
      return NextResponse.next({ request: req });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/portal/login";
    if (pathname !== "/portal") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Site-wide password gate — REMOVED ─────────────────────────────────────
  // Public pages (homepage, /admissions, /programs, /atticus, /tickets) are
  // now open. Only /admin/* and /api/admin/* (gated below) and /portal/*
  // (gated above) require auth. The /gate page itself still resolves for
  // anyone who bookmarked it.
  void SITE_COOKIE;

  // ── Admin guard — pages AND API routes ────────────────────────────────────
  // Accept EITHER the admin cookie OR a Supabase session whose email is on
  // the ADMIN_EMAILS allowlist. /api/admin/* previously fell outside this
  // guard entirely (it doesn't start with "/admin"), leaving every admin
  // endpoint — document vault downloads, student import/export, magic-link
  // minting — open to unauthenticated callers.
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (isAdminPage || isAdminApi) {
    const response = NextResponse.next({ request: req });

    if (adminCookieIsValid(req.cookies.get(ADMIN_COOKIE)?.value)) {
      return response;
    }

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    ) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll: () => req.cookies.getAll(),
              setAll: (
                cookiesToSet: {
                  name: string;
                  value: string;
                  options: CookieOptions;
                }[]
              ) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                  response.cookies.set(name, value, options);
                });
              },
            },
          }
        );

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isAllowedAdminEmail(user.email)) {
          return response;
        }
      } catch {
        // Fall through to 401 / login redirect.
      }
    }

    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 401 });
    }

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
