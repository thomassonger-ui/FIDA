import { NextResponse } from "next/server";
import { getSiteInfo, isMoodleConfigured } from "@/lib/moodle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isMoodleConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "MOODLE_URL and MOODLE_TOKEN are not set in Vercel.",
      },
      { status: 200 }
    );
  }
  try {
    const info = await getSiteInfo();
    return NextResponse.json({
      ok: true,
      configured: true,
      site: {
        sitename: info.sitename,
        siteurl: info.siteurl,
        release: info.release,
        username: info.username,
        fullname: info.fullname,
        userid: info.userid,
        functionCount: info.functions?.length ?? 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        // Redact token; echo URL so we can spot typos.
        moodleUrl: process.env.MOODLE_URL ?? null,
        tokenLength: process.env.MOODLE_TOKEN?.length ?? 0,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
