import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/students/create
 * Stub: accepts a multipart/form-encoded new-student form, logs it, redirects
 * back to /admin/students with a success flash. When Supabase is wired this
 * will insert into the students table.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") payload[k] = v;
  }

  // TODO: insert into Supabase `students` table once schema is in place.
  // For now we log and redirect.
  console.log("[students/create] new student submission:", payload);

  const url = new URL("/admin/students", req.url);
  url.searchParams.set("created", "1");
  return NextResponse.redirect(url, { status: 303 });
}
