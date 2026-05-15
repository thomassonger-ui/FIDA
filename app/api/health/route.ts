import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    ok: true,
    app: "blueprint-school",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: supabaseUrl ?? null,
      serviceRoleKey: hasServiceRole ? "set" : "missing",
      anonKey: hasAnon ? "set" : "missing",
    },
  });
}
