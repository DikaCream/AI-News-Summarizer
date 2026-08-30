"use client";

import { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const studionetConfig = {
  id: 61999,
  name: "GenLayer Studio",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"],
    },
  },
};

const config = createConfig({
  chains: [studionetConfig as any],
  connectors: [injected()],
  transports: {
    [61999]: http(
      process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"
    ),
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
