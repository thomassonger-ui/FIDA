import { NextRequest, NextResponse } from "next/server";
import { answerMemo } from "@/lib/prospect-memos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/memo/[token]  { answer } — public, the token is the secret. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const json = (await req.json().catch(() => null)) as { answer?: string } | null;
  const res = await answerMemo(token, String(json?.answer ?? ""));
  if ("error" in res) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
