/**
 * Bulk-download — POST /api/admin/documents/bulk-download
 *
 * Body: { ids: number[] }  (max 100)
 *
 * Fetches each document from the document-vault Storage bucket, packages
 * them into a single ZIP archive, and returns the binary with
 * Content-Disposition: attachment. Filenames inside the ZIP are de-duped
 * with a numeric suffix when collisions occur.
 *
 * Files that fail to download are recorded in an in-archive
 * `_missing.txt` rather than failing the whole bundle.
 */

import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { getServerClient } from "@/lib/supabase";
import { categoryLabel } from "@/lib/demo-documents";

/**
 * Filesystem-safe sanitiser. Replaces characters that are illegal or
 * awkward in zip-extracted filenames on Windows/macOS/Linux.
 */
function safe(s: string): string {
  return s
    .replace(/[\/\\:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // seconds

const MAX_IDS = 100;

export async function POST(req: NextRequest) {
  let ids: number[] = [];
  try {
    const body = (await req.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) {
      ids = body.ids
        .map((n) => (typeof n === "number" ? n : parseInt(String(n), 10)))
        .filter((n) => Number.isFinite(n));
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "At least one id required" },
      { status: 400 }
    );
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json(
      { error: `Too many ids (max ${MAX_IDS})` },
      { status: 400 }
    );
  }

  try {
    const supabase = getServerClient();
    const { data: docs, error } = await supabase
      .from("document_records")
      .select("id, filename, storage_path, student_id, student_name, category, program")
      .in("id", ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!docs || docs.length === 0) {
      return NextResponse.json(
        { error: "No matching documents" },
        { status: 404 }
      );
    }

    const zip = new JSZip();
    const usedNames = new Set<string>();
    const missing: string[] = [];

    for (const doc of docs) {
      const { data: blob, error: dlErr } = await supabase.storage
        .from("document-vault")
        .download(doc.storage_path);
      if (dlErr || !blob) {
        missing.push(`#${doc.id} ${doc.filename}: ${dlErr?.message ?? "not found"}`);
        continue;
      }

      // Build a human-readable archive name:
      //   FIDA - {Program?} - {Student Name} - {Category Label} - {Original Filename}
      // Sanitise each part separately so we never produce illegal characters,
      // then de-dup on collision.
      const studentPart = safe(doc.student_name);
      const categoryPart = safe(categoryLabel(doc.category));
      const filePart = safe(doc.filename);
      const programLabel = (p: string | null): string => {
        if (!p) return "";
        if (p === "efda") return "EFDA";
        if (p === "rdp_ce") return "RDP-CE";
        if (p === "both") return "EFDA + RDP-CE";
        return "Other";
      };
      const progPart = programLabel(
        (doc as { program?: string | null }).program ?? null
      );
      let name = progPart
        ? `FIDA - ${progPart} - ${studentPart} - ${categoryPart} - ${filePart}`
        : `FIDA - ${studentPart} - ${categoryPart} - ${filePart}`;
      if (usedNames.has(name)) {
        const dot = name.lastIndexOf(".");
        const base = dot > 0 ? name.slice(0, dot) : name;
        const ext = dot > 0 ? name.slice(dot) : "";
        let n = 2;
        while (usedNames.has(`${base} (${n})${ext}`)) n++;
        name = `${base} (${n})${ext}`;
      }
      usedNames.add(name);

      const arrayBuffer = await blob.arrayBuffer();
      zip.file(name, arrayBuffer);
    }

    if (missing.length > 0) {
      zip.file(
        "_missing.txt",
        `Some documents could not be retrieved:\n\n${missing.join("\n")}\n`
      );
    }

    // Build a manifest file with audit metadata.
    const manifestLines = [
      `FIDA Document Vault — Bulk Export`,
      `Generated: ${new Date().toISOString()}`,
      `Documents requested: ${ids.length}`,
      `Documents retrieved: ${docs.length - missing.length}`,
      ``,
      `# id\tprogram\tcategory\tstudent\tfilename`,
      ...docs.map(
        (d) => {
          const dr = d as { program?: string | null };
          return `${d.id}\t${dr.program ?? "-"}\t${d.category}\t${d.student_name}\t${d.filename}`;
        }
      ),
    ];
    zip.file("_manifest.txt", manifestLines.join("\n") + "\n");

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `fida-vault-${timestamp}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error("[bulk-download] threw:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
