export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface IPReport {
  ip: string;
  abuseScore: number;
  totalReports: number;
  country: string;
  isp: string;
  usageType: string;
  lastReportedAt: string;
}

export type Mode = 'explain' | 'analyst';
