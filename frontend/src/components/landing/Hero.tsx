"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-32 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-surface-border text-sm text-brand-primary mb-8"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Built for the Qdrant "Think Outside the Bot" Hackathon</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl"
      >
        The AI Trust Layer for <br />
        <span className="text-gradient">Agentic Coding Pipelines</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10"
      >
        Stop rogue AI commits before they merge. VaultCI uses local Qdrant memory, semantic AST analysis, and Groq LLMs to enforce architectural consistency automatically.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 bg-white text-zinc-950 px-8 py-4 rounded-lg font-bold hover:bg-zinc-200 transition-colors"
        >
          View Live Feed
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/setup"
          className="flex items-center gap-2 glass-panel px-8 py-4 rounded-lg font-bold text-white hover:bg-brand-surface-border transition-colors"
        >
          Connect Repository
        </Link>
      </motion.div>
    </section>
  );
}
