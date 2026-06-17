import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lookupIP, _clearIpCache } from './ipLookup';

const ONE_HOUR = 60 * 60 * 1000;

function okResponse(data: Record<string, unknown>) {
  return { ok: true, json: async () => ({ data }) } as unknown as Response;
}

const sample = {
  ipAddress: '8.8.8.8',
  abuseConfidenceScore: 0,
  totalReports: 0,
  countryCode: 'US',
  isp: 'Google LLC',
  usageType: 'Data Center',
  lastReportedAt: null,
};

describe('lookupIP', () => {
  const originalKey = process.env.ABUSEIPDB_API_KEY;

  beforeEach(() => {
    process.env.ABUSEIPDB_API_KEY = 'test-key';
    _clearIpCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.ABUSEIPDB_API_KEY = originalKey;
  });

  it('fetches once and serves the second call from cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(sample));
    vi.stubGlobal('fetch', fetchMock);

    const first = await lookupIP('8.8.8.8');
    const second = await lookupIP('8.8.8.8');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first?.country).toBe('US');
    expect(first?.isp).toBe('Google LLC');
  });

  it('fetches separately for distinct IPs', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(sample));
    vi.stubGlobal('fetch', fetchMock);

    await lookupIP('1.1.1.1');
    await lookupIP('2.2.2.2');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('re-fetches after the TTL expires', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(sample));
    vi.stubGlobal('fetch', fetchMock);

    await lookupIP('8.8.8.8', 0);
    await lookupIP('8.8.8.8', ONE_HOUR + 1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null without fetching when no API key is set', async () => {
    delete process.env.ABUSEIPDB_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await lookupIP('8.8.8.8')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null on upstream error, then re-fetches successfully after the negative TTL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce(okResponse({ ipAddress: '9.9.9.9', abuseConfidenceScore: 5, totalReports: 2 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await lookupIP('9.9.9.9', 0)).toBeNull();
    // negative result cached only 1m, so a later call re-fetches and succeeds
    const ok = await lookupIP('9.9.9.9', 61_000);
    expect(ok?.country).toBe('Unknown');
    expect(ok?.abuseScore).toBe(5);
  });
});
