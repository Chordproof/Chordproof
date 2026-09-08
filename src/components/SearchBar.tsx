"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Music2, User } from "lucide-react";

interface Suggestion {
  type: "song" | "artist";
  label: string;
  href: string;
}

const PLACEHOLDERS = [
  "Search artist or song...",
  'Try "Back in Black"',
  "Search by song or artist...",
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Placeholder rotativo
  useEffect(() => {
    const idx = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(idx);
  }, []);

  // Busca sugestões com debounce de 250ms (evita request a cada tecla)
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const term = q.trim();
      if (term.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setOpen(true);
        setHighlighted(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 250);
  }, []);

  // Navega para a sugestão selecionada
  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setHighlighted(-1);
      router.push(href);
    },
    [router]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Enter com sugestão destacada → vai para a sugestão
    if (highlighted >= 0 && suggestions[highlighted]) {
      go(suggestions[highlighted].href);
      return;
    }
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      go(suggestions[highlighted].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  // Fecha ao clicar fora
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full" role="search">
      <form onSubmit={submit}>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold pointer-events-none">
          <Search size={18} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            fetchSuggestions(v);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={PLACEHOLDERS[phIndex]}
          aria-label="Search songs or artists"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-activedescendant={highlighted >= 0 ? `suggestion-${highlighted}` : undefined}
          autoComplete="off"
          className="w-full pl-12 pr-28 py-3.5 rounded-full bg-[#1A1A1A] border border-white/15 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/20 transition"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-brand-gold text-black text-sm font-bold hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {/* Dropdown de sugestões */}
      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 top-full mt-2 w-full bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.type}-${s.label}-${i}`} role="option" aria-selected={highlighted === i}>
              <button
                type="button"
                onClick={() => go(s.href)}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  highlighted === i ? "bg-white/10 text-brand-gold" : "text-white hover:bg-white/5"
                }`}
              >
                {s.type === "artist" ? (
                  <User size={15} className="text-brand-muted shrink-0" />
                ) : (
                  <Music2 size={15} className="text-brand-muted shrink-0" />
                )}
                <span className="truncate">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
