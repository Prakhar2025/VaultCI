"use client";

import GlassCard from "@/components/ui/GlassCard";
import { AlertOctagon, ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskHeatmapProps {
  files: { path: string; risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }[];
}

const RISK_COLORS = {
  LOW: "bg-brand-accent/20 border-brand-accent/50 text-brand-accent",
  MEDIUM: "bg-yellow-500/20 border-yellow-500/50 text-yellow-500",
  HIGH: "bg-orange-500/20 border-orange-500/50 text-orange-500",
  CRITICAL: "bg-brand-danger/20 border-brand-danger/50 text-brand-danger",
};

export default function RiskHeatmap({ files }: RiskHeatmapProps) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-brand-primary" />
        Repository Risk Heatmap
      </h3>
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-zinc-500 text-sm">No risky files detected yet.</p>
        ) : (
          files.map((file, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border text-sm font-mono ${RISK_COLORS[file.risk]}`}>
              <span className="truncate max-w-[70%]">{file.path}</span>
              <span className="font-bold tracking-wider">{file.risk}</span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
