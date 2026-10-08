import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { getPortalStudent } from "@/lib/portal-auth";
import { appliesToProgram, audit, buildPatch, loadFieldDefs } from "@/lib/sis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH — student updates their own info. Only fields the school marked "student edits". */
export async function PATCH(req: NextRequest) {
  const student = (await getPortalStudent()) as unknown as Record<string, unknown> | null;
  if (!student) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const defs = (await loadFieldDefs()).filter(
    (f) => f.student_editable && appliesToProgram(f, student.program as string)
  );
  const { core, custom, error } = buildPatch(defs, body, (student.custom as Record<string, unknown>) ?? {});
  if (error) return NextResponse.json({ error }, { status: 400 });

  const patch: Record<string, unknown> = { ...core };
  if (custom) patch.custom = custom;
  const changedOld: Record<string, unknown> = {};
  const changedNew: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(core)) {
    if ((student[k] ?? null) !== (v ?? null)) {
      changedOld[k] = student[k] ?? null;
      changedNew[k] = v;
    }
  }
  const before = (student.custom as Record<string, unknown>) ?? {};
  for (const [k, v] of Object.entries(custom ?? {})) {
    if (JSON.stringify(before[k] ?? null) !== JSON.stringify(v ?? null)) {
      changedOld[`custom.${k}`] = before[k] ?? null;
      changedNew[`custom.${k}`] = v;
    }
  }
  if (Object.keys(changedNew).length === 0) return NextResponse.json({ ok: true, changed: 0 });

  patch.updated_at = new Date().toISOString();
  const { error: upErr } = await getServerClient().from("students").update(patch).eq("id", student.id as string);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  await audit(student.id as string, "record_updated_by_student", changedOld, changedNew, "student (portal)", `Student updated ${Object.keys(changedNew).length} field(s)`);
  return NextResponse.json({ ok: true, changed: Object.keys(changedNew).length });
}
