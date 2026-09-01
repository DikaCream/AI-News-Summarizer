import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export function createGenLayerClient(account: `0x${string}`) {
  return createClient({
    chain: studionet,
    account,
  });
}

// ============ Write Functions ============

export async function summarizeUrl(url: string, account: `0x${string}`): Promise<string> {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient(account);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "summarize",
    args: [url],
    value: 0n,
  });

  return txHash as string;
}

// ============ Read Functions ============

export async function getSummary(url: string) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_summary",
    args: [url],
  });

  return result as any;
}

export async function getAllSummaries() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_all_summaries",
    args: [],
  });

  return result as any;
}

export async function getStats() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_stats",
    args: [],
  });

  return result as any;
}

export async function getSubmitterSummaries(submitter: string) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_submitter_summaries",
    args: [submitter],
  });

  return result as any;
}

export async function getSummariesByCategory(category: string) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_summaries_by_category",
    args: [category],
  });

  return result as any;
}

export async function getSummariesBySentiment(sentiment: string) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_summaries_by_sentiment",
    args: [sentiment],
  });

  return result as any;
}

// ============ Transaction Utilities ============

export async function waitForTransaction(
  txHash: string,
  maxRetries = 100,
  intervalMs = 3000
) {
  const client = createGenLayerClient("0x0000000000000000000000000000000000000000");
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const tx = await client.getTransaction({
        hash: txHash as any,
      });
      const status = (tx as any)?.statusName || (tx as any)?.status;

      if (
        status === "ACCEPTED" ||
        status === 5 ||
        status === "FINALIZED" ||
        status === 7
      ) {
        return tx;
      }
    } catch (e) {
      // Keep trying
    }
  }
  throw new Error("Transaction timed out");
}

// ============ Helper Functions ============

export const CATEGORIES = [
  "Technology",
  "Business",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Politics",
  "Other",
];

export const SENTIMENTS = ["Positive", "Negative", "Neutral", "Mixed"];

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Technology: "bg-blue-500",
    Business: "bg-green-500",
    Science: "bg-purple-500",
    Health: "bg-red-500",
    Sports: "bg-orange-500",
    Entertainment: "bg-pink-500",
    Politics: "bg-yellow-500",
    Other: "bg-gray-500",
  };
  return colors[category] || "bg-gray-500";
}

export function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    Positive: "text-green-400",
    Negative: "text-red-400",
    Neutral: "text-gray-400",
    Mixed: "text-yellow-400",
  };
  return colors[sentiment] || "text-gray-400";
}

export function getSentimentEmoji(sentiment: string): string {
  const emojis: Record<string, string> = {
    Positive: "😊",
    Negative: "😞",
    Neutral: "😐",
    Mixed: "🤔",
  };
  return emojis[sentiment] || "😐";
}
