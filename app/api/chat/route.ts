import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { buildSystemPrompt } from '@/lib/systemPrompt';
import { IPReport } from '@/lib/types';
import { extractIPs, isPublicIP } from '@/lib/extractIPs';
import { lookupIP } from '@/lib/ipLookup';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';

// Free OpenRouter models can be slow to first token; lift the serverless cap
// above Vercel Hobby's 10s default so streams aren't cut off.
export const maxDuration = 60;

const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60_000; // per minute, per client
const MAX_MESSAGES = 50;
const MAX_TOTAL_CHARS = 20_000;
const MAX_IP_LOOKUPS = 5;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    return null;
  }

  const cleaned: ChatMessage[] = [];
  let totalChars = 0;

  for (const m of value) {
    if (!m || typeof m !== 'object') return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      return null;
    }
    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) return null;
    cleaned.push({ role, content });
  }

  return cleaned;
}

export async function POST(req: Request) {
  const limit = rateLimit(`chat:${clientKey(req)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) return tooManyRequests(limit.resetAt);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { messages, analystMode } = (body ?? {}) as {
    messages?: unknown;
    analystMode?: unknown;
  };

  const cleaned = parseMessages(messages);
  if (!cleaned) {
    return Response.json({ error: 'Invalid or oversized messages' }, { status: 400 });
  }

  const mode = analystMode ? 'analyst' : 'explain';

  // Re-extract IPs server-side from user text — never trust a client-supplied
  // list. Only globally routable IPs are looked up, capped to bound API usage.
  const userText = cleaned
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n');
  const ips = extractIPs(userText).filter(isPublicIP).slice(0, MAX_IP_LOOKUPS);

  const ipResults = await Promise.all(ips.map(lookupIP));
  const ipReports = ipResults.filter((r): r is IPReport => r !== null);

  const systemPrompt = buildSystemPrompt(mode, ipReports);

  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

  const result = streamText({
    model: openrouter('nvidia/nemotron-3-super-120b-a12b:free'),
    system: systemPrompt,
    messages: cleaned,
  });

  return result.toTextStreamResponse();
}
