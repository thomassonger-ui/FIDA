import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { viewerRole } from "@/lib/sis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST {body} — add a private staff note to the student's activity timeline. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { role, email } = await viewerRole();
  if (role === "read_only") return NextResponse.json({ error: "Read-only access." }, { status: 403 });
  const json = (await req.json().catch(() => null)) as { body?: unknown } | null;
  const body = typeof json?.body === "string" ? json.body.trim().slice(0, 2000) : "";
  if (!body) return NextResponse.json({ error: "Note is empty" }, { status: 400 });

  const supabase = getServerClient();
  const { data: s } = await supabase.from("students").select("id").eq("id", id).maybeSingle();
  if (!s) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const { error } = await supabase
    .from("sis_student_notes")
    .insert({ student_id: id, body, author: `${email ?? "admin"} (${role})` });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
