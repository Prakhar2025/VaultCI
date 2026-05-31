"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import ScoreRing from "@/components/ui/ScoreRing";
import GateBadge from "@/components/ui/GateBadge";
import { PRReport, GateType } from "@/lib/types";
import {
  ArrowLeft, Shield, Brain, Activity, Lock, Bot,
  GitBranch, AlertTriangle, CheckCircle2, ChevronRight,
  Clock, User,
} from "lucide-react";

const OWNER = "Prakhar2025";
const REPO  = "vaultci";

const MOCK_PRS: Record<number, PRReport> = {
  247: {
    pr_number: 247, repo_id: "Prakhar2025/vaultci", is_ai_generated: true,
    trust_score: 0.34, gate_decision: "BLOCK",
    security_score: 0.38, arch_score: 0.22, blast_score: 0.55, rejected_score: 0.80,
    created_at: new Date(Date.now() - 120000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/auth/middleware.ts", risk: "CRITICAL" }, { file: "src/api/user.ts", risk: "HIGH" }, { file: "src/lib/jwt.ts", risk: "HIGH" }],
      contradictions: [{ decision: "All auth must go through AuthService — no direct JWT handling in middleware", pr_number: 88, author: "prakhar", relevance_score: 0.94, decision_type: "ARCH_RULE" }],
      explanation: "This AI-generated PR introduces direct JWT validation in middleware, bypassing the central AuthService. This directly contradicts architectural rule established in PR #88 (similarity score: 0.94). Critical security vulnerability detected: authentication bypass risk.",
      override_applied: "CRITICAL_SECURITY_FLAG",
    },
  },
  246: {
    pr_number: 246, repo_id: "Prakhar2025/vaultci", is_ai_generated: false,
    trust_score: 0.91, gate_decision: "TRUSTED",
    security_score: 1.0, arch_score: 0.95, blast_score: 0.88, rejected_score: 1.0,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/components/Button.tsx", risk: "LOW" }],
      contradictions: [],
      explanation: "Safe UI component update. No security vulnerabilities detected. No architectural contradictions. Low blast radius — only 1 module affected. Human-written code, standard thresholds applied.",
    },
  },
  245: {
    pr_number: 245, repo_id: "Prakhar2025/vaultci", is_ai_generated: true,
    trust_score: 0.71, gate_decision: "REVIEW",
    security_score: 0.88, arch_score: 0.75, blast_score: 0.44, rejected_score: 0.90,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    report_json: {
      weights: { security: 0.35, arch: 0.30, blast: 0.20, rejected: 0.10, ai_origin: 0.05 },
      file_map: [{ file: "src/lib/db.ts", risk: "MEDIUM" }, { file: "src/lib/cache.ts", risk: "LOW" }],
      contradictions: [],
      explanation: "High blast radius detected — this utility file is imported by 14 downstream modules. Any regression here would cascade. AI-generated code, stricter threshold applied. Manual review recommended before merging.",
    },
  },
};

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981",
};

const LAYER_CONFIG = [
  { key: "security",  label: "Security Analysis",    icon: Shield,   color: "#ef4444", desc: "AST-level security pattern matching" },
  { key: "arch",      label: "Architecture Memory",  icon: Brain,    color: "#8b5cf6", desc: "Qdrant vector contradiction detection" },
  { key: "blast",     label: "Blast Radius",         icon: Activity, color: "#f59e0b", desc: "Dependency graph impact score" },
  { key: "rejected",  label: "Pattern Memory",       icon: Lock,     color: "#06b6d4", desc: "Rejected pattern database search" },
];

function ScoreBar({ label, value, color, desc }: { label: string; value: number; color: string; desc: string; icon: React.ComponentType<{ className?: string }> }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(value * 100), 150); }, [value]);

  return (
    <div className="p-4 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-zinc-200">{label}</p>
          <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
        </div>
        <span className="font-mono text-lg font-bold" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>
  );
}

