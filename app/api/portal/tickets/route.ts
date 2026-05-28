import { NextRequest, NextResponse } from "next/server";
import { createTicket, isValidCategory, type TicketCategory } from "@/lib/tickets-db";
import { getPortalStudent } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  const student = await getPortalStudent();
  if (!student) return bad("Not signed in", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const categoryRaw = String(form.get("category") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();

  if (!subject) return bad("Subject is required.");
  if (subject.length > 200) return bad("Subject must be 200 characters or fewer.");
  if (!body) return bad("Message is required.");
  if (body.length > 8000) return bad("Message must be 8,000 characters or fewer.");
  if (!isValidCategory(categoryRaw)) return bad("Please choose a category.");

  const result = await createTicket({
    email: student.email,
    studentName: student.full_name ?? null,
    program: student.program ?? null,
    category: categoryRaw as TicketCategory,
    subject,
    body,
  });
  if ("error" in result) return bad(result.error, 500);

  return NextResponse.json({ ok: true, ticketId: result.ticket.id });
}
