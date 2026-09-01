# AI News Summarizer

A dApp that summarizes news articles using AI and stores the results on-chain. Built on GenLayer, which lets smart contracts fetch web pages and call LLMs directly.

You paste a URL. The contract grabs the page, sends it to an LLM, gets back a structured summary, and five validators agree on the result before it's saved to the blockchain. Once it's there, nobody can change it.

## What it does

The whole thing runs in five steps: you give it a URL, the contract fetches the page content, an LLM breaks it down into a summary with category and sentiment tags, validators check that everyone got the same result, and the summary gets written to GenLayer's chain with a hash proving it hasn't been tampered with.

No oracles. No external indexing services. The contract itself does the fetching.

## Features

- Summarizes any public URL using an LLM
- Validators reach consensus on the LLM output before storage
- Tags content by category: Technology, Business, Science, Health, Sports, Entertainment, Politics, Other
- Detects sentiment: Positive, Negative, Neutral, Mixed
- Identifies the source language automatically
- Pulls out 3-4 key points from each article
- Tracks which wallet submitted each summary
- Stats page showing totals across all summaries
- REST API so other apps can read the data

## Setup

You need Node.js 18+, the GenLayer CLI (`npm install -g genlayer`), and a GenLayer account.

```bash
git clone https://github.com/DikaCream/AI-News-Summarizer.git
cd AI-News-Summarizer
npm install
cp .env.example .env
```

Deploy the contract to StudioNet:

```bash
genlayer network set studionet
genlayer deploy --contract contracts/news_summarizer.py
```

Grab the contract address from the output and paste it into `.env`:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
CONTRACT_ADDRESS=0x...
```

Then start the dev server:

```bash
npm run dev
```

The app runs at http://localhost:3000.

## How the contract works

GenLayer contracts run inside a sandbox where they can call external services. The key parts of `news_summarizer.py`:

```python
# Inside a non-deterministic block:
web_data = gl.nondet.web.render(url, mode="text")
result = gl.nondet.exec_prompt(task, response_format="json")
return json.dumps(result)

# Validators compare results:
result_json = json.loads(gl.eq_principle.strict_eq(fetch_and_analyze))
```

`strict_eq` works here because the LLM output is JSON with specific fields; validators can diff the numbers and strings directly. For free-form text where two slightly different phrasings should count as the same, you'd use `prompt_comparative` instead.

## Contract API

Write methods:

| Method | What it does |
|--------|-------------|
| `summarize(url)` | Fetch, analyze, store |

Read methods:

| Method | What it does |
|--------|-------------|
| `get_summary(url)` | One summary by URL |
| `get_all_summaries()` | Every stored summary |
| `get_stats()` | Counts by domain, category, sentiment |
| `get_submitter_summaries(address)` | Summaries from one wallet |
| `get_summaries_by_category(cat)` | Filter by category |
| `get_summaries_by_sentiment(s)` | Filter by sentiment |

Each summary stores: url, summary text, category, sentiment, word count, language, key points, submitter address, timestamp.

## REST API

```bash
# Summarize a URL
curl -X POST https://your-domain.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# Get all summaries
curl https://your-domain.com/api/summaries

# Filter by category
curl "https://your-domain.com/api/summaries?category=Technology"

# Get stats
curl https://your-domain.com/api/stats
```

Full docs in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Project layout

```
contracts/
  news_summarizer.py
src/
  app/
    page.tsx
    api/
      summarize/route.ts
      summaries/route.ts
      stats/route.ts
      transaction/route.ts
  lib/
    genlayer-client.ts
tests/
  direct/
deploy/
  deployScript.ts
```

## Tech

Contract: Python on GenLayer. Frontend: Next.js 16, TypeScript, Tailwind. Wallet: wagmi + viem. Chain: GenLayer StudioNet (gasless).

## Deploying to Vercel

```bash
vercel deploy
```

Set these environment variables in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_GENLAYER_CHAIN_ID` | `61999` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | your contract address |
| `CONTRACT_ADDRESS` | your contract address |

## Testing

```bash
pytest tests/direct/ -v
```

Tests run in-memory with mocked web and LLM calls. No running Studio instance required.

MIT
