import { NextRequest, NextResponse } from "next/server";
import { getPortalStudent } from "@/lib/portal-auth";
import { savePhoto } from "@/lib/sis-photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST multipart `file` — student submits their ID photo (only while none is on file). */
export async function POST(req: NextRequest) {
  const student = (await getPortalStudent()) as unknown as Record<string, unknown> | null;
  if (!student) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (student.photo_ref) {
    return NextResponse.json({ error: "A photo is already on file. Ask the registrar to change it." }, { status: 409 });
  }
  const form = await req.formData().catch(() => null);
  const r = await savePhoto(student.id as string, form?.get("file"), "student (portal)");
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
  return NextResponse.json({ ok: true });
}
