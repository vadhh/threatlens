import { IPReport } from '@/lib/types';

export function IPBadge({ report }: { report: IPReport }) {
  const scoreColor =
    report.abuseScore > 50 ? '#ef4444' : report.abuseScore > 20 ? '#f59e0b' : '#22c55e';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '6px 16px',
        background: '#0f172a',
        border: '1px solid #1e3a5f',
        borderRadius: 4,
        padding: '8px 12px',
        marginBottom: 8,
        fontFamily: 'var(--font-geist-mono)',
        fontSize: 12,
        color: '#93c5fd',
      }}
    >
      <span>
        IP:{' '}
        <strong style={{ color: '#3b82f6' }}>{report.ip}</strong>
      </span>
      <span>
        Score:{' '}
        <strong style={{ color: scoreColor }}>{report.abuseScore}/100</strong>
      </span>
      <span>
        Country: <strong>{report.country}</strong>
      </span>
      <span>
        ISP: <strong>{report.isp}</strong>
      </span>
      <span>
        Reports: <strong>{report.totalReports}</strong>
      </span>
    </div>
  );
}
