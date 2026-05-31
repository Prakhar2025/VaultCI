import PRFeed from "@/components/dashboard/PRFeed";
import RiskHeatmap from "@/components/dashboard/RiskHeatmap";
import GlassCard from "@/components/ui/GlassCard";
import ScoreRing from "@/components/ui/ScoreRing";
import { Activity } from "lucide-react";

export default function DashboardPage() {
  // Mock top risk files for the demo
  const riskFiles = [
    { path: "src/auth/login.ts", risk: "CRITICAL" as const },
    { path: "src/database/queries.ts", risk: "HIGH" as const },
    { path: "src/api/user.ts", risk: "MEDIUM" as const },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Dashboard</h1>
          <p className="text-zinc-400 mt-1">Real-time trust layer analysis for Prakhar2025/vaultci</p>
        </div>
        
        <GlassCard className="px-6 py-4 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Avg Repo Score</span>
            <span className="text-2xl font-black text-white">0.82</span>
          </div>
          <ScoreRing score={0.82} gate="REVIEW" size={50} strokeWidth={4} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-bold">Live Pull Requests</h2>
          </div>
          <PRFeed />
        </div>
        
        <div className="space-y-6">
          <RiskHeatmap files={riskFiles} />
          
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 text-white">Gate Policy</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-accent" /> &gt;= 0.85 — Auto-Merge</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500" /> &gt;= 0.65 — Code Review</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> &gt;= 0.40 — Security Audit</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-danger" /> &lt; 0.40 — Auto-Block</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
