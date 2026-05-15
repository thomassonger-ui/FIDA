import { NextResponse } from "next/server";
import { getCourses, isMoodleConfigured } from "@/lib/moodle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isMoodleConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Moodle not configured." },
      { status: 200 }
    );
  }
  try {
    const courses = await getCourses();
    // Strip "site" pseudo-course (id 1) and hidden courses.
    const filtered = courses
      .filter((c) => c.id !== 1 && c.visible !== 0)
      .map((c) => ({
        id: c.id,
        shortname: c.shortname,
        fullname: c.fullname,
        format: c.format,
        startdate: c.startdate,
        enddate: c.enddate,
      }));
    return NextResponse.json({ ok: true, courses: filtered });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 200 }
    );
  }
}
