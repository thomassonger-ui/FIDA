/**
 * Per-document download — GET /api/admin/documents/[id]/download
 *
 * Generates a 60-second signed URL from the document-vault Storage bucket
 * and 302-redirects the browser to it. The signed URL is single-use-ish
 * (time-limited; not reusable after expiry) and audited at the Supabase
 * Storage layer.
 *
 * Pass `?download=1` to force a Content-Disposition: attachment header
 * (file downloads instead of rendering inline).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const docId = parseInt(id, 10);
  if (!Number.isFinite(docId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const supabase = getServerClient();

    // Look up the storage path + filename for this record.
    const { data: doc, error } = await supabase
      .from("document_records")
      .select("storage_path, filename, mime_type")
      .eq("id", docId)
      .single();

    if (error || !doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate a short-lived signed URL.
    const forceDownload = req.nextUrl.searchParams.get("download") === "1";
    const opts = forceDownload ? { download: doc.filename } : undefined;
    const { data: signed, error: signErr } = await supabase.storage
      .from("document-vault")
      .createSignedUrl(doc.storage_path, 60, opts);

    if (signErr || !signed?.signedUrl) {
      console.error("[download] sign error:", signErr);
      return NextResponse.json(
        { error: signErr?.message ?? "Could not generate signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(signed.signedUrl, 302);
  } catch (err) {
    console.error("[download] threw:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
