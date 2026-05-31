"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, GitBranch, Shield, Zap } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface LayerProps {
  weights: Record<string, number>;
}

export default function LayerBreakdown({ weights }: LayerProps) {
  const layers = [
    { id: "security", title: "AST Security Analysis", icon: ShieldAlert, color: "text-red-400", weight: 0.35 },
    { id: "arch", title: "Architectural Consistency", icon: ShieldCheck, color: "text-blue-400", weight: 0.30 },
    { id: "blast", title: "Blast Radius", icon: Zap, color: "text-emerald-400", weight: 0.20 },
    { id: "rejected", title: "Rejected Patterns", icon: GitBranch, color: "text-orange-400", weight: 0.10 },
    { id: "ai_origin", title: "AI Origin Penalty", icon: Shield, color: "text-purple-400", weight: 0.05 },
  ];

  return (
    <div className="space-y-4">
      {layers.map((layer, i) => {
        const score = weights[layer.id] || 0;
        const normalized = Math.min((score / layer.weight) * 100, 100);
        const Icon = layer.icon;

        return (
          <GlassCard key={layer.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-brand-surface border border-brand-surface-border ${layer.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold">{layer.title}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono text-lg font-bold">+{score.toFixed(3)}</span>
                <span className="text-xs text-zinc-500">Max: {layer.weight.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${layer.color.replace('text-', 'bg-')}`}
                initial={{ width: 0 }}
                animate={{ width: `${normalized}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              />
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
