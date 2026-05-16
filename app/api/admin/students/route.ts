import { NextRequest, NextResponse } from "next/server";
import { upsertStudent } from "@/lib/students-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * POST /api/admin/students  (multipart/form-data)
 *
 * Fields: email (required), full_name, phone, program, cohort_id,
 * start_date, notes, send_invite ("1" optional).
 *
 * Creates the student row (upsert by email). If send_invite=1, also
 * fires the magic-link invite via the /invite route.
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const email = String(form.get("email") ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) return bad("Valid email is required.");
  const result = await upsertStudent({
    email,
    full_name: String(form.get("full_name") ?? "").trim() || null,
    phone: String(form.get("phone") ?? "").trim() || null,
    program: String(form.get("program") ?? "").trim() || null,
    cohort_id: String(form.get("cohort_id") ?? "").trim() || null,
    start_date: String(form.get("start_date") ?? "").trim() || null,
    notes: String(form.get("notes") ?? "").trim() || null,
    source: "admin",
  });
  if ("error" in result) return bad(result.error, 500);
  return NextResponse.json({ ok: true, studentId: result.student.id });
}
