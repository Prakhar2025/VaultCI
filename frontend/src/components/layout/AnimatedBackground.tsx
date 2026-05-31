"use client";

import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-brand-background">
      {/* Dark noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
      />
      
      {/* Animated glowing orbs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)" }}
        animate={{
          x: ["0%", "20%", "0%"],
          y: ["0%", "30%", "0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-brand-secondary) 0%, transparent 70%)" }}
        animate={{
          x: ["0%", "-30%", "0%"],
          y: ["0%", "-20%", "0%"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      <motion.div
        className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full opacity-10 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--color-brand-accent) 0%, transparent 70%)" }}
        animate={{
          x: ["0%", "40%", "0%"],
          y: ["0%", "-40%", "0%"],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
}
