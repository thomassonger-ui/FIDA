/**
 * Canonical site origin, safe against a mis-set NEXT_PUBLIC_SITE_URL.
 *
 * Vercel env vars are easy to fumble — e.g. "fldentalassisting.com"
 * without a scheme. `new URL(path, origin)` throws ERR_INVALID_URL on a
 * scheme-less base, which took down /api/portal/login (500 on every
 * sign-in, 2026-07-28). This helper normalizes:
 *   - trims whitespace and trailing slashes
 *   - prepends https:// when no scheme is present
 *   - falls back to the default deployment URL if the value is empty
 *     or still unparsable
 */
const FALLBACK = "https://fida-eight.vercel.app";

export function siteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (!raw) return FALLBACK;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    // Validate; throws if still malformed.
    new URL(withScheme);
    return withScheme;
  } catch {
    console.error("[site-url] unparsable NEXT_PUBLIC_SITE_URL:", raw);
    return FALLBACK;
  }
}
