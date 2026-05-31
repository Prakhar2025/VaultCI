"use client";

import { useState } from "react";
import SearchBar from "@/components/memory/SearchBar";
import DecisionGraph from "@/components/memory/DecisionGraph";
import GlassCard from "@/components/ui/GlassCard";
import { searchMemory } from "@/lib/api";
import { MemoryResult } from "@/lib/types";
import { GitPullRequest, Quote } from "lucide-react";
import Link from "next/link";

const MOCK_RESULTS: MemoryResult[] = [
  {
    decision: "All database access must go through the Repository pattern layer. No direct SQL queries in API endpoints.",
    pr_number: 12,
    author: "prakhar",
    relevance_score: 0.94,
    decision_type: "RULE",
  },
  {
    decision: "Rejected use of raw psycopg2 connections. We standardized on SQLAlchemy AsyncSession.",
    pr_number: 45,
    author: "vaultci-bot",
    relevance_score: 0.81,
    decision_type: "PATTERN_REJECTED",
  }
];

export default function MemoryExplorerPage() {
  const [results, setResults] = useState<MemoryResult[]>(MOCK_RESULTS);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearched(true);
    
    // Try real API
    let res = await searchMemory("Prakhar2025/vaultci", query);
    
    // Fallback to mock for demo if API isn't up
    if (res.length === 0) {
      setTimeout(() => {
        setResults(MOCK_RESULTS);
        setLoading(false);
      }, 800);
    } else {
      setResults(res);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Architectural Memory Explorer</h1>
        <p className="text-zinc-400">Query the Qdrant vector database to understand why past PRs were approved or rejected.</p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={loading} />

      {searched && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Semantic Matches</h2>
            {results.map((r, i) => (
              <GlassCard key={i} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    r.decision_type === "RULE" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {r.decision_type}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Score: {r.relevance_score.toFixed(3)}
                  </span>
                </div>
                
                <div className="flex gap-3 mb-4">
                  <Quote className="w-5 h-5 text-brand-primary shrink-0 opacity-50 mt-1" />
                  <p className="text-zinc-200">{r.decision}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-zinc-500 border-t border-brand-surface-border pt-3">
                  <Link href={`/pr/${r.pr_number}`} className="flex items-center gap-1 hover:text-white transition-colors">
                    <GitPullRequest className="w-4 h-4" />
                    Source: PR #{r.pr_number}
                  </Link>
                  <span>@ {r.author}</span>
                </div>
              </GlassCard>
            ))}
          </div>

          <div>
            <h2 className="font-bold text-xl mb-4">Vector Space Visualization</h2>
            <DecisionGraph results={results} />
          </div>
        </div>
      )}
    </div>
  );
}
