// src/components/AutoScrollControl.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Minus, Plus } from "lucide-react";

const MIN_LEVEL = 1;
const MAX_LEVEL = 10;

// Velocidade por nível — progressão suave (não linear, para o nível 1 ser bem lento)
const SPEED_BY_LEVEL: Record<number, number> = {
  1: 0.5,   // mais lento possível
  2: 1,
  3: 1.8,
  4: 3,
  5: 4.5,
  6: 6.5,
  7: 9,
  8: 12,
  9: 16,
  10: 22,  // mais rápido
};

interface AutoScrollControlProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

export default function AutoScrollControl({ targetRef }: AutoScrollControlProps) {
  const [level, setLevel] = useState(MIN_LEVEL);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const start = useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = performance.now();
    setIsPlaying(true);

    const tick = (now: number) => {
      const el = targetRef.current;
      if (el) {
        const dt = (now - lastTimeRef.current) / 1000; // segundos
        lastTimeRef.current = now;
        el.scrollTop += SPEED_BY_LEVEL[level] * dt * 60;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [level, targetRef]);

  // Parar ao desmontar
  useEffect(() => () => stop(), [stop]);

  const toggle = () => (isPlaying ? stop() : start());

  const decrease = () => setLevel((l) => Math.max(MIN_LEVEL, l - 1));
  const increase = () => setLevel((l) => Math.min(MAX_LEVEL, l + 1));

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLevel(Number(e.target.value));
  };

  const pct = ((level - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL)) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1A1A1A]/95 backdrop-blur border border-white/10 rounded-2xl shadow-2xl">
        {/* Play / Pause */}
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pausar autoscroll" : "Iniciar autoscroll"}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-accent text-black hover:opacity-90 transition"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* Diminuir */}
        <button
          onClick={decrease}
          disabled={level === MIN_LEVEL}
          aria-label="Diminuir velocidade"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-brand-gold hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>

        {/* Slider arrastável */}
        <div className="flex flex-col items-center gap-1 min-w-[160px]">
          <span className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
            Speed
          </span>
          <input
            type="range"
            min={MIN_LEVEL}
            max={MAX_LEVEL}
            value={level}
            onChange={handleSlider}
            aria-label="Velocidade do autoscroll"
            className="w-full h-1.5 appearance-none rounded-full bg-white/10 cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f0b429 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
            }}
          />
        </div>

        {/* Aumentar */}
        <button
          onClick={increase}
          disabled={level === MAX_LEVEL}
          aria-label="Aumentar velocidade"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-brand-gold hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>

        {/* Badge de nível + velocidade */}
        <div className="flex flex-col items-center min-w-[44px]">
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-accent text-black text-sm font-bold">
            {level}
          </span>
          <span className="text-[10px] text-brand-muted mt-0.5">{level}x</span>
        </div>
      </div>
    </div>
  );
}
