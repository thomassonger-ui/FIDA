import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Timing-safe string compare. Both sides are padded to equal length first.
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    return NextResponse.json(
      {
        error:
          "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel.",
      },
      { status: 500 }
    );
  }

  let password = "";
  let next = "/admin/leads";
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as {
      password?: string;
      next?: string;
    };
    password = body.password ?? "";
    if (body.next) next = body.next;
  } else {
    const form = await req.formData();
    password = String(form.get("password") ?? "");
    const n = form.get("next");
    if (typeof n === "string" && n) next = n;
  }

  if (!password || !safeEqual(password, adminPassword)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=bad-password";
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  // Only allow next paths inside /admin to prevent open-redirect abuse.
  const safeNext = next.startsWith("/admin") ? next : "/admin/leads";
  const redirect = NextResponse.redirect(new URL(safeNext, req.url), {
    status: 303,
  });
  redirect.cookies.set("apex_admin", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return redirect;
}
