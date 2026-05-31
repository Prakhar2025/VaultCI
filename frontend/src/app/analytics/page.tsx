import TrendChart from "@/components/analytics/TrendChart";
import AIvsHumanBar from "@/components/analytics/AIvsHumanBar";
import GlassCard from "@/components/ui/GlassCard";
import { AnalyticsData } from "@/lib/types";

// Mock data if backend is offline
const MOCK_ANALYTICS: AnalyticsData = {
  repo_id: "Prakhar2025/vaultci",
  total_prs_analyzed: 142,
  ai_generated_prs: 86,
  average_trust_score: 0.74,
  blocked_prs: 18,
  gate_breakdown: {
    TRUSTED: 64,
    REVIEW: 42,
    CAUTION: 18,
    BLOCK: 18,
  },
  top_risk_files: [],
  trust_score_trend: Array.from({ length: 30 }).map((_, i) => ({
    created_at: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
    trust_score: 0.5 + Math.random() * 0.45
  }))
};

export default function AnalyticsPage() {
  const data = MOCK_ANALYTICS;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline Analytics</h1>
        <p className="text-zinc-400 mt-1">Aggregated metrics for Prakhar2025/vaultci</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <p className="text-sm text-zinc-400 font-bold tracking-wider uppercase mb-1">Total PRs</p>
          <p className="text-4xl font-mono font-bold text-white">{data.total_prs_analyzed}</p>
        </GlassCard>
        
        <GlassCard className="p-6">
          <p className="text-sm text-zinc-400 font-bold tracking-wider uppercase mb-1">AI Volume</p>
          <p className="text-4xl font-mono font-bold text-purple-400">
            {Math.round((data.ai_generated_prs / data.total_prs_analyzed) * 100)}%
          </p>
        </GlassCard>
        
        <GlassCard className="p-6">
          <p className="text-sm text-zinc-400 font-bold tracking-wider uppercase mb-1">Avg Score</p>
          <p className="text-4xl font-mono font-bold text-blue-400">
            {Math.round((data.average_trust_score || 0) * 100)}
          </p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/20 blur-2xl" />
          <p className="text-sm text-zinc-400 font-bold tracking-wider uppercase mb-1">Blocks</p>
          <p className="text-4xl font-mono font-bold text-red-500">{data.blocked_prs}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart data={data.trust_score_trend} />
        <AIvsHumanBar 
          total={data.total_prs_analyzed} 
          ai={data.ai_generated_prs} 
          blocked={data.blocked_prs} 
        />
      </div>
    </div>
  );
}
