import { NextRequest, NextResponse } from "next/server";
import { ATTICUS_FIDA_STATEMENT } from "@/lib/atticus-va";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gated by middleware.ts like every /api/admin/* route.
// POST /api/admin/va-assignment — saves FIDA's assignment for the VA
// (today's focus, tasks, weekly appointment target, weekly hour cap) on
// Atticus, where it shows on her time-clock card for FIDA.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const res = await fetch(ATTICUS_FIDA_STATEMENT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "set_assignment",
      focus: body.focus ?? null,
      tasks: body.tasks ?? [],
      target_appts: body.target_appts ?? null,
      hour_cap: body.hour_cap ?? null,
      updated_by: "FIDA admin",
    }),
    cache: "no-store",
  });
  const out = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) return NextResponse.json({ ok: false, error: out.error || "Could not save" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
