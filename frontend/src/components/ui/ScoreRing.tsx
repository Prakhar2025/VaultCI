import { GateType } from "@/lib/types";

const GATE_COLORS: Record<GateType, { stroke: string; glow: string; text: string }> = {
  TRUSTED: { stroke: "#10b981", glow: "rgba(16,185,129,0.25)", text: "#10b981" },
  REVIEW:  { stroke: "#f59e0b", glow: "rgba(245,158,11,0.25)", text: "#f59e0b" },
  CAUTION: { stroke: "#f97316", glow: "rgba(249,115,22,0.25)", text: "#f97316" },
  BLOCK:   { stroke: "#ef4444", glow: "rgba(239,68,68,0.25)",  text: "#ef4444" },
};

interface Props {
  score: number;
  gate: GateType;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreRing({ score, gate, size = 80, strokeWidth = 6, showLabel = false }: Props) {
  const colors = GATE_COLORS[gate];
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - Math.max(0, Math.min(1, score)) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Glow ring */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={0.15}
          strokeDasharray={circumference}
          strokeDashoffset={0}
        />
        {/* Score arc */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${colors.glow})`,
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold leading-none"
          style={{
            fontSize: size * 0.22,
            color: colors.text,
          }}
        >
          {score.toFixed(2)}
        </span>
        {showLabel && (
          <span
            className="font-label leading-none mt-0.5"
            style={{ fontSize: size * 0.1, color: colors.text, opacity: 0.7 }}
          >
            {gate}
          </span>
        )}
      </div>
    </div>
  );
}
