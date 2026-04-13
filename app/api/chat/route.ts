import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildSystemPrompt } from '@/lib/systemPrompt';
import { IPReport } from '@/lib/types';

async function lookupIP(ip: string): Promise<IPReport | null> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      {
        headers: {
          Key: apiKey,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) return null;

    const json = await res.json();
    const d = json.data;

    return {
      ip: d.ipAddress,
      abuseScore: d.abuseConfidenceScore,
      totalReports: d.totalReports,
      country: d.countryCode ?? 'Unknown',
      isp: d.isp ?? 'Unknown',
      usageType: d.usageType ?? 'Unknown',
      lastReportedAt: d.lastReportedAt ?? 'Never',
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const { messages, analystMode, detectedIPs } = await req.json();

  const mode = analystMode ? 'analyst' : 'explain';

  // Lookup all IPs in parallel, skip failures
  const ips: string[] = detectedIPs ?? [];
  const ipResults = await Promise.all(ips.map(lookupIP));
  const ipReports = ipResults.filter((r): r is IPReport => r !== null);

  const systemPrompt = buildSystemPrompt(mode, ipReports);

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  return result.toTextStreamResponse();
}
