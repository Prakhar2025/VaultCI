"use client";

import { useEffect, useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { MemoryResult } from "@/lib/types";

export default function DecisionGraph({ results }: { results: MemoryResult[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // A very simple canvas visualization of vectors/nodes based on results
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive setup
    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 400;
    };
    updateSize();

    // Draw nodes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Center node (The Query)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#8b5cf6"; // primary
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#8b5cf6";
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText("QUERY", centerX - 18, centerY - 30);
    ctx.shadowBlur = 0; // reset

    // Draw result nodes around it based on relevance
    results.forEach((r, i) => {
      const angle = (i / results.length) * 2 * Math.PI;
      // Distance inversely proportional to relevance (high relevance = closer)
      const distance = 80 + (1 - r.relevance_score) * 200; 
      
      const nx = centerX + distance * Math.cos(angle);
      const ny = centerY + distance * Math.sin(angle);

      // Draw edge
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2 * r.relevance_score;
      ctx.stroke();

      // Draw node
      ctx.beginPath();
      ctx.arc(nx, ny, 10 + r.relevance_score * 5, 0, 2 * Math.PI);
      ctx.fillStyle = r.decision_type === "RULE" ? "#3b82f6" : "#f59e0b";
      ctx.fill();

      // Draw label
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "10px sans-serif";
      ctx.fillText(`PR #${r.pr_number}`, nx + 15, ny + 5);
    });

  }, [results]);

  if (results.length === 0) return null;

  return (
    <GlassCard className="p-1 overflow-hidden mt-8">
      <div className="bg-black/50 rounded-lg relative w-full h-[400px]">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-brand-primary" /> Query Vector</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Arch Rule</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Rejected Pattern</div>
        </div>
      </div>
    </GlassCard>
  );
}
