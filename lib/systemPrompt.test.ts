import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './systemPrompt';
import { IPReport } from './types';

const mockReport: IPReport = {
  ip: '45.33.32.156',
  abuseScore: 87,
  totalReports: 142,
  country: 'US',
  isp: 'Linode LLC',
  usageType: 'Data Center/Web Hosting/Transit',
  lastReportedAt: '2026-06-10T12:00:00+00:00',
};

describe('buildSystemPrompt', () => {
  describe('explain mode', () => {
    it('includes the base persona', () => {
      const prompt = buildSystemPrompt('explain', []);
      expect(prompt).toContain('ThreatLens AI');
      expect(prompt).toContain('network security analyst');
    });

    it('includes explain-mode instruction', () => {
      const prompt = buildSystemPrompt('explain', []);
      expect(prompt).toContain('plain, accessible language');
      expect(prompt).toContain('analogies');
    });

    it('does not include analyst-mode language', () => {
      const prompt = buildSystemPrompt('explain', []);
      expect(prompt).not.toContain('SOC/blue team');
      expect(prompt).not.toContain('CVE references');
    });
  });

  describe('analyst mode', () => {
    it('includes analyst-mode instruction', () => {
      const prompt = buildSystemPrompt('analyst', []);
      expect(prompt).toContain('precise technical language');
      expect(prompt).toContain('SOC/blue team');
    });

    it('does not include explain-mode language', () => {
      const prompt = buildSystemPrompt('analyst', []);
      expect(prompt).not.toContain('plain, accessible language');
    });
  });

  describe('IP context injection', () => {
    it('injects IP intel when reports are provided', () => {
      const prompt = buildSystemPrompt('explain', [mockReport]);
      expect(prompt).toContain('45.33.32.156');
      expect(prompt).toContain('87/100');
      expect(prompt).toContain('142');
      expect(prompt).toContain('Linode LLC');
      expect(prompt).toContain('US');
    });

    it('does not include IP context when no reports given', () => {
      const prompt = buildSystemPrompt('explain', []);
      expect(prompt).not.toContain('AbuseIPDB');
    });

    it('injects context for multiple IPs', () => {
      const second: IPReport = {
        ...mockReport,
        ip: '8.8.8.8',
        abuseScore: 0,
        country: 'US',
        isp: 'Google LLC',
      };
      const prompt = buildSystemPrompt('analyst', [mockReport, second]);
      expect(prompt).toContain('45.33.32.156');
      expect(prompt).toContain('8.8.8.8');
      expect(prompt).toContain('Google LLC');
    });
  });

  describe('structure', () => {
    it('includes all required response sections', () => {
      const prompt = buildSystemPrompt('explain', []);
      expect(prompt).toContain('CLASSIFICATION');
      expect(prompt).toContain("What's happening");
      expect(prompt).toContain('Why it matters');
      expect(prompt).toContain('MITRE ATT&CK');
      expect(prompt).toContain('Recommended Actions');
    });

    it('includes topic restriction instruction', () => {
      const prompt = buildSystemPrompt('explain', []);
      expect(prompt).toContain('network security and infrastructure');
    });
  });
});
