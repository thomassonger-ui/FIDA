import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { resolvePortalStudent, uploadStudentDocument, MAX_DOC_BYTES } from "@/lib/students-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return bad("Not signed in", 401);

  const student = await resolvePortalStudent({ userId: user.id, email: user.email });
  if (!student) return bad("Your portal account isn't linked to a student record yet. Ask a FIDA staff member to complete your enrollment.", 403);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const file = form.get("file");
  const label = String(form.get("label") ?? "").trim() || null;
  if (!(file instanceof File) || file.size === 0) return bad("Pick a file.");
  if (file.size > MAX_DOC_BYTES) return bad("File exceeds the 25 MB limit.");

  const buf = await file.arrayBuffer();
  const up = await uploadStudentDocument({
    studentId: student.id,
    filename: file.name,
    mimeType: file.type || null,
    buffer: buf,
    uploadedBy: "student",
    uploadedByEmail: user.email,
    label,
  });
  if ("error" in up) return bad(up.error, 500);
  return NextResponse.json({ ok: true, docId: up.doc.id });
}
