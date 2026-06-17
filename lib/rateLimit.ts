interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory fixed-window counter. Adequate for a single-instance / demo
// deployment. On multi-instance serverless this is best-effort per instance;
// swap in a shared store (Redis, Upstash) for hard guarantees in production.
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Fixed-window rate limit. Allows up to `limit` calls per `windowMs` for a key.
 * `now` is injectable for deterministic tests.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    pruneExpired(now);
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

// Opportunistic cleanup so the map can't grow unbounded from one-off keys.
function pruneExpired(now: number): void {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

/** Best-effort client identifier from proxy headers, for rate-limit keying. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(resetAt: number, now: number = Date.now()): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
  return Response.json(
    { error: 'Rate limit exceeded. Please slow down and try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
