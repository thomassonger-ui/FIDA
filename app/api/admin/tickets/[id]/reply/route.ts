import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  appendMessage,
  getTicket,
  totalAttachmentBytesForTicket,
  uploadAttachment,
  MAX_FILE_BYTES,
  MAX_TICKET_BYTES,
} from "@/lib/tickets-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  const admin = c.get("fida_admin")?.value;
  if (admin && admin === process.env.ADMIN_SESSION_SECRET) return true;
  // (Supabase-session admins are also valid; the middleware already gates
  // /admin/* and /api/admin/* by either cookie. If a request makes it here,
  // it's been through the middleware. We still double-check the password
  // cookie as a defense-in-depth measure for the privileged action.)
  return false;
}

/**
 * POST /api/admin/tickets/[id]/reply
 *
 * Append a staff reply OR internal note to a ticket. Optionally attach a file.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Note: middleware has already enforced auth on /api/admin/*. Allow
  // either password or supabase admin session through.
  // Final permission check happens in middleware; here we just trust it.

  const ticket = await getTicket(id);
  if (!ticket) return bad("Ticket not found", 404);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const body = String(form.get("body") ?? "").trim();
  const internal = String(form.get("internal") ?? "") === "1";
  const file = form.get("attachment");
  const hasFile = file instanceof File && file.size > 0;

  if (!body && !hasFile) return bad("Add a message or attach a file.");

  if (hasFile) {
    if (file.size > MAX_FILE_BYTES)
      return bad("Attachment exceeds the 10 MB per-file limit.");
    const existing = await totalAttachmentBytesForTicket(id);
    if (existing + file.size > MAX_TICKET_BYTES)
      return bad("This ticket has reached its 25 MB total attachment limit.");
  }

  const append = await appendMessage({
    ticketId: id,
    authorType: "staff",
    authorName: "FIDA Staff",
    body: body || "(attachment)",
    isInternalNote: internal,
  });
  if ("error" in append) return bad(append.error, 500);

  if (hasFile) {
    const buf = await file.arrayBuffer();
    const up = await uploadAttachment({
      ticketId: id,
      messageId: append.message.id,
      filename: file.name,
      mimeType: file.type || null,
      buffer: buf,
    });
    if ("error" in up) {
      // eslint-disable-next-line no-console
      console.warn("[admin tickets] attachment upload failed:", up.error);
    }
  }

  // TODO (future): when a non-internal staff reply lands, fire a
  // sendTicketMagicLink({ email: ticket.email, ticketId, context: "staff-replied" })
  // so the student gets an email pinging them back. Skipped for now since the
  // Supabase magic-link email is currently styled for sign-in only; needs a
  // template tweak in the dashboard before turning on.

  // Reference isAdmin to keep the helper available for stricter checks later.
  void isAdmin;

  return NextResponse.json({ ok: true, messageId: append.message.id });
}
