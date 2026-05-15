import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { trackCourse, untrackCourse } from "@/lib/moodle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/moodle/track
 *
 * Accepts either form-encoded (from a <form> POST) or JSON payloads with:
 *   - action: "track" | "untrack"
 *   - courseId: number
 *   - shortname?: string
 *   - fullname?: string
 *
 * Admin cookie gate is enforced by middleware.ts.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let action: string | null = null;
  let courseId: number | null = null;
  let shortname: string | undefined;
  let fullname: string | undefined;

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      action?: string;
      courseId?: number | string;
      shortname?: string;
      fullname?: string;
    };
    action = body.action ?? null;
    courseId = body.courseId != null ? Number(body.courseId) : null;
    shortname = body.shortname;
    fullname = body.fullname;
  } else {
    const form = await req.formData();
    action = (form.get("action") as string | null) ?? null;
    const id = form.get("courseId");
    courseId = id != null ? Number(id) : null;
    shortname = (form.get("shortname") as string | null) ?? undefined;
    fullname = (form.get("fullname") as string | null) ?? undefined;
  }

  if (!courseId || Number.isNaN(courseId)) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }
  if (action !== "track" && action !== "untrack") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    if (action === "track") {
      await trackCourse({ id: courseId, shortname, fullname });
    } else {
      await untrackCourse(courseId);
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }

  revalidatePath("/admin/moodle");

  // If this came from a <form> POST (no fetch/JSON), redirect back so the page rerenders.
  if (!contentType.includes("application/json")) {
    const back = new URL("/admin/moodle", req.url);
    return NextResponse.redirect(back, { status: 303 });
  }

  return NextResponse.json({ ok: true });
}
