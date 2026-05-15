import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SITE_COOKIE = "apex_site_auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Always allow: gate, login, auth callback, static assets ───────────────
  if (
    pathname === "/gate" ||
    pathname === "/login" ||
    pathname.startsWith("/api/gate") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|svg|jpg|ico|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // ── Site-wide password gate ────────────────────────────────────────────────
  const siteAuth = req.cookies.get(SITE_COOKIE)?.value;
  if (siteAuth !== "1") {
    const url = req.nextUrl.clone();
    url.pathname = "/gate";
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── Admin guard — verify Supabase session ──────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next({ request: req });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
