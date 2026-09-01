# AI News Summarizer

Decentralized news summarization powered by GenLayer Intelligent Contracts. Users submit article URLs, AI generates summaries, and validators reach consensus before storing results on-chain.

## Overview

This dApp combines web scraping, LLM analysis, and blockchain consensus:

1. User submits a URL
2. Contract fetches page content via `gl.nondet.web.render`
3. LLM analyzes and creates a structured summary
4. Five validators verify the result through consensus
5. Summary is stored immutably on-chain

## Features

- AI-powered summarization using LLMs
- On-chain consensus with 5 validators
- Auto-categorization (Technology, Business, Science, Health, Sports, Entertainment, Politics, Other)
- Sentiment analysis (Positive, Negative, Neutral, Mixed)
- Language detection
- Key point extraction
- Submitter wallet tracking
- Statistics dashboard
- REST API for external integration

## Quick Start

### Prerequisites

- Node.js 18+
- GenLayer CLI (`npm install -g genlayer`)
- GenLayer account

### Setup

```bash
git clone https://github.com/DikaCream/AI-News-Summarizer.git
cd AI-News-Summarizer
npm install
cp .env.example .env
```

### Deploy Contract

```bash
genlayer network set studionet
genlayer deploy --contract contracts/news_summarizer.py
```

Add the contract address to `.env`:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
CONTRACT_ADDRESS=0x...
```

### Run

```bash
npm run dev
```

Open http://localhost:3000

## How It Works

The contract uses GenLayer's non-deterministic blocks to fetch web content and call LLMs:

```python
# Fetch web content
web_data = gl.nondet.web.render(url, mode="text")

# Ask LLM to analyze
result = gl.nondet.exec_prompt(task, response_format="json")

# Validators reach consensus
result_json = json.loads(gl.eq_principle.strict_eq(fetch_and_analyze))
```

## Contract API

**Write:**

| Method | Description |
|--------|-------------|
| `summarize(url)` | Fetch, analyze, and store a summary |

**Read:**

| Method | Description |
|--------|-------------|
| `get_summary(url)` | Get a specific summary |
| `get_all_summaries()` | Get all summaries |
| `get_stats()` | Get aggregate statistics |
| `get_submitter_summaries(address)` | Get summaries by wallet |
| `get_summaries_by_category(category)` | Filter by category |
| `get_summaries_by_sentiment(sentiment)` | Filter by sentiment |

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/summarize` | POST | Summarize a URL |
| `/api/summaries` | GET | Get summaries (supports filters) |
| `/api/stats` | GET | Get statistics |
| `/api/transaction` | GET | Check transaction status |

Example:

```bash
curl -X POST https://your-domain.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

Full API docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Project Structure

```
contracts/
  news_summarizer.py          # GenLayer Intelligent Contract
src/
  app/
    page.tsx                  # Main UI
    api/                      # REST API routes
  lib/
    genlayer-client.ts        # GenLayer SDK wrapper
tests/
  direct/                     # Unit tests
deploy/
  deployScript.ts             # Deployment script
```

## Tech Stack

- Smart Contract: Python (GenLayer)
- Frontend: Next.js 16, TypeScript, Tailwind CSS
- Blockchain: GenLayer StudioNet
- SDK: genlayer-js, wagmi, viem

## Deployment

### Contract

```bash
genlayer network set studionet
genlayer deploy --contract contracts/news_summarizer.py
```

### Frontend (Vercel)

```bash
vercel deploy
```

Vercel environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_GENLAYER_CHAIN_ID` | `61999` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Your contract address |
| `CONTRACT_ADDRESS` | Your contract address |

## Testing

```bash
pytest tests/direct/ -v
```

## License

MIT
