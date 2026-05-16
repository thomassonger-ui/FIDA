import { NextRequest, NextResponse } from "next/server";
import { getStudentById, recordInviteSent, sendPortalInvite, setStudentStatus } from "@/lib/students-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
  const result = await sendPortalInvite({ email: student.email, sentBy: "admin" });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  await recordInviteSent({ studentId: student.id, email: student.email, sentBy: "admin" });
  if (student.status === "invited") {
    // keep status as invited; flips to active when they log in (resolvePortalStudent does this)
  } else if (student.status === "withdrawn" || student.status === "paused") {
    await setStudentStatus(student.id, "invited");
  }
  return NextResponse.json({ ok: true });
}
