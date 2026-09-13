import { NextRequest, NextResponse } from "next/server";
import { promoteToStudent } from "@/lib/prospects-db";
import { programUsesAgreement, sendEnrollmentAgreement } from "@/lib/enrollment";
import { getStudentById } from "@/lib/students-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/prospects/[id]/promote
 *
 * Registered = the $150 fee is paid. Writes the students row and links it
 * back. Students stays the single record from here on.
 *
 * Entry Level students also get the enrollment agreement emailed here
 * (2026-09-13) — this click is the "$150 paid" trigger Ashley asked for.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { program?: string; cohort_id?: string; start_date?: string } = {};
  try {
    body = await req.json();
  } catch {
    // an empty body is fine — fall back to the prospect's own fields
  }
  const res = await promoteToStudent(id, body);
  if ("error" in res)
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  let agreement: "sent" | "skipped" | string = "skipped";
  const student = await getStudentById(res.studentId);
  if (student && programUsesAgreement(student.program)) {
    const sent = await sendEnrollmentAgreement(res.studentId, "auto:promote");
    agreement = sent.ok ? "sent" : `failed: ${sent.error}`;
  }
  return NextResponse.json({ ok: true, studentId: res.studentId, agreement });
}
