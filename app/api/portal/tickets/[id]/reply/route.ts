import { NextRequest, NextResponse } from "next/server";
import {
  appendMessage,
  getTicket,
  normalizeEmail,
  totalAttachmentBytesForTicket,
  uploadAttachment,
  MAX_FILE_BYTES,
  MAX_TICKET_BYTES,
} from "@/lib/tickets-db";
import { getPortalStudent } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const student = await getPortalStudent();
  if (!student) return bad("Not signed in", 401);

  const ticket = await getTicket(id);
  if (!ticket) return bad("Message thread not found", 404);
  if (normalizeEmail(ticket.email) !== normalizeEmail(student.email)) {
    return bad("You don't have permission to reply here.", 403);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const body = String(form.get("body") ?? "").trim();
  const file = form.get("attachment");
  const hasFile = file instanceof File && file.size > 0;

  if (!body && !hasFile) return bad("Add a message or attach a file.");
  if (body.length > 8000) return bad("Message must be 8,000 characters or fewer.");

  if (hasFile) {
    if (file.size > MAX_FILE_BYTES)
      return bad("Attachment exceeds the 10 MB per-file limit.");
    const existing = await totalAttachmentBytesForTicket(id);
    if (existing + file.size > MAX_TICKET_BYTES)
      return bad("This thread has reached its 25 MB total attachment limit.");
  }

  const append = await appendMessage({
    ticketId: id,
    authorType: "student",
    authorName: student.full_name ?? null,
    authorEmail: student.email,
    body: body || "(attachment)",
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
      console.warn("[portal tickets] attachment upload failed:", up.error);
    }
  }

  return NextResponse.json({ ok: true, messageId: append.message.id });
}
