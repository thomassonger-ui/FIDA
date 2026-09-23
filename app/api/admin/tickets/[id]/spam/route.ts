import { NextRequest, NextResponse } from "next/server";
import { getTicket, setTicketStatus } from "@/lib/tickets-db";
import { blockSender, unblockSender } from "@/lib/spam-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/tickets/[id]/spam   (admin-gated by middleware)
 *   { action: "block" }     → status "spam" + sender added to blocked_senders
 *                             (whole domain for company mail, exact address
 *                             for Gmail/Yahoo/etc.)
 *   { action: "not_spam" }  → back to "open" + sender removed from
 *                             blocked_senders (address and domain)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const json = (await req.json().catch(() => null)) as { action?: string } | null;
  const action = json?.action;
  if (action !== "block" && action !== "not_spam") {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }
  const ticket = await getTicket(id);
  if (!ticket) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (action === "not_spam") {
    const u = await unblockSender(ticket.email);
    if (!u.ok) return NextResponse.json({ ok: false, error: u.error }, { status: 500 });
    const r = await setTicketStatus(id, "open");
    return NextResponse.json({ ok: r.ok, error: r.error }, { status: r.ok ? 200 : 500 });
  }

  const b = await blockSender(ticket.email, `ticket ${id}`);
  if (!b.ok) return NextResponse.json({ ok: false, error: b.error }, { status: 500 });
  const r = await setTicketStatus(id, "spam");
  return NextResponse.json(
    { ok: r.ok, blocked: b.value, error: r.error },
    { status: r.ok ? 200 : 500 },
  );
}
