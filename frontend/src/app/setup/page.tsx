"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, GitBranch, KeyRound, Server } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const STEPS = [
  { id: 1, title: "Connect Repository", icon: GitBranch },
  { id: 2, title: "Configure Webhooks", icon: Server },
  { id: 3, title: "Gate Thresholds", icon: KeyRound },
];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [repo, setRepo] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  
  const handleNext = () => setStep(s => Math.min(s + 1, 4));

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Repository Setup</h1>
        <p className="text-zinc-400">Connect a GitHub repository to the VaultCI Trust Layer.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -z-10 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-brand-primary -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
              step >= s.id ? "bg-brand-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]" : "bg-zinc-900 text-zinc-500 border border-zinc-700"
            }`}>
              {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.id ? "text-white" : "text-zinc-600"}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <GlassCard className="p-8 relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Which repository should VaultCI monitor?</h2>
              <p className="text-zinc-400 text-sm">Format: owner/repo</p>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300">Repository Name</label>
                <input 
                  type="text" 
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g., Prakhar2025/vaultci"
                  className="w-full bg-black/30 border border-brand-surface-border rounded-lg p-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Configure GitHub Webhook</h2>
              <p className="text-zinc-400 text-sm">Go to your GitHub repository settings &gt; Webhooks and add this URL.</p>
              
              <div className="p-4 bg-black/40 border border-zinc-800 rounded-lg font-mono text-sm text-brand-primary break-all">
                https://vaultci.yourdomain.com/webhook/github
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300">Webhook Secret</label>
                <input 
                  type="password" 
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Enter a secure secret"
                  className="w-full bg-black/30 border border-brand-surface-border rounded-lg p-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold">Configure Gate Thresholds</h2>
              <p className="text-zinc-400 text-sm">Fine-tune when VaultCI should auto-merge, request review, or block.</p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-brand-accent">Auto-Merge (TRUSTED)</span>
                    <span className="text-sm font-mono">&gt;= 0.85</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="85" className="w-full accent-brand-accent h-1 bg-zinc-800 rounded-lg appearance-none" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-brand-danger">Auto-Block (BLOCK)</span>
                    <span className="text-sm font-mono">&lt; 0.40</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-brand-danger h-1 bg-zinc-800 rounded-lg appearance-none" />
                </div>
              </div>
            </motion.div>
          )}
          
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full space-y-6 text-center pt-10"
            >
              <div className="w-20 h-20 bg-brand-accent/20 text-brand-accent rounded-full flex items-center justify-center border-2 border-brand-accent">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Setup Complete!</h2>
                <p className="text-zinc-400">VaultCI is now actively monitoring <strong className="text-white">{repo || "your repository"}</strong>.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-8 right-8">
          {step < 4 && (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-white text-zinc-950 px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
            >
              {step === 3 ? "Complete Setup" : "Next Step"}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
