"use client";

import { useEffect, useState } from "react";
import ChordDiagram from "./ChordDiagram";
import { getChord, type Chord } from "@/lib/chords";

export default function ChordTooltip({ chordName }: { chordName: string }) {
  const [chord, setChord] = useState<Chord | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let alive = true;
    setChord(null);
    setIdx(0);
    getChord(chordName).then((c) => {
      if (alive) setChord(c);
    });
    return () => {
      alive = false;
    };
  }, [chordName]);

  if (!chord || chord.variants.length === 0) return null;

  const count = chord.variants.length;
  const i = ((idx % count) + count) % count;
  const variant = chord.variants[i];

  return (
    <span className="relative inline-block">
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
        <span className="relative block bg-white rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.35)] border border-black/20 px-3 pt-3 pb-2">
          <ChordDiagram name={chord.name} variant={variant} width={112} />

          {/* Variações — inglês */}
          <span className="flex items-center justify-center gap-2 mt-2 pb-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i - 1);
              }}
              className="text-[#333] text-sm font-bold leading-none hover:opacity-70 px-1"
              aria-label="Previous variation"
            >
              ‹
            </button>
            <span className="text-[#444] text-[11px] font-medium whitespace-nowrap">
              Variation {i + 1} of {count}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIdx(i + 1);
              }}
              className="text-[#333] text-sm font-bold leading-none hover:opacity-70 px-1"
              aria-label="Next variation"
            >
              ›
            </button>
          </span>
        </span>
        {/* Seta triangular apontando para o acorde */}
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] h-3 w-3 rotate-45 bg-white border-r border-b border-black/20" />
      </span>

      <span className="font-bold text-[#34d399]">{chord.name}</span>
    </span>
  );
}
