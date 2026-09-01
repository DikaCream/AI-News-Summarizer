import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export const STUDIONET_CHAIN_ID = 61999;
export const STUDIONET_CHAIN_ID_HEX = "0xF23F";

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

export function hasEthereumProvider(): boolean {
  return !!getProvider();
}

export async function requestAccounts(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) throw new Error("No injected wallet found. Install MetaMask.");
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  return accounts;
}

export async function getAccounts(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) return [];
  try {
    return (await provider.request({ method: "eth_accounts" })) as string[];
  } catch {
    return [];
  }
}

export async function getChainId(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    return (await provider.request({ method: "eth_chainId" })) as string;
  } catch {
    return null;
  }
}

export function onAccountsChanged(
  handler: (accounts: string[]) => void,
): () => void {
  const provider = getProvider();
  if (!provider?.on) return () => {};
  provider.on("accountsChanged", handler as (...args: unknown[]) => void);
  return () =>
    provider.removeListener?.(
      "accountsChanged",
      handler as (...args: unknown[]) => void,
    );
}

export function onChainChanged(handler: (chainId: string) => void): () => void {
  const provider = getProvider();
  if (!provider?.on) return () => {};
  provider.on("chainChanged", handler as (...args: unknown[]) => void);
  return () =>
    provider.removeListener?.(
      "chainChanged",
      handler as (...args: unknown[]) => void,
    );
}

async function addStudionet(provider: EthereumProvider) {
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: STUDIONET_CHAIN_ID_HEX,
        chainName: "GenLayer Studio",
        nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
        rpcUrls: [RPC_URL],
        blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
      },
    ],
  });
}

async function switchToStudionet(provider: EthereumProvider) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    });
  } catch (err: any) {
    if (err?.code === 4902) await addStudionet(provider);
    else throw err;
  }
}

async function ensureNetwork(provider: EthereumProvider) {
  const chainId = (await provider.request({ method: "eth_chainId" })) as string;
  const current = parseInt(chainId, 16);
  if (current !== STUDIONET_CHAIN_ID) {
    await switchToStudionet(provider);
  }
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider) throw new Error("No injected wallet found. Install MetaMask.");
  const accounts = await requestAccounts();
  if (!accounts.length) throw new Error("No accounts available.");
  try {
    await ensureNetwork(provider);
  } catch (err: any) {
    if (err?.code === 4001) throw new Error("Connection cancelled.");
    console.warn("Could not switch network:", err);
  }
  return accounts[0];
}

export function createGenLayerClient(address?: string | null) {
  const config: any = { chain: studionet };
  if (address) config.account = address as `0x${string}`;
  if (RPC_URL) config.endpoint = RPC_URL;
  return createClient(config);
}

// ============ Contract Functions ============

export async function summarizeUrl(url: string, address: string): Promise<string> {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
  const client = createGenLayerClient(address);
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "summarize",
    args: [url],
    value: 0n,
  });
  return txHash as string;
}

export async function getSummary(url: string) {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
  const client = createGenLayerClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_summary",
    args: [url],
  });
  return result as any;
}

export async function getAllSummaries() {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
  const client = createGenLayerClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_all_summaries",
    args: [],
  });
  return result as any;
}

export async function getStats() {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
  const client = createGenLayerClient();
  const result = await client.readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: "get_stats",
    args: [],
  });
  return result as any;
}

export async function waitForReceipt(
  txHash: string,
  retries = 40,
  interval = 3000,
) {
  const client = createGenLayerClient();
  return client.waitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    status: "ACCEPTED" as any,
    retries,
    interval,
  });
}

// ============ Helpers ============

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export const CATEGORIES = [
  "Technology", "Business", "Science", "Health", "Sports", "Entertainment", "Politics", "Other",
];
export const SENTIMENTS = ["Positive", "Negative", "Neutral", "Mixed"];

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Technology: "bg-blue-500", Business: "bg-green-500", Science: "bg-purple-500",
    Health: "bg-red-500", Sports: "bg-orange-500", Entertainment: "bg-pink-500",
    Politics: "bg-yellow-500", Other: "bg-gray-500",
  };
  return colors[category] || "bg-gray-500";
}

export function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    Positive: "text-green-400", Negative: "text-red-400",
    Neutral: "text-gray-400", Mixed: "text-yellow-400",
  };
  return colors[sentiment] || "text-gray-400";
}

export function getSentimentEmoji(sentiment: string): string {
  const emojis: Record<string, string> = {
    Positive: "😊", Negative: "😞", Neutral: "😐", Mixed: "🤔",
  };
  return emojis[sentiment] || "😐";
}
