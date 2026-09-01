# AI News Summarizer

A decentralized news summarization tool powered by GenLayer's Intelligent Contracts. Paste any article URL, and the system fetches the content, generates an AI summary, and stores it immutably on-chain after validator consensus.

## What This Does

This is a full-stack dApp that combines web scraping, LLM analysis, and blockchain consensus into a single workflow:

1. You provide a URL (news article, blog post, etc.)
2. The智能合约 fetches the page content directly — no oracles needed
3. An LLM analyzes the text and produces a structured summary with metadata
4. Five validators independently verify the result and reach consensus
5. The summary, along with category, sentiment, and key points, gets stored on-chain

Once stored, summaries can't be altered. Every result is backed by blockchain consensus.

## Core Features

- **AI-powered summarization** — Uses LLMs to generate concise summaries
- **On-chain consensus** — 5 validators verify results before storage
- **Auto-categorization** — Content tagged as Technology, Business, Science, Health, Sports, Entertainment, Politics, or Other
- **Sentiment analysis** — Detects whether content is Positive, Negative, Neutral, or Mixed
- **Language detection** — Identifies the source language automatically
- **Key point extraction** — Pulls out 3-4 main takeaways from the article
- **Submitter tracking** — Each summary is linked to the wallet that created it
- **Statistics dashboard** — View aggregate data across all summaries
- **REST API** — Integrate with external applications

## Getting Started

### Prerequisites

- Node.js 18 or later
- GenLayer CLI installed globally (`npm install -g genlayer`)
- A GenLayer account (free on StudioNet)

### Installation

```bash
git clone https://github.com/DikaCream/AI-News-Summarizer.git
cd AI-News-Summarizer
npm install
cp .env.example .env
```

### Deploying the Contract

```bash
genlayer network set studionet
genlayer deploy --contract contracts/news_summarizer.py
```

After deployment, you'll get a contract address. Add it to your `.env` file:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
CONTRACT_ADDRESS=0xYourContractAddress
```

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## How the Contract Works

The智能合约 (`contracts/news_summarizer.py`) is built on GenLayer, which lets smart contracts fetch live web pages and call LLMs natively. Here's the flow:

```python
# Inside the non-deterministic block:
web_data = gl.nondet.web.render(url, mode="text")  # Fetch the page
result = gl.nondet.exec_prompt(task)                 # Ask LLM to analyze
return json.dumps(result)                            # Return structured JSON

# Validators compare results using the equivalence principle:
result_json = json.loads(gl.eq_principle.strict_eq(fetch_and_analyze))
```

The contract uses `gl.eq_principle.strict_eq()` because the LLM output is structured JSON — validators can compare exact values. For text-heavy outputs where slight wording differences are acceptable, you'd use `gl.eq_principle.prompt_comparative()` instead.

### Contract Methods

**Write:**

| Method | Description |
|--------|-------------|
| `summarize(url)` | Fetches, analyzes, and stores a summary |

**Read:**

| Method | Description |
|--------|-------------|
| `get_summary(url)` | Retrieve a specific summary |
| `get_all_summaries()` | Get every stored summary |
| `get_stats()` | Aggregate counts by domain, category, sentiment |
| `get_submitter_summaries(address)` | Summaries from a specific wallet |
| `get_summaries_by_category(category)` | Filter by content category |
| `get_summaries_by_sentiment(sentiment)` | Filter by detected sentiment |

### Data Model

Each summary stores:

- `url` — Source URL
- `summary` — AI-generated summary text
- `category` — One of: Technology, Business, Science, Health, Sports, Entertainment, Politics, Other
- `sentiment` — One of: Positive, Negative, Neutral, Mixed
- `word_count` — Approximate word count of original content
- `language` — Detected language
- `key_points` — 3-4 bullet points of main takeaways
- `submitter` — Wallet address that initiated the summary
- `created_at` — Timestamp

## REST API

The frontend exposes API routes for external integration.

### Summarize a URL

```bash
curl -X POST https://your-domain.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://techcrunch.com/article"}'
```

### Get Summaries

```bash
# All summaries
curl https://your-domain.com/api/summaries

# Filter by category
curl "https://your-domain.com/api/summaries?category=Technology"

# Filter by sentiment
curl "https://your-domain.com/api/summaries?sentiment=Positive"

# Specific URL
curl "https://your-domain.com/api/summaries?url=https://example.com/article"
```

### Get Statistics

```bash
curl https://your-domain.com/api/stats
```

### Check Transaction Status

```bash
curl "https://your-domain.com/api/transaction?hash=0x..."
```

Full API reference is in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Project Structure

```
├── contracts/
│   └── news_summarizer.py      # The GenLayer Intelligent Contract
├── src/
│   ├── app/
│   │   ├── page.tsx            # Main UI with tabs (Summarize, History, Stats)
│   │   ├── layout.tsx          # Root layout
│   │   ├── providers.tsx       # Wallet connection providers
│   │   └── api/
│   │       ├── summarize/route.ts
│   │       ├── summaries/route.ts
│   │       ├── stats/route.ts
│   │       └── transaction/route.ts
│   └── lib/
│       └── genlayer-client.ts  # GenLayer SDK wrapper
├── tests/
│   └── direct/                 # In-memory unit tests
├── deploy/
│   └── deployScript.ts         # Deployment script
├── API_DOCUMENTATION.md
└── .env.example
```

## Tech Stack

- **Smart Contract**: Python on GenLayer (Intelligent Contract)
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Blockchain**: GenLayer StudioNet (gasless testing network)
- **SDK**: genlayer-js for contract interaction, wagmi + viem for wallet connection

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

Environment variables to set in Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_GENLAYER_CHAIN_ID` | `61999` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Your deployed contract address |
| `CONTRACT_ADDRESS` | Your deployed contract address |

## Testing

```bash
pytest tests/direct/ -v
```

The tests use GenLayer's direct mode, which runs contracts in-memory with mocked web and LLM calls. No Studio instance needed.

## License

MIT
