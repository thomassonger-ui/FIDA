import { NextRequest, NextResponse } from "next/server";
import { savePhoto } from "@/lib/sis-photo";
import { viewerRole } from "@/lib/sis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST multipart `file` — set the student's photo. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { role, email } = await viewerRole();
  if (!["owner", "registrar", "admissions"].includes(role)) {
    return NextResponse.json({ error: "Only owner, registrar or admissions can change photos." }, { status: 403 });
  }
  const form = await req.formData().catch(() => null);
  const r = await savePhoto(id, form?.get("file"), email ?? "admin");
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status ?? 400 });
  return NextResponse.json({ ok: true });
}
