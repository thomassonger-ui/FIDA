import { NextRequest, NextResponse } from "next/server";
import { listProspects, toCsv } from "@/lib/prospects-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/prospects/export — CSV of the current filter set. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const prospects = await listProspects(
    {
      search: sp.get("search") ?? undefined,
      county: sp.get("county") ?? undefined,
      zip: sp.get("zip") ?? undefined,
      segment: sp.get("segment") ?? undefined,
      program: sp.get("program") ?? undefined,
      stage: sp.get("stage") ?? undefined,
      hasPhone: sp.get("hasPhone") === "1",
      hasEmail: sp.get("hasEmail") === "1",
      showRemoved: sp.get("showRemoved") === "1",
    },
    5000
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(prospects), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fida-prospects-${stamp}.csv"`,
    },
  });
}
