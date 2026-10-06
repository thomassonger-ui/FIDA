// /api/admin/va-clock — VA Time Clock on /admin/prospects (admin-gated by
// middleware.ts).
//   GET                                   → the VA (signed in with her Atticus
//                                           VA email): her shift + task list;
//                                           anyone else: { role: "staff" }
//   POST { action: "clock_in", task }     → VA only: starts a FIDA shift on Atticus
//   POST { action: "clock_out", notes, appts } → VA only: ends her FIDA shift
// Shifts are saved on Atticus (pay + monthly billing) through FIDA's statement
// link, always tagged FIDA. The token never leaves the server.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ATTICUS_FIDA_STATEMENT } from "@/lib/atticus-va";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function signedInEmail(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

async function atticus(payload: Record<string, unknown>) {
  const res = await fetch(ATTICUS_FIDA_STATEMENT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({ error: "Atticus did not respond" }))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, body };
}

export async function GET() {
  const email = await signedInEmail();
  if (!email) return NextResponse.json({ role: "staff" });
  const r = await atticus({ action: "va_status", va_email: email });
  if (!r.ok) return NextResponse.json({ role: "staff" }); // not a registered VA
  return NextResponse.json(r.body);
}

export async function POST(req: Request) {
  const email = await signedInEmail();
  if (!email) return NextResponse.json({ error: "Sign in with your VA email to clock in." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const payload =
    b.action === "clock_in"
      ? { action: "clock_in", va_email: email, task: b.task ?? "" }
      : b.action === "clock_out"
        ? { action: "clock_out", va_email: email, notes: b.notes ?? "", appts: b.appts ?? 0 }
        : null;
  if (!payload) return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  const r = await atticus(payload);
  return NextResponse.json(r.body, { status: r.status });
}
