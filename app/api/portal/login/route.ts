import { NextRequest, NextResponse } from "next/server";
import { sendPortalInvite } from "@/lib/students-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const email = String(form.get("email") ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: true });
  }
  await sendPortalInvite({ email, sentBy: "portal-self" });
  return NextResponse.json({ ok: true });
}
