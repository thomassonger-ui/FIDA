/**
 * In-memory sliding-window rate limiter for the Atticus API.
 *
 * Not cross-instance (Vercel serverless can fan out), but each cold-started
 * worker enforces the limit locally. Good enough to stop single-client abuse
 * and budget blow-ups. Upgrade to Upstash or Supabase-backed counters if
 * you start seeing distributed abuse.
 */

type Bucket = {
  timestamps: number[];
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

// Tune these as you see traffic. Defaults assume a human typing pace.
const PER_MINUTE_LIMIT = 15;
const PER_HOUR_LIMIT = 120;

const buckets = new Map<string, Bucket>();

// Garbage-collect buckets that haven't been touched in an hour.
function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    const freshest = bucket.timestamps[bucket.timestamps.length - 1] ?? 0;
    if (now - freshest > HOUR_MS) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  reason?: "minute" | "hour";
  retryAfterSeconds?: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  // Occasional GC — 1% of requests.
  if (Math.random() < 0.01) sweep(now);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  // Drop anything older than an hour.
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < HOUR_MS);

  const inLastMinute = bucket.timestamps.filter((t) => now - t < MINUTE_MS).length;
  const inLastHour = bucket.timestamps.length;

  if (inLastMinute >= PER_MINUTE_LIMIT) {
    buckets.set(key, bucket);
    return { ok: false, reason: "minute", retryAfterSeconds: 60 };
  }
  if (inLastHour >= PER_HOUR_LIMIT) {
    buckets.set(key, bucket);
    return { ok: false, reason: "hour", retryAfterSeconds: 3600 };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { ok: true };
}

/**
 * Derive a stable key from the request. Prefers the explicit session id
 * (client-generated UUID, sent as a header) so the limit survives even if
 * the client sits behind a shared NAT. Falls back to IP.
 */
export function rateLimitKey(req: Request): string {
  const session = req.headers.get("x-atticus-session");
  if (session && session.length <= 100) return `session:${session}`;
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  return `ip:${ip}`;
}