export default function PRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pr, setPr] = useState<PRReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/report/${OWNER}/${REPO}/${id}`,
          { cache: "no-store" }
        );
        if (res.ok) { setPr(await res.json()); setLoading(false); return; }
      } catch {/* fallback */}
      // Use demo data
      const n = parseInt(id);
      setPr(MOCK_PRS[n] ?? {
        ...MOCK_PRS[247],
        pr_number: n,
        trust_score: 0.34 + Math.random() * 0.5,
      });
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-32 shimmer" />)}
    </div>
  );

  if (!pr) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <AlertTriangle className="w-12 h-12 text-amber-400" />
      <p className="text-xl font-bold text-zinc-300">PR #{id} not found</p>
      <button className="btn-ghost" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
    </div>
  );

  const gateConfig: Record<GateType, { label: string; color: string; desc: string; icon: typeof CheckCircle2 }> = {
    TRUSTED: { label: "Auto-Merge Eligible", color: "#10b981", desc: "Safe to merge. No critical issues found.", icon: CheckCircle2 },
    REVIEW:  { label: "Human Review Required", color: "#f59e0b", desc: "Minor concerns. Spot-check flagged areas before merging.", icon: AlertTriangle },
    CAUTION: { label: "Detailed Review Required", color: "#f97316", desc: "Architectural concerns detected. Senior review needed.", icon: AlertTriangle },
    BLOCK:   { label: "Merge Blocked", color: "#ef4444", desc: "Critical vulnerabilities or architectural contradictions found. Do not merge.", icon: AlertTriangle },
  };
  const gCfg = gateConfig[pr.gate_decision];
  const GIcon = gCfg.icon;

  const scores: Record<string, number> = {
    security: pr.security_score ?? 0,
    arch:     pr.arch_score ?? 0,
    blast:    pr.blast_score ?? 0,
    rejected: pr.rejected_score ?? 0,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Hero Card */}
      <GlassCard
        className="p-8"
        glow={`${gCfg.color}12`}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="flex-1">
            {/* PR Meta */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <GitBranch className="w-4 h-4 text-zinc-600" />
              <span className="font-mono text-lg font-bold text-zinc-200">PR #{pr.pr_number}</span>
              {pr.is_ai_generated
                ? <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20"><Bot className="w-3 h-3" />AI Generated</span>
                : <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><User className="w-3 h-3" />Human Written</span>
              }
              <GateBadge gate={pr.gate_decision} size="lg" />
              {pr.report_json?.override_applied && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                  OVERRIDE: {pr.report_json.override_applied}
                </span>
              )}
            </div>

            {/* Gate verdict */}
            <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ background: `${gCfg.color}08`, border: `1px solid ${gCfg.color}20` }}>
              <GIcon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: gCfg.color }} />
              <div>
                <p className="font-bold text-sm" style={{ color: gCfg.color }}>{gCfg.label}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{gCfg.desc}</p>
              </div>
            </div>

            {/* Explanation */}
            <div className="glass rounded-xl p-4">
              <p className="font-label text-[10px] text-violet-400 mb-2">GROQ AI EXPLANATION</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{pr.report_json?.explanation}</p>
            </div>
          </div>

          {/* Score Ring */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <ScoreRing score={pr.trust_score} gate={pr.gate_decision} size={120} strokeWidth={8} showLabel />
            <div className="text-center">
              <p className="font-label text-[9px] text-zinc-600">COMPOSITE TRUST SCORE</p>
              <div className="flex items-center gap-1 mt-1 justify-center">
                <Clock className="w-3 h-3 text-zinc-700" />
                <span className="text-xs text-zinc-700">
                  {new Date(pr.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Layer Breakdown + Contradictions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Layer Scores */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-violet-400" />
              <h2 className="text-lg font-bold text-white">5-Layer Analysis</h2>
            </div>
            <div className="space-y-3">
              {LAYER_CONFIG.map(layer => (
                <ScoreBar
                  key={layer.key}
                  label={layer.label}
                  value={scores[layer.key] ?? 0}
                  color={layer.color}
                  desc={layer.desc}
                  icon={layer.icon}
                />
              ))}
            </div>
          </div>

          {/* Contradictions */}
          {(pr.report_json?.contradictions ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-violet-400" />
                <h2 className="text-lg font-bold text-white">Memory Contradictions</h2>
              </div>
              <div className="space-y-3">
                {(pr.report_json.contradictions ?? []).map((c, i) => (
                  <GlassCard key={i} className="p-5" glow="rgba(239,68,68,0.06)">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span
                          className="font-label text-[9px] px-2 py-0.5 rounded-full border"
                          style={{
                            color: c.decision_type === "ARCH_RULE" ? "#8b5cf6" : "#ef4444",
                            background: c.decision_type === "ARCH_RULE" ? "rgba(139,92,246,0.1)" : "rgba(239,68,68,0.1)",
                            borderColor: c.decision_type === "ARCH_RULE" ? "rgba(139,92,246,0.3)" : "rgba(239,68,68,0.3)",
                          }}
                        >
                          {c.decision_type}
                        </span>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          PR #{c.pr_number} · by {c.author}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono text-lg font-bold text-red-400">{(c.relevance_score * 100).toFixed(0)}%</p>
                        <p className="font-label text-[8px] text-zinc-700">SIMILARITY</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">"{c.decision}"</p>
                    <div
                      className="h-0.5 mt-4 rounded-full"
                      style={{ background: `linear-gradient(90deg, rgba(239,68,68,0.5) ${c.relevance_score * 100}%, rgba(255,255,255,0.03) ${c.relevance_score * 100}%)` }}
                    />
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: File Risk Map + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Risk Map */}
          <GlassCard className="p-5">
            <p className="font-label text-[10px] text-zinc-600 mb-4">AFFECTED FILES · RISK MAP</p>
            <div className="space-y-2.5">
              {(pr.report_json?.file_map ?? []).map(f => {
                const c = RISK_COLOR[f.risk] || "#6b7280";
                return (
                  <div
                    key={f.file}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: `${c}08`, border: `1px solid ${c}20` }}
                  >
                    <span className="font-mono text-xs text-zinc-300 truncate">{f.file.split("/").slice(-2).join("/")}</span>
                    <span className="font-label text-[9px] ml-3 flex-shrink-0" style={{ color: c }}>{f.risk}</span>
                  </div>
                );
              })}
              {(pr.report_json?.file_map ?? []).length === 0 && (
                <p className="text-xs text-zinc-700 text-center py-4">No file risk data</p>
              )}
            </div>
          </GlassCard>

          {/* Score Weights */}
          <GlassCard className="p-5">
            <p className="font-label text-[10px] text-zinc-600 mb-4">SCORE FORMULA WEIGHTS</p>
            <div className="space-y-2">
              {Object.entries(pr.report_json?.weights ?? {}).map(([key, w]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 capitalize">{key.replace("_", " ")}</span>
                  <span className="font-mono text-xs text-zinc-400">{(w * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          <GlassCard className="p-5">
            <p className="font-label text-[10px] text-zinc-600 mb-3">ACTIONS</p>
            <div className="space-y-2">
              <a href="/memory" className="flex items-center justify-between btn-ghost w-full text-sm py-2.5">
                Search Memory for Context
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
              <a href="/analytics" className="flex items-center justify-between btn-ghost w-full text-sm py-2.5">
                View Analytics
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
