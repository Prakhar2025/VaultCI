"use client";

import { motion } from "framer-motion";
import { GateType } from "./GateBadge";

interface ScoreRingProps {
  score: number; // 0.0 to 1.0
  gate: GateType;
  size?: number;
  strokeWidth?: number;
}

const GATE_COLORS: Record<GateType, string> = {
  TRUSTED: "text-brand-accent",
  REVIEW: "text-yellow-500",
  CAUTION: "text-orange-500",
  BLOCK: "text-brand-danger",
};

export default function ScoreRing({ score, gate, size = 60, strokeWidth = 4 }: ScoreRingProps) {
  const colorClass = GATE_COLORS[gate] || GATE_COLORS.REVIEW;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - score * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          fill="none" stroke="currentColor" 
          className="text-zinc-800" 
          strokeWidth={strokeWidth} 
        />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} 
          fill="none" stroke="currentColor"
          className={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-bold font-mono text-sm">{(score * 100).toFixed(0)}</span>
      </div>
    </div>
  );
}
