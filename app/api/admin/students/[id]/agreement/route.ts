import { NextRequest, NextResponse } from "next/server";
import { countersignAgreement, latestAgreementForStudent, markDepositPaid, sendEnrollmentAgreement } from "@/lib/enrollment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST — send (or re-send) the enrollment agreement signing link. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await sendEnrollmentAgreement(id, "admin");
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true, sentAt: res.agreement.sent_at });
}

/**
 * PATCH { deposit_paid: boolean } — staff marks the $600 as received in QBO.
 * PATCH { countersign: { name, title } } — staff signs the School Official +
 *   Representative lines; executed PDF is re-filed and emailed.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { deposit_paid?: boolean; countersign?: { name?: string; title?: string } } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const agreement = await latestAgreementForStudent(id);
  if (!agreement || agreement.status !== "signed") {
    return NextResponse.json({ ok: false, error: "No signed agreement on file yet." }, { status: 400 });
  }
  if (body.countersign) {
    const res = await countersignAgreement(agreement.id, {
      name: String(body.countersign.name ?? ""),
      title: String(body.countersign.title ?? ""),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  const ok = await markDepositPaid(agreement.id, body.deposit_paid === true);
  if (!ok) return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
