import { getServerClient } from "@/lib/supabase";
import { STUDENT_DOCS_BUCKET } from "@/lib/students-db";
import { audit } from "@/lib/sis";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Short-lived signed URL for a student's photo, or null. */
export async function photoUrl(photoRef: unknown): Promise<string | null> {
  if (typeof photoRef !== "string" || !photoRef) return null;
  try {
    const { data } = await getServerClient().storage.from(STUDENT_DOCS_BUCKET).createSignedUrl(photoRef, 60 * 30);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

/** Store an uploaded photo and point students.photo_ref at it (audited). */
export async function savePhoto(studentId: string, file: unknown, actor: string): Promise<{ error?: string; status?: number }> {
  if (!(file instanceof File)) return { error: "No file", status: 400 };
  const ext = TYPES[file.type];
  if (!ext) return { error: "Photo must be JPG, PNG or WebP", status: 400 };
  if (file.size === 0 || file.size > MAX_BYTES) return { error: "Photo must be under 5 MB", status: 400 };

  const supabase = getServerClient();
  const { data: s } = await supabase.from("students").select("photo_ref").eq("id", studentId).maybeSingle();
  if (!s) return { error: "Student not found", status: 404 };

  const path = `${studentId}/photo/${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from(STUDENT_DOCS_BUCKET).upload(path, buf, { contentType: file.type });
  if (upErr) return { error: upErr.message, status: 500 };

  const { error } = await supabase
    .from("students")
    .update({ photo_ref: path, updated_at: new Date().toISOString() })
    .eq("id", studentId);
  if (error) return { error: error.message, status: 500 };

  await audit(studentId, "photo_updated", { photo_ref: s.photo_ref ?? null }, { photo_ref: path }, actor, "Student photo uploaded");
  return {};
}
