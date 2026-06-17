import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThreatBadge } from './ThreatBadge';

describe('ThreatBadge', () => {
  describe('classification parsing', () => {
    it('renders BRUTE FORCE classification', () => {
      render(<ThreatBadge content="**[BRUTE FORCE]** — Multiple failed SSH logins detected." />);
      expect(screen.getByText('BRUTE FORCE')).toBeInTheDocument();
    });

    it('renders RECONNAISSANCE classification', () => {
      render(<ThreatBadge content="**[RECONNAISSANCE]** — Port scan from external host." />);
      expect(screen.getByText('RECONNAISSANCE')).toBeInTheDocument();
    });

    it('renders BENIGN classification', () => {
      render(<ThreatBadge content="**[BENIGN]** — Normal traffic pattern." />);
      expect(screen.getByText('BENIGN')).toBeInTheDocument();
    });

    it('renders INSUFFICIENT DATA classification', () => {
      render(<ThreatBadge content="**[INSUFFICIENT DATA]** — Not enough context." />);
      expect(screen.getByText('INSUFFICIENT DATA')).toBeInTheDocument();
    });

    it('renders MALWARE C2 classification', () => {
      render(<ThreatBadge content="**[MALWARE C2]** — Command and control beacon detected." />);
      expect(screen.getByText('MALWARE C2')).toBeInTheDocument();
    });

    it('renders EXFILTRATION classification', () => {
      render(<ThreatBadge content="**[EXFILTRATION]** — Large outbound data transfer." />);
      expect(screen.getByText('EXFILTRATION')).toBeInTheDocument();
    });

    it('renders DDOS / FLOODING classification', () => {
      render(<ThreatBadge content="**[DDOS / FLOODING]** — Volumetric attack detected." />);
      expect(screen.getByText('DDOS / FLOODING')).toBeInTheDocument();
    });

    it('renders LATERAL MOVEMENT classification', () => {
      render(<ThreatBadge content="**[LATERAL MOVEMENT]** — Internal host pivoting." />);
      expect(screen.getByText('LATERAL MOVEMENT')).toBeInTheDocument();
    });
  });

  describe('invalid classifications', () => {
    it('renders nothing for unknown classification', () => {
      const { container } = render(<ThreatBadge content="**[UNKNOWN THREAT]** — Something bad." />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when no classification present', () => {
      const { container } = render(<ThreatBadge content="This is just a plain response." />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing for empty string', () => {
      const { container } = render(<ThreatBadge content="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing for a classification not in the allowlist', () => {
      const { container } = render(<ThreatBadge content="**[PHISHING]** — Suspicious email." />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('badge colors', () => {
    it('applies red styling for BRUTE FORCE', () => {
      render(<ThreatBadge content="**[BRUTE FORCE]**" />);
      expect(screen.getByText('BRUTE FORCE')).toHaveStyle({ color: '#ef4444' });
    });

    it('applies green styling for BENIGN', () => {
      render(<ThreatBadge content="**[BENIGN]**" />);
      expect(screen.getByText('BENIGN')).toHaveStyle({ color: '#22c55e' });
    });

    it('applies amber styling for RECONNAISSANCE', () => {
      render(<ThreatBadge content="**[RECONNAISSANCE]**" />);
      expect(screen.getByText('RECONNAISSANCE')).toHaveStyle({ color: '#f59e0b' });
    });

    it('applies amber styling for LATERAL MOVEMENT', () => {
      render(<ThreatBadge content="**[LATERAL MOVEMENT]**" />);
      expect(screen.getByText('LATERAL MOVEMENT')).toHaveStyle({ color: '#f59e0b' });
    });

    it('applies gray styling for INSUFFICIENT DATA', () => {
      render(<ThreatBadge content="**[INSUFFICIENT DATA]**" />);
      expect(screen.getByText('INSUFFICIENT DATA')).toHaveStyle({ color: '#9ca3af' });
    });

    it('applies red styling for MALWARE C2', () => {
      render(<ThreatBadge content="**[MALWARE C2]**" />);
      expect(screen.getByText('MALWARE C2')).toHaveStyle({ color: '#ef4444' });
    });

    it('applies red styling for EXFILTRATION', () => {
      render(<ThreatBadge content="**[EXFILTRATION]**" />);
      expect(screen.getByText('EXFILTRATION')).toHaveStyle({ color: '#ef4444' });
    });

    it('applies red styling for DDOS / FLOODING', () => {
      render(<ThreatBadge content="**[DDOS / FLOODING]**" />);
      expect(screen.getByText('DDOS / FLOODING')).toHaveStyle({ color: '#ef4444' });
    });
  });
});
