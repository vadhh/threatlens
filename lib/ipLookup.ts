import { IPReport } from './types';

const TTL_MS = 60 * 60 * 1000; // 1h cache for successful lookups
const NEGATIVE_TTL_MS = 60 * 1000; // 1m for failures, so transient errors recover
const MAX_ENTRIES = 5000;

interface CacheEntry {
  report: IPReport | null;
  expiresAt: number;
}

// Process-wide cache shared by every route that looks up an IP, so the same
// address is fetched from AbuseIPDB at most once per TTL — whether the request
// came from the badge endpoint or the chat endpoint.
const cache = new Map<string, CacheEntry>();

/** Test helper: reset the shared cache between cases. */
export function _clearIpCache(): void {
  cache.clear();
}

/**
 * Look up an IP against AbuseIPDB, served from cache when fresh. Returns null
 * if the key is unset, the request fails, or the upstream returns an error.
 * `now` is injectable for deterministic tests.
 */
export async function lookupIP(ip: string, now: number = Date.now()): Promise<IPReport | null> {
  const cached = cache.get(ip);
  if (cached && now < cached.expiresAt) return cached.report;

  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) return null; // not cached — recovers once configured

  let report: IPReport | null = null;
  try {
    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      { headers: { Key: apiKey, Accept: 'application/json' } }
    );
    if (res.ok) {
      const json = await res.json();
      const d = json.data;
      report = {
        ip: d.ipAddress,
        abuseScore: d.abuseConfidenceScore,
        totalReports: d.totalReports,
        country: d.countryCode ?? 'Unknown',
        isp: d.isp ?? 'Unknown',
        usageType: d.usageType ?? 'Unknown',
        lastReportedAt: d.lastReportedAt ?? 'Never',
      };
    }
  } catch {
    report = null;
  }

  if (cache.size >= MAX_ENTRIES) pruneExpired(now);
  cache.set(ip, { report, expiresAt: now + (report ? TTL_MS : NEGATIVE_TTL_MS) });
  return report;
}

function pruneExpired(now: number): void {
  for (const [key, entry] of Array.from(cache.entries())) {
    if (now >= entry.expiresAt) cache.delete(key);
  }
}
