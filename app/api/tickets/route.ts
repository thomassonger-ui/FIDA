import { NextRequest, NextResponse } from "next/server";
import {
  createTicket,
  isValidCategory,
  type TicketCategory,
} from "@/lib/tickets-db";
import {
  botCheck,
  clientIp,
  contactRateLimited,
  contentCheck,
  isBlockedSender,
} from "@/lib/spam-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * POST /api/tickets
 *
 * One-way intake: accepts a new-ticket submission and persists it to Supabase.
 * Staff replies happen out-of-band (admin emails the student directly using
 * the address captured here). No magic-link / student auth layer.
 *
 * Form fields (multipart/form-data):
 *   - email          (required)
 *   - student_name   (optional)
 *   - program        (optional — radiography | efda | foundation)
 *   - category       (required — academics | financial_aid | scheduling |
 *                     transcripts | tech | other)
 *   - subject        (required, <= 200 chars)
 *   - body           (required, <= 8000 chars)
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }

  // Bots: answer "ok" so they don't retry, save nothing.
  const bot = botCheck(form);
  if (bot.action === "drop") {
    console.warn(`[tickets] dropped bot submission (${bot.reason})`);
    return NextResponse.json({ ok: true, ticketId: null });
  }
  if (contactRateLimited(clientIp(req))) {
    return bad("Too many messages from this connection. Please call us instead.", 429);
  }

  const email = String(form.get("email") ?? "").trim();
  const studentName = String(form.get("student_name") ?? "").trim();
  const program = String(form.get("program") ?? "").trim();
  const categoryRaw = String(form.get("category") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();

  if (!email || !EMAIL_RE.test(email)) return bad("Please enter a valid email.");
  if (!subject) return bad("Subject is required.");
  if (subject.length > 200) return bad("Subject must be 200 characters or fewer.");
  if (!body) return bad("Message is required.");
  if (body.length > 8000) return bad("Message must be 8,000 characters or fewer.");
  if (!isValidCategory(categoryRaw)) return bad("Please choose a category.");

  // Pitches, gibberish, blocked senders: saved as "spam" (never in Open).
  let spamReason: string | null = null;
  if (await isBlockedSender(email)) spamReason = "blocked sender";
  else {
    const c = contentCheck(email, body);
    if (c.action === "quarantine") spamReason = c.reason;
  }

  const result = await createTicket({
    status: spamReason ? "spam" : "open",
    spamReason,
    email,
    studentName: studentName || null,
    program: program || null,
    category: categoryRaw as TicketCategory,
    subject,
    body,
  });
  if ("error" in result) return bad(result.error, 500);

  return NextResponse.json({ ok: true, ticketId: result.ticket.id });
}
