import { NextRequest, NextResponse } from "next/server";
import { ATTICUS_FIDA_STATEMENT } from "@/lib/atticus-va";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gated by middleware.ts like every /api/admin/* route.
// POST /api/admin/va-messages — memo to the VA, or reply to one of her
// questions. Forwarded to FIDA's statement link on Atticus.
//   { action: "post_memo", body }  |  { action: "answer_question", id, answer }
export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const payload =
    b.action === "post_memo"
      ? { action: "post_memo", body: b.body ?? "", updated_by: "FIDA" }
      : b.action === "answer_question"
        ? { action: "answer_question", id: b.id ?? "", answer: b.answer ?? "", updated_by: "FIDA" }
        : null;
  if (!payload) return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  const res = await fetch(ATTICUS_FIDA_STATEMENT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const out = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return NextResponse.json({ ok: false, error: out.error || "Could not save" }, { status: res.status === 400 ? 400 : 502 });
  return NextResponse.json({ ok: true });
}
