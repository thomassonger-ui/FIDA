/**
 * Tickets persistence helpers.
 *
 * Every read/write here uses the service-role Supabase client. RLS is bypassed.
 * Never call any of these from a client component.
 */

import { getServerClient } from "./supabase";

export type TicketStatus =
  | "open"
  | "awaiting_staff"
  | "awaiting_student"
  | "resolved"
  | "closed";

export type TicketCategory =
  | "academics"
  | "financial_aid"
  | "scheduling"
  | "transcripts"
  | "tech"
  | "other";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  academics: "Academics",
  financial_aid: "Financial Aid",
  scheduling: "Scheduling",
  transcripts: "Transcripts",
  tech: "Tech / Login",
  other: "Other",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  awaiting_staff: "Awaiting staff",
  awaiting_student: "Awaiting you",
  resolved: "Resolved",
  closed: "Closed",
};

export type Ticket = {
  id: string;
  email: string;
  student_name: string | null;
  program: string | null;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  last_reply_at: string;
  last_reply_by: "student" | "staff" | "system";
};

export type TicketMessage = {
  id: number;
  ticket_id: string;
  author_type: "student" | "staff" | "system";
  author_name: string | null;
  author_email: string | null;
  body: string;
  is_internal_note: boolean;
  created_at: string;
};

export type TicketAttachment = {
  id: number;
  message_id: number;
  storage_path: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
};

const VALID_CATEGORIES: TicketCategory[] = [
  "academics",
  "financial_aid",
  "scheduling",
  "transcripts",
  "tech",
  "other",
];

export function isValidCategory(v: unknown): v is TicketCategory {
  return typeof v === "string" && (VALID_CATEGORIES as string[]).includes(v);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ------------------------------------------------------------
// Create + read
// ------------------------------------------------------------

export async function createTicket(input: {
  email: string;
  studentName?: string | null;
  program?: string | null;
  category: TicketCategory;
  subject: string;
  body: string;
}): Promise<{ ticket: Ticket; message: TicketMessage } | { error: string }> {
  try {
    const supabase = getServerClient();
    const email = normalizeEmail(input.email);

    const { data: ticketRow, error: tErr } = await supabase
      .from("tickets")
      .insert({
        email,
        student_name: input.studentName ?? null,
        program: input.program ?? null,
        category: input.category,
        subject: input.subject.slice(0, 200),
        status: "open",
        last_reply_by: "student",
      })
      .select("*")
      .single();

    if (tErr || !ticketRow) {
      return { error: tErr?.message ?? "Failed to create ticket" };
    }

    const { data: msgRow, error: mErr } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketRow.id,
        author_type: "student",
        author_name: input.studentName ?? null,
        author_email: email,
        body: input.body,
      })
      .select("*")
      .single();

    if (mErr || !msgRow) {
      // Roll back the ticket so we don't leak orphans.
      await supabase.from("tickets").delete().eq("id", ticketRow.id);
      return { error: mErr?.message ?? "Failed to create initial message" };
    }

    return { ticket: ticketRow as Ticket, message: msgRow as TicketMessage };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function listTicketsByEmail(email: string): Promise<Ticket[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("email", normalizeEmail(email))
      .order("last_reply_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Ticket[];
  } catch {
    return [];
  }
}

export async function listAllTickets(filter?: {
  status?: TicketStatus[];
  category?: TicketCategory;
  program?: string;
}): Promise<Ticket[]> {
  try {
    const supabase = getServerClient();
    let q = supabase.from("tickets").select("*").order("last_reply_at", { ascending: false });
    if (filter?.status?.length) q = q.in("status", filter.status);
    if (filter?.category) q = q.eq("category", filter.category);
    if (filter?.program) q = q.eq("program", filter.program);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as Ticket[];
  } catch {
    return [];
  }
}

export async function getTicket(id: string): Promise<Ticket | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    return (data as Ticket) ?? null;
  } catch {
    return null;
  }
}

