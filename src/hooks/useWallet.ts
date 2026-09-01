"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectWallet,
  getAccounts,
  getChainId,
  hasEthereumProvider,
  onAccountsChanged,
  onChainChanged,
  STUDIONET_CHAIN_ID_HEX,
} from "@/lib/client";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    setHasProvider(hasEthereumProvider());
    getChainId().then(setChainId);
    getAccounts().then((accounts) => {
      if (accounts.length) setAddress(accounts[0]);
    });
  }, []);

  useEffect(() => {
    const offAccounts = onAccountsChanged((accounts) => {
      const next = accounts.length ? accounts[0] : null;
      setAddress(next);
    });
    const offChain = onChainChanged((id) => {
      setChainId(id);
    });
    return () => {
      offAccounts();
      offChain();
    };
  }, []);

  const connect = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setChainId(await getChainId());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet.");
    } finally {
      setBusy(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  const isRightNetwork =
    chainId != null && chainId.toLowerCase() === STUDIONET_CHAIN_ID_HEX.toLowerCase();

  return {
    address,
    hasProvider,
    busy,
    error,
    chainId,
    isRightNetwork,
    connect,
    disconnect,
  };
}
