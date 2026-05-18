import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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

  // ── Site-wide password gate ────────────────────────────────────────────────
  const siteAuth = req.cookies.get(SITE_COOKIE)?.value;
  if (siteAuth !== "1") {
    const url = req.nextUrl.clone();
    url.pathname = "/gate";
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── Admin guard — accept EITHER Supabase user OR admin cookie ─────────────
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next({ request: req });

    const adminCookie = req.cookies.get("fida_admin")?.value;
    if (adminCookie && adminCookie === process.env.ADMIN_SESSION_SECRET) {
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

        if (user) {
          return response;
        }
      } catch {
        // Fall through to login redirect.
      }
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
