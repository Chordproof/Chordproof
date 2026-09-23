"use client";

import { useEffect, useRef, useState } from "react";
import ChordDiagram from "./ChordDiagram";
import { getChord, type Chord } from "@/lib/chords";

interface ChordHoverProps {
  chord: string; // nome do acorde, ex.: "Bm"
}

export default function ChordHover({ chord }: ChordHoverProps) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<Chord | null>(null);
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca o acorde no catálogo (com cache) sempre que o nome mudar
  useEffect(() => {
    let alive = true;
    setData(null);
    setIdx(0);
    getChord(chord).then((c) => {
      if (alive) setData(c);
    });
    return () => {
      alive = false;
    };
  }, [chord]);

  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(true), 250); // delay anti-poluição
  };
  const close = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 150);
  };

  const count = data?.variants.length ?? 0;
  const i = count ? ((idx % count) + count) % count : 0;
  const variant = count ? data!.variants[i] : null;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      {show && data && variant && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2">
          <div className="relative bg-white rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.35)] border border-black/20 px-3 pt-3 pb-2">
            <ChordDiagram name={data.name} variant={variant} width={112} />

            {/* Variações — inglês */}
            <div className="flex items-center justify-center gap-2 mt-2 pb-1">
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
            </div>
          </div>
          {/* Seta triangular apontando para o acorde */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] h-3 w-3 rotate-45 bg-white border-r border-b border-black/20" />
        </div>
      )}

      <span className="font-bold text-[#34d399]">{chord}</span>
    </span>
  );
}
