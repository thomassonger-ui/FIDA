import { NextRequest, NextResponse } from "next/server";
import { runDripBatch, sendDripTest, setDrip, STEP_COUNT } from "@/lib/drip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Gated by middleware.ts like every /api/admin/* route.

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/**
 * POST /api/admin/prospects/drip
 *   { action: "start" | "pause", ids: string[] }   turn the drip on/off
 *   { action: "send_now", dryRun?: boolean }        run today's batch now
 *   { action: "test", to, step?, track? }          send one sample email
 *                                                  (track: "student" | "employer")
 */
export async function POST(req: NextRequest) {
  let json: {
    action?: string;
    ids?: string[];
    dryRun?: boolean;
    to?: string;
    step?: number;
    track?: string;
  };
  try {
    json = await req.json();
  } catch {
    return bad("Bad JSON");
  }

  switch (json.action) {
    case "start":
    case "pause": {
      const ids = Array.isArray(json.ids) ? json.ids.filter(Boolean) : [];
      if (ids.length === 0) return bad("No prospects selected.");
      const r = await setDrip(ids, json.action === "start" ? "active" : "paused");
      return NextResponse.json({ ok: true, ...r });
    }
    case "send_now": {
      try {
        const result = await runDripBatch({ dryRun: Boolean(json.dryRun) });
        return NextResponse.json({ ok: true, ...result });
      } catch (err) {
        return bad(err instanceof Error ? err.message : "Drip run failed", 500);
      }
    }
    case "test": {
      const to = (json.to ?? "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return bad("Enter a valid email.");
      const step = Math.min(Math.max(Number(json.step) || 0, 0), STEP_COUNT - 1);
      const track = json.track === "employer" ? "employer" : "student";
      const r = await sendDripTest(to, step, track);
      if (!r.ok) return bad(r.error, 502);
      return NextResponse.json({ ok: true, id: r.id });
    }
    default:
      return bad("Unknown action.");
  }
}
