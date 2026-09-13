import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { signAgreement, validateSignInput } from "@/lib/enrollment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/enroll/[token]/sign — public (the token IS the credential).
 * Body: JSON of the signing form. Renders the PDF, files it, sends the
 * deposit email. Idempotent: a second call on a signed token returns 409.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`enroll:${ip}`);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many attempts — try again in a minute." }, { status: 429 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const v = validateSignInput(body);
  if ("error" in v) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  const res = await signAgreement(token, {
    ...v.input,
    ip,
    user_agent: req.headers.get("user-agent") ?? "",
  });
  if (!res.ok) {
    const status = /already been signed/.test(res.error) ? 409 : 400;
    return NextResponse.json({ ok: false, error: res.error }, { status });
  }
  return NextResponse.json({ ok: true, depositUrl: res.depositUrl });
}
