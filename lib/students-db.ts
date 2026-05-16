/**
 * Student portal persistence helpers.
 *
 * All reads/writes here use the service-role Supabase client.
 * Never call from a client component.
 */

import { getServerClient } from "./supabase";

export type StudentStatus =
  | "invited"
  | "active"
  | "paused"
  | "graduated"
  | "withdrawn";

export type Student = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  program: string | null;
  cohort_id: string | null;
  start_date: string | null;
  status: StudentStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentDocument = {
  id: number;
  student_id: string;
  filename: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  uploaded_by: "staff" | "student";
  uploaded_by_email: string | null;
  label: string | null;
  is_required: boolean;
  created_at: string;
};

export const STUDENT_DOCS_BUCKET = "student-documents";
export const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25 MB

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ------------------------------------------------------------
// Reads
// ------------------------------------------------------------

export async function getStudentByEmail(email: string): Promise<Student | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("email", normalizeEmail(email))
      .maybeSingle();
    if (error) return null;
    return (data as Student) ?? null;
  } catch {
    return null;
  }
}

export async function getStudentByUserId(
  userId: string
): Promise<Student | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return null;
    return (data as Student) ?? null;
  } catch {
    return null;
  }
}

export async function getStudentById(id: string): Promise<Student | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    return (data as Student) ?? null;
  } catch {
    return null;
  }
}

export async function listStudents(filter?: {
  status?: StudentStatus[];
  program?: string;
}): Promise<Student[]> {
  try {
    const supabase = getServerClient();
    let q = supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter?.status?.length) q = q.in("status", filter.status);
    if (filter?.program) q = q.eq("program", filter.program);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as Student[];
  } catch {
    return [];
  }
}

/** Find an authenticated portal user's student record by their Supabase user_id; falls back to email. */
export async function resolvePortalStudent(input: {
  userId: string | null;
  email: string | null;
}): Promise<Student | null> {
  if (input.userId) {
    const byUid = await getStudentByUserId(input.userId);
    if (byUid) return byUid;
  }
  if (input.email) {
    const byEmail = await getStudentByEmail(input.email);
    if (byEmail) {
      // Lazy-link: if we found by email but user_id was empty, set it now.
      if (input.userId && byEmail.user_id !== input.userId) {
        try {
          const supabase = getServerClient();
          await supabase
            .from("students")
            .update({ user_id: input.userId, status: byEmail.status === "invited" ? "active" : byEmail.status })
            .eq("id", byEmail.id);
        } catch {
          // best-effort
        }
      }
      return byEmail;
    }
  }
  return null;
}

// ------------------------------------------------------------
// Writes
// ------------------------------------------------------------

export async function upsertStudent(input: {
  email: string;
  full_name?: string | null;
  phone?: string | null;
  program?: string | null;
  cohort_id?: string | null;
  start_date?: string | null;
  source?: string | null;
  notes?: string | null;
}): Promise<{ student: Student } | { error: string }> {
  try {
    const supabase = getServerClient();
    const email = normalizeEmail(input.email);
    const existing = await getStudentByEmail(email);
    if (existing) {
      // Update fields that were passed in (only non-null values).
      const patch: Record<string, unknown> = {};
      if (input.full_name !== undefined) patch.full_name = input.full_name;
      if (input.phone !== undefined) patch.phone = input.phone;
      if (input.program !== undefined) patch.program = input.program;
      if (input.cohort_id !== undefined) patch.cohort_id = input.cohort_id;
      if (input.start_date !== undefined) patch.start_date = input.start_date;
      if (input.notes !== undefined) patch.notes = input.notes;
      if (Object.keys(patch).length === 0) return { student: existing };
      const { data, error } = await supabase
        .from("students")
        .update(patch)
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error || !data) return { error: error?.message ?? "update failed" };
      return { student: data as Student };
    }

    const { data, error } = await supabase
      .from("students")
      .insert({
        email,
        full_name: input.full_name ?? null,
        phone: input.phone ?? null,
        program: input.program ?? null,
        cohort_id: input.cohort_id ?? null,
        start_date: input.start_date ?? null,
        source: input.source ?? "admin",
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (error || !data) return { error: error?.message ?? "insert failed" };
    return { student: data as Student };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function setStudentStatus(id: string, status: StudentStatus) {
  try {
    const supabase = getServerClient();
    const { error } = await supabase
      .from("students")
      .update({ status })
      .eq("id", id);
    return { ok: !error, error: error?.message };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "err" };
  }
}

export async function recordInviteSent(input: {
  studentId: string;
  email: string;
  sentBy?: string | null;
}) {
  try {
    const supabase = getServerClient();
    await supabase.from("student_invites").insert({
      student_id: input.studentId,
      email: input.email,
      sent_by: input.sentBy ?? "admin",
    });
  } catch {
    // soft fail; invite was sent regardless
  }
}

// ------------------------------------------------------------
// Documents
// ------------------------------------------------------------

export async function listStudentDocuments(
  studentId: string
): Promise<StudentDocument[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as StudentDocument[];
  } catch {
    return [];
  }
}

export async function uploadStudentDocument(input: {
  studentId: string;
  filename: string;
  mimeType: string | null;
  buffer: ArrayBuffer | Buffer;
  uploadedBy: "staff" | "student";
  uploadedByEmail: string | null;
  label?: string | null;
  isRequired?: boolean;
}): Promise<{ doc: StudentDocument } | { error: string }> {
  try {
    const supabase = getServerClient();
    const safeName = input.filename.replace(/[^\w.\-]+/g, "_").slice(0, 120);
    const path = `${input.studentId}/${Date.now()}-${safeName}`;
    const blob =
      input.buffer instanceof Buffer
        ? input.buffer
        : Buffer.from(input.buffer as ArrayBuffer);

    if (blob.byteLength > MAX_DOC_BYTES) {
      return { error: "File exceeds the 25 MB per-document limit." };
    }

    const { error: upErr } = await supabase.storage
      .from(STUDENT_DOCS_BUCKET)
      .upload(path, blob, {
        contentType: input.mimeType ?? "application/octet-stream",
        upsert: false,
      });
    if (upErr) return { error: upErr.message };

    const { data, error } = await supabase
      .from("student_documents")
      .insert({
        student_id: input.studentId,
        filename: safeName,
        storage_path: path,
        mime_type: input.mimeType,
        size_bytes: blob.byteLength,
        uploaded_by: input.uploadedBy,
        uploaded_by_email: input.uploadedByEmail,
        label: input.label ?? null,
        is_required: input.isRequired ?? false,
      })
      .select("*")
      .single();
    if (error || !data) return { error: error?.message ?? "insert failed" };
    return { doc: data as StudentDocument };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function signedDocumentUrl(
  storagePath: string,
  expiresIn = 60 * 10
): Promise<string | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase.storage
      .from(STUDENT_DOCS_BUCKET)
      .createSignedUrl(storagePath, expiresIn);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// Invite flow — send magic link via Supabase Auth OTP
// ------------------------------------------------------------

export async function sendPortalInvite(input: {
  email: string;
  sentBy?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = getServerClient();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://fida-eight.vercel.app";
    const redirect = `${origin}/api/auth/callback?next=/portal`;
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizeEmail(input.email),
      options: {
        emailRedirectTo: redirect,
        shouldCreateUser: true,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}
