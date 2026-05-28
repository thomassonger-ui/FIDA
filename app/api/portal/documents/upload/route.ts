import { NextRequest, NextResponse } from "next/server";
import { uploadStudentDocument, MAX_DOC_BYTES } from "@/lib/students-db";
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
  const file = form.get("file");
  const label = String(form.get("label") ?? "").trim() || null;
  if (!(file instanceof File) || file.size === 0) return bad("Pick a file.");
  if (file.size > MAX_DOC_BYTES) return bad("File exceeds the 25 MB limit.");

  const buf = await file.arrayBuffer();
  const up = await uploadStudentDocument({
    studentId: student.id,
    filename: file.name,
    mimeType: file.type || null,
    buffer: buf,
    uploadedBy: "student",
    uploadedByEmail: student.email,
    label,
  });
  if ("error" in up) return bad(up.error, 500);
  return NextResponse.json({ ok: true, docId: up.doc.id });
}
