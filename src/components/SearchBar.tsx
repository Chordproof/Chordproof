"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SEARCH_ROUTE = "/browse?q=";

const FALLBACK_SUGGESTIONS = [
  "Stairway to Heaven",
  "Wonderwall",
  "Hotel California",
  "Perfect",
  "Hallelujah",
  "Creep",
];

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0 || q.length === 1) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("tabs")
          .select("song")
          .ilike("song", "%" + q + "%")
          .limit(6);
        const songs = (data || []).map((row) => row.song);
        setSuggestions(
          songs.length
            ? songs
            : FALLBACK_SUGGESTIONS.filter((s) =>
                s.toLowerCase().includes(q.toLowerCase())
              )
        );
      } catch {
        setSuggestions(
          FALLBACK_SUGGESTIONS.filter((s) =>
            s.toLowerCase().includes(q.toLowerCase())
          )
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(SEARCH_ROUTE + encodeURIComponent(q));
    setShowSuggestions(false);
  }

  function handleSuggestionClick(s: string) {
    setQuery(s);
    setShowSuggestions(false);
    router.push(SEARCH_ROUTE + encodeURIComponent(s));
  }

  return (
    <form onSubmit={handleSubmit} className="w-full relative" role="search">
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
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={large ? "Search songs, artists..." : "Search..."}
          aria-label="Search songs and artists"
          className="w-full bg-transparent outline-none placeholder:text-brand-muted/70 text-brand-text font-mono"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="text-brand-muted hover:text-brand-gold transition-colors shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-brand-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(s)}
                className="w-full text-left px-4 py-3 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors text-sm"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
