"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LayoutDashboard, BrainCircuit, Activity, Settings } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memory", href: "/memory", icon: BrainCircuit },
  { name: "Analytics", href: "/analytics", icon: Activity },
  { name: "Setup", href: "/setup", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b border-brand-surface-border glass-panel"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/50 overflow-hidden">
            <Shield className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-full group-hover:scale-150 transition-transform duration-500" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Vault<span className="text-brand-primary">CI</span></span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <div className={cn(
                  "flex items-center gap-2 relative z-10",
                  isActive ? "text-white" : "text-zinc-400 hover:text-white transition-colors"
                )}>
                  <Icon className="w-4 h-4" />
                  {link.name}
                </div>
                
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-brand-surface border border-brand-surface-border rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
