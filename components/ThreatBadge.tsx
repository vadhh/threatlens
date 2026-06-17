const CLASSIFICATIONS = [
  'RECONNAISSANCE',
  'BRUTE FORCE',
  'EXFILTRATION',
  'MALWARE C2',
  'DDOS / FLOODING',
  'LATERAL MOVEMENT',
  'BENIGN',
  'INSUFFICIENT DATA',
] as const;

type Classification = (typeof CLASSIFICATIONS)[number];

function getColors(c: Classification) {
  if (c === 'BENIGN') return { bg: '#052e16', text: '#22c55e', border: '#166534' };
  if (c === 'INSUFFICIENT DATA') return { bg: '#111827', text: '#9ca3af', border: '#374151' };
  if (c === 'RECONNAISSANCE' || c === 'LATERAL MOVEMENT')
    return { bg: '#451a03', text: '#f59e0b', border: '#78350f' };
  return { bg: '#450a0a', text: '#ef4444', border: '#7f1d1d' };
}

export function ThreatBadge({ content }: { content: string }) {
  const match = content.match(/\[([A-Z0-9\s\/]+)\]/);
  const raw = match?.[1]?.trim() ?? null;
  const classification =
    raw && (CLASSIFICATIONS as readonly string[]).includes(raw)
      ? (raw as Classification)
      : null;

  if (!classification) return null;

  const { bg, text, border } = getColors(classification);

  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: text,
        border: `1px solid ${border}`,
        borderRadius: 4,
        padding: '2px 10px',
        fontSize: 11,
        fontFamily: 'var(--font-geist-mono)',
        fontWeight: 700,
        letterSpacing: '0.06em',
        marginBottom: 8,
      }}
    >
      {classification}
    </span>
  );
}