export async function getMessages(
  ticketId: string,
  options: { includeInternal?: boolean } = {}
): Promise<TicketMessage[]> {
  try {
    const supabase = getServerClient();
    let q = supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    if (!options.includeInternal) q = q.eq("is_internal_note", false);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as TicketMessage[];
  } catch {
    return [];
  }
}

export async function getAttachmentsForMessages(
  messageIds: number[]
): Promise<TicketAttachment[]> {
  if (!messageIds.length) return [];
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("ticket_attachments")
      .select("*")
      .in("message_id", messageIds);
    if (error) return [];
    return (data ?? []) as TicketAttachment[];
  } catch {
    return [];
  }
}

// ------------------------------------------------------------
// Write — append a reply
// ------------------------------------------------------------

export async function appendMessage(input: {
  ticketId: string;
  authorType: "student" | "staff" | "system";
  authorName?: string | null;
  authorEmail?: string | null;
  body: string;
  isInternalNote?: boolean;
}): Promise<{ message: TicketMessage } | { error: string }> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: input.ticketId,
        author_type: input.authorType,
        author_name: input.authorName ?? null,
        author_email: input.authorEmail ?? null,
        body: input.body,
        is_internal_note: input.isInternalNote ?? false,
      })
      .select("*")
      .single();
    if (error || !data) return { error: error?.message ?? "Insert failed" };
    return { message: data as TicketMessage };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function setTicketStatus(id: string, status: TicketStatus) {
  try {
    const supabase = getServerClient();
    const patch: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("tickets").update(patch).eq("id", id);
    return { ok: !error, error: error?.message };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "err" };
  }
}

// ------------------------------------------------------------
// Attachments — Supabase Storage bucket "ticket-attachments"
// ------------------------------------------------------------

export const ATTACHMENT_BUCKET = "ticket-attachments";
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
export const MAX_TICKET_BYTES = 25 * 1024 * 1024; // 25 MB per ticket

export async function totalAttachmentBytesForTicket(ticketId: string): Promise<number> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("id, ticket_attachments(size_bytes)")
      .eq("ticket_id", ticketId);
    if (error || !data) return 0;
    let total = 0;
    for (const row of data as Array<{ ticket_attachments?: Array<{ size_bytes: number }> }>) {
      for (const a of row.ticket_attachments ?? []) total += a.size_bytes ?? 0;
    }
    return total;
  } catch {
    return 0;
  }
}

export async function uploadAttachment(input: {
  ticketId: string;
  messageId: number;
  filename: string;
  mimeType: string | null;
  buffer: ArrayBuffer | Buffer;
}): Promise<{ attachment: TicketAttachment } | { error: string }> {
  try {
    const supabase = getServerClient();
    const safeName = input.filename.replace(/[^\w.\-]+/g, "_").slice(0, 120);
    const path = `${input.ticketId}/${input.messageId}/${Date.now()}-${safeName}`;
    const blob =
      input.buffer instanceof Buffer
        ? input.buffer
        : Buffer.from(input.buffer as ArrayBuffer);

    const { error: upErr } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, blob, {
        contentType: input.mimeType ?? "application/octet-stream",
        upsert: false,
      });
    if (upErr) return { error: upErr.message };

    const { data, error } = await supabase
      .from("ticket_attachments")
      .insert({
        message_id: input.messageId,
        storage_path: path,
        filename: safeName,
        mime_type: input.mimeType,
        size_bytes: blob.byteLength,
      })
      .select("*")
      .single();
    if (error || !data) return { error: error?.message ?? "Insert failed" };

    return { attachment: data as TicketAttachment };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function signedAttachmentUrl(
  storagePath: string,
  expiresIn = 60 * 10 // 10 min
): Promise<string | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(storagePath, expiresIn);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

export function statusTone(status: TicketStatus): "open" | "warn" | "ok" | "muted" {
  switch (status) {
    case "open":
    case "awaiting_staff":
      return "warn";
    case "awaiting_student":
      return "open";
    case "resolved":
      return "ok";
    case "closed":
    default:
      return "muted";
  }
}
