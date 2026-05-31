import { ShieldCheck, ShieldAlert, Shield, AlertOctagon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GateType = "TRUSTED" | "REVIEW" | "CAUTION" | "BLOCK";

interface GateBadgeProps {
  gate: GateType;
  className?: string;
  showIcon?: boolean;
}

const GATE_STYLES: Record<GateType, { color: string; icon: any }> = {
  TRUSTED: { color: "bg-brand-accent/20 text-brand-accent border-brand-accent/50", icon: ShieldCheck },
  REVIEW: { color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50", icon: Shield },
  CAUTION: { color: "bg-orange-500/20 text-orange-500 border-orange-500/50", icon: ShieldAlert },
  BLOCK: { color: "bg-brand-danger/20 text-brand-danger border-brand-danger/50", icon: AlertOctagon },
};

export default function GateBadge({ gate, className, showIcon = true }: GateBadgeProps) {
  const { color, icon: Icon } = GATE_STYLES[gate] || GATE_STYLES.REVIEW;
  
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold tracking-wider", color, className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {gate}
    </div>
  );
}
