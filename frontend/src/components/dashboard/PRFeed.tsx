"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAllReports } from "@/lib/api";
import { PRReport, GateType } from "@/lib/types";
import ScoreRing from "@/components/ui/ScoreRing";
import GateBadge from "@/components/ui/GateBadge";
import { GitBranch, Bot, User, Clock, RefreshCw } from "lucide-react";

// Realistic fallback data shown when backend is offline
const MOCK: PRReport[] = [
  {
    pr_number: 247, repo_id: "Prakhar2025/vaultci", is_ai_generated: true,
    trust_score: 0.34, gate_decision: "BLOCK",
    security_score: 0.38, arch_score: 0.22, blast_score: 0.55, rejected_score: 0.80,
    created_at: new Date(Date.now() - 120000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/auth/middleware.ts", risk: "CRITICAL" }, { file: "src/api/user.ts", risk: "HIGH" }],
      contradictions: [{ decision: "All auth must go through AuthService", pr_number: 88, author: "prakhar", relevance_score: 0.94, decision_type: "ARCH_RULE" }],
      explanation: "This AI-generated PR introduces direct JWT validation bypassing the central AuthService — contradicts architectural rule from PR #88.",
    },
  },
  {
    pr_number: 246, repo_id: "Prakhar2025/vaultci", is_ai_generated: false,
    trust_score: 0.91, gate_decision: "TRUSTED",
    security_score: 1.0, arch_score: 0.95, blast_score: 0.88, rejected_score: 1.0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/components/Button.tsx", risk: "LOW" }],
      contradictions: [],
      explanation: "Safe UI component update. No security or architectural issues detected.",
    },
  },
  {
    pr_number: 245, repo_id: "Prakhar2025/vaultci", is_ai_generated: true,
    trust_score: 0.71, gate_decision: "REVIEW",
    security_score: 0.88, arch_score: 0.75, blast_score: 0.44, rejected_score: 0.90,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/lib/db.ts", risk: "MEDIUM" }, { file: "src/lib/cache.ts", risk: "LOW" }],
      contradictions: [],
      explanation: "High blast radius — this utility is imported by 14 modules. Manual review recommended before merging.",
    },
  },
  {
    pr_number: 244, repo_id: "Prakhar2025/vaultci", is_ai_generated: true,
    trust_score: 0.52, gate_decision: "CAUTION",
    security_score: 0.60, arch_score: 0.48, blast_score: 0.62, rejected_score: 0.55,
    created_at: new Date(Date.now() - 18000000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/database/queries.ts", risk: "HIGH" }, { file: "src/models/user.ts", risk: "MEDIUM" }],
      contradictions: [{ decision: "All DB access must use repository layer", pr_number: 201, author: "alex", relevance_score: 0.81, decision_type: "ARCH_RULE" }],
      explanation: "Direct database query pattern detected. Possible violation of repository layer rule established in PR #201.",
    },
  },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981",
};

interface Props {
  owner: string;
  repo: string;
}

export default function PRFeed({ owner, repo }: Props) {
  const router = useRouter();
  const [prs, setPrs] = useState<PRReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    const data = await fetchAllReports(owner, repo, 10);
    if (data.length > 0) {
      setPrs(data);
      setLive(true);
    } else {
      setPrs(MOCK);
      setLive(false);
    }
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [owner, repo]);

  return (
    <div className="space-y-3">
      {/* Feed header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`pulse-dot ${live ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span className="font-label text-[10px] text-zinc-500">
            {live ? "LIVE · REAL DATA" : "DEMO MODE · BACKEND OFFLINE"}
          </span>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </button>
      </div>

      {/* PR Cards */}
      {prs.map((pr, i) => (
        <div
          key={pr.pr_number}
          onClick={() => router.push(`/pr/${pr.pr_number}`)}
          className="glass glass-hover rounded-2xl p-5 cursor-pointer"
          style={{
            animation: `fade-up 0.4s ease ${i * 60}ms both`,
            borderColor: pr.gate_decision === "BLOCK" ? "rgba(239,68,68,0.2)" : undefined,
          }}
        >
          <div className="flex items-center gap-4">
            {/* Score Ring */}
            <ScoreRing
              score={pr.trust_score}
              gate={pr.gate_decision}
              size={64}
              strokeWidth={5}
            />

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <GitBranch className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                <span className="font-mono text-sm text-zinc-300 font-semibold">PR #{pr.pr_number}</span>
                {pr.is_ai_generated && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <Bot className="w-2.5 h-2.5" /> AI
                  </span>
                )}
                {!pr.is_ai_generated && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <User className="w-2.5 h-2.5" /> Human
                  </span>
                )}
                <GateBadge gate={pr.gate_decision} size="sm" />
              </div>

              {/* Explanation preview */}
              <p className="text-sm text-zinc-500 truncate leading-relaxed">
                {pr.report_json?.explanation || "Analysis complete."}
              </p>

              {/* File risks */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {(pr.report_json?.file_map ?? []).slice(0, 3).map(f => (
                  <span
                    key={f.file}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: `${RISK_COLOR[f.risk]}12`,
                      color: RISK_COLOR[f.risk],
                      border: `1px solid ${RISK_COLOR[f.risk]}25`,
                    }}
                  >
                    {f.file.split("/").pop()} · {f.risk}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: time + score bars */}
            <div className="hidden md:flex flex-col items-end gap-3 flex-shrink-0">
              <div className="flex items-center gap-1 text-zinc-600 text-xs">
                <Clock className="w-3 h-3" />
                {timeAgo(pr.created_at)}
              </div>
              <div className="space-y-1 w-24">
                {[
                  { label: "Sec", val: pr.security_score, color: "#ef4444" },
                  { label: "Arch", val: pr.arch_score, color: "#8b5cf6" },
                  { label: "Blast", val: pr.blast_score, color: "#f59e0b" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="font-label text-[8px] text-zinc-700 w-6">{label}</span>
                    <div className="flex-1 h-0.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${val * 100}%`, background: color }}
                      />
                    </div>
                    <span className="font-mono text-[9px]" style={{ color }}>{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {loading && prs.length === 0 && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-24 shimmer" />
          ))}
        </div>
      )}
    </div>
  );
}
