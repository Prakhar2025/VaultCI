"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GitPullRequest, Clock, Bot, User } from "lucide-react";
import GateBadge from "@/components/ui/GateBadge";
import ScoreRing from "@/components/ui/ScoreRing";
import GlassCard from "@/components/ui/GlassCard";
import { PRReport } from "@/lib/types";
import { usePRFeed } from "@/hooks/usePRFeed";

export default function PRFeed() {
  const { prs, loading } = usePRFeed("Prakhar2025", "vaultci");

  if (loading) return <div className="animate-pulse h-64 bg-brand-surface rounded-xl" />;

  return (
    <div className="space-y-4">
      {prs.map((pr, i) => (
        <motion.div
          key={pr.pr_number}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link href={`/pr/${pr.pr_number}`}>
            <GlassCard className="p-4 hover:border-brand-primary/50 transition-colors group cursor-pointer flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <ScoreRing score={pr.trust_score} gate={pr.gate_decision} size={48} strokeWidth={4} />
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <GitPullRequest className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono font-bold">#{pr.pr_number}</span>
                    <GateBadge gate={pr.gate_decision} />
                    {pr.is_ai_generated && (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
                        <Bot className="w-3 h-3" /> AI Origin
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400 line-clamp-1 max-w-xl">
                    {pr.report_json.explanation}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end text-xs text-zinc-500 gap-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(pr.created_at).toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-1">
                  {pr.is_ai_generated ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {pr.is_ai_generated ? "Automated" : "Human"}
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
