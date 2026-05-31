import { GateType } from "@/lib/types";

const GATE_CONFIG: Record<GateType, { label: string; color: string; bg: string; border: string }> = {
  TRUSTED: { label: "TRUSTED",  color: "#10b981", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.30)"  },
  REVIEW:  { label: "REVIEW",   color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)"  },
  CAUTION: { label: "CAUTION",  color: "#f97316", bg: "rgba(249,115,22,0.10)",  border: "rgba(249,115,22,0.30)"  },
  BLOCK:   { label: "BLOCK",    color: "#ef4444", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.30)"   },
};

interface Props {
  gate: GateType;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "px-2 py-0.5 text-[9px]",
  md: "px-2.5 py-1 text-[10px]",
  lg: "px-3 py-1.5 text-xs",
};

export default function GateBadge({ gate, size = "md" }: Props) {
  const cfg = GATE_CONFIG[gate];
  return (
    <span
      className={`inline-flex items-center font-bold tracking-widest rounded-lg border ${sizeMap[size]}`}
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}
