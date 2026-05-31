import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export default function GlassCard({ children, className }: { children: ReactNode; className?: ClassValue }) {
  return (
    <div className={twMerge(clsx("glass-panel rounded-xl border-brand-surface-border", className))}>
      {children}
    </div>
  );
}
