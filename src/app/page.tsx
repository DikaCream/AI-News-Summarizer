"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  summarizeUrl,
  getSummary,
  waitForTransaction,
  CONTRACT_ADDRESS,
} from "@/lib/genlayer-client";

interface SummaryResult {
  url: string;
  summary: string;
  created_at: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleSummarize = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus("Sending transaction...");

    try {
      // 1. Send write transaction
      const txHash = await summarizeUrl(url);
      setStatus("Transaction sent. Waiting for consensus (60-90s)...");

      // 2. Wait for finalization
      await waitForTransaction(txHash);
      setStatus("Consensus reached! Fetching summary...");

      // 3. Read the result
      const summary = await getSummary(url);
      setResult(summary as SummaryResult);
      setStatus("Done!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to summarize");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          📰 AI News Summarizer
        </h1>
        <p className="text-gray-400 text-lg">
          Powered by GenLayer — AI + Blockchain consensus
        </p>
        {!CONTRACT_ADDRESS && (
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            ⚠️ Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env after deploying
          </div>
        )}
      </div>

      {/* Wallet Connect */}
      <div className="mb-8 flex justify-center">
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Summarize Form */}
      <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Enter URL to summarize
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            disabled={loading}
          />
          <button
            onClick={handleSummarize}
            disabled={loading || !url.trim() || !isConnected}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Processing...
              </>
            ) : (
              "Summarize"
            )}
          </button>
        </div>

        {/* Status */}
        {status && (
          <p className="mt-3 text-sm text-blue-400">{status}</p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-gray-900 rounded-xl p-6 border border-green-700">
          <h2 className="text-lg font-semibold text-green-400 mb-3">
            ✅ Summary
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed mb-4">
            {result.summary}
          </p>
          <div className="flex justify-between text-xs text-gray-500">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 truncate max-w-[70%]"
            >
              {result.url}
            </a>
            <span>{new Date(result.created_at).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-600 text-sm">
        Built on{" "}
        <a
          href="https://genlayer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          GenLayer
        </a>{" "}
        — AI-powered Intelligent Contracts
      </footer>
    </main>
  );
}
