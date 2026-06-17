import { describe, it, expect } from 'vitest';
import { extractIPs, isValidIP, isPublicIP } from './extractIPs';

describe('extractIPs', () => {
  it('extracts a single valid IP', () => {
    expect(extractIPs('Traffic from 192.168.1.1 detected')).toEqual(['192.168.1.1']);
  });

  it('extracts multiple IPs from text', () => {
    const result = extractIPs('Source: 10.0.0.1 Destination: 8.8.8.8');
    expect(result).toContain('10.0.0.1');
    expect(result).toContain('8.8.8.8');
    expect(result).toHaveLength(2);
  });

  it('deduplicates repeated IPs', () => {
    const result = extractIPs('45.33.32.156 attacked 45.33.32.156 again');
    expect(result).toEqual(['45.33.32.156']);
  });

  it('returns empty array when no IPs found', () => {
    expect(extractIPs('No addresses in this text')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractIPs('')).toEqual([]);
  });

  it('extracts IPs embedded in log lines', () => {
    const log = 'Jun 12 04:22:01 sshd[1234]: Failed password from 203.0.113.42 port 52341';
    expect(extractIPs(log)).toContain('203.0.113.42');
  });

  it('extracts multiple unique IPs from multi-line logs', () => {
    const log = `
      Failed login from 198.51.100.5
      Failed login from 198.51.100.5
      Failed login from 203.0.113.10
    `;
    const result = extractIPs(log);
    expect(result).toHaveLength(2);
    expect(result).toContain('198.51.100.5');
    expect(result).toContain('203.0.113.10');
  });

  it('handles loopback and private ranges', () => {
    const result = extractIPs('127.0.0.1 and 10.10.10.10 and 172.16.0.1');
    expect(result).toContain('127.0.0.1');
    expect(result).toContain('10.10.10.10');
    expect(result).toContain('172.16.0.1');
  });

  it('rejects octets greater than 255', () => {
    expect(extractIPs('999.999.999.999')).toEqual([]);
    expect(extractIPs('256.1.1.1')).toEqual([]);
    expect(extractIPs('1.2.3.256')).toEqual([]);
  });

  it('extracts a valid IP adjacent to an invalid one', () => {
    expect(extractIPs('bad 300.1.1.1 good 8.8.8.8')).toEqual(['8.8.8.8']);
  });
});

describe('isValidIP', () => {
  it('accepts valid dotted quads', () => {
    expect(isValidIP('8.8.8.8')).toBe(true);
    expect(isValidIP('0.0.0.0')).toBe(true);
    expect(isValidIP('255.255.255.255')).toBe(true);
  });

  it('rejects out-of-range octets', () => {
    expect(isValidIP('256.0.0.1')).toBe(false);
    expect(isValidIP('999.999.999.999')).toBe(false);
  });

  it('rejects malformed input', () => {
    expect(isValidIP('1.2.3')).toBe(false);
    expect(isValidIP('1.2.3.4.5')).toBe(false);
    expect(isValidIP('1.2.3.a')).toBe(false);
    expect(isValidIP('')).toBe(false);
  });
});

describe('isPublicIP', () => {
  it('accepts globally routable addresses', () => {
    expect(isPublicIP('8.8.8.8')).toBe(true);
    expect(isPublicIP('45.142.212.100')).toBe(true);
    expect(isPublicIP('203.0.113.10')).toBe(true);
  });

  it('rejects private, loopback, link-local, and CGNAT ranges', () => {
    expect(isPublicIP('10.0.0.1')).toBe(false);
    expect(isPublicIP('172.16.0.1')).toBe(false);
    expect(isPublicIP('172.31.255.255')).toBe(false);
    expect(isPublicIP('192.168.1.100')).toBe(false);
    expect(isPublicIP('127.0.0.1')).toBe(false);
    expect(isPublicIP('169.254.1.1')).toBe(false);
    expect(isPublicIP('100.64.0.1')).toBe(false);
    expect(isPublicIP('0.0.0.0')).toBe(false);
  });

  it('rejects multicast and reserved ranges', () => {
    expect(isPublicIP('224.0.0.1')).toBe(false);
    expect(isPublicIP('240.0.0.1')).toBe(false);
  });

  it('treats 172.x outside 16–31 as public', () => {
    expect(isPublicIP('172.15.0.1')).toBe(true);
    expect(isPublicIP('172.32.0.1')).toBe(true);
  });

  it('rejects invalid input', () => {
    expect(isPublicIP('not.an.ip.addr')).toBe(false);
    expect(isPublicIP('999.1.1.1')).toBe(false);
  });
});
