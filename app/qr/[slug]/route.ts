import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /qr/<slug>
 *
 * Logs the scan to qr_scans, then 302-redirects to the destination_path
 * (defaults to /atticus) with ?src=<slug> attached for downstream attribution.
 *
 * Best-effort logging: if the database is unavailable, we still redirect so
 * a prospect never sees a broken page after scanning.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const safeSlug = (slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);

  let destination = "/atticus";
  let codeId: string | null = null;

  try {
    const sb = getServerClient();

    // Look up the QR code (may not exist — that's OK, we still log the attempt)
    const { data: code } = await sb
      .from("qr_codes")
      .select("id, destination_path, archived_at")
      .eq("slug", safeSlug)
      .maybeSingle();

    if (code) {
      codeId = code.id as string;
      destination = code.destination_path || "/atticus";
    }

    // Log the scan event
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 500);
    const referrer = (req.headers.get("referer") || "").slice(0, 500);

    await sb.from("qr_scans").insert({
      qr_code_id: codeId,
      slug: safeSlug,
      user_agent: userAgent,
      referrer: referrer,
    });
  } catch (err) {
    // Swallow — never block redirect on logging failure
    console.error("[qr/route] scan log failed:", err);
  }

  const target = new URL(destination, req.url);
  if (safeSlug) target.searchParams.set("src", safeSlug);
  return NextResponse.redirect(target, 302);
}
