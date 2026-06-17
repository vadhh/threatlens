import { isValidIP, isPublicIP } from '@/lib/extractIPs';
import { lookupIP } from '@/lib/ipLookup';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';

const RATE_LIMIT = 30; // requests
const RATE_WINDOW_MS = 60_000; // per minute, per client

export async function GET(req: Request) {
  const limit = rateLimit(`ipcheck:${clientKey(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) return tooManyRequests(limit.resetAt);

  const url = new URL(req.url);
  const ip = url.searchParams.get('ip') ?? '';

  if (!isValidIP(ip)) {
    return Response.json({ error: 'Invalid IP' }, { status: 400 });
  }
  if (!isPublicIP(ip)) {
    return Response.json({ error: 'Non-public IP — not looked up' }, { status: 422 });
  }

  const report = await lookupIP(ip);
  if (!report) {
    return Response.json({ error: 'Lookup failed' }, { status: 502 });
  }

  return Response.json(report);
}
