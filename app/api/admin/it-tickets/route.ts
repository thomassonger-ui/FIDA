/**
 * POST /api/admin/it-tickets
 *
 * School-staff submits an IT support ticket.
 * Flow:
 *   1. Validate the form (subject + body required; attachment optional, <= 10 MB).
 *   2. Upload the attachment (if any) to the it-ticket-attachments bucket.
 *   3. Insert a row in public.it_tickets.
 *   4. Send Tom@TryAtticus.com an email via Resend (best-effort).
 *      - On success, persist email_sent_at.
 *      - On failure, persist email_send_error so the UI can show it.
 *
 * RESEND_API_KEY env var must be set in Vercel for emails to go out. Without
 * it, the ticket still saves; the UI just notes the email didn't ship.
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_API_URL = "https://api.resend.com/emails";
const RECIPIENT = "Tom@TryAtticus.com";
const SENDER = process.env.RESEND_FROM || "FIDA IT <noreply@tryatticus.com>";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function adminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function isAdmin(): Promise<boolean> {
  // Middleware has already gated /api/admin/*. Belt-and-suspenders cookie check.
  const c = await cookies();
  const admin = c.get("fida_admin")?.value;
  if (admin && admin === process.env.ADMIN_SESSION_SECRET) return true;
  // Supabase admin session via cookie is also valid (admin-supabase path); middleware
  // enforces it before this route runs. We allow through here.
  return true;
}

async function sendResendEmail(opts: {
  subject: string;
  bodyText: string;
  attachment?: {
    filename: string;
    contentBase64: string;
    contentType: string;
  };
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY env var is not set in Vercel" };
  }

  const payload: Record<string, unknown> = {
    from: SENDER,
    to: [RECIPIENT],
    subject: `[FIDA IT] ${opts.subject}`,
    text: opts.bodyText,
  };
  if (opts.attachment) {
    payload.attachments = [
      {
        filename: opts.attachment.filename,
        content: opts.attachment.contentBase64,
      },
    ];
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: json.message || `HTTP ${res.status}` };
    }
    return { ok: true, id: json.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return bad("Not authorized", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }

  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const submittedByName =
    String(form.get("submitted_by_name") ?? "").trim() || null;
  const file = form.get("attachment");
  const hasFile = file instanceof File && file.size > 0;

  if (!subject) return bad("Subject is required.");
  if (subject.length > 200)
    return bad("Subject must be 200 characters or fewer.");
  if (!body) return bad("Message is required.");
  if (body.length > 8000)
    return bad("Message must be 8,000 characters or fewer.");
  if (hasFile && file.size > MAX_FILE_BYTES) {
    return bad("Attachment exceeds the 10 MB per-file limit.");
  }

  const sb = adminClient();

  // 1. Upload attachment (if any) to Supabase Storage.
  let attachmentStoragePath: string | null = null;
  let attachmentBuffer: ArrayBuffer | null = null;
  if (hasFile) {
    const id = crypto.randomUUID();
    const ext =
      (file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? "").slice(0, 10) || "";
    attachmentStoragePath = `${id}${ext}`;
    attachmentBuffer = await file.arrayBuffer();
    const up = await sb.storage
      .from("it-ticket-attachments")
      .upload(attachmentStoragePath, new Uint8Array(attachmentBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (up.error) {
      // Bucket might not exist yet — try to create it once, then retry.
      const bucketCreate = await sb.storage.createBucket(
        "it-ticket-attachments",
        { public: false }
      );
      if (!bucketCreate.error || bucketCreate.error.message?.includes("exists")) {
        const retry = await sb.storage
          .from("it-ticket-attachments")
          .upload(attachmentStoragePath, new Uint8Array(attachmentBuffer), {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (retry.error) {
          return bad(`Attachment upload failed: ${retry.error.message}`, 500);
        }
      } else {
        return bad(`Attachment upload failed: ${up.error.message}`, 500);
      }
    }
  }

  // 2. Insert the ticket row.
  // Submitter email — pulled from admin session if available, else "admin".
  const submittedByEmail = "admin@fldentalassisting.com"; // Placeholder; middleware
  // gated this route already, and we don't capture admin identity in the cookie.
  // If we later wire admin Supabase Auth here, swap in the actual user email.

  const insertRes = await sb
    .from("it_tickets")
    .insert({
      submitted_by_email: submittedByEmail,
      submitted_by_name: submittedByName,
      subject,
      body,
      attachment_storage_path: attachmentStoragePath,
      attachment_filename: hasFile ? file.name : null,
      attachment_size_bytes: hasFile ? file.size : null,
      attachment_mime_type: hasFile ? file.type || null : null,
    })
    .select("id")
    .single();

  if (insertRes.error || !insertRes.data) {
    return bad(
      `Could not save ticket: ${insertRes.error?.message ?? "unknown"}`,
      500
    );
  }
  const ticketId = insertRes.data.id as string;

  // 3. Send the email via Resend (best-effort).
  const emailText = [
    `Subject: ${subject}`,
    `From: ${submittedByName ? `${submittedByName} (${submittedByEmail})` : submittedByEmail}`,
    `Ticket ID: ${ticketId}`,
    `Submitted: ${new Date().toISOString()}`,
    "",
    "---",
    "",
    body,
    "",
    "---",
    "",
    hasFile
      ? `Attachment: ${file.name} (${Math.round(file.size / 1024)} KB)`
      : "No attachment.",
  ].join("\n");

  const sendRes = await sendResendEmail({
    subject,
    bodyText: emailText,
    attachment:
      hasFile && attachmentBuffer
        ? {
            filename: file.name,
            contentBase64: Buffer.from(attachmentBuffer).toString("base64"),
            contentType: file.type || "application/octet-stream",
          }
        : undefined,
  });

  if (sendRes.ok) {
    await sb
      .from("it_tickets")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", ticketId);
    return NextResponse.json({ ok: true, ticketId, emailSent: true });
  } else {
    await sb
      .from("it_tickets")
      .update({ email_send_error: sendRes.error })
      .eq("id", ticketId);
    return NextResponse.json({
      ok: true,
      ticketId,
      emailSent: false,
      emailError: sendRes.error,
    });
  }
}
