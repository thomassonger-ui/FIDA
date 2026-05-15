import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hard cap to keep demo imports sane.
const MAX_ROWS = 5000;

type StudentInsert = {
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

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function validate(row: unknown): StudentInsert | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (!isString(r.first_name) || !r.first_name.trim()) return null;
  if (!isString(r.last_name) || !r.last_name.trim()) return null;
  return {
    first_name: r.first_name.trim().slice(0, 120),
    last_name: r.last_name.trim().slice(0, 120),
    email: isString(r.email) && r.email.trim() ? r.email.trim().slice(0, 255) : null,
    phone: isString(r.phone) && r.phone.trim() ? r.phone.trim().slice(0, 40) : null,
    program: isString(r.program) && r.program.trim() ? r.program.trim().slice(0, 120) : null,
    cohort_id:
      isString(r.cohort_id) && r.cohort_id.trim() ? r.cohort_id.trim().slice(0, 60) : null,
    status:
      isString(r.status) && r.status.trim() ? r.status.trim().slice(0, 40) : "active",
    start_date:
      isString(r.start_date) && /^\d{4}-\d{2}-\d{2}$/.test(r.start_date)
        ? r.start_date
        : null,
    notes: isString(r.notes) && r.notes.trim() ? r.notes.trim().slice(0, 2000) : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.rows)) {
      return NextResponse.json(
        { error: "Invalid body. Expected { rows: [...] }." },
        { status: 400 }
      );
    }
    if (body.rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Too many rows (${body.rows.length}). Max ${MAX_ROWS} per import.` },
        { status: 400 }
      );
    }

    const clean: StudentInsert[] = [];
    for (const r of body.rows) {
      const ok = validate(r);
      if (ok) clean.push(ok);
    }
    if (clean.length === 0) {
      return NextResponse.json(
        { error: "No valid rows — every row was missing first or last name." },
        { status: 400 }
      );
    }

    const supabase = getServerClient();
    // Insert in chunks so Supabase doesn't balk on large payloads.
    let inserted = 0;
    const CHUNK = 500;
    for (let i = 0; i < clean.length; i += CHUNK) {
      const slice = clean.slice(i, i + CHUNK);
      const { error, count } = await supabase
        .from("demo_students")
        .insert(slice, { count: "exact" });
      if (error) {
        return NextResponse.json(
          {
            error: `Insert failed at row ${i + 1}: ${error.message}`,
            inserted,
          },
          { status: 500 }
        );
      }
      inserted += count ?? slice.length;
    }

    return NextResponse.json({ inserted });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
