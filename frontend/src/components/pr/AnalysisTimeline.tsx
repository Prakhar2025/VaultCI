"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export default function AnalysisTimeline() {
  const steps = [
    { label: "Webhook Received", desc: "Signature validated" },
    { label: "AST Parse", desc: "Extracting diff structure" },
    { label: "Security & Blast Check", desc: "Pattern matching & NetworkX" },
    { label: "Qdrant Memory Query", desc: "Semantic vector search" },
    { label: "Groq Reasoning", desc: "llama-3.3-70b explanation" },
    { label: "Trust Score Aggregation", desc: "Gate decision finalized" },
  ];

  return (
    <div className="py-4">
      {steps.map((step, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className="flex items-start gap-4 mb-6 last:mb-0 relative"
        >
          {i !== steps.length - 1 && (
            <div className="absolute top-6 left-[11px] w-0.5 h-full bg-brand-primary/20 -z-10" />
          )}
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.15 + 0.1, type: "spring" }}
            className="mt-0.5 bg-brand-background"
          >
            <CheckCircle2 className="w-6 h-6 text-brand-primary" />
          </motion.div>
          
          <div>
            <h4 className="font-bold text-white">{step.label}</h4>
            <p className="text-sm text-zinc-500">{step.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
