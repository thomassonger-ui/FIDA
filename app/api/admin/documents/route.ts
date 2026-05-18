/**
 * Document upload API — POST /api/admin/documents
 *
 * Accepts a multipart form upload, stores the file in Supabase Storage
 * (bucket: "document-vault"), computes a SHA-256 hash, and writes a
 * record to the `document_records` table.
 *
 * On DB-insert failure, the just-uploaded storage object is rolled back
 * (deleted) so we never leave orphaned files. `uploaded_by` is captured
 * from the Supabase auth session — preferring `user_metadata.full_name`,
 * falling back to `user:<UUID>`. Personal email is NEVER stored. If the
 * request only carries the shared-admin cookie, it falls back to
 * "admin-shared".
 *
 * GET /api/admin/documents — returns all records (newest first).
 *
 * WORM enforcement is in the DB via the document_records_worm_protect
 * trigger: locked rows cannot be UPDATEd or DELETEd.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getServerClient } from "@/lib/supabase";
import { RETENTION_YEARS, type DocumentCategory } from "@/lib/demo-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_CATEGORIES: DocumentCategory[] = [
  "enrollment_agreement",
  "financial_disclosure",
  "id_verification",
  "transcript",
  "sap_notice",
  "appeal_decision",
  "placement_verification",
  "other",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Identify the admin performing this action. Preferred: Supabase auth user
 * (signed in via email + password or Google OAuth). Fallback: "admin-shared"
 * when the request only carries the shared-admin cookie (no Supabase session).
 */
async function whoIsTheAdmin(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return "admin-shared";
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* no-op: read-only auth check */
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "admin-shared";
    // Prefer a friendly display name set in user_metadata; never the email.
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      typeof meta.full_name === "string" && meta.full_name.trim()
        ? meta.full_name.trim()
        : null;
    return fullName ?? `user:${user.id}`;
  } catch {
    return "admin-shared";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;
    const studentId = formData.get("student_id") as string | null;
    const studentName = formData.get("student_name") as string | null;
    const programRaw = formData.get("program") as string | null;
    const notes = formData.get("notes") as string | null;

    const VALID_PROGRAMS = new Set(["efda", "rdp_ce", "both", "other"]);
    const program =
      programRaw && VALID_PROGRAMS.has(programRaw) ? programRaw : null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category as DocumentCategory)) {
      return NextResponse.json(
        { error: "Invalid or missing category" },
        { status: 400 }
      );
    }
    if (!studentName) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10 MB limit" },
        { status: 400 }
      );
    }

    const supabase = getServerClient();
    const buffer = await file.arrayBuffer();
    const hash = await sha256Hex(buffer);
    const uploadedBy = await whoIsTheAdmin();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const studentRef = (studentId ?? "").trim() || "unknown";
    const storagePath = `${studentRef}/${timestamp}_${safeName}`;

    // 1) Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from("document-vault")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 2) Insert DB record. If this fails, roll back the storage upload.
    const cat = category as DocumentCategory;
    const now = new Date();
    const retYears = RETENTION_YEARS[cat] ?? 3;
    const retExpires = new Date(now);
    retExpires.setFullYear(retExpires.getFullYear() + retYears);

    const { data: record, error: dbError } = await supabase
      .from("document_records")
      .insert({
        student_id: (studentId ?? "").trim() || null,
        student_name: studentName,
        category: cat,
        program,
        filename: file.name,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.type || "application/octet-stream",
        storage_path: storagePath,
        sha256: hash,
        uploaded_by: uploadedBy,
        retention_years: retYears,
        retention_expires: retExpires.toISOString().slice(0, 10),
        locked: true,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert failed; rolling back storage:", dbError);
      // Roll back: delete the just-uploaded object so we don't leave an orphan.
      await supabase.storage.from("document-vault").remove([storagePath]);
      return NextResponse.json(
        { error: `Could not record upload: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: record?.id,
      hash,
      storagePath,
      uploadedBy,
      retentionExpires: retExpires.toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/documents — return all records, newest first.
 * Used by the /admin/documents page to render the vault contents.
 */
export async function GET() {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("document_records")
      .select(
        "id, student_id, student_name, category, program, filename, file_size_kb, mime_type, storage_path, sha256, uploaded_by, uploaded_at, retention_years, retention_expires, locked, notes"
      )
      .order("uploaded_at", { ascending: false })
      .limit(500);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ records: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
