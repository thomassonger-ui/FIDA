import { NextRequest, NextResponse } from "next/server";
import {
  listProspects,
  upsertProspect,
  setStage,
  softRemove,
  restore,
  STAGES,
  type Stage,
  type ProspectFilters,
} from "@/lib/prospects-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth note: every /api/admin/* path is gated by middleware.ts (fida_admin
// cookie or an ADMIN_EMAILS Supabase session). We deliberately do NOT accept
// a shared password in a query string — those end up in server logs, browser
// history and Referer headers.

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

const VALID_STAGES: string[] = [...STAGES, "lost"];

/** GET /api/admin/prospects — filtered list (used by the client table). */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters: ProspectFilters = {
    search: sp.get("search") ?? undefined,
    county: sp.get("county") ?? undefined,
    zip: sp.get("zip") ?? undefined,
    segment: sp.get("segment") ?? undefined,
    program: sp.get("program") ?? undefined,
    stage: sp.get("stage") ?? undefined,
    hasPhone: sp.get("hasPhone") === "1",
    hasEmail: sp.get("hasEmail") === "1",
    showRemoved: sp.get("showRemoved") === "1",
  };
  const prospects = await listProspects(filters);
  return NextResponse.json({ ok: true, prospects, total: prospects.length });
}

/** POST /api/admin/prospects — create or update one prospect by email. */
export async function POST(req: NextRequest) {
  let json: Record<string, unknown>;
  try {
    json = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("Bad JSON");
  }
  if (!json.email && !json.phone && !json.full_name && !json.last_name) {
    return bad("Give at least a name, an email, or a phone number.");
  }
  const res = await upsertProspect(json);
  if ("error" in res) return bad(res.error, 500);
  return NextResponse.json({ ok: true, prospect: res.prospect });
}

/**
 * PATCH /api/admin/prospects
 * { ids: string[], action: "stage" | "remove" | "restore", stage?: Stage }
 */
export async function PATCH(req: NextRequest) {
  let json: { ids?: string[]; action?: string; stage?: string };
  try {
    json = await req.json();
  } catch {
    return bad("Bad JSON");
  }
  const ids = Array.isArray(json.ids) ? json.ids.filter(Boolean) : [];
  if (ids.length === 0) return bad("No prospects selected.");

  switch (json.action) {
    case "stage": {
      if (!json.stage || !VALID_STAGES.includes(json.stage))
        return bad("Unknown stage.");
      for (const id of ids) await setStage(id, json.stage as Stage);
      return NextResponse.json({ ok: true, moved: ids.length });
    }
    case "remove": {
      for (const id of ids) await softRemove(id);
      return NextResponse.json({ ok: true, removed: ids.length });
    }
    case "restore": {
      for (const id of ids) await restore(id);
      return NextResponse.json({ ok: true, restored: ids.length });
    }
    default:
      return bad("Unknown action.");
  }
}
