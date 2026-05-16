import { NextRequest, NextResponse } from "next/server";
import { upsertStudent, sendPortalInvite, recordInviteSent } from "@/lib/students-db";
import { getTicket } from "@/lib/tickets-db";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/tickets/[id]/convert-to-student
 *
 * Promote a ticket submitter (prospect) into a student record so they get
 * portal access and future staff replies route through the portal.
 *
 * Body (form-data, all optional): send_invite ("1" = also fire invite)
 *
 * Steps:
 *   1. Look up the ticket
 *   2. Upsert a students row from ticket.email + ticket.student_name + ticket.program
 *   3. Update the ticket's student_id (the trigger should auto-link, but we
 *      do it explicitly here too in case the row already existed)
 *   4. If send_invite=1, fire sendPortalInvite() + record the invite
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) {
    return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });
  }

  let sendInvite = true;
  try {
    const form = await req.formData();
    sendInvite = String(form.get("send_invite") ?? "1") !== "0";
  } catch {
    /* default */
  }

  const result = await upsertStudent({
    email: ticket.email,
    full_name: ticket.student_name ?? null,
    program: ticket.program ?? null,
    source: "tickets",
  });
  if ("error" in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  const student = result.student;

  // Explicit link in case the row pre-existed.
  try {
    const supabase = getServerClient();
    await supabase
      .from("tickets")
      .update({ student_id: student.id })
      .eq("id", ticket.id);
  } catch {
    /* trigger will pick it up otherwise */
  }

  if (sendInvite) {
    const sent = await sendPortalInvite({ email: student.email, sentBy: "admin-convert" });
    if (sent.ok) {
      await recordInviteSent({ studentId: student.id, email: student.email, sentBy: "admin-convert" });
    }
  }

  return NextResponse.json({ ok: true, studentId: student.id, inviteSent: sendInvite });
}
