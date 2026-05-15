import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/leads/[id]/enroll
 * Stub: promotes a lead to a student. When Supabase is wired this will
 *   1. Read the lead from atticus_sessions
 *   2. Insert a student row in students with lead-derived data
 *   3. Mark the lead as enrolled (e.g. atticus_sessions.enrolled_at = now())
 *   4. Redirect to the new student detail page
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // TODO: real lead → student conversion via Supabase.
  console.log("[leads/enroll] enroll lead", id);

  const url = new URL("/admin/leads", req.url);
  url.searchParams.set("enrolled", id);
  return NextResponse.redirect(url, { status: 303 });
}
