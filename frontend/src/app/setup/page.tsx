"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { registerRepo } from "@/lib/api";
import {
  GitBranch, Key, SlidersHorizontal, CheckCircle2,
  Copy, ArrowRight, ChevronRight, AlertCircle, Loader2,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Repository" },
    { n: 2, label: "Webhook" },
    { n: 3, label: "Thresholds" },
    { n: 4, label: "Confirm" },
  ];
  return (
    <div className="flex items-center gap-0 mb-12">
      {steps.map(({ n, label }, i) => {
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: done ? "rgba(16,185,129,0.15)" : active ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                  border: done ? "1px solid rgba(16,185,129,0.4)" : active ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  color: done ? "#10b981" : active ? "#a78bfa" : "#3f3f50",
                  boxShadow: active ? "0 0 16px rgba(139,92,246,0.3)" : "none",
                }}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              <span className={`font-label text-[9px] hidden sm:block ${active ? "text-violet-400" : done ? "text-emerald-500" : "text-zinc-700"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-px w-12 sm:w-20 mx-1 mb-4 transition-all duration-500"
                style={{ background: done ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.05)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 glass border border-[rgba(139,92,246,0.15)] transition-colors"
    >
      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function SetupPage() {
  const [step, setStep] = useState<Step>(1);
  const [repoId, setRepoId] = useState("");
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [secThreshold, setSecThreshold] = useState(0.70);
  const [archThreshold, setArchThreshold] = useState(0.65);
  const [blastThreshold, setBlastThreshold] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/webhook/github`;

  const generateSecret = () => {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    setSecret(Array.from(arr, b => b.toString(16).padStart(2, "0")).join(""));
  };

  const handleRegister = async () => {
    setLoading(true);
    const res = await registerRepo({
      repo_id: repoId,
      github_token: token || undefined,
      webhook_secret: secret,
      security_threshold: secThreshold,
      arch_threshold: archThreshold,
      blast_threshold: blastThreshold,
    });
    setResult(res);
    setLoading(false);
    if (res.success) setStep(4);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-violet-400" />
          <span className="font-label text-[10px] text-violet-400">REPOSITORY SETUP</span>
        </div>
        <h1 className="font-display text-4xl text-white">Connect Your Repository</h1>
        <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
          VaultCI will monitor every pull request and post trust analysis directly on GitHub.
        </p>
      </div>

      <StepIndicator current={step} />

      {/* Step 1: Repository */}
      {step === 1 && (
        <GlassCard className="p-7">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Repository Details</h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="font-label text-[10px] text-zinc-500 block mb-2">GITHUB REPOSITORY</label>
              <input
                className="vault-input"
                placeholder="owner/repository-name"
                value={repoId}
                onChange={e => setRepoId(e.target.value)}
              />
              <p className="text-xs text-zinc-600 mt-1.5">e.g. Prakhar2025/vaultci</p>
            </div>
            <div>
              <label className="font-label text-[10px] text-zinc-500 block mb-2">
                GITHUB TOKEN <span className="text-zinc-700">(optional — for auto PR comments)</span>
              </label>
              <input
                className="vault-input font-mono"
                placeholder="ghp_xxxxxxxxxxxx"
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
              />
              <p className="text-xs text-zinc-600 mt-1.5">Needs <code className="text-violet-400 bg-violet-500/10 px-1 rounded">repo</code> + <code className="text-violet-400 bg-violet-500/10 px-1 rounded">write:discussion</code> scopes.</p>
            </div>
            <button
              className="btn-primary w-full justify-center"
              onClick={() => setStep(2)}
              disabled={!repoId.includes("/")}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Step 2: Webhook */}
      {step === 2 && (
        <GlassCard className="p-7">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Configure Webhook</h2>
          </div>
          <div className="space-y-5">
            {/* Webhook URL */}
            <div>
              <label className="font-label text-[10px] text-zinc-500 block mb-2">PAYLOAD URL</label>
              <div className="flex items-center gap-2">
                <input className="vault-input font-mono text-xs" readOnly value={webhookUrl} />
                <CopyButton text={webhookUrl} />
              </div>
              <p className="text-xs text-zinc-600 mt-1.5">Paste this into GitHub → Settings → Webhooks → Add webhook</p>
            </div>

            {/* Secret */}
            <div>
              <label className="font-label text-[10px] text-zinc-500 block mb-2">WEBHOOK SECRET</label>
              <div className="flex gap-2">
                <input
                  className="vault-input font-mono text-xs"
                  placeholder="Generate a secret or paste your own"
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                />
                <button onClick={generateSecret} className="btn-ghost flex-shrink-0 text-xs px-3">
                  Generate
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/15 p-4 text-sm">
              <p className="font-label text-[10px] text-cyan-400 mb-3">GITHUB SETUP STEPS</p>
              <ol className="space-y-1.5 text-zinc-500 text-xs">
                {[
                  "Go to your repo on GitHub",
                  "Settings → Webhooks → Add webhook",
                  `Paste the URL above as Payload URL`,
                  "Set Content-Type to application/json",
                  "Paste the secret above",
                  "Choose: Let me select individual events → Pull requests",
                  "Click Add webhook",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-cyan-600 flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3">
              <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary flex-1 justify-center" onClick={() => setStep(3)} disabled={!secret}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 3: Thresholds */}
      {step === 3 && (
        <GlassCard className="p-7">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Trust Gate Thresholds</h2>
          </div>
          <div className="space-y-6">
            {[
              { label: "Security Block Threshold", value: secThreshold, set: setSecThreshold, min: 0.3, max: 1, step: 0.05, color: "#ef4444", desc: "PRs below this security score are blocked" },
              { label: "Architecture Block Threshold", value: archThreshold, set: setArchThreshold, min: 0.3, max: 1, step: 0.05, color: "#8b5cf6", desc: "PRs with lower arch consistency score blocked" },
              { label: "Blast Radius Max Files", value: blastThreshold, set: setBlastThreshold, min: 5, max: 100, step: 5, color: "#f59e0b", desc: "PRs affecting more files than this get flagged", isInt: true },
            ].map(({ label, value, set, min, max, step: st, color, desc, isInt }) => (
              <div key={label}>
                <div className="flex justify-between mb-2">
                  <label className="font-label text-[10px] text-zinc-500">{label}</label>
                  <span className="font-mono text-sm font-bold" style={{ color }}>
                    {isInt ? value : (value as number).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range" min={min} max={max} step={st}
                  value={value}
                  onChange={e => set(isInt ? parseInt(e.target.value) : parseFloat(e.target.value) as any)}
                  className="w-full accent-violet-500"
                />
                <p className="text-xs text-zinc-700 mt-1">{desc}</p>
              </div>
            ))}

            <div className="flex gap-3">
              <button className="btn-ghost flex-1 justify-center" onClick={() => setStep(2)}>Back</button>
              <button
                className="btn-primary flex-1 justify-center"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Register Repository <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>

            {result && !result.success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {result.message || "Registration failed. Is the backend running?"}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <GlassCard className="p-10 text-center" glow="rgba(16,185,129,0.1)">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-3xl text-white mb-3">Repository Connected!</h2>
          <p className="text-zinc-500 mb-2">
            <span className="font-mono text-zinc-300">{repoId}</span> is now protected by VaultCI.
          </p>
          <p className="text-sm text-zinc-600 mb-8">
            Open a pull request on GitHub — VaultCI will automatically post a trust report as a PR comment within seconds.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/dashboard" className="btn-primary">
              View Dashboard <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/memory" className="btn-ghost">
              Explore Memory
            </a>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
