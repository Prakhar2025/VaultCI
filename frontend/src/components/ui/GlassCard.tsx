import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", hover = false, glow, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl ${hover ? "glass-hover cursor-pointer" : ""} ${className}`}
      style={glow ? { boxShadow: `0 0 40px ${glow}, 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset` } : undefined}
    >
      {children}
    </div>
  );
}
