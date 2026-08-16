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
          .ilike("song", `%${q}%`)
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
      



      {showSuggestions && suggestions.length > 0 && (
        
          {suggestions.map((s) => (
            - 
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(s)}
                className="w-full text-left px-4 py-3 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors text-sm"
              >
                {s}
              </button>
            

          ))}
        
      )}
    </form>
  );
}
