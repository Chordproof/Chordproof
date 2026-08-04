"use client";
import { useState, useEffect } from "react";
import { ArrowUpDown, RotateCcw } from "lucide-react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function TransposeControls() {
  const [semitones, setSemitones] = useState(0);

  // Escuta o evento de reset disparado pelo "Clean all" da página da cifra
  useEffect(() => {
    const handler = () => setSemitones(0);
    window.addEventListener("reset-transpose", handler);
    return () => window.removeEventListener("reset-transpose", handler);
  }, []);

  return (
    <div className="bg-brand-card rounded-xl p-4 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <ArrowUpDown size={16} className="text-brand-gold" />
          Transpose
        </div>
        <span className="text-brand-gold font-bold text-lg">
          {semitones > 0 ? `+${semitones}` : semitones}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSemitones((s) => Math.max(-11, s - 1))}
          className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-bold"
        >
          −
        </button>
        <button
          onClick={() => setSemitones(0)}
          className="inline-flex items-center gap-1 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-brand-gold transition-colors text-sm font-bold"
        >
          <RotateCcw size={14} />
          Reset
        </button>
        <button
          onClick={() => setSemitones((s) => Math.min(11, s + 1))}
          className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-bold"
        >
          +
        </button>
      </div>

      <p className="text-xs text-brand-muted text-center">
        {NOTES[(NOTES.indexOf("C") + semitones + 12) % 12]}
      </p>
    </div>
  );
}
