"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics } from "@/lib/api";
import { AnalyticsData } from "@/lib/types";
import PRFeed from "@/components/dashboard/PRFeed";
import GlassCard from "@/components/ui/GlassCard";
import ScoreRing from "@/components/ui/ScoreRing";
import { Activity, Shield, Bot, XCircle, TrendingUp } from "lucide-react";

const OWNER = "Prakhar2025";
const REPO  = "vaultci";

const MOCK_STATS = {
  total_prs_analyzed: 47,
  ai_generated_prs: 31,
  average_trust_score: 0.72,
  blocked_prs: 8,
  gate_breakdown: { TRUSTED: 18, REVIEW: 14, CAUTION: 7, BLOCK: 8 },
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics(OWNER, REPO).then(data => {
      if (data) setAnalytics(data);
    });
  }, []);

  const stats = analytics ?? MOCK_STATS as unknown as AnalyticsData;
  const avgScore = stats.average_trust_score ?? 0.72;
  const gate = avgScore >= 0.85 ? "TRUSTED" : avgScore >= 0.65 ? "REVIEW" : avgScore >= 0.4 ? "CAUTION" : "BLOCK";

  const STAT_CARDS = [
    {
      label: "Total PRs Analyzed",
      value: stats.total_prs_analyzed ?? 0,
      icon: Activity,
      color: "#8b5cf6",
      sub: "all time",
    },
    {
      label: "AI-Generated PRs",
      value: stats.ai_generated_prs ?? 0,
      icon: Bot,
      color: "#06b6d4",
      sub: `${stats.total_prs_analyzed ? Math.round(((stats.ai_generated_prs ?? 0) / stats.total_prs_analyzed) * 100) : 0}% of total`,
    },
    {
      label: "Auto-Blocked",
      value: stats.blocked_prs ?? 0,
      icon: XCircle,
      color: "#ef4444",
      sub: "merge prevented",
    },
    {
      label: "Avg Trust Score",
      value: avgScore.toFixed(2),
      icon: TrendingUp,
      color: "#10b981",
      sub: "repo health",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <span className="font-label text-[10px] text-violet-400">VAULTCI DASHBOARD</span>
          </div>
          <h1 className="font-display text-4xl text-white tracking-tight">Pipeline Monitor</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Real-time trust analysis for{" "}
            <span className="font-mono text-zinc-300">{OWNER}/{REPO}</span>
          </p>
        </div>

        <GlassCard className="px-6 py-4 flex items-center gap-5 flex-shrink-0">
          <div>
            <p className="font-label text-[10px] text-zinc-600 mb-1">REPO TRUST SCORE</p>
            <p className="font-display text-3xl text-white">{avgScore.toFixed(2)}</p>
          </div>
          <ScoreRing score={avgScore} gate={gate} size={72} strokeWidth={5} showLabel />
        </GlassCard>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, sub }) => (
          <GlassCard key={label} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="font-display text-3xl text-white mb-1">{value}</p>
            <p className="font-label text-[10px] text-zinc-600">{label}</p>
            <p className="text-xs text-zinc-700 mt-0.5">{sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* PR Feed */}
        <div className="xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Pull Request Feed</h2>
          </div>
          <PRFeed owner={OWNER} repo={REPO} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Gate Breakdown */}
          <GlassCard className="p-5">
            <p className="font-label text-[10px] text-zinc-600 mb-4">GATE DISTRIBUTION</p>
            <div className="space-y-3">
              {(["TRUSTED", "REVIEW", "CAUTION", "BLOCK"] as const).map(gate => {
                const count = (stats.gate_breakdown?.[gate] ?? 0);
                const total = stats.total_prs_analyzed || 1;
                const pct = Math.round((count / total) * 100);
                const colors: Record<string, string> = {
                  TRUSTED: "#10b981", REVIEW: "#f59e0b",
                  CAUTION: "#f97316", BLOCK: "#ef4444",
                };
                const c = colors[gate];
                return (
                  <div key={gate}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: c }}>{gate}</span>
                      <span className="font-mono text-xs text-zinc-600">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: c }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Gate Policy */}
          <GlassCard className="p-5">
            <p className="font-label text-[10px] text-zinc-600 mb-4">GATE POLICY</p>
            <div className="space-y-2.5">
              {[
                { range: "≥ 0.85", label: "Auto-Merge",   color: "#10b981" },
                { range: "≥ 0.65", label: "Code Review",  color: "#f59e0b" },
                { range: "≥ 0.40", label: "Sec Audit",    color: "#f97316" },
                { range: "< 0.40", label: "Auto-Block",   color: "#ef4444" },
              ].map(({ range, label, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span className="text-sm text-zinc-400">{label}</span>
                  </div>
                  <span className="font-mono text-xs text-zinc-600">{range}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Quick action */}
          <GlassCard className="p-5">
            <p className="font-label text-[10px] text-zinc-600 mb-3">QUICK ACTIONS</p>
            <div className="space-y-2">
              <a href="/memory" className="btn-ghost w-full justify-center text-xs py-2">
                Search Memory
              </a>
              <a href="/setup" className="btn-ghost w-full justify-center text-xs py-2">
                Configure Thresholds
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
