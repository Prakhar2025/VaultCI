import { AlertTriangle, ExternalLink } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Contradiction } from "@/lib/types";
import Link from "next/link";

interface Props {
  contradictions: Contradiction[];
}

export default function ContradictionCards({ contradictions }: Props) {
  if (!contradictions || contradictions.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-zinc-500 border-dashed">
        <p>No architectural contradictions detected.</p>
        <p className="text-sm mt-1">Code aligns with past decisions in Qdrant memory.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-orange-400">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="font-bold">Memory Conflicts Found</h3>
      </div>
      
      {contradictions.map((c, i) => (
        <GlassCard key={i} className="p-5 border-orange-500/30 bg-orange-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
          
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold tracking-wider uppercase text-orange-400">{c.decision_type}</span>
            <span className="text-xs font-mono text-zinc-500 bg-black/20 px-2 py-1 rounded">
              Sim: {c.relevance_score.toFixed(2)}
            </span>
          </div>
          
          <p className="text-zinc-200 mb-4">{c.decision}</p>
          
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <Link href={`/pr/${c.pr_number}`} className="flex items-center gap-1 hover:text-brand-primary transition-colors">
              <ExternalLink className="w-3 h-3" />
              Originally decided in PR #{c.pr_number}
            </Link>
            <span>•</span>
            <span>By @{c.author}</span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
