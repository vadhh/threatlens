import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IPBadge } from './IPBadge';
import { IPReport } from '@/lib/types';

const baseReport: IPReport = {
  ip: '45.33.32.156',
  abuseScore: 87,
  totalReports: 142,
  country: 'US',
  isp: 'Linode LLC',
  usageType: 'Data Center/Web Hosting/Transit',
  lastReportedAt: '2026-06-10T12:00:00+00:00',
};

describe('IPBadge', () => {
  it('renders the IP address', () => {
    render(<IPBadge report={baseReport} />);
    expect(screen.getByText('45.33.32.156')).toBeInTheDocument();
  });

  it('renders the abuse score', () => {
    render(<IPBadge report={baseReport} />);
    expect(screen.getByText('87/100')).toBeInTheDocument();
  });

  it('renders the country code', () => {
    render(<IPBadge report={baseReport} />);
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  it('renders the ISP name', () => {
    render(<IPBadge report={baseReport} />);
    expect(screen.getByText('Linode LLC')).toBeInTheDocument();
  });

  it('renders the total reports count', () => {
    render(<IPBadge report={baseReport} />);
    expect(screen.getByText('142')).toBeInTheDocument();
  });

  it('applies red color for high abuse score (>50)', () => {
    render(<IPBadge report={{ ...baseReport, abuseScore: 87 }} />);
    expect(screen.getByText('87/100')).toHaveStyle({ color: '#ef4444' });
  });

  it('applies amber color for medium abuse score (21-50)', () => {
    render(<IPBadge report={{ ...baseReport, abuseScore: 35 }} />);
    expect(screen.getByText('35/100')).toHaveStyle({ color: '#f59e0b' });
  });

  it('applies green color for low abuse score (0-20)', () => {
    render(<IPBadge report={{ ...baseReport, abuseScore: 5 }} />);
    expect(screen.getByText('5/100')).toHaveStyle({ color: '#22c55e' });
  });

  it('applies green color for zero abuse score', () => {
    render(<IPBadge report={{ ...baseReport, abuseScore: 0 }} />);
    expect(screen.getByText('0/100')).toHaveStyle({ color: '#22c55e' });
  });

  it('applies red color for score exactly 51', () => {
    render(<IPBadge report={{ ...baseReport, abuseScore: 51 }} />);
    expect(screen.getByText('51/100')).toHaveStyle({ color: '#ef4444' });
  });

  it('renders a different IP correctly', () => {
    render(<IPBadge report={{ ...baseReport, ip: '8.8.8.8', isp: 'Google LLC', country: 'US' }} />);
    expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
    expect(screen.getByText('Google LLC')).toBeInTheDocument();
  });
});
