import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the service-role key — never import this from a client component.
 * Reads/writes bypass RLS. Keep it out of the bundle.
 */
export function getServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local and in Vercel env vars."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Browser-safe Supabase client.
 *
 * Uses the anon public key. Respects RLS. Safe for client components.
 */
export function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, key);
}

/**
 * Demo-school data helpers. Tables are prefixed `demo_` per the seed schema.
 * These return empty arrays if the tables haven't been created yet, so the
 * UI can render even before the migration is applied.
 */
export async function getDemoStudents(limit = 100) {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("demo_students")
      .select("*")
      .limit(limit);
    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getDemoCohorts() {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase.from("demo_cohorts").select("*");
    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
