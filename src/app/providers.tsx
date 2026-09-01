"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const GENLAYER_CHAIN_ID = 61999;
const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export const GENLAYER_CHAIN_PARAMS = {
  chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}`,
  chainName: "GenLayer StudioNet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: ["https://explorer-studio.genlayer.com"],
};

const config = createConfig({
  chains: [
    {
      id: GENLAYER_CHAIN_ID,
      name: "GenLayer StudioNet",
      nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
      rpcUrls: {
        default: { http: [RPC_URL] },
        public: { http: [RPC_URL] },
      },
    } as any,
  ],
  connectors: [injected()],
  transports: {
    [GENLAYER_CHAIN_ID]: http(RPC_URL),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
