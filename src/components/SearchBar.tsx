"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const PLACEHOLDERS = [
  "Search artist or song...",
  "Try \"Back in Black\"",
  "Search by song or artist...",
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phIndex, setPhIndex] = useState(0);

  // Placeholder rotativo
  useEffect(() => {
    const idx = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(idx);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <form onSubmit={submit} className="relative w-full" role="search">
      {/* Ícone de lupa dourado bem visível */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold pointer-events-none">
        <Search size={18} />
      </span>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={PLACEHOLDERS[phIndex]}
        aria-label="Search songs or artists"
        className="w-full pl-12 pr-28 py-3.5 rounded-full bg-[#1A1A1A] border border-white/15 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/20 transition"
      />

      {/* Botão de busca explícito */}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-brand-gold text-black text-sm font-bold hover:opacity-90 transition"
      >
        Search
      </button>
    </form>
  );
}
