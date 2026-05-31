"use client";

import { useState, useRef, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { searchMemory, postDecision } from "@/lib/api";
import { MemoryResult } from "@/lib/types";
import {
  Brain, Search, Plus, CheckCircle2, Loader2,
  AlertCircle, GitBranch, Clock, ChevronRight,
} from "lucide-react";

const EXAMPLE_QUERIES = [
  "why did we stop using direct SQL queries?",
  "authentication service decisions",
  "database access patterns",
  "API error handling rules",
];

const REPO_ID = "Prakhar2025/vaultci";

const DECISION_TYPES = ["ARCH_RULE", "PATTERN_ADOPTED", "PATTERN_REJECTED", "SECURITY_RULE"];

const RELEVANCE_COLOR = (score: number) =>
  score >= 0.85 ? "#10b981" : score >= 0.70 ? "#f59e0b" : "#6b7280";

export default function MemoryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Add decision form
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [decisionText, setDecisionText] = useState("");
  const [decisionType, setDecisionType] = useState("ARCH_RULE");
  const [codeContext, setCodeContext] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    const data = await searchMemory(REPO_ID, q.trim(), 8);
    setResults(data);
    setLoading(false);
  };

  const handleAddDecision = async () => {
    if (!decisionText.trim()) return;
    setAddLoading(true);
    const res = await postDecision({
      repo_id: REPO_ID,
      decision_text: decisionText,
      decision_type: decisionType,
      code_context: codeContext || undefined,
    });
    setAddResult(res);
    setAddLoading(false);
    if (res.success) {
      setDecisionText("");
      setCodeContext("");
      setTimeout(() => { setShowAdd(false); setAddResult(null); }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="font-label text-[10px] text-violet-400">ARCHITECTURAL MEMORY</span>
        </div>
        <h1 className="font-display text-4xl text-white">Memory Explorer</h1>
        <p className="text-zinc-500 mt-2 text-sm leading-relaxed max-w-xl">
          Semantic search over every architectural decision ever made in this repository.
          Ask in plain English — VaultCI searches Qdrant vector embeddings to find the answer.
        </p>
      </div>

      {/* Search Bar */}
      <GlassCard className="p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              ref={inputRef}
              className="vault-input pl-10"
              placeholder="Why did we decide to use the repository pattern for DB access?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
            />
          </div>
          <button className="btn-primary flex-shrink-0" onClick={() => doSearch()} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {/* Example queries */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="font-label text-[9px] text-zinc-700 self-center">TRY:</span>
          {EXAMPLE_QUERIES.map(eq => (
            <button
              key={eq}
              className="text-xs px-3 py-1.5 rounded-full glass border border-violet-500/10 text-zinc-500 hover:text-violet-300 hover:border-violet-500/30 transition-colors"
              onClick={() => { setQuery(eq); doSearch(eq); }}
            >
              {eq}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Results */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-24 shimmer" />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <GlassCard className="p-10 text-center">
          <Brain className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No memories found matching that query.</p>
          <p className="text-zinc-700 text-xs mt-1">Try a broader search, or add a new architectural decision below.</p>
        </GlassCard>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-label text-[10px] text-zinc-600">
              {results.length} RESULTS · RANKED BY SEMANTIC SIMILARITY
            </p>
          </div>
          {results.map((r, i) => {
            const typeColor: Record<string, string> = {
              ARCH_RULE: "#8b5cf6",
              PATTERN_ADOPTED: "#10b981",
              PATTERN_REJECTED: "#ef4444",
              SECURITY_RULE: "#f59e0b",
            };
            const c = typeColor[r.decision_type] || "#6b7280";
            return (
              <GlassCard
                key={i}
                className="p-5 opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="font-label text-[9px] px-2 py-0.5 rounded-full border"
                        style={{ color: c, background: `${c}10`, borderColor: `${c}30` }}
                      >
                        {r.decision_type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-600">
                        <GitBranch className="w-3 h-3" /> PR #{r.pr_number}
                      </span>
                      <span className="text-xs text-zinc-700">by {r.author}</span>
                    </div>
                    <p className="text-sm text-zinc-200 leading-relaxed font-medium">{r.decision}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: RELEVANCE_COLOR(r.relevance_score) }}
                    >
                      {(r.relevance_score * 100).toFixed(0)}%
                    </span>
                    <span className="font-label text-[8px] text-zinc-700">MATCH</span>
                  </div>
                </div>
                <div
                  className="h-0.5 mt-4 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${c}50 ${r.relevance_score * 100}%, rgba(255,255,255,0.03) ${r.relevance_score * 100}%)`,
                  }}
                />
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Decision */}
      <div>
        <button
          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors mb-4"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="w-4 h-4" />
          {showAdd ? "Cancel" : "Add New Architectural Decision"}
          <ChevronRight className={`w-3 h-3 transition-transform ${showAdd ? "rotate-90" : ""}`} />
        </button>

        {showAdd && (
          <GlassCard className="p-6 animate-scale-up" glow="rgba(139,92,246,0.06)">
            <p className="font-label text-[10px] text-zinc-600 mb-5">NEW ARCHITECTURAL DECISION</p>
            <div className="space-y-4">
              <div>
                <label className="font-label text-[10px] text-zinc-500 block mb-2">DECISION TYPE</label>
                <div className="flex flex-wrap gap-2">
                  {DECISION_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setDecisionType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        decisionType === t
                          ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                          : "glass border-[rgba(139,92,246,0.1)] text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-label text-[10px] text-zinc-500 block mb-2">DECISION TEXT *</label>
                <textarea
                  className="vault-input resize-none h-24"
                  placeholder="All database access must go through the repository layer. Direct SQL queries are forbidden outside of migration scripts."
                  value={decisionText}
                  onChange={e => setDecisionText(e.target.value)}
                />
              </div>
              <div>
                <label className="font-label text-[10px] text-zinc-500 block mb-2">CODE CONTEXT (optional)</label>
                <textarea
                  className="vault-input font-mono text-xs resize-none h-16"
                  placeholder="// Example of correct pattern..."
                  value={codeContext}
                  onChange={e => setCodeContext(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleAddDecision}
                disabled={addLoading || !decisionText.trim()}
              >
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Save to Memory
              </button>
              {addResult && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
                  addResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {addResult.success
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <AlertCircle className="w-4 h-4" />}
                  {addResult.success ? "Decision saved to Qdrant memory!" : addResult.message}
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
