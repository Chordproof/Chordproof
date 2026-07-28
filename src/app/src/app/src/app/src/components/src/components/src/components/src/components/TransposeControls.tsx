"use client";
import { useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

export default function TransposeControls() {
  const [val, setVal] = useState(0);

  return (
    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
      <button
        onClick={() => setVal(v => v - 1)}
        className="p-2 hover:bg-white/10 rounded-lg transition"
      >
        <Minus size={16} />
      </button>

      <div className="px-4 flex flex-col items-center min-w-[80px]">
        <span className="text-[10px] uppercase font-black text-brand-muted">Transpose</span>
        <span className="font-mono font-bold text-brand-gold">
          {val > 0 ? `+${val}` : val}
        </span>
      </div>

      <button
        onClick={() => setVal(v => v + 1)}
        className="p-2 hover:bg-white/10 rounded-lg transition"
      >
        <Plus size={16} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        onClick={() => setVal(0)}
        className="p-2 hover:text-brand-gold transition"
        title="Reset"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}
