/**
 * Prospecting pipeline persistence.
 *
 * Prospective students, sourced from CSV or entered by hand, worked through
 * the school funnel and promoted into `students` once they register.
 *
 * Stages: identified -> nurture -> applied -> registered -> enrolled -> graduated
 *         (plus `lost`, which sits outside the board).
 *
 * All reads/writes use the service-role client. Never import from a client
 * component.
 */

import { getServerClient } from "./supabase";
import { upsertStudent } from "./students-db";
import {
  STAGES,
  STAGE_LABELS,
  displayName,
  type Prospect,
  type Stage,
} from "./prospects-shared";

// ------------------------------------------------------------
// Types and constants live in ./prospects-shared so client components can
// import them without dragging the service-role client into the bundle.
// Re-exported here so existing server imports keep working.
// ------------------------------------------------------------

export * from "./prospects-shared";

function normalizeEmail(email: string | null | undefined): string | null {
  const v = (email ?? "").trim().toLowerCase();
  return v || null;
}

// ------------------------------------------------------------
// Reads
// ------------------------------------------------------------

export type ProspectFilters = {
  search?: string;
  county?: string;
  zip?: string;
  segment?: string;
  program?: string;
  stage?: string;
  hasPhone?: boolean;
  hasEmail?: boolean;
  showRemoved?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(q: any, filters: ProspectFilters) {
  if (!filters.showRemoved) q = q.is("removed_at", null);
  else q = q.not("removed_at", "is", null);
  if (filters.county) q = q.ilike("county", `%${filters.county}%`);
  if (filters.zip) q = q.eq("zip", filters.zip);
  if (filters.segment) q = q.eq("segment", filters.segment);
  if (filters.program) q = q.eq("program_interest", filters.program);
  if (filters.stage) q = q.eq("stage", filters.stage);
  if (filters.hasPhone) q = q.not("phone", "is", null);
  if (filters.hasEmail) q = q.not("email", "is", null);
  if (filters.search) {
    const s = filters.search.replace(/[%,()]/g, "");
    q = q.or(
      [
        `full_name.ilike.%${s}%`,
        `first_name.ilike.%${s}%`,
        `last_name.ilike.%${s}%`,
        `email.ilike.%${s}%`,
        `phone.ilike.%${s}%`,
        `city.ilike.%${s}%`,
        `zip.ilike.%${s}%`,
        `current_employer.ilike.%${s}%`,
        `notes.ilike.%${s}%`,
      ].join(",")
    );
  }
  return q;
}

export async function listProspects(
  filters: ProspectFilters = {},
  limit = 500
): Promise<Prospect[]> {
  try {
    const supabase = getServerClient();
    const q = applyFilters(supabase.from("prospects").select("*"), filters);
    const { data, error } = await q
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as Prospect[]) ?? [];
  } catch {
    return [];
  }
}

/** How many rows match — so the table can say "showing 500 of 13,806". */
export async function countProspects(filters: ProspectFilters = {}): Promise<number> {
  try {
    const supabase = getServerClient();
    const q = applyFilters(
      supabase.from("prospects").select("id", { count: "exact", head: true }),
      filters
    );
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getProspect(id: string): Promise<Prospect | null> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    return (data as Prospect) ?? null;
  } catch {
    return null;
  }
}

export type PipelineStats = {
  inPipeline: number;
  overdue: number;
  stale7d: number;
  registered: number;
  byStage: Record<string, Prospect[]>;
};

export function summarize(prospects: Prospect[]): PipelineStats {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const live = prospects.filter(
    (p) => !p.removed_at && p.stage !== "lost" && p.stage !== "graduated"
  );

  const byStage: Record<string, Prospect[]> = {};
  for (const s of STAGES) byStage[s] = [];
  for (const p of prospects) {
    if (p.removed_at) continue;
    if (byStage[p.stage]) byStage[p.stage].push(p);
  }

  return {
    inPipeline: live.length,
    overdue: live.filter(
      (p) => p.next_followup_at && new Date(p.next_followup_at).getTime() < now
    ).length,
    stale7d: live.filter(
      (p) => !p.last_touch_at || now - new Date(p.last_touch_at).getTime() > sevenDays
    ).length,
    registered: prospects.filter((p) =>
      ["registered", "enrolled", "graduated"].includes(p.stage)
    ).length,
    byStage,
  };
}

/** The four headline numbers, counted in the database (the list is too big to load). */
export async function pipelineStats(): Promise<Omit<PipelineStats, "byStage">> {
  try {
    const supabase = getServerClient();
    const nowIso = new Date().toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const live = () =>
      supabase
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .is("removed_at", null)
        .not("stage", "in", "(lost,graduated)");
    const [a, b, c, d] = await Promise.all([
      live(),
      live().lt("next_followup_at", nowIso),
      live().or(`last_touch_at.is.null,last_touch_at.lt.${weekAgo}`),
      supabase
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .in("stage", ["registered", "enrolled", "graduated"]),
    ]);
    return {
      inPipeline: a.count ?? 0,
      overdue: b.count ?? 0,
      stale7d: c.count ?? 0,
      registered: d.count ?? 0,
    };
  } catch {
    return { inPipeline: 0, overdue: 0, stale7d: 0, registered: 0 };
  }
}

