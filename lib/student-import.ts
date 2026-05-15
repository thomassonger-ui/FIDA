/**
 * Student import: field definitions + smart column mapping.
 * Shared between the upload UI (client) and the import API route (server).
 */

export type StudentField =
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "program"
  | "cohort_id"
  | "status"
  | "start_date"
  | "notes";

export const STUDENT_FIELDS: {
  key: StudentField;
  label: string;
  required?: boolean;
  aliases: string[]; // lowercased, punctuation-stripped
}[] = [
  {
    key: "first_name",
    label: "First name",
    required: true,
    aliases: ["first name", "firstname", "fname", "given name", "first"],
  },
  {
    key: "last_name",
    label: "Last name",
    required: true,
    aliases: ["last name", "lastname", "lname", "surname", "family name", "last"],
  },
  {
    key: "email",
    label: "Email",
    aliases: ["email", "email address", "e-mail", "student email"],
  },
  {
    key: "phone",
    label: "Phone",
    aliases: ["phone", "phone number", "mobile", "cell", "cell phone", "tel"],
  },
  {
    key: "program",
    label: "Program",
    aliases: ["program", "track", "course", "degree"],
  },
  {
    key: "cohort_id",
    label: "Cohort",
    aliases: ["cohort", "cohort id", "class", "group", "batch", "section"],
  },
  {
    key: "status",
    label: "Status",
    aliases: ["status", "state", "enrollment status"],
  },
  {
    key: "start_date",
    label: "Start date",
    aliases: ["start date", "enrollment date", "starts", "start"],
  },
  {
    key: "notes",
    label: "Notes",
    aliases: ["notes", "note", "comments", "remarks"],
  },
];

/** Normalize a column header for loose comparison. */
export function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[_\-./]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Given a list of source column headers, guess which maps to which DB field.
 * Returns { sourceHeader -> StudentField | null }.
 */
export function autoMapColumns(
  headers: string[]
): Record<string, StudentField | null> {
  const result: Record<string, StudentField | null> = {};
  const claimed = new Set<StudentField>();

  for (const h of headers) {
    const norm = normalizeHeader(h);
    let best: StudentField | null = null;

    for (const field of STUDENT_FIELDS) {
      if (claimed.has(field.key)) continue;
      if (field.aliases.includes(norm)) {
        best = field.key;
        break;
      }
      // partial match — fall back to alias contained within header
      if (!best && field.aliases.some((a) => norm.includes(a))) {
        best = field.key;
      }
    }

    result[h] = best;
    if (best) claimed.add(best);
  }
  return result;
}

/** Canonicalize program string to one of the three FIDA programs. */
export function canonicalizeProgram(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.toLowerCase();
  if (t.includes("patient")) return "Patient Care Technology";
  if (t.includes("billing") || t.includes("coding") || t === "cpc" || t === "cca")
    return "Medical Billing & Coding";
  if (t.includes("medical assist") || t.includes("ma ") || t === "ma" || t === "ccma")
    return "Medical Assisting";
  return raw.trim(); // passthrough if unknown — let user clean up manually
}

/** Canonicalize status to known values. */
export function canonicalizeStatus(raw: string | null | undefined): string {
  if (!raw) return "active";
  const t = raw.toLowerCase().trim();
  if (["active", "enrolled", "current"].includes(t)) return "active";
  if (["paused", "lot", "loa", "leave"].includes(t)) return "paused";
  if (["grad", "graduated", "completed", "done"].includes(t)) return "graduated";
  if (["withdrawn", "dropped", "inactive"].includes(t)) return "withdrawn";
  return t;
}

/** ISO-ish date coercion. Accepts YYYY-MM-DD, M/D/YYYY, Excel serial, etc. */
export function coerceDate(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  // Excel serial number (days since 1899-12-30)
  if (typeof raw === "number" && raw > 20000 && raw < 60000) {
    const ms = (raw - 25569) * 86400 * 1000;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  if (!s) return null;
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

export type ImportRow = {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  program: string | null;
  cohort_id: string | null;
  status: string;
  start_date: string | null;
  notes: string | null;
};

export type ImportError = {
  rowIndex: number; // 0-based row index in the source data
  reason: string;
};

/**
 * Apply a column mapping to raw rows and normalize each record.
 * Rows missing required fields (first_name, last_name) are dropped into errors.
 */
export function mapAndNormalize(
  rows: Record<string, unknown>[],
  mapping: Record<string, StudentField | null>
): { valid: ImportRow[]; errors: ImportError[] } {
  const valid: ImportRow[] = [];
  const errors: ImportError[] = [];

  // Invert mapping: StudentField -> sourceHeader
  const fieldToSource: Partial<Record<StudentField, string>> = {};
  for (const [src, field] of Object.entries(mapping)) {
    if (field && !fieldToSource[field]) fieldToSource[field] = src;
  }

  rows.forEach((row, idx) => {
    const pick = (f: StudentField): unknown => {
      const src = fieldToSource[f];
      return src ? row[src] : null;
    };
    const s = (v: unknown): string => (v == null ? "" : String(v).trim());

    const first_name = s(pick("first_name"));
    const last_name = s(pick("last_name"));
    if (!first_name || !last_name) {
      errors.push({ rowIndex: idx, reason: "Missing first_name or last_name" });
      return;
    }

    valid.push({
      first_name,
      last_name,
      email: s(pick("email")) || null,
      phone: s(pick("phone")) || null,
      program: canonicalizeProgram(s(pick("program"))) || null,
      cohort_id: s(pick("cohort_id")) || null,
      status: canonicalizeStatus(s(pick("status"))),
      start_date: coerceDate(pick("start_date")),
      notes: s(pick("notes")) || null,
    });
  });

  return { valid, errors };
}
