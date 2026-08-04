"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export const ALL = "All";

// Gêneros fixos — controla quais aparecem na barra (5 principais + More)
export const MAIN_GENRES = ["Rock", "Pop", "Sertanejo", "MPB", "Gospel"];
export const EXTRA_GENRES = ["Jazz", "Blues", "Funk", "Soul", "Reggae", "Eletrônica", "Hip-Hop", "Country", "Metal", "Indie"];

interface GenreBarProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

export default function GenreBar({ selectedGenre, onSelect }: GenreBarProps) {
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const moreGenresRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown "More" ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreGenresRef.current && !moreGenresRef.current.contains(e.target as Node)) {
        setShowMoreGenres(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const genrePillClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
      active
        ? "bg-brand-accent text-black"
        : "bg-white/[0.06] text-brand-muted hover:bg-white/10 hover:text-white"
    }`;

  const handleSelect = (g: string) => {
    setShowMoreGenres(false);
    onSelect(g);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleSelect(ALL)}
        className={genrePillClass(selectedGenre === ALL)}
      >
        All
      </button>

      {MAIN_GENRES.map((g) => (
        <button
          key={g}
          onClick={() => handleSelect(g)}
          className={genrePillClass(selectedGenre === g)}
        >
          {g}
        </button>
      ))}

      <div className="relative" ref={moreGenresRef}>
        <button
          onClick={() => setShowMoreGenres(!showMoreGenres)}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
            showMoreGenres || (selectedGenre !== ALL && !MAIN_GENRES.includes(selectedGenre))
              ? "bg-brand-accent text-black"
              : "bg-white/[0.06] text-brand-muted hover:bg-white/10 hover:text-white"
          }`}
        >
          More <ChevronDown size={14} className={`transition-transform ${showMoreGenres ? "rotate-180" : ""}`} />
        </button>

        {showMoreGenres && (
          <div className="absolute left-0 top-full mt-2 bg-[#1A1A1A] border border-white/[0.06] rounded-2xl shadow-2xl p-3 z-50 min-w-[220px]">
            <div className="grid grid-cols-2 gap-2">
              {EXTRA_GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => handleSelect(g)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-colors ${
                    selectedGenre === g
                      ? "bg-brand-accent text-black"
                      : "text-brand-muted hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
