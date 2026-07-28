import { NextRequest, NextResponse } from "next/server";
import { getStudentById } from "@/lib/students-db";
import { getServerClient } from "@/lib/supabase";
import { siteOrigin } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/students/[id]/sign-in-link
 *
 * Generates a magic-link URL via Supabase admin API. Does NOT send email.
 * Bypasses the free-tier email rate limit for staff-facing flows where
 * the admin wants to hand the link to the student directly (or test).
 *
 * Returns: { ok: true, url: string, email: string }
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
  }

  try {
    const supabase = getServerClient();
    const redirectTo = `${siteOrigin()}/auth/callback?next=/portal`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: student.email.toLowerCase(),
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Could not generate link" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      url: data.properties.action_link,
      email: student.email,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown error" },
      { status: 500 }
    );
  }
}
