import { describe, it, expect } from 'vitest';
import { rateLimit, clientKey } from './rateLimit';

describe('rateLimit', () => {
  it('allows calls up to the limit then blocks', () => {
    const key = `t-${Math.random()}`;
    const r1 = rateLimit(key, 3, 1000, 0);
    const r2 = rateLimit(key, 3, 1000, 0);
    const r3 = rateLimit(key, 3, 1000, 0);
    const r4 = rateLimit(key, 3, 1000, 0);

    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it('resets after the window elapses', () => {
    const key = `t-${Math.random()}`;
    rateLimit(key, 1, 1000, 0);
    expect(rateLimit(key, 1, 1000, 500).allowed).toBe(false); // same window
    expect(rateLimit(key, 1, 1000, 1000).allowed).toBe(true); // window rolled over
  });

  it('tracks keys independently', () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    rateLimit(a, 1, 1000, 0);
    expect(rateLimit(a, 1, 1000, 0).allowed).toBe(false);
    expect(rateLimit(b, 1, 1000, 0).allowed).toBe(true);
  });
});

describe('clientKey', () => {
  it('uses the first x-forwarded-for entry', () => {
    const req = new Request('http://x', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    });
    expect(clientKey(req)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://x', { headers: { 'x-real-ip': '198.51.100.9' } });
    expect(clientKey(req)).toBe('198.51.100.9');
  });

  it('returns "unknown" when no client headers are present', () => {
    expect(clientKey(new Request('http://x'))).toBe('unknown');
  });
});
