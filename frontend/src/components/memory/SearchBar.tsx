"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto mb-10">
      <div className="relative group">
        <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full group-hover:bg-brand-primary/30 transition-colors" />
        <div className="relative flex items-center bg-brand-background border border-brand-surface-border rounded-xl shadow-lg focus-within:border-brand-primary/50 transition-colors">
          <div className="pl-4 pr-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-zinc-400 group-hover:text-brand-primary transition-colors" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search architectural memory (e.g. 'How do we handle auth?')"
            className="w-full bg-transparent border-none outline-none py-4 pr-4 text-white placeholder-zinc-500"
          />
          <button 
            type="submit"
            disabled={isLoading || !query.trim()}
            className="mr-2 px-4 py-2 bg-brand-surface border border-brand-surface-border rounded-lg text-sm font-bold text-white hover:bg-brand-primary hover:border-brand-primary disabled:opacity-50 transition-colors"
          >
            Query
          </button>
        </div>
      </div>
    </form>
  );
}
