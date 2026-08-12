"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push("/browse?q=" + encodeURIComponent(q));
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <div
        className={
          "flex items-center gap-3 rounded-full border border-white/10 bg-brand-card/60 " +
          "focus-within:border-brand-gold/60 focus-within:ring-2 focus-within:ring-brand-gold/20 " +
          "transition-all duration-200 " +
          (large ? "px-6 py-4 text-lg" : "px-4 py-2.5 text-sm")
        }
      >
        <Search
          className={
            "text-brand-muted shrink-0 " + (large ? "w-6 h-6" : "w-4 h-4")
          }
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={large ? "Search songs, artists..." : "Search..."}
          aria-label="Search songs and artists"
          className={
            "w-full bg-transparent outline-none placeholder:text-brand-muted/70 " +
            "text-brand-text " +
            (large ? "font-mono" : "font-mono")
          }
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-brand-muted hover:text-brand-gold transition-colors shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
