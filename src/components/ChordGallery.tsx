"use client";

import { useEffect, useState } from "react";
import ChordDiagram from "./ChordDiagram";
import { getChord, type Chord } from "@/lib/chords";

interface ChordsGalleryProps {
  chords: string[]; // nomes únicos dos acordes usados na cifra
}

export default function ChordsGallery({ chords }: ChordsGalleryProps) {
  const [loaded, setLoaded] = useState<Chord[] | null>(null);

  useEffect(() => {
    let alive = true;
    const unique = Array.from(new Set(chords.map((c) => c.trim()).filter(Boolean)));

    Promise.all(
      unique.map((name) =>
        getChord(name).catch(() => null)
      )
    ).then((results) => {
      if (!alive) return;
      setLoaded(results.filter((c): c is Chord => Boolean(c && c.variants.length > 0)));
    });

    return () => {
      alive = false;
    };
  }, [chords.join("|")]);

  // Carregando: skeleton discreto para não "pular" a página
  if (!loaded) {
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {Array.from(new Set(chords)).slice(0, 8).map((name) => (
          <div key={name} className="w-[88px] h-[120px] rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (loaded.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {loaded.map((chord) => (
        <ChordDiagram
          key={chord.name}
          name={chord.name}
          variant={chord.variants[0]}
          width={88}
        />
      ))}
    </div>
  );
}
