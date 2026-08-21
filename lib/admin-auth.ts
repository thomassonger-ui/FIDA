/**
 * Admin authorization helpers shared by middleware and route handlers.
 *
 * Two ways to be an admin:
 *   (a) fida_admin cookie === ADMIN_SESSION_SECRET (set by /api/admin/login)
 *   (b) a Supabase Auth session whose email is in ADMIN_EMAILS
 *
 * ADMIN_EMAILS is a comma-separated allowlist (case-insensitive). If it is
 * unset or empty, path (b) is DISABLED — Supabase users are not admins by
 * default. This matters because student portal invites create auth.users
 * rows for students; without an allowlist any invited student who set a
 * password via /login/forgot could sign into /admin.
 */

export const ADMIN_COOKIE = "fida_admin";

export function adminEmailAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = adminEmailAllowlist();
  if (list.size === 0) return false;
  return list.has(email.trim().toLowerCase());
}

export function adminCookieIsValid(value: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(secret && value && value === secret);
}
