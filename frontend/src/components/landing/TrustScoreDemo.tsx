"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

const FLOW_STEPS = [
  { step: "01", label: "PR Opened", desc: "AI agent opens PR on GitHub", status: "done" },
  { step: "02", label: "Webhook Fires", desc: "GitHub sends event to VaultCI", status: "done" },
  { step: "03", label: "5-Layer Analysis", desc: "AST · Memory · Graph · Patterns · Origin", status: "running" },
  { step: "04", label: "Trust Score", desc: "Composite score calculated in real-time", status: "pending" },
  { step: "05", label: "Gate Decision", desc: "BLOCK posted as PR comment automatically", status: "pending" },
];

function FlowDiagram() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(prev => (prev + 1) % FLOW_STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      {FLOW_STEPS.map((s, i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <div key={s.step} className="flex items-start gap-4 mb-4 last:mb-0">
            {/* Connector */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 flex-shrink-0"
                style={{
                  background: isDone ? "rgba(16,185,129,0.15)" : isActive ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.03)",
                  border: isDone ? "1px solid rgba(16,185,129,0.4)" : isActive ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  color: isDone ? "#10b981" : isActive ? "#a78bfa" : "#3f3f50",
                  boxShadow: isActive ? "0 0 16px rgba(139,92,246,0.3)" : "none",
                }}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div
                  className="w-px mt-1 mb-0 transition-all duration-500"
                  style={{
                    height: "24px",
                    background: isDone
                      ? "linear-gradient(180deg, #10b981, rgba(16,185,129,0.2))"
                      : "rgba(255,255,255,0.05)",
                  }}
                />
              )}
            </div>
            {/* Label */}
            <div className={`transition-all duration-300 ${isActive ? "opacity-100" : isDone ? "opacity-60" : "opacity-30"}`}>
              <p className="text-sm font-semibold text-zinc-200">{s.label}</p>
              <p className="text-xs text-zinc-500">{s.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="w-full max-w-7xl mx-auto px-6 py-24"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-cyan-500/20 mb-6">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="font-label text-[10px] text-cyan-300">REAL-TIME PIPELINE</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
            From PR open<br />to decision in{" "}
            <span className="text-gradient-cyber">milliseconds.</span>
          </h2>
          <p className="text-zinc-500 leading-relaxed mb-8">
            VaultCI sits as middleware between your AI coding agent and the merge gate.
            Every single PR triggers the full pipeline automatically — no human needs
            to configure, trigger, or monitor anything.
          </p>
          <Link href="/setup" className="btn-primary">
            Connect Your Repo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: Animated Flow */}
        <div className="glass rounded-2xl p-8">
          <div className="font-label text-[10px] text-zinc-600 mb-6 flex items-center gap-2">
            <div className="pulse-dot bg-violet-400" />
            LIVE PIPELINE · PROCESSING PR #247
          </div>
          <FlowDiagram />

          {/* Result */}
          <hr className="vault-divider my-6" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label text-[10px] text-zinc-600 mb-1">FINAL DECISION</p>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-bold text-red-400">MERGE BLOCKED</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label text-[10px] text-zinc-600 mb-1">TRUST SCORE</p>
              <span className="font-mono text-2xl font-bold text-red-400">0.34</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
