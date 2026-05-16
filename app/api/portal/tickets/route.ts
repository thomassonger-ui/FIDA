import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createTicket, isValidCategory, type TicketCategory } from "@/lib/tickets-db";
import { resolvePortalStudent } from "@/lib/students-db";

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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const categoryRaw = String(form.get("category") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();

  if (!subject) return bad("Subject is required.");
  if (subject.length > 200) return bad("Subject must be 200 characters or fewer.");
  if (!body) return bad("Message is required.");
  if (body.length > 8000) return bad("Message must be 8,000 characters or fewer.");
  if (!isValidCategory(categoryRaw)) return bad("Please choose a category.");

  const result = await createTicket({
    email: user.email,
    studentName: student?.full_name ?? user.user_metadata?.full_name ?? null,
    program: student?.program ?? null,
    category: categoryRaw as TicketCategory,
    subject,
    body,
  });
  if ("error" in result) return bad(result.error, 500);

  return NextResponse.json({ ok: true, ticketId: result.ticket.id });
}
