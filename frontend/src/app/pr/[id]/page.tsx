import { use } from "react";
import GlassCard from "@/components/ui/GlassCard";
import ScoreRing from "@/components/ui/ScoreRing";
import GateBadge from "@/components/ui/GateBadge";
import LayerBreakdown from "@/components/pr/LayerBreakdown";
import ContradictionCards from "@/components/pr/ContradictionCards";
import AnalysisTimeline from "@/components/pr/AnalysisTimeline";
import RiskHeatmap from "@/components/dashboard/RiskHeatmap";
import { PRReport } from "@/lib/types";

// Mock data fetcher for the hackathon demo since backend might not be live during build
async function getPR(id: string): Promise<PRReport | null> {
  // Try fetching from the API first, if it fails, fallback to MOCK
  try {
    const res = await fetch(`http://localhost:8000/report/Prakhar2025/vaultci/${id}`, { cache: "no-store" });
    if (res.ok) return res.json();
  } catch (e) {
    console.log("Using mock data for PR", id);
  }

  // MOCK fallback for ID 142 (Blocked PR from dashboard)
  return {
    pr_number: parseInt(id),
    repo_id: "Prakhar2025/vaultci",
    is_ai_generated: true,
    trust_score: 0.35,
    gate_decision: "BLOCK",
    security_score: 0.4,
    arch_score: 0.5,
    blast_score: 0.6,
    rejected_score: 0.8,
    created_at: new Date().toISOString(),
    report_json: {
      weights: { security: 0.14, arch: 0.15, blast: 0.12, rejected: 0.08, ai_origin: 0.04 },
      file_map: [
        { file: "src/auth/login.ts", risk: "CRITICAL" },
        { file: "src/api/user.ts", risk: "MEDIUM" }
      ],
      contradictions: [
        { decision: "All auth goes through AuthService", pr_number: 88, author: "prakhar", relevance_score: 0.92, decision_type: "RULE" }
      ],
      explanation: "This AI-generated PR introduces direct JWT validation bypassing the central AuthService. Critical security risk detected.",
      override_applied: "CRITICAL_SECURITY_FLAG",
    }
  };
}

export default function PRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pr = use(getPR(id));

  if (!pr) return <div className="text-center py-20 text-xl font-bold">PR Not Found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-mono">PR #{pr.pr_number}</h1>
              <GateBadge gate={pr.gate_decision} />
              {pr.report_json.override_applied && (
                <span className="text-xs font-mono bg-brand-danger/20 text-brand-danger px-2 py-1 rounded border border-brand-danger/30">
                  OVERRIDE: {pr.report_json.override_applied}
                </span>
              )}
            </div>
            
            <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-brand-surface-border pl-4">
              "{pr.report_json.explanation}"
            </p>
          </div>

          <div className="flex-shrink-0 bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Final Trust Score</span>
            <ScoreRing score={pr.trust_score} gate={pr.gate_decision} size={100} strokeWidth={8} />
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Layer Breakdown</h2>
            <LayerBreakdown weights={pr.report_json.weights} />
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Architectural Memory</h2>
            <ContradictionCards contradictions={pr.report_json.contradictions} />
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <RiskHeatmap files={pr.report_json.file_map} />
          
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-6">Execution Pipeline</h3>
            <AnalysisTimeline />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
