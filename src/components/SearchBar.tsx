"use client";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  large?: boolean;
}

export default function SearchBar({ large }: SearchBarProps) {
  const [query, setQuery] = useState("");

  return (
    <div className={`relative ${large ? "w-full" : "w-full max-w-md"}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={large ? 24 : 20} />
      <input
        type="text"
        placeholder="Search songs, artists, or chords..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 text-white placeholder-brand-muted focus:outline-none focus:border-brand-gold transition ${
          large ? "py-5 text-lg" : "py-3 text-sm"
        }`}
      />
    </div>
  );
}
