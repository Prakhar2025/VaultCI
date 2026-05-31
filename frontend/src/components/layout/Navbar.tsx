"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, LayoutDashboard, Brain, BarChart3, Settings, Activity } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/memory",    label: "Memory",    icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/setup",     label: "Setup",     icon: Settings },
];

type BackendStatus = "checking" | "live" | "offline";

export default function Navbar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`,
          { cache: "no-store", signal: AbortSignal.timeout(3000) }
        );
        setStatus(res.ok ? "live" : "offline");
      } catch {
        setStatus("offline");
      }
    };
    checkBackend();
    const t = setInterval(checkBackend, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const statusConfig = {
    checking: { color: "bg-amber-400",  label: "Connecting…" },
    live:     { color: "bg-emerald-400", label: "API Live" },
    offline:  { color: "bg-red-400",     label: "API Offline" },
  };
  const s = statusConfig[status];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-[rgba(139,92,246,0.15)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="VaultCI Home"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 group-hover:from-violet-500 group-hover:to-violet-700 transition-all duration-300" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <Shield className="w-4 h-4 text-white relative z-10" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[15px] text-white tracking-tight">
              Vault<span className="text-violet-400">CI</span>
            </span>
            <span className="font-label text-[9px] text-zinc-500 tracking-widest">TRUST LAYER</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-violet-300 bg-violet-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[rgba(139,92,246,0.15)]">
            <div className={`pulse-dot ${s.color}`} />
            <span className="font-label text-[10px] text-zinc-400">{s.label}</span>
          </div>

          {/* Mobile menu fallback */}
          <div className="flex md:hidden items-center gap-1">
            {NAV_LINKS.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`p-2 rounded-lg transition-colors ${
                  pathname === href ? "text-violet-300 bg-violet-500/10" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
