"use client";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function TransposeControls() {
  const [semitones, setSemitones] = useState(0);

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
      <div className="flex gap-2">
        <button
          onClick={() => setSemitones((s) => Math.max(s - 1, -12))}
          className="flex-1 bg-white/5 py-2 rounded-lg text-sm hover:bg-white/10 transition"
        >
          -1
        </button>
        <button
          onClick={() => setSemitones(0)}
          className="flex-1 bg-white/5 py-2 rounded-lg text-sm hover:bg-white/10 transition"
        >
          Reset
        </button>
        <button
          onClick={() => setSemitones((s) => Math.min(s + 1, 12))}
          className="flex-1 bg-white/5 py-2 rounded-lg text-sm hover:bg-white/10 transition"
        >
          +1
        </button>
      </div>
    </div>
  );
}
