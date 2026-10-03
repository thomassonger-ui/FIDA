import { NextRequest, NextResponse } from "next/server";
import { createMemo } from "@/lib/prospect-memos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gated by middleware.ts like every /api/admin/* route.

/** POST /api/admin/prospects/[id]/memo  { from, to, goal, brief, dueOn } */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const json = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!json) return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  const dueOn = String(json.dueOn ?? "").trim();
  if (dueOn && !/^\d{4}-\d{2}-\d{2}$/.test(dueOn))
    return NextResponse.json({ ok: false, error: "Bad due date." }, { status: 400 });
  const res = await createMemo({
    prospectId: id,
    fromKey: String(json.from ?? ""),
    toKey: String(json.to ?? ""),
    goal: String(json.goal ?? ""),
    brief: String(json.brief ?? ""),
    dueOn: dueOn || null,
  });
  if ("error" in res) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true, emailed: res.emailed, emailError: res.emailError });
}
