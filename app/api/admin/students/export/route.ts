import { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "program",
  "cohort_id",
  "status",
  "start_date",
  "notes",
  "created_at",
] as const;

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  // Quote if it contains comma, quote, or newline
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("demo_students")
      .select(COLUMNS.join(","))
      .order("last_name", { ascending: true })
      .limit(10000);
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    const header = COLUMNS.join(",");
    const body = rows
      .map((r) => COLUMNS.map((c) => csvEscape(r[c])).join(","))
      .join("\n");
    const csv = `${header}\n${body}\n`;

    const today = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="apex-students-${today}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
