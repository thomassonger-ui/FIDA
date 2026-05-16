import { NextRequest, NextResponse } from "next/server";
import { setTicketStatus, type TicketStatus } from "@/lib/tickets-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: TicketStatus[] = [
  "open",
  "awaiting_staff",
  "awaiting_student",
  "resolved",
  "closed",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
  const status = (json as { status?: string }).status;
  if (!status || !VALID.includes(status as TicketStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }
  const r = await setTicketStatus(id, status as TicketStatus);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error ?? "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
