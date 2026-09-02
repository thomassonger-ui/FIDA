import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/prospects-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gated by middleware.ts like every /api/admin/* route.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, prospect });
}

/** PATCH /api/admin/prospects/[id] — edit fields on one prospect. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let json: Record<string, unknown>;
  try {
    json = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const res = await updateProspect(id, json);
  if ("error" in res) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true, prospect: res.prospect });
}
