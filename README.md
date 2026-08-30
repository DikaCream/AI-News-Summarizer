# 📰 AI News Summarizer

An AI-powered news summarizer built on **GenLayer** — the first AI-native blockchain with Intelligent Contracts.

## What it does

1. Enter any URL (news article, blog post, etc.)
2. The contract fetches the web content
3. AI analyzes and creates a concise summary
4. Validators reach consensus on the summary
5. Summary is stored on-chain — immutable and verifiable

## Tech Stack

- **Smart Contract:** Python (GenLayer Intelligent Contract)
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Blockchain:** GenLayer Studionet (gasless)
- **SDK:** genlayer-js, wagmi, viem

## How it works

```
User submits URL
  → Contract fetches web content (gl.nondet.web.render)
  → AI summarizes content (gl.nondet.exec_prompt)
  → 5 validators reach consensus (gl.eq_principle)
  → Summary stored on-chain
```

## Project Structure

```
├── contracts/
│   └── news_summarizer.py    # GenLayer Intelligent Contract
├── deploy/
│   └── deployScript.ts       # Deployment script
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI
│   │   ├── layout.tsx        # Root layout
│   │   └── providers.tsx     # Wallet providers
│   └── lib/
│       └── genlayer-client.ts # GenLayer SDK client
├── tests/                    # Contract tests
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your contract address

# Run development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

## Deploy

1. Deploy contract via GenLayer CLI:
   ```bash
   genlayer network studionet
   genlayer deploy --contract contracts/news_summarizer.py
   ```

2. Deploy frontend to Vercel:
   ```bash
   vercel deploy
   ```

## License

MIT
