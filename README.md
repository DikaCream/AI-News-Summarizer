# 📰 AI News Summarizer

> AI-powered news summarization with blockchain consensus, built on [GenLayer](https://genlayer.com).

Enter any URL → AI analyzes the content → Validators reach consensus → Immutable summary stored on-chain.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Summarization | Intelligent content analysis using LLMs |
| ⛓️ Blockchain Consensus | 5 validators verify and agree on summaries |
| 📊 Auto-Categorization | Content categorized (Tech, Business, Science, etc.) |
| 😊 Sentiment Analysis | Emotional tone detected (Positive, Negative, Neutral, Mixed) |
| 🌐 Language Detection | Automatic language identification |
| 📌 Key Points | Main takeaways extracted |
| 📈 Statistics | Aggregate analytics dashboard |
| 🔌 REST API | External integration support |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GenLayer CLI (`npm install -g genlayer`)
- GenLayer account

### Setup

```bash
# Clone
git clone https://github.com/DikaCream/AI-News-Summarizer.git
cd AI-News-Summarizer

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Deploy Contract

```bash
genlayer network set studionet
genlayer deploy --contract contracts/news_summarizer.py
```

Copy the deployed contract address to `.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
CONTRACT_ADDRESS=0x...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   GenLayer   │────▶│  Validators │
│  (Next.js)  │     │   Network    │     │  (5x LLM)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   On-Chain   │
                    │   Storage    │
                    └──────────────┘
```

### How It Works

1. **User submits URL** via frontend or API
2. **Contract fetches** web content (`gl.nondet.web.render`)
3. **AI analyzes** and creates summary (`gl.nondet.exec_prompt`)
4. **Validators reach consensus** on the result (`gl.eq_principle.strict_eq`)
5. **Summary stored** on-chain with metadata

---

## 📁 Project Structure

```
├── contracts/
│   └── news_summarizer.py      # GenLayer Intelligent Contract
├── src/
│   ├── app/
│   │   ├── page.tsx            # Main UI
│   │   └── api/                # REST API endpoints
│   └── lib/
│       └── genlayer-client.ts  # GenLayer SDK wrapper
├── tests/
│   └── direct/                 # In-memory unit tests
├── deploy/
│   └── deployScript.ts         # Deployment script
└── API_DOCUMENTATION.md        # API reference
```

---

## 🔧 Contract API

### Write Methods

| Method | Description |
|--------|-------------|
| `summarize(url)` | Summarize a URL with AI analysis |

### View Methods

| Method | Returns |
|--------|---------|
| `get_summary(url)` | Summary for a specific URL |
| `get_all_summaries()` | All stored summaries |
| `get_stats()` | Aggregate statistics |
| `get_submitter_summaries(address)` | Summaries by wallet |
| `get_summaries_by_category(category)` | Filter by category |
| `get_summaries_by_sentiment(sentiment)` | Filter by sentiment |

---

## 🔌 REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/summarize` | POST | Summarize a URL |
| `/api/summaries` | GET | Get summaries (with filters) |
| `/api/stats` | GET | Get statistics |
| `/api/transaction` | GET | Check transaction status |

### Example

```bash
# Summarize
curl -X POST https://your-domain.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# Get summaries
curl https://your-domain.com/api/summaries?category=Technology
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for full reference.

---

## 🧪 Testing

```bash
# Run unit tests (fast, in-memory)
pytest tests/direct/ -v
```

---

## 🚢 Deployment

### Vercel

```bash
vercel deploy
```

Set environment variables in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address |
| `CONTRACT_ADDRESS` | Deployed contract address |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_GENLAYER_CHAIN_ID` | `61999` |

---

## 🛠️ Tech Stack

- **Smart Contract**: Python (GenLayer Intelligent Contract)
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Blockchain**: GenLayer Studionet
- **SDK**: genlayer-js, wagmi, viem

---

## 📄 License

MIT

---

<p align="center">
  Built on <a href="https://genlayer.com">GenLayer</a> — AI-powered Intelligent Contracts
</p>
