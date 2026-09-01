📰 AI News Summarizer

An AI-powered news summarizer built on GenLayer — the first AI-native blockchain with Intelligent Contracts.

## Features

- **AI-Powered Summarization**: Enter any URL and get an intelligent summary
- **Blockchain Consensus**: 5 validators reach consensus on the summary
- **Immutable Storage**: Summaries are stored on-chain and cannot be modified
- **Auto-Categorization**: Content is automatically categorized
- **Sentiment Analysis**: Sentiment is automatically detected
- **Language Detection**: Language is automatically identified
- **Key Points Extraction**: Main takeaways are extracted
- **Statistics Dashboard**: View aggregate statistics
- **REST API**: External access via API endpoints

## Tech Stack

- **Smart Contract**: Python (GenLayer Intelligent Contract)
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Blockchain**: GenLayer Studionet (gasless)
- **SDK**: genlayer-js, wagmi, viem

## How it works

```
User submits URL
  → Contract fetches web content (gl.nondet.web.render)
  → AI analyzes and summarizes content (gl.nondet.exec_prompt)
  → 5 validators reach consensus (gl.eq_principle.strict_eq)
  → Summary stored on-chain with metadata
```

## Project Structure

```
AI-News-Summarizer/
├── contracts/
│   └── news_summarizer.py    # GenLayer Intelligent Contract
├── deploy/
│   └── deployScript.ts       # Deployment script
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # Wallet providers
│   │   └── api/
│   │       ├── summarize/route.ts    # POST /api/summarize
│   │       ├── summaries/route.ts    # GET /api/summaries
│   │       ├── stats/route.ts        # GET /api/stats
│   │       └── transaction/route.ts  # GET /api/transaction
│   └── lib/
│       └── genlayer-client.ts # GenLayer SDK client
├── tests/
│   └── test_news_summarizer.py # Contract tests
├── API_DOCUMENTATION.md        # API documentation
├── .env.example                # Environment variables template
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Smart Contract Features

The `news_summarizer.py` contract provides:

- **`summarize(url)`** - Summarize a URL with AI analysis
- **`get_summary(url)`** - Get summary for a specific URL
- **`get_all_summaries()`** - Get all summaries
- **`get_stats()`** - Get overall statistics
- **`get_submitter_summaries(submitter)`** - Get summaries by submitter
- **`get_summaries_by_category(category)`** - Filter by category
- **`get_summaries_by_sentiment(sentiment)`** - Filter by sentiment

### Data Stored Per Summary

- URL
- Summary text
- Category (Technology, Business, Science, Health, Sports, Entertainment, Politics, Other)
- Sentiment (Positive, Negative, Neutral, Mixed)
- Word count
- Language
- Key points
- Submitter address
- Creation timestamp

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- GenLayer account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/DikaCream/AI-News-Summarizer.git
cd AI-News-Summarizer

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your contract address
```

### Deploy Contract

```bash
# Install GenLayer CLI
npm install -g genlayer

# Deploy to StudioNet
genlayer network studionet
genlayer deploy --contract contracts/news_summarizer.py
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

```env
# GenLayer Configuration
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999

# Contract Address (deploy contract first, then set this)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
CONTRACT_ADDRESS=0x...
```

## API Usage

### Summarize a URL

```bash
curl -X POST https://your-domain.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### Get Summaries

```bash
# Get all summaries
curl https://your-domain.com/api/summaries

# Get summaries by category
curl "https://your-domain.com/api/summaries?category=Technology"

# Get summaries by sentiment
curl "https://your-domain.com/api/summaries?sentiment=Positive"
```

### Get Statistics

```bash
curl https://your-domain.com/api/stats
```

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Testing

```bash
# Run tests
pytest tests/ -v
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy
```

### Environment Variables for Vercel

Set these in your Vercel project settings:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `CONTRACT_ADDRESS`
- `NEXT_PUBLIC_GENLAYER_RPC_URL`
- `NEXT_PUBLIC_GENLAYER_CHAIN_ID`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on [GenLayer](https://genlayer.com) - AI-powered Intelligent Contracts
- Uses [genlayer-js](https://github.com/genlayer-labs/genlayer-js) SDK
- Frontend powered by [Next.js](https://nextjs.org/)
