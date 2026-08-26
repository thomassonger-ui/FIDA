import { NextRequest, NextResponse } from "next/server";
import { logTouch } from "@/lib/prospects-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = ["call", "email", "text", "note"];

/** POST /api/admin/prospects/[id]/touch — stamp a contact attempt. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let json: { kind?: string; outcome?: string; body?: string; actor?: string };
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  if (!json.kind || !KINDS.includes(json.kind)) {
    return NextResponse.json(
      { ok: false, error: "kind must be call, email, text or note." },
      { status: 400 }
    );
  }
  await logTouch(id, {
    kind: json.kind,
    outcome: json.outcome,
    body: json.body,
    actor: json.actor,
  });
  return NextResponse.json({ ok: true });
}
