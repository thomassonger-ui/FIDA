import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { audit, buildPatch, fieldsForRole, loadFieldDefs, viewerRole, withFullName, type Role } from "@/lib/sis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EDIT_ROLES: Role[] = ["owner", "registrar", "admissions"];
const RELEASE_ROLES: Role[] = ["owner", "registrar"];

function cleanReleases(v: unknown): Array<Record<string, string>> | null {
  if (!Array.isArray(v) || v.length > 20) return null;
  const out: Array<Record<string, string>> = [];
  for (const r of v) {
    if (!r || typeof r !== "object") return null;
    const o = r as Record<string, unknown>;
    const name = String(o.name ?? "").trim().slice(0, 120);
    const relationship = String(o.relationship ?? "").trim().slice(0, 60);
    const scope = String(o.scope ?? "").trim().slice(0, 40);
    const signed_at = String(o.signed_at ?? "").trim();
    if (!name || !relationship || !/^\d{4}-\d{2}-\d{2}$/.test(signed_at)) return null;
    out.push({ name, relationship, scope, signed_at });
  }
  return out;
}

/** PATCH — edit the SIS record (fields the viewer's role may see). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { role, email } = await viewerRole();
  if (!EDIT_ROLES.includes(role)) {
    return NextResponse.json({ error: `The ${role.replace("_", " ")} role cannot edit student records.` }, { status: 403 });
  }

  const supabase = getServerClient();
  const { data: current } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  if (!current) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  const cur = current as Record<string, unknown>;

  const defs = await loadFieldDefs();
  if (defs.length === 0) {
    return NextResponse.json({ error: "SIS fields are not set up yet — run supabase/migrations/20261008_sis.sql." }, { status: 503 });
  }
  const allowed = fieldsForRole(defs, role, cur.program as string);
  const { core, custom, error } = buildPatch(allowed, body, (cur.custom as Record<string, unknown>) ?? {});
  if (error) return NextResponse.json({ error }, { status: 400 });

  const patch: Record<string, unknown> = withFullName(core, cur);
  if (custom) patch.custom = custom;
  if ("notes" in body && (role === "owner" || role === "registrar")) {
    const n = body.notes;
    patch.notes = typeof n === "string" && n.trim() ? n.trim().slice(0, 2000) : null;
  }
  if ("ferpa_releases" in body) {
    if (!RELEASE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Only owner or registrar can change FERPA releases." }, { status: 403 });
    }
    const rel = cleanReleases(body.ferpa_releases);
    if (!rel) return NextResponse.json({ error: "Each release needs a name, relationship and signed date." }, { status: 400 });
    patch.ferpa_releases = rel;
  }
  if (patch.email === null) return NextResponse.json({ error: "Email cannot be blank" }, { status: 400 });
  if (typeof patch.email === "string") patch.email = patch.email.toLowerCase();

  const changedOld: Record<string, unknown> = {};
  const changedNew: Record<string, unknown> = {};
  for (const k of Object.keys(patch)) {
    if (k === "custom") {
      const before = (cur.custom as Record<string, unknown>) ?? {};
      for (const ck of Object.keys(custom ?? {})) {
        if (JSON.stringify(before[ck] ?? null) !== JSON.stringify(custom![ck] ?? null)) {
          changedOld[`custom.${ck}`] = before[ck] ?? null;
          changedNew[`custom.${ck}`] = custom![ck];
        }
      }
    } else if (JSON.stringify(cur[k] ?? null) !== JSON.stringify(patch[k] ?? null)) {
      changedOld[k] = cur[k];
      changedNew[k] = patch[k];
    }
  }
  if (Object.keys(changedNew).length === 0) return NextResponse.json({ ok: true, changed: 0 });

  patch.updated_at = new Date().toISOString();
  const { error: upErr } = await supabase.from("students").update(patch).eq("id", id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  await audit(
    id,
    "ferpa_releases" in changedNew ? "ferpa_release_changed" : "record_updated",
    changedOld,
    changedNew,
    email ?? "admin",
    `Edited ${Object.keys(changedNew).length} field(s) as ${role}`
  );
  return NextResponse.json({ ok: true, changed: Object.keys(changedNew).length });
}
