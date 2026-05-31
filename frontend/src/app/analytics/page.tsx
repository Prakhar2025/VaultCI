"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics } from "@/lib/api";
import { AnalyticsData, GateType } from "@/lib/types";
import GlassCard from "@/components/ui/GlassCard";
import ScoreRing from "@/components/ui/ScoreRing";
import { BarChart3, TrendingUp, Bot, Shield, XCircle } from "lucide-react";

const OWNER = "Prakhar2025";
const REPO  = "vaultci";

// Realistic mock analytics for demo
const MOCK: AnalyticsData = {
  repo_id: "Prakhar2025/vaultci",
  total_prs_analyzed: 47,
  ai_generated_prs: 31,
  average_trust_score: 0.72,
  blocked_prs: 8,
  gate_breakdown: { TRUSTED: 18, REVIEW: 14, CAUTION: 7, BLOCK: 8 },
  top_risk_files: [
    "src/auth/middleware.ts",
    "src/database/queries.ts",
    "src/api/user.ts",
    "src/lib/db.ts",
    "src/models/session.ts",
  ],
  trust_score_trend: Array.from({ length: 14 }, (_, i) => ({
    created_at: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
    trust_score: 0.55 + Math.random() * 0.35,
  })),
};

function TrendChart({ data }: { data: { created_at: string; trust_score: number }[] }) {
  if (!data.length) return null;
  const max = 1;
  const min = 0;
  const H = 100;
  const W = 400;
  const padX = 20;
  const usable = W - padX * 2;

  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * usable;
    const y = H - ((d.trust_score - min) / (max - min)) * H;
    return { x, y, score: d.trust_score, date: new Date(d.created_at) };
  });

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = path + ` L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  const [hovered, setHovered] = useState<typeof pts[0] | null>(null);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 120 }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal grid */}
        {[0.25, 0.5, 0.75].map(v => {
          const y = H - v * H;
          return (
            <line key={v} x1={padX} y1={y} x2={W - padX} y2={y}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          );
        })}
        {/* Area fill */}
        <path d={area} fill="url(#areaGrad)" />
        {/* Line */}
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots + hover zones */}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(p)}>
            <circle cx={p.x} cy={p.y} r={10} fill="transparent" />
            <circle
              cx={p.x} cy={p.y} r={hovered === p ? 4 : 2.5}
              fill={hovered === p ? "#a78bfa" : "#8b5cf6"}
              className="transition-all duration-150"
            />
          </g>
        ))}
      </svg>
      {hovered && (
        <div
          className="absolute top-0 glass rounded-lg px-2.5 py-1.5 pointer-events-none text-xs"
          style={{ left: `${(hovered.x / 400) * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="font-mono font-bold text-violet-300">{hovered.score.toFixed(2)}</div>
          <div className="text-zinc-600">{hovered.date.toLocaleDateString()}</div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetchAnalytics(OWNER, REPO).then(d => {
      if (d) { setData(d); setLive(true); }
      else setData(MOCK);
    });
  }, []);

  const d = data ?? MOCK;
  const avgScore = d.average_trust_score ?? 0.72;
  const gate: GateType = avgScore >= 0.85 ? "TRUSTED" : avgScore >= 0.65 ? "REVIEW" : avgScore >= 0.4 ? "CAUTION" : "BLOCK";
  const aiPct = d.total_prs_analyzed ? Math.round(((d.ai_generated_prs ?? 0) / d.total_prs_analyzed) * 100) : 0;
  const blockPct = d.total_prs_analyzed ? Math.round(((d.blocked_prs ?? 0) / d.total_prs_analyzed) * 100) : 0;

  const GATE_COLORS: Record<GateType, string> = {
    TRUSTED: "#10b981", REVIEW: "#f59e0b", CAUTION: "#f97316", BLOCK: "#ef4444",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <span className="font-label text-[10px] text-violet-400">REPOSITORY ANALYTICS</span>
            {!live && (
              <span className="font-label text-[9px] text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                DEMO DATA
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl text-white">Trust Analytics</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            <span className="font-mono text-zinc-300">{OWNER}/{REPO}</span> · all time
          </p>
        </div>
        <ScoreRing score={avgScore} gate={gate} size={88} strokeWidth={6} showLabel />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total PRs Analyzed", value: d.total_prs_analyzed, icon: Shield, color: "#8b5cf6" },
          { label: "AI-Generated", value: `${d.ai_generated_prs} (${aiPct}%)`, icon: Bot, color: "#06b6d4" },
          { label: "Auto-Blocked", value: `${d.blocked_prs} (${blockPct}%)`, icon: XCircle, color: "#ef4444" },
          { label: "Avg Trust Score", value: avgScore.toFixed(3), icon: TrendingUp, color: "#10b981" },
        ].map(({ label, value, icon: Icon, color }) => (
          <GlassCard key={label} className="p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="font-display text-3xl text-white">{value}</p>
            <p className="font-label text-[10px] text-zinc-600 mt-1">{label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Trust Score Trend */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-label text-[10px] text-zinc-600 mb-1">TRUST SCORE TREND</p>
              <p className="text-sm font-semibold text-zinc-300">Last 14 days</p>
            </div>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <TrendChart data={d.trust_score_trend ?? []} />
          <div className="flex justify-between mt-2">
            <span className="font-label text-[9px] text-zinc-700">14 DAYS AGO</span>
            <span className="font-label text-[9px] text-zinc-700">TODAY</span>
          </div>
        </GlassCard>

        {/* Gate Breakdown */}
        <GlassCard className="p-6">
          <p className="font-label text-[10px] text-zinc-600 mb-6">GATE BREAKDOWN</p>
          <div className="space-y-5">
            {(Object.keys(GATE_COLORS) as GateType[]).map(g => {
              const count = d.gate_breakdown?.[g] ?? 0;
              const pct = d.total_prs_analyzed ? (count / d.total_prs_analyzed) * 100 : 0;
              const c = GATE_COLORS[g];
              return (
                <div key={g}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: c }}>{g}</span>
                    <span className="font-mono text-xs text-zinc-600">{count} PRs</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: c }}
                    />
                  </div>
                  <p className="text-xs text-zinc-700 mt-0.5">{pct.toFixed(0)}% of total</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Top Risk Files */}
      <GlassCard className="p-6">
        <p className="font-label text-[10px] text-zinc-600 mb-5">TOP RISK FILES</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(d.top_risk_files ?? []).map((file, i) => {
            const riskColors = ["#ef4444", "#f97316", "#f59e0b", "#f59e0b", "#6b7280"];
            const riskLabels = ["CRITICAL", "HIGH", "HIGH", "MEDIUM", "MEDIUM"];
            const c = riskColors[i] || "#6b7280";
            const label = riskLabels[i] || "LOW";
            return (
              <div
                key={file}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: `${c}08`, border: `1px solid ${c}20` }}
              >
                <span className="font-mono text-xs text-zinc-300 truncate">{file.split("/").slice(-2).join("/")}</span>
                <span className="font-label text-[9px] ml-2 flex-shrink-0" style={{ color: c }}>{label}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* AI vs Human */}
      <GlassCard className="p-6">
        <p className="font-label text-[10px] text-zinc-600 mb-6">AI vs HUMAN PR COMPARISON</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "AI-Generated PRs", count: d.ai_generated_prs ?? 0, pct: aiPct, color: "#8b5cf6", icon: Bot, desc: "Stricter verification thresholds applied" },
            { label: "Human-Written PRs", count: (d.total_prs_analyzed - (d.ai_generated_prs ?? 0)), pct: 100 - aiPct, color: "#06b6d4", icon: Shield, desc: "Standard review thresholds" },
          ].map(({ label, count, pct, color, icon: Icon, desc }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-200">{count} PRs <span className="font-normal text-zinc-600">({pct}%)</span></p>
                <p className="font-label text-[10px] mt-0.5" style={{ color }}>{label}</p>
                <p className="text-xs text-zinc-700 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
