"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarn, AlertOctagon } from "lucide-react";

export default function TrustScoreDemo() {
  const [score, setScore] = useState(85); // 0 to 100

  // Gate logic mapping
  let gate = "BLOCK";
  let colorClass = "text-brand-danger";
  let bgClass = "bg-brand-danger/20 border-brand-danger/50";
  let Icon = AlertOctagon;
  let text = "Merge Blocked: Critical security flaws detected.";

  if (score >= 85) {
    gate = "TRUSTED";
    colorClass = "text-brand-accent";
    bgClass = "bg-brand-accent/20 border-brand-accent/50";
    Icon = ShieldCheck;
    text = "Auto-Merge Approved: Architecturally sound.";
  } else if (score >= 65) {
    gate = "REVIEW";
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-500/20 border-yellow-500/50";
    Icon = ShieldWarn;
    text = "Manual Review Required: Moderate blast radius.";
  } else if (score >= 40) {
    gate = "CAUTION";
    colorClass = "text-orange-500";
    bgClass = "bg-orange-500/20 border-orange-500/50";
    Icon = ShieldAlert;
    text = "Caution: Major architectural deviations.";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto w-full my-12 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-50" />
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Interactive Trust Score</h3>
        <p className="text-zinc-400">Slide to see how VaultCI's gate logic reacts to PR quality.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Score Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-zinc-800" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none" stroke="currentColor"
              className={colorClass}
              strokeWidth="8"
              strokeDasharray="283"
              animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black font-mono">{score}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Score</span>
          </div>
        </div>

        {/* Dynamic Status */}
        <div className="flex-1 space-y-6 w-full">
          <div className={`p-4 rounded-xl border flex items-start gap-4 transition-colors duration-300 ${bgClass}`}>
            <Icon className={`w-8 h-8 ${colorClass} shrink-0`} />
            <div className="text-left">
              <h4 className={`text-lg font-bold tracking-wider ${colorClass}`}>{gate}</h4>
              <p className="text-sm text-zinc-300 mt-1">{text}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2 text-zinc-400 font-mono">
              <span>0 (Vulnerable)</span>
              <span>100 (Perfect)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
