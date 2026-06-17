const IP_PATTERN = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g;

function isOctet(value: string): boolean {
  if (!/^\d{1,3}$/.test(value)) return false;
  const n = Number(value);
  return n >= 0 && n <= 255;
}

/** True for a syntactically valid dotted-quad IPv4 address (octets 0–255). */
export function isValidIP(ip: string): boolean {
  const parts = ip.split('.');
  return parts.length === 4 && parts.every(isOctet);
}

/**
 * True only for addresses worth looking up against an external reputation
 * service — i.e. globally routable. Filters out private (RFC 1918), loopback,
 * link-local, CGNAT, and multicast/reserved ranges.
 */
export function isPublicIP(ip: string): boolean {
  if (!isValidIP(ip)) return false;
  const [a, b] = ip.split('.').map(Number);
  if (a === 0 || a === 127) return false; // "this" network, loopback
  if (a === 10) return false; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return false; // 172.16.0.0/12
  if (a === 192 && b === 168) return false; // 192.168.0.0/16
  if (a === 169 && b === 254) return false; // 169.254.0.0/16 link-local
  if (a === 100 && b >= 64 && b <= 127) return false; // 100.64.0.0/10 CGNAT
  if (a >= 224) return false; // 224.0.0.0/4 multicast + 240/4 reserved
  return true;
}

/** Extract unique, syntactically valid IPv4 addresses from free text. */
export function extractIPs(text: string): string[] {
  const found = new Set<string>();
  for (const match of Array.from(text.matchAll(IP_PATTERN))) {
    const [, a, b, c, d] = match;
    if ([a, b, c, d].every(isOctet)) {
      found.add(`${a}.${b}.${c}.${d}`);
    }
  }
  return Array.from(found);
}
