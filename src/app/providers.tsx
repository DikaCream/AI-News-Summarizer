"use client";

import { ReactNode, useEffect } from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useSwitchChain,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const GENLAYER_CHAIN_ID = 61999;

const studionetConfig = {
  id: GENLAYER_CHAIN_ID,
  name: "GenLayer StudioNet",
  network: "studionet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: "https://explorer-studio.genlayer.com",
    },
  },
};

const config = createConfig({
  chains: [studionetConfig as any],
  connectors: [injected()],
  transports: {
    [GENLAYER_CHAIN_ID]: http(
      process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"
    ),
  },
});

const queryClient = new QueryClient();

function AutoSwitchChain() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (chain && chain.id !== GENLAYER_CHAIN_ID) {
      switchChain({ chainId: GENLAYER_CHAIN_ID });
    }
  }, [chain, switchChain]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoSwitchChain />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
