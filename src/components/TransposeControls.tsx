"use client";
import { Minus, Plus } from "lucide-react";

type TransposeControlsProps = {
  transpose: number;
  onTranspose: (value: number) => void;
};

export default function TransposeControls({ transpose, onTranspose }: TransposeControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-brand-muted font-semibold">Transpose</span>
      <button
        onClick={() => onTranspose(transpose - 1)}
        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
        aria-label="Diminuir tom"
      >
        <Minus size={16} />
      </button>
      <span className="w-10 text-center font-bold text-brand-gold">
        {transpose > 0 ? `+${transpose}` : transpose}
      </span>
      <button
        onClick={() => onTranspose(transpose + 1)}
        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
        aria-label="Aumentar tom"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}