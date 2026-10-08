/**
 * Atticus SIS — configurable student record (FIDA edition).
 *
 * Core fields map to public.students columns; custom fields live in
 * students.custom (jsonb) keyed by sis_field_defs.key. The school turns
 * fields on/off, marks them required, limits them to programs, and chooses
 * which staff roles (and the student) can see or edit them in
 * /admin/settings/sis. No SSN/TIN is ever stored.
 *
 * Roles: FIDA has no staff table. Anyone who passes the admin guard is
 * `owner` unless SIS_STAFF_ROLES maps their email to another role:
 *   SIS_STAFF_ROLES="jessa@example.com:admissions,instructor@fida.edu:instructor"
 * Owners may preview any role with ?as=<role>.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getServerClient } from "@/lib/supabase";

export const ROLES = ["owner", "registrar", "admissions", "instructor", "read_only"] as const;
export type Role = (typeof ROLES)[number];

export const SECTIONS = [
  ["profile", "Profile"],
  ["admissions", "Admissions"],
  ["ferpa", "FERPA"],
  ["custom", "Program fields"],
] as const;
export type Section = (typeof SECTIONS)[number][0];

export const FIELD_TYPES = ["text", "date", "number", "boolean", "select", "email", "phone"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldDef = {
  key: string;
  label: string;
  section: Section;
  field_type: FieldType;
  options: string[] | null;
  programs: string[] | null;
  required: boolean;
  visible_roles: Role[];
  student_visible: boolean;
  student_editable: boolean;
  is_core: boolean;
  active: boolean;
  sort: number;
};

/** Which tabs each role sees, beyond field-driven ones. */
export const TAB_ROLES: Record<string, Role[]> = {
  documents: ["owner", "registrar", "admissions", "read_only"],
  messages: ["owner", "registrar", "admissions", "read_only"],
  ferpa_releases: ["owner", "registrar", "read_only"],
  activity: ["owner", "registrar", "admissions", "read_only"],
};

/** Empty list (not an error) when the migration hasn't been applied yet. */
export async function loadFieldDefs(includeInactive = false): Promise<FieldDef[]> {
  try {
    const supabase = getServerClient();
    let q = supabase.from("sis_field_defs").select("*").order("sort").order("label");
    if (!includeInactive) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as FieldDef[];
  } catch {
    return [];
  }
}

export function appliesToProgram(f: FieldDef, program: string | null | undefined): boolean {
  return !f.programs || f.programs.length === 0 || (!!program && f.programs.includes(program));
}

export function fieldsForRole(defs: FieldDef[], role: Role, program: string | null | undefined) {
  return defs.filter((f) => f.active && f.visible_roles.includes(role) && appliesToProgram(f, program));
}

export function fieldsForStudent(defs: FieldDef[], program: string | null | undefined) {
  return defs.filter((f) => f.active && f.student_visible && appliesToProgram(f, program));
}

export function valueOf(student: Record<string, unknown>, f: FieldDef): unknown {
  if (f.is_core) return student[f.key];
  const custom = (student.custom as Record<string, unknown> | null) ?? {};
  return custom[f.key];
}

export function isBlank(v: unknown): boolean {
  return v === null || v === undefined || v === "" || v === false;
}

export function missingRequired(defs: FieldDef[], student: Record<string, unknown>): FieldDef[] {
  return defs.filter(
    (f) => f.active && f.required && appliesToProgram(f, student.program as string) && isBlank(valueOf(student, f))
  );
}

export function coerce(f: FieldDef, v: unknown): unknown {
  if (f.field_type === "boolean") return v === true;
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return null;
  if (f.field_type === "number") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  const s = String(v).trim().slice(0, 500);
  if (f.field_type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  if (f.field_type === "select" && f.options && !f.options.includes(s)) return undefined;
  if (f.field_type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) return undefined;
  return s;
}

export function buildPatch(
  allowed: FieldDef[],
  body: Record<string, unknown>,
  currentCustom: Record<string, unknown>
): { core: Record<string, unknown>; custom: Record<string, unknown> | null; error?: string } {
  const core: Record<string, unknown> = {};
  let custom: Record<string, unknown> | null = null;
  for (const f of allowed) {
    if (!(f.key in body)) continue;
    const v = coerce(f, body[f.key]);
    if (v === undefined) return { core, custom, error: `Invalid value for ${f.label}` };
    if (f.is_core) core[f.key] = v;
    else {
      custom = custom ?? { ...currentCustom };
      custom[f.key] = v;
    }
  }
  return { core, custom };
}

/** Keep full_name in step when first/last change (older pages still read it). */
export function withFullName(core: Record<string, unknown>, current: Record<string, unknown>) {
  if (!("first_name" in core) && !("last_name" in core)) return core;
  const first = (core.first_name ?? current.first_name ?? "") as string;
  const last = (core.last_name ?? current.last_name ?? "") as string;
  const full = `${first} ${last}`.trim();
  return full ? { ...core, full_name: full } : core;
}

/** Signed-in staff email (Supabase session cookie), or null. */
export async function viewerEmail(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    const jar = await cookies();
    const supabase = createServerClient(url, anon, {
      cookies: { getAll: () => jar.getAll(), setAll: () => {} },
    });
    const { data } = await supabase.auth.getUser();
    return data.user?.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function roleFromEnv(email: string | null): Role | null {
  if (!email) return null;
  const raw = process.env.SIS_STAFF_ROLES ?? "";
  for (const pair of raw.split(",")) {
    const [e, r] = pair.split(":").map((x) => x?.trim().toLowerCase());
    if (e === email && r && (ROLES as readonly string[]).includes(r)) return r as Role;
  }
  return null;
}

/**
 * Role of the viewer. Everyone past the admin guard is `owner` unless
 * SIS_STAFF_ROLES says otherwise. Owners may preview with ?as=<role>.
 */
export async function viewerRole(asParam?: string | null): Promise<{ role: Role; actual: Role; email: string | null }> {
  const email = await viewerEmail();
  const actual: Role = roleFromEnv(email) ?? "owner";
  const as = asParam && (ROLES as readonly string[]).includes(asParam) ? (asParam as Role) : null;
  return { role: actual === "owner" && as ? as : actual, actual, email };
}

export function labelFor(f: FieldDef, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (f.field_type === "boolean" || typeof v === "boolean") return v ? "Yes" : "No";
  if (f.field_type === "select") return String(v).replace(/_/g, " ");
  return String(v);
}

export async function audit(entityId: string, action: string, oldValue: unknown, newValue: unknown, actor: string, reason: string | null) {
  try {
    await getServerClient().from("audit_events").insert({
      entity_type: "student",
      entity_id: entityId,
      action,
      old_value: oldValue ?? null,
      new_value: newValue ?? null,
      actor,
      reason,
    });
  } catch {
    /* audit table missing before migration — never block the edit */
  }
}
