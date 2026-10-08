import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { FIELD_TYPES, ROLES, viewerRole } from "@/lib/sis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Core fields every record needs — can be relabelled but never turned off. */
const LOCKED = new Set(["student_number", "first_name", "last_name", "email", "program"]);
const SECTIONS = new Set(["profile", "admissions", "ferpa", "custom"]);

function roles(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const r = v.filter((x): x is string => typeof x === "string" && (ROLES as readonly string[]).includes(x));
  return r.includes("owner") ? r : ["owner", ...r];
}
function strList(v: unknown, max = 40): string[] | null {
  if (v === null) return null;
  if (!Array.isArray(v)) return null;
  const out = v.map((x) => String(x).trim().slice(0, 120)).filter(Boolean).slice(0, max);
  return out.length ? out : null;
}

async function ownerOnly() {
  const { role, email } = await viewerRole();
  return role === "owner" ? { email } : null;
}

/** PATCH {key, ...changes} — update one field definition. */
export async function PATCH(req: NextRequest) {
  const who = await ownerOnly();
  if (!who) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b.key !== "string") return NextResponse.json({ error: "key required" }, { status: 400 });

  const supabase = getServerClient();
  const { data: cur } = await supabase.from("sis_field_defs").select("*").eq("key", b.key).maybeSingle();
  if (!cur) return NextResponse.json({ error: "Field not found" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof b.label === "string" && b.label.trim()) patch.label = b.label.trim().slice(0, 80);
  for (const k of ["required", "student_visible", "student_editable", "active"] as const) {
    if (typeof b[k] === "boolean") patch[k] = b[k];
  }
  if (LOCKED.has(cur.key) && patch.active === false) {
    return NextResponse.json({ error: `${cur.label} is part of every student record and can't be turned off.` }, { status: 400 });
  }
  if ("visible_roles" in b) {
    const r = roles(b.visible_roles);
    if (!r) return NextResponse.json({ error: "visible_roles must be a list" }, { status: 400 });
    patch.visible_roles = r;
  }
  if ("programs" in b) patch.programs = strList(b.programs);
  if ("options" in b && cur.field_type === "select") patch.options = strList(b.options, 50);
  if (typeof b.sort === "number") patch.sort = Math.round(b.sort);
  if (patch.student_editable === true) patch.student_visible = true;

  patch.updated_at = new Date().toISOString();
  const { error } = await supabase.from("sis_field_defs").update(patch).eq("key", b.key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("audit_events").insert({
    entity_type: "sis_field",
    entity_id: String(b.key),
    action: "sis_field_updated",
    old_value: cur,
    new_value: patch,
    actor: who.email ?? "admin",
    reason: `SIS field ${b.key} changed`,
  }).then(() => undefined, () => undefined);
  return NextResponse.json({ ok: true });
}

/** POST — add a custom field. */
export async function POST(req: NextRequest) {
  const who = await ownerOnly();
  if (!who) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const label = typeof b?.label === "string" ? b.label.trim().slice(0, 80) : "";
  if (!b || !label) return NextResponse.json({ error: "Label required" }, { status: 400 });
  const field_type = String(b.field_type ?? "text");
  if (!(FIELD_TYPES as readonly string[]).includes(field_type)) {
    return NextResponse.json({ error: "Unknown field type" }, { status: 400 });
  }
  const section = SECTIONS.has(String(b.section)) ? String(b.section) : "custom";
  const options = field_type === "select" ? strList(b.options, 50) : null;
  if (field_type === "select" && !options) return NextResponse.json({ error: "Add at least one option" }, { status: 400 });

  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 50) || "field";
  const supabase = getServerClient();
  const { data: clash } = await supabase.from("sis_field_defs").select("key").eq("key", key).maybeSingle();
  if (clash) return NextResponse.json({ error: `A field with key "${key}" already exists` }, { status: 409 });

  const row = {
    key,
    label,
    section,
    field_type,
    options,
    programs: strList(b.programs),
    required: b.required === true,
    visible_roles: roles(b.visible_roles) ?? ["owner", "registrar", "admissions", "read_only"],
    student_visible: b.student_visible === true || b.student_editable === true,
    student_editable: b.student_editable === true,
    is_core: false,
    active: true,
    sort: 200,
  };
  const { error } = await supabase.from("sis_field_defs").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("audit_events").insert({
    entity_type: "sis_field",
    entity_id: key,
    action: "sis_field_added",
    old_value: null,
    new_value: row,
    actor: who.email ?? "admin",
    reason: `Custom SIS field "${label}" added`,
  }).then(() => undefined, () => undefined);
  return NextResponse.json({ ok: true, key });
}
