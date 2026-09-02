import { NextRequest, NextResponse } from "next/server";
import { unsubscribe } from "@/lib/prospects-db";
import { unsubscribeTokenValid } from "@/lib/drip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public. Two callers:
 *   POST — RFC 8058 one-click unsubscribe (Gmail/Yahoo "Unsubscribe" button
 *          hits the List-Unsubscribe URL with a POST) AND the confirm button
 *          on /unsubscribe.
 *   GET  — someone opened the header URL in a browser; send them to the page.
 *
 * Both carry ?e=<email>&t=<hmac>. A bad token does nothing.
 */
function params(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return { email: (sp.get("e") ?? "").trim().toLowerCase(), token: sp.get("t") ?? "" };
}

export async function POST(req: NextRequest) {
  const { email, token } = params(req);
  if (!email || !unsubscribeTokenValid(email, token)) {
    return NextResponse.json({ ok: false, error: "Invalid link" }, { status: 400 });
  }
  await unsubscribe(email);

  // Browser form submit → show the confirmation page. Mail client → 200 JSON.
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    const url = req.nextUrl.clone();
    url.pathname = "/unsubscribe";
    url.search = `?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}&done=1`;
    return NextResponse.redirect(url, 303);
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/unsubscribe";
  return NextResponse.redirect(url, 302);
}
