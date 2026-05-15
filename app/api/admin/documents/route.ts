/**
 * Document upload API — POST /api/admin/documents
 *
 * Accepts a multipart form upload, stores the file in Supabase Storage
 * (bucket: "document-vault"), computes a SHA-256 hash, and writes a
 * record to the `document_records` table.
 *
 * This is the Option 2 approach: Supabase Storage + hash chain.
 * For production WORM compliance, upgrade to S3 Object Lock.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { RETENTION_YEARS, type DocumentCategory } from "@/lib/demo-documents";

export const dynamic = "force-dynamic";

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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;
    const studentId = formData.get("student_id") as string | null;
    const studentName = formData.get("student_name") as string | null;
    const notes = formData.get("notes") as string | null;

    // Validate
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

    // Build a safe storage path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${studentId ?? "unknown"}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("document-vault")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false, // never overwrite
      });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Write record to document_records table
    const cat = category as DocumentCategory;
    const now = new Date();
    const retYears = RETENTION_YEARS[cat] ?? 3;
    const retExpires = new Date(now);
    retExpires.setFullYear(retExpires.getFullYear() + retYears);

    const { data: record, error: dbError } = await supabase
      .from("document_records")
      .insert({
        student_id: studentId ? parseInt(studentId, 10) : null,
        student_name: studentName,
        category: cat,
        filename: file.name,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.type || "application/octet-stream",
        storage_path: storagePath,
        sha256: hash,
        uploaded_by: "admin@blueprint.edu", // TODO: real auth user
        retention_years: retYears,
        retention_expires: retExpires.toISOString().slice(0, 10),
        locked: true,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert failed:", dbError);
      // Still return success-ish since the file IS uploaded
      return NextResponse.json({
        ok: true,
        warning: "File uploaded but record insert failed. Check document_records table.",
        hash,
        storagePath,
      });
    }

    return NextResponse.json({
      ok: true,
      id: record?.id,
      hash,
      storagePath,
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
