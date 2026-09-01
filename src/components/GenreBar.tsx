// src/components/GenreBar.tsx
"use client";

import Link from "next/link";

// Gêneros com cifras no banco — alinhados à classificação (8 gêneros)
export const GENRES = ["Rock", "Pop", "Indie", "Folk", "Country", "Metal", "Jazz", "R&B"];

interface GenreBarProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

export default function GenreBar({ selectedGenre, onSelect }: GenreBarProps) {
  const genrePillClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
      active
        ? "bg-brand-accent text-black"
        : "bg-white/[0.06] text-brand-muted hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {GENRES.map((g) => (
        <Link
          key={g}
          href={`/genre/${encodeURIComponent(g)}`}
          onClick={() => onSelect(g)}
          className={genrePillClass(selectedGenre === g)}
        >
          {g}
        </Link>
      ))}
    </div>
  );
}
