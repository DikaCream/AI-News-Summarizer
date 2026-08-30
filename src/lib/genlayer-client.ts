import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export const genlayerClient = createClient({
  chain: studionet,
});

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export async function summarizeUrl(url: string): Promise<string> {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const txHash = await genlayerClient.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "summarize",
    args: [url],
    value: 0n,
  });

  return txHash as string;
}

export async function getSummary(url: string) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not configured");
  }

  const result = await genlayerClient.readContract({
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

  const result = await genlayerClient.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_all_summaries",
    args: [],
  });

  return result as any;
}

export async function waitForTransaction(
  txHash: string,
  maxRetries = 100,
  intervalMs = 3000
) {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const tx = await genlayerClient.getTransaction({
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
