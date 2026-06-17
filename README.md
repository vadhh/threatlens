# ThreatLens

<img width="1875" height="1010" alt="image" src="https://github.com/user-attachments/assets/c273467a-0e8e-43ff-8a37-7144c04839b3" />


> LLM-assisted IP threat-intel chat. Paste an IP (or a sentence with one), get a streamed risk verdict grounded in live [AbuseIPDB](https://www.abuseipdb.com/) reputation data.

ThreatLens extracts public IPs from your message server-side, looks up their abuse reputation, and feeds that data to an LLM that explains the risk in plain English or in terse analyst shorthand. Responses stream token-by-token and can be stopped mid-generation.

**Live:** [Threatlens](https://threatlens-gamma.vercel.app/) · **Repo:** https://github.com/vadhh/threatlens

---

## Why it's interesting

Most "AI chatbot" projects are a thin wrapper over a model. ThreatLens is built around the parts that actually matter in production:

- **Secrets never reach the client.** AbuseIPDB and model keys live server-side; the browser only talks to your own API routes.
- **Untrusted input is re-validated at the boundary.** IPs are re-extracted from user text on the server and filtered to globally-routable addresses, the client's claims are never trusted.
- **Abuse is bounded.** Per-client fixed-window rate limiting, a cap on IP lookups per request, and message-size limits.
- **External calls are deduped.** A shared TTL cache means the same IP hits AbuseIPDB at most once per hour, across every route.
- **It's tested.** 136 unit tests across the lib and components (Vitest + Testing Library).

## Stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS, Base UI, Lucide icons |
| LLM | [OpenRouter](https://openrouter.ai/) free model (`nvidia/nemotron-3-super-120b-a12b:free`) via the Vercel AI SDK |
| Threat data | AbuseIPDB v2 reputation API |
| Tests | Vitest, @testing-library/react |

## How it works

```
user message
  → POST /api/chat
    → rate limit (per-client, fixed window)
    → parse + size-check messages
    → extract IPs from user text → keep only public, cap at 5
    → lookup each IP (AbuseIPDB, shared TTL cache)
    → build system prompt with the reputation data
    → stream LLM response (OpenRouter) back to the client
```

Two modes: **Explain** (plain-language verdict for humans) and **Analyst** (terse, scannable shorthand).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the two keys below
npm run dev
```

Open http://localhost:3000.

### Environment

```bash
OPENROUTER_API_KEY=...   # https://openrouter.ai/keys (free tier works)
ABUSEIPDB_API_KEY=...    # https://www.abuseipdb.com/account/api
```

Both are server-only and never exposed to the browser. Without `ABUSEIPDB_API_KEY` the app still runs, it just skips reputation enrichment.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm test        # run the test suite (vitest run)
npm run lint    # next lint
```

## Deploy

Import the repo on [Vercel](https://vercel.com/new), set `OPENROUTER_API_KEY` and `ABUSEIPDB_API_KEY` in project env vars, and deploy. The chat route declares `maxDuration = 60` so slow free-model responses aren't cut off by Hobby's default timeout.

## Production notes

The rate limiter and IP cache are **in-memory**, fine for a single instance or a demo, but on multi-instance serverless they're best-effort per instance. For hard guarantees under real traffic, swap in a shared store (Upstash Redis). This is a deliberate, documented trade-off, not an oversight.
