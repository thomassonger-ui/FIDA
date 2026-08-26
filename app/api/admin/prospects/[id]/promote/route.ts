import { NextRequest, NextResponse } from "next/server";
import { promoteToStudent } from "@/lib/prospects-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/prospects/[id]/promote
 *
 * Registered = the $150 fee is paid. Writes the students row and links it
 * back. Students stays the single record from here on.
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
  return NextResponse.json({ ok: true, studentId: res.studentId });
}
