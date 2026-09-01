"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  summarizeUrl,
  getSummary,
  getAllSummaries,
  getStats,
  waitForReceipt,
  connectWallet,
  getChainId,
  CONTRACT_ADDRESS,
  formatAddress,
  getCategoryColor,
  getSentimentColor,
  getSentimentEmoji,
  CATEGORIES,
} from "@/lib/client";

interface SummaryResult {
  url: string;
  summary: string;
  created_at: string;
  submitter: string;
  category: string;
  sentiment: string;
  word_count: number;
  language: string;
  key_points: string;
}

interface Stats {
  total_summaries: number;
  urls_by_domain: Record<string, number>;
  categories_count: Record<string, number>;
  sentiment_count: Record<string, number>;
}

export default function Home() {
  const wallet = useWallet();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const [allSummaries, setAllSummaries] = useState<Record<string, SummaryResult>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summarize" | "history" | "stats">("summarize");

  useEffect(() => {
    if (CONTRACT_ADDRESS) {
      loadData();
    }
  }, [CONTRACT_ADDRESS]);

  const loadData = async () => {
    try {
      const [summariesData, statsData] = await Promise.all([
        getAllSummaries(),
        getStats(),
      ]);
      setAllSummaries(summariesData || {});
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const handleSummarize = async () => {
    if (!url.trim() || !wallet.address) return;

    if (!wallet.isRightNetwork) {
      setError("Please switch to GenLayer StudioNet first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStatus("Sending transaction...");

    try {
      const txHash = await summarizeUrl(url, wallet.address);
      setStatus("Transaction sent. Waiting for consensus (60-90s)...");

      await waitForReceipt(txHash, 60, 5000);
      setStatus("Consensus reached! Fetching summary...");

      const summary = await getSummary(url);
      setResult(summary as SummaryResult);
      setStatus("Done!");

      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to summarize");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSummaries = () => {
    if (!selectedCategory) return allSummaries;
    return Object.fromEntries(
      Object.entries(allSummaries).filter(([_, s]) => s.category === selectedCategory)
    );
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📰 AI News Summarizer
        </h1>
        <p className="text-gray-400 text-lg">
          Powered by GenLayer — AI + Blockchain consensus
        </p>
        {CONTRACT_ADDRESS && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
            <span className="text-gray-500">Contract:</span>
            <a
              href={`https://explorer-studio.genlayer.com/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono"
            >
              {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
            </a>
            <a
              href={`https://explorer-studio.genlayer.com/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300"
            >
              ↗
            </a>
          </div>
        )}
        {!CONTRACT_ADDRESS && (
          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            ⚠️ Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env after deploying
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="mb-8 flex justify-center">
        {wallet.address ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {formatAddress(wallet.address)}
            </span>
            {!wallet.isRightNetwork && (
              <span className="text-xs text-yellow-400">Wrong network</span>
            )}
            <button
              onClick={wallet.disconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={wallet.connect}
            disabled={wallet.busy}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium transition"
          >
            {wallet.busy ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {/* Wallet error */}
      {wallet.error && (
        <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm text-center">
          {wallet.error}
        </div>
      )}

      {/* Wrong network */}
      {wallet.address && !wallet.isRightNetwork && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-center flex flex-col items-center gap-3">
          <span>⚠️ Wrong network. Please switch to GenLayer StudioNet.</span>
          <button
            onClick={async () => {
              try {
                await connectWallet();
                const newChain = await getChainId();
                window.location.reload();
              } catch (e) {
                console.error(e);
              }
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition"
          >
            Switch to GenLayer
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {(["summarize", "history", "stats"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Summarize Tab */}
      {activeTab === "summarize" && (
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
              disabled={loading || !url.trim() || !wallet.address || !wallet.isRightNetwork}
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

          {status && <p className="mt-3 text-sm text-blue-400">{status}</p>}

          {error && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-gray-900 rounded-xl p-6 border border-green-700 mb-8">
          <h2 className="text-lg font-semibold text-green-400 mb-4">✅ Summary</h2>
          <p className="text-gray-200 text-lg leading-relaxed mb-4">{result.summary}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block">Category</span>
              <span className={`inline-block px-2 py-1 rounded text-xs text-white ${getCategoryColor(result.category)}`}>
                {result.category}
              </span>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block">Sentiment</span>
              <span className={`text-sm font-medium ${getSentimentColor(result.sentiment)}`}>
                {getSentimentEmoji(result.sentiment)} {result.sentiment}
              </span>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block">Words</span>
              <span className="text-sm font-medium text-white">{result.word_count.toLocaleString()}</span>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <span className="text-xs text-gray-500 block">Language</span>
              <span className="text-sm font-medium text-white">{result.language}</span>
            </div>
          </div>

          {result.key_points && (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">📌 Key Points</h3>
              <div className="text-sm text-gray-300 whitespace-pre-line">{result.key_points}</div>
            </div>
          )}

          <div className="flex justify-between text-xs text-gray-500">
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 truncate max-w-[70%]">
              {result.url}
            </a>
            <span>{new Date(result.created_at).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm transition ${!selectedCategory ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries(getFilteredSummaries()).map(([url, summary]) => (
              <div key={url} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a href={summary.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm truncate block mb-2">
                      {summary.url}
                    </a>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{summary.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${getCategoryColor(summary.category)} text-white`}>{summary.category}</span>
                      <span className={getSentimentColor(summary.sentiment)}>{getSentimentEmoji(summary.sentiment)} {summary.sentiment}</span>
                      <span>{summary.word_count} words</span>
                      <span>{summary.language}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{new Date(summary.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {Object.keys(getFilteredSummaries()).length === 0 && (
              <div className="text-center text-gray-500 py-12">No summaries found. Start by summarizing a URL!</div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">📊 Total Summaries</h3>
            <div className="text-4xl font-bold text-blue-400">{stats.total_summaries}</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">📁 By Category</h3>
            <div className="space-y-2">
              {Object.entries(stats.categories_count).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{cat}</span>
                  <span className="text-sm font-medium text-white">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">😊 By Sentiment</h3>
            <div className="space-y-2">
              {Object.entries(stats.sentiment_count).map(([sent, count]) => (
                <div key={sent} className="flex items-center justify-between">
                  <span className={`text-sm ${getSentimentColor(sent)}`}>{getSentimentEmoji(sent)} {sent}</span>
                  <span className="text-sm font-medium text-white">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">🌐 By Domain</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(stats.urls_by_domain)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 10)
                .map(([domain, count]) => (
                  <div key={domain} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 truncate">{domain}</span>
                    <span className="text-sm font-medium text-white">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-gray-600 text-sm">
        Built on <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">GenLayer</a> — AI-powered Intelligent Contracts
      </footer>
    </main>
  );
}
