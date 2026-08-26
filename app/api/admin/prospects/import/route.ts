import { NextRequest, NextResponse } from "next/server";
import { importCsv } from "@/lib/prospects-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

/** POST /api/admin/prospects/import — multipart CSV upload. */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not read the upload." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Choose a CSV file to import." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "That file is larger than 5 MB. Split it and try again." },
      { status: 400 }
    );
  }

  const text = await file.text();
  const result = await importCsv(text, {
    batch: String(form.get("batch") ?? "").trim() || undefined,
    consentSource: String(form.get("consent_source") ?? "").trim() || undefined,
  });

  return NextResponse.json({ ok: true, ...result });
}
