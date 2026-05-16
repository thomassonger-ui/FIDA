import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SITE_COOKIE = "fida_site_auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Always allow: gate, login, auth callback, static assets ───────────────
  if (
    pathname === "/gate" ||
    pathname === "/login" ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/api/gate") ||
    pathname.startsWith("/api/auth") ||
    // Public tickets intake — no site gate, no login.
    pathname === "/tickets" ||
    pathname.startsWith("/tickets/") ||
    pathname.startsWith("/api/tickets") ||
    // Portal sign-in page — open so a student with a magic link can land.
    pathname === "/portal/login" ||
    pathname.startsWith("/api/portal/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|svg|jpg|ico|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // ── Portal — requires a Supabase auth session, bypasses site-gate ──────────
  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    const response = NextResponse.next({ request: req });

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/portal/login";
      url.searchParams.set("error", "supabase-not-configured");
      return NextResponse.redirect(url);
    }

    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll: () => req.cookies.getAll(),
            setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
              toSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) return response;
    } catch {
      // fall through to login redirect
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

  // ── Admin guard — accept EITHER Supabase user OR password-based admin cookie ──
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
              setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
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
