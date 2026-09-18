import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";
import { logTouch } from "@/lib/prospects-db";
import { clickTargetAllowed, clickTokenValid } from "@/lib/drip";
import { siteOrigin } from "@/lib/site-url";
import type { Prospect } from "@/lib/prospects-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public. GET /api/drip/click?p=<prospect id>&t=<hmac>&u=<destination>
 *
 * Every link in a drip email points here. We record the click, move the
 * prospect into the pipeline (identified → nurture) and pause their drip so
 * a human follows up instead of email 3 — then send them on to the page they
 * asked for. A bad token or an off-list destination just goes to the homepage.
 *
 * Caveat: some mail providers pre-fetch links to scan them, which looks like
 * a click. Known scanner user agents are ignored; the rest we accept.
 */
const SCANNER_UA = /bot|crawler|spider|scanner|preview|proofpoint|mimecast|barracuda|safelinks|GoogleImageProxy|YahooMailProxy/i;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const id = (sp.get("p") ?? "").trim();
  const token = sp.get("t") ?? "";
  const dest = sp.get("u") ?? "";
  const target = clickTargetAllowed(dest) ? dest : siteOrigin();

  if (id && clickTokenValid(id, token) && !SCANNER_UA.test(req.headers.get("user-agent") ?? "")) {
    try {
      const supabase = getServerClient();
      const { data } = await supabase.from("prospects").select("*").eq("id", id).maybeSingle();
      const p = data as Prospect | null;
      if (p && !p.removed_at) {
        const patch: Record<string, unknown> = {};
        if (p.stage === "identified") patch.stage = "nurture";
        if (p.drip_status === "active") patch.drip_status = "paused";
        if (Object.keys(patch).length) await supabase.from("prospects").update(patch).eq("id", id);
        await logTouch(id, {
          kind: "email",
          outcome: "clicked",
          body: `Clicked drip link → ${target}`,
          actor: "drip",
        });
      }
    } catch {
      // Never block the redirect over bookkeeping.
    }
  }
  return NextResponse.redirect(target, 302);
}
