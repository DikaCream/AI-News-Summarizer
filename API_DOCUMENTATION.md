# AI News Summarizer - API Documentation

## Overview

This API provides external access to the AI News Summarizer built on GenLayer. It allows developers to integrate AI-powered news summarization with blockchain consensus into their applications.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently, the API is open. For production use, implement API key authentication.

## Endpoints

### 1. Summarize URL

**POST** `/api/summarize`

Summarize a news article or web page using AI with blockchain consensus.

**Request Body:**
```json
{
  "url": "https://example.com/article"
}
```

**Response (Success):**
```json
{
  "success": true,
  "txHash": "0x...",
  "message": "Transaction sent. Waiting for consensus..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid URL format"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request (missing/invalid URL)
- `500` - Server error

---

### 2. Get Summaries

**GET** `/api/summaries`

Retrieve summaries with optional filters.

**Query Parameters:**
- `url` (optional) - Get specific summary by URL
- `category` (optional) - Filter by category
- `sentiment` (optional) - Filter by sentiment

**Examples:**

```bash
# Get all summaries
GET /api/summaries

# Get specific summary
GET /api/summaries?url=https://example.com/article

# Get summaries by category
GET /api/summaries?category=Technology

# Get summaries by sentiment
GET /api/summaries?sentiment=Positive
```

**Response (All Summaries):**
```json
{
  "https://example.com/article1": {
    "url": "https://example.com/article1",
    "summary": "This article discusses...",
    "created_at": "2024-01-15T10:30:00",
    "submitter": "0x...",
    "category": "Technology",
    "sentiment": "Positive",
    "word_count": 1500,
    "language": "English",
    "key_points": "• Point 1\n• Point 2\n• Point 3"
  }
}
```

**Response (Single Summary):**
```json
{
  "url": "https://example.com/article",
  "summary": "This article discusses...",
  "created_at": "2024-01-15T10:30:00",
  "submitter": "0x...",
  "category": "Technology",
  "sentiment": "Positive",
  "word_count": 1500,
  "language": "English",
  "key_points": "• Point 1\n• Point 2\n• Point 3"
}
```

**Status Codes:**
- `200` - Success
- `404` - Summary not found
- `500` - Server error

---

### 3. Get Statistics

**GET** `/api/stats`

Get overall statistics about summarized content.

**Response:**
```json
{
  "total_summaries": 42,
  "urls_by_domain": {
    "example.com": 15,
    "news.site.com": 10,
    "blog.example.org": 8
  },
  "categories_count": {
    "Technology": 20,
    "Business": 12,
    "Science": 10
  },
  "sentiment_count": {
    "Positive": 18,
    "Neutral": 15,
    "Negative": 9
  }
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### 4. Get Transaction Status

**GET** `/api/transaction?hash=0x...`

Check the status of a summarization transaction.

**Query Parameters:**
- `hash` (required) - Transaction hash

**Response:**
```json
{
  "hash": "0x...",
  "status": "ACCEPTED",
  "details": {
    // Full transaction details
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing hash parameter
- `500` - Server error

---

## Data Models

### Summary Object

```typescript
interface Summary {
  url: string;           // Original URL
  summary: string;       // AI-generated summary
  created_at: string;    // ISO timestamp
  submitter: string;     // Wallet address of submitter
  category: string;      // Auto-categorized (Technology, Business, etc.)
  sentiment: string;     // Auto-detected (Positive, Negative, Neutral, Mixed)
  word_count: number;    // Approximate word count of original content
  language: string;      // Detected language
  key_points: string;    // 3-4 bullet points
}
```

### Categories

- Technology
- Business
- Science
- Health
- Sports
- Entertainment
- Politics
- Other

### Sentiments

- Positive 😊
- Negative 😞
- Neutral 😐
- Mixed 🤔

---

## Usage Examples

### cURL

```bash
# Summarize a URL
curl -X POST https://your-domain.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# Get all summaries
curl https://your-domain.com/api/summaries

# Get summaries by category
curl "https://your-domain.com/api/summaries?category=Technology"

# Get statistics
curl https://your-domain.com/api/stats
```

### JavaScript/TypeScript

```typescript
// Summarize a URL
const summarize = async (url: string) => {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return response.json();
};

// Get summaries
const getSummaries = async (filters?: { category?: string; sentiment?: string }) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/summaries?${params}`);
  return response.json();
};

// Get statistics
const getStats = async () => {
  const response = await fetch('/api/stats');
  return response.json();
};
```

### Python

```python
import requests

# Summarize a URL
response = requests.post(
    'https://your-domain.com/api/summarize',
    json={'url': 'https://example.com/article'}
)
print(response.json())

# Get summaries
response = requests.get('https://your-domain.com/api/summaries')
print(response.json())

# Get statistics
response = requests.get('https://your-domain.com/api/stats')
print(response.json())
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

Common error codes:
- `400` - Bad request (missing parameters, invalid format)
- `404` - Resource not found
- `500` - Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting based on API keys or IP addresses.

---

## Blockchain Consensus

All summaries are stored on the GenLayer blockchain with the following guarantees:

1. **AI Analysis** - Content is analyzed by AI models
2. **Validator Consensus** - Multiple validators reach consensus on the summary
3. **Immutable Storage** - Once stored, summaries cannot be modified
4. **Verifiable** - All summaries can be verified on-chain

---

## Environment Variables

```env
CONTRACT_ADDRESS=0x...  # Your deployed contract address
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
```

---

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
- `CONTRACT_ADDRESS` - Your deployed contract address
- `NEXT_PUBLIC_GENLAYER_RPC_URL` - GenLayer RPC URL
- `NEXT_PUBLIC_GENLAYER_CHAIN_ID` - GenLayer chain ID
