/**
 * Portal session — DB-backed, signed-cookie-style without HMAC.
 *
 * Auth flow for /portal/* is entirely independent of Supabase Auth:
 *   - /api/portal/login validates email against public.students, then INSERTs
 *     a row into public.portal_sessions and sets cookie `fida_portal_session`
 *     to the row's UUID.
 *   - Middleware reads the cookie, looks up the row by id, checks expires_at,
 *     and allows the request through if valid.
 *   - Server-rendered /portal pages call getPortalStudent() to read the
 *     cookie and return the linked Student record.
 *
 * The cookie value is an unguessable UUID. The session is invalidated by
 * deleting the row (or letting it expire). No Supabase Auth involvement.
 */

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Student } from "./students-db";

export const PORTAL_SESSION_COOKIE = "fida_portal_session";
export const PORTAL_SESSION_TTL_DAYS = 7;

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type PortalSession = {
  id: string;
  student_id: string;
  expires_at: string;
};

/**
 * Validate a portal session id against the DB. Returns the row if valid and
 * unexpired; returns null otherwise. Side-effect: updates last_seen_at.
 */
export async function getValidSession(
  sessionId: string
): Promise<PortalSession | null> {
  if (!sessionId) return null;
  try {
    const sb = admin();
    const { data, error } = await sb
      .from("portal_sessions")
      .select("id, student_id, expires_at")
      .eq("id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    // Touch last_seen_at (fire-and-forget; failure is non-fatal).
    sb.from("portal_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", sessionId)
      .then(() => undefined);
    return data as PortalSession;
  } catch {
    return null;
  }
}

/**
 * Get the current portal student from the request cookies. For use in
 * server components and route handlers inside /portal/(auth)/.
 * Returns null if no valid session.
 */
export async function getPortalStudent(): Promise<Student | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;
    if (!sessionId) return null;
    const session = await getValidSession(sessionId);
    if (!session) return null;

    const sb = admin();
    const { data, error } = await sb
      .from("students")
      .select("*")
      .eq("id", session.student_id)
      .maybeSingle();
    if (error || !data) return null;
    return data as Student;
  } catch {
    return null;
  }
}

/**
 * Create a new portal session row for a student and return the cookie value
 * (the session id) along with the expires_at timestamp.
 */
export async function createPortalSession(
  studentId: string,
  meta?: { userAgent?: string; ipHash?: string }
): Promise<{ id: string; expiresAt: Date } | null> {
  try {
    const sb = admin();
    const expiresAt = new Date(
      Date.now() + PORTAL_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
    );
    const { data, error } = await sb
      .from("portal_sessions")
      .insert({
        student_id: studentId,
        expires_at: expiresAt.toISOString(),
        user_agent: meta?.userAgent ?? null,
        ip_hash: meta?.ipHash ?? null,
      })
      .select("id")
      .single();
    if (error || !data) return null;
    return { id: data.id, expiresAt };
  } catch {
    return null;
  }
}

/**
 * Delete a portal session row (for logout).
 */
export async function destroyPortalSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    const sb = admin();
    await sb.from("portal_sessions").delete().eq("id", sessionId);
  } catch {
    // best-effort
  }
}
