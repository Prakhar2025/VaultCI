import type { Metadata } from "next";
import "./globals.css";
import AuroraBackground from "@/components/layout/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "VaultCI — AI Trust Layer for Agentic Code",
  description:
    "VaultCI verifies AI-generated code is safe to ship. 5-layer trust analysis: AST security, architectural contradiction detection, blast radius, rejected patterns, and AI origin scoring.",
  keywords: ["AI code review", "trust layer", "agentic coding", "Codex", "CI/CD", "security"],
  openGraph: {
    title: "VaultCI — AI Trust Layer",
    description: "Verify AI-generated code before it reaches production.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col relative">
        <AuroraBackground />
        <Navbar />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <footer className="relative z-10 border-t border-[rgba(139,92,246,0.1)] py-6 mt-20">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <p className="font-label text-[11px] text-zinc-600">
              © 2026 VAULTCI · AI TRUST LAYER
            </p>
            <p className="font-label text-[11px] text-zinc-700">
              BUILT BY PRAKHAR SHUKLA
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
