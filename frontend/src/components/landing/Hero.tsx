"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Lock, GitBranch } from "lucide-react";

function AnimatedScore() {
  const [score, setScore] = useState(0);
  const target = 0.34;

  useEffect(() => {
    const start = Date.now();
    const duration = 2000;
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(parseFloat((eased * target).toFixed(2)));
      if (progress < 1) requestAnimationFrame(frame);
    };
    const delay = setTimeout(() => requestAnimationFrame(frame), 600);
    return () => clearTimeout(delay);
  }, []);

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 1) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="44" fill="none"
          stroke="url(#scoreGrad)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <div className="font-mono text-2xl font-bold text-red-400">{score.toFixed(2)}</div>
        <div className="font-label text-[9px] text-red-500 tracking-widest">BLOCKED</div>
      </div>
    </div>
  );
}

const METRICS = [
  { label: "Security",     score: 0.38, color: "#ef4444" },
  { label: "Architecture", score: 0.22, color: "#f97316" },
  { label: "Blast Radius", score: 0.55, color: "#f59e0b" },
  { label: "Patterns",     score: 0.80, color: "#10b981" },
];

function PRCard() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="glass rounded-2xl p-5 w-full max-w-sm border border-[rgba(239,68,68,0.2)] shadow-[0_0_40px_rgba(239,68,68,0.08)]">
      {/* PR Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-mono text-xs text-zinc-500">PR #247</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">AI</span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">feat: add auth middleware bypass</p>
          <p className="text-xs text-zinc-500 mt-0.5">by codex-agent · 2 min ago</p>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all duration-500 ${
          revealed ? "badge-block opacity-100" : "opacity-0"
        }`}>
          BLOCK
        </div>
      </div>

      <hr className="vault-divider mb-4" />

      {/* Score Bars */}
      <div className="space-y-2.5 mb-4">
        {METRICS.map((m, i) => (
          <div key={m.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-zinc-500">{m.label}</span>
              <span className="font-mono text-xs" style={{ color: m.color }}>{m.score.toFixed(2)}</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full score-bar-fill"
                style={{
                  width: revealed ? `${m.score * 100}%` : "0%",
                  background: m.color,
                  transitionDelay: `${i * 120 + 300}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Contradiction */}
      <div className={`rounded-lg bg-red-500/5 border border-red-500/20 p-3 transition-all duration-500 ${revealed ? "opacity-100" : "opacity-0"}`}>
        <p className="font-label text-[9px] text-red-400 mb-1">ARCHITECTURAL CONTRADICTION</p>
        <p className="text-xs text-zinc-400">Bypasses AuthService — contradicts decision from PR #88 (similarity 0.94)</p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Radial center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-violet-500/20 mb-8">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="font-label text-[10px] text-violet-300">AI TRUST LAYER · HACKATHON 2026</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-[68px] text-white mb-6 leading-[1.05]">
            Stop AI code<br />
            <span className="text-gradient-cyber">before it ships.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-lg mb-10 leading-relaxed">
            VaultCI intercepts every AI-generated pull request and runs a{" "}
            <span className="text-zinc-200 font-medium">5-layer trust analysis</span> — security, architecture, blast radius, rejected patterns, and AI origin — before anything reaches production.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary">
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/setup" className="btn-ghost">
              <GitBranch className="w-4 h-4" />
              Connect Repository
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-[rgba(139,92,246,0.1)]">
            {[
              { value: "5",    label: "Analysis Layers" },
              { value: "0.01s", label: "Avg Response" },
              { value: "∞",    label: "Memory Depth" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display text-3xl text-gradient-violet">{value}</div>
                <div className="font-label text-[10px] text-zinc-600 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Demo Card */}
        <div className="flex flex-col items-center gap-6 opacity-0 animate-fade-up delay-200" style={{ animationFillMode: "forwards" }}>
          {/* Live badge */}
          <div className="flex items-center gap-2">
            <div className="pulse-dot bg-red-400" />
            <span className="font-label text-[10px] text-zinc-500">LIVE ANALYSIS · PR INTERCEPTED</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <PRCard />
            <div className="flex flex-col items-center gap-3">
              <AnimatedScore />
              <div className="text-center">
                <p className="font-label text-[9px] text-zinc-600">COMPOSITE TRUST SCORE</p>
                <p className="text-xs text-zinc-500 mt-1">Merge blocked automatically</p>
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-md">
            {[
              { icon: Shield, label: "AST Security" },
              { icon: Lock,   label: "Arch Memory" },
              { icon: Zap,    label: "Blast Radius" },
              { icon: GitBranch, label: "AI Detection" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-[rgba(139,92,246,0.1)]">
                <Icon className="w-3 h-3 text-violet-400" />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-12 bg-gradient-to-b from-violet-500/50 to-transparent" />
      </div>
    </section>
  );
}
