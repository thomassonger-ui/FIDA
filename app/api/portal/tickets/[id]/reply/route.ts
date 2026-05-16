import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  appendMessage,
  getTicket,
  normalizeEmail,
} from "@/lib/tickets-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const ticket = await getTicket(id);
  if (!ticket) return bad("Ticket not found", 404);
  if (normalizeEmail(ticket.email) !== normalizeEmail(user.email)) {
    return bad("You don't have permission to reply to this ticket.", 403);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return bad("Could not parse form data");
  }
  const body = String(form.get("body") ?? "").trim();
  if (!body) return bad("Add a message.");
  if (body.length > 8000) return bad("Message must be 8,000 characters or fewer.");

  const append = await appendMessage({
    ticketId: id,
    authorType: "student",
    authorName: (user.user_metadata?.full_name as string) ?? null,
    authorEmail: user.email,
    body,
  });
  if ("error" in append) return bad(append.error, 500);

  return NextResponse.json({ ok: true, messageId: append.message.id });
}