/** Emails dispatched since local midnight — checked against currentLimits().email. */
export async function sentToday(): Promise<number> {
  try {
    const supabase = getServerClient();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("prospect_sends")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("created_at", since.toISOString());
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Skip traces run since local midnight — checked against currentLimits().skipTrace. */
export async function skipTracedToday(): Promise<number> {
  try {
    const supabase = getServerClient();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .gte("skip_traced_at", since.toISOString());
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ------------------------------------------------------------
// Writes
// ------------------------------------------------------------

export type ProspectInput = Partial<
  Omit<Prospect, "id" | "created_at" | "updated_at">
>;

export async function upsertProspect(
  input: ProspectInput
): Promise<{ prospect: Prospect } | { error: string }> {
  try {
    const supabase = getServerClient();
    const email = normalizeEmail(input.email);
    const full_name =
      input.full_name?.trim() ||
      [input.first_name, input.last_name].filter(Boolean).join(" ").trim() ||
      null;

    const row = { ...input, email, full_name };

    if (email) {
      const { data: existing } = await supabase
        .from("prospects")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      if (existing?.id) {
        const { data, error } = await supabase
          .from("prospects")
          .update(row)
          .eq("id", existing.id)
          .select("*")
          .single();
        if (error) return { error: error.message };
        return { prospect: data as Prospect };
      }
    }

    const { data, error } = await supabase
      .from("prospects")
      .insert(row)
      .select("*")
      .single();
    if (error) return { error: error.message };
    return { prospect: data as Prospect };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function setStage(
  id: string,
  stage: Stage,
  actor?: string
): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = getServerClient();
    const { error } = await supabase
      .from("prospects")
      .update({ stage })
      .eq("id", id);
    if (error) return { error: error.message };
    await logTouch(id, {
      kind: "stage_change",
      body: `Moved to ${STAGE_LABELS[stage] ?? stage}`,
      actor,
    });
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function logTouch(
  prospectId: string,
  touch: { kind: string; outcome?: string; body?: string; actor?: string }
): Promise<void> {
  try {
    const supabase = getServerClient();
    await supabase.from("prospect_touches").insert({
      prospect_id: prospectId,
      kind: touch.kind,
      outcome: touch.outcome ?? null,
      body: touch.body ?? null,
      actor: touch.actor ?? null,
    });
    if (touch.kind !== "stage_change") {
      const { data } = await supabase
        .from("prospects")
        .select("touch_count")
        .eq("id", prospectId)
        .maybeSingle();
      await supabase
        .from("prospects")
        .update({
          last_touch_at: new Date().toISOString(),
          touch_count: (data?.touch_count ?? 0) + 1,
        })
        .eq("id", prospectId);
    }
  } catch {
    // touch logging is best-effort — never block the action it describes
  }
}

export async function unsubscribe(email: string): Promise<void> {
  try {
    const supabase = getServerClient();
    const e = normalizeEmail(email);
    if (!e) return;
    await supabase
      .from("prospects")
      .update({
        unsubscribed_at: new Date().toISOString(),
        email_ok: false,
        drip_status: "finished",
      })
      .ilike("email", e);
  } catch {
    // best-effort
  }
}

export async function softRemove(id: string): Promise<void> {
  try {
    const supabase = getServerClient();
    await supabase
      .from("prospects")
      .update({ removed_at: new Date().toISOString(), drip_status: "paused" })
      .eq("id", id);
  } catch {
    // best-effort
  }
}

export async function restore(id: string): Promise<void> {
  try {
    const supabase = getServerClient();
    await supabase.from("prospects").update({ removed_at: null }).eq("id", id);
  } catch {
    // best-effort
  }
}

// ------------------------------------------------------------
// Promotion — the point of the whole pipeline.
//
// Registered means the $150 fee is paid and the seat is held, so the
// prospect becomes a real student row. We do NOT create a second CRM:
// from here on Students is the record and the prospect row keeps only
// the link plus its outreach history.
// ------------------------------------------------------------

export async function promoteToStudent(
  id: string,
  opts: { program?: string; cohort_id?: string; start_date?: string } = {}
): Promise<{ studentId: string } | { error: string }> {
  const prospect = await getProspect(id);
  if (!prospect) return { error: "Prospect not found." };
  if (!prospect.email)
    return { error: "This prospect has no email address — add one first." };

  const result = await upsertStudent({
    email: prospect.email,
    full_name: displayName(prospect),
    phone: prospect.phone,
    program: opts.program ?? prospect.program_interest ?? null,
    cohort_id: opts.cohort_id ?? null,
    start_date: opts.start_date ?? null,
    notes: prospect.notes,
    source: "prospect",
  });
  if ("error" in result) return { error: result.error };

  try {
    const supabase = getServerClient();
    await supabase
      .from("prospects")
      .update({
        stage: "registered",
        student_id: result.student.id,
        drip_status: "finished",
      })
      .eq("id", id);
  } catch {
    // the student row is what matters; the back-link is cosmetic
  }
  await logTouch(id, {
    kind: "stage_change",
    body: "Registered — promoted into Students",
  });

  return { studentId: result.student.id };
}

// ------------------------------------------------------------
// CSV import
// ------------------------------------------------------------

const HEADER_ALIASES: Record<string, string> = {
  "first name": "first_name",
  firstname: "first_name",
  first: "first_name",
  "last name": "last_name",
  lastname: "last_name",
  last: "last_name",
  name: "full_name",
  "full name": "full_name",
  email: "email",
  "email address": "email",
  phone: "phone",
  "phone number": "phone",
  mobile: "phone",
  cell: "phone",
  city: "city",
  state: "state",
  zip: "zip",
  zipcode: "zip",
  "zip code": "zip",
  postal: "zip",
  county: "county",
  employer: "current_employer",
  "current employer": "current_employer",
  office: "current_employer",
  practice: "current_employer",
  program: "program_interest",
  "program interest": "program_interest",
  interest: "program_interest",
  segment: "segment",
  score: "score",
  notes: "notes",
  note: "notes",
  source: "consent_source",
  "consent source": "consent_source",
  // FIDA dentist/employer list (built from the FL DOH profession-701 file)
  business_email: "email",
  fida_lead_score: "score",
  fida_candidate_type: "segment",
  fida_course_opportunity: "program_interest",
  practice_address_line_1: "address",
  fida_territory: "territory",
  outreach_status: "outreach_status",
  credential_number: "credential_number",
};

/** Columns that have no prospects field of their own — folded into notes. */
const NOTE_COLUMNS = ["outreach_status", "territory", "credential_number", "address"];

/** Free-text values from the employer list → the codes the table filters on. */
function normalizeValue(key: string, raw: string): string {
  const v = raw.trim();
  if (key === "segment" && /dentist|employer/i.test(v)) return "dentist_employer";
  if (key === "program_interest") {
    if (/radiograph.*expanded|expanded.*radiograph/i.test(v)) return "staff_training";
    if (/expanded|efda/i.test(v)) return "efda";
    if (/radiograph/i.test(v)) return "radiography";
    if (/entry|diploma/i.test(v)) return "entry_level";
  }
  return v;
}

/** Minimal RFC-4180 parser — handles quoted fields and embedded commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export async function importCsv(
  text: string,
  opts: { batch?: string; consentSource?: string } = {}
): Promise<ImportResult> {
  const rows = parseCsv(text);
  const out: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  if (rows.length < 2) {
    out.errors.push("The file needs a header row and at least one prospect.");
    return out;
  }

  const header = rows[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? "");
  if (!header.some(Boolean)) {
    out.errors.push(
      "None of the column headings were recognised. Expected at least one of: name, email, phone, city, zip."
    );
    return out;
  }

  const supabase = getServerClient();
  const batch = opts.batch ?? new Date().toISOString().slice(0, 10);

  for (let r = 1; r < rows.length; r++) {
    const input: ProspectInput = {
      source: "csv",
      source_batch: batch,
      consent_source: opts.consentSource ?? "purchased_list",
      stage: "identified",
    };
    const extras: string[] = [];
    header.forEach((key, c) => {
      if (!key) return;
      const raw = (rows[r][c] ?? "").trim();
      if (!raw) return;
      if (key === "score") input.score = Number(raw) || 0;
      else if (NOTE_COLUMNS.includes(key)) extras.push(raw);
      else (input as Record<string, unknown>)[key] = normalizeValue(key, raw);
    });
    if (extras.length) {
      input.notes = [input.notes, extras.join(" · ")].filter(Boolean).join("\n");
    }

    if (!input.email && !input.phone && !input.full_name && !input.last_name) {
      out.skipped++;
      continue;
    }

    const email = normalizeEmail(input.email as string | null);
    let existed = false;
    if (email) {
      const { data } = await supabase
        .from("prospects")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      existed = Boolean(data?.id);
    }

    const res = await upsertProspect(input);
    if ("error" in res) {
      out.errors.push(`Row ${r + 1}: ${res.error}`);
      out.skipped++;
    } else if (existed) out.updated++;
    else out.created++;
  }

  return out;
}

export function toCsv(prospects: Prospect[]): string {
  const cols: (keyof Prospect)[] = [
    "full_name",
    "email",
    "phone",
    "city",
    "state",
    "zip",
    "county",
    "current_employer",
    "program_interest",
    "segment",
    "score",
    "stage",
    "drip_status",
    "consent_source",
    "unsubscribed_at",
    "dnc",
    "last_touch_at",
    "next_followup_at",
    "created_at",
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const p of prospects) lines.push(cols.map((c) => esc(p[c])).join(","));
  return lines.join("\n");
}
