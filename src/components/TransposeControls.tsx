"use client";

import { recordAction } from "@/lib/gamification";

interface TransposeControlsProps {
  transpose: number;
  onTranspose: (value: number) => void;
}

export default function TransposeControls({ transpose, onTranspose }: TransposeControlsProps) {
  const handle = (value: number) => {
    onTranspose(value);
    if (value !== 0) recordAction("TRANSPOSE");
  };
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handle(transpose - 1)}
        className="w-8 h-8 flex items-center justify-center bg-[var(--c-overlay-soft)] rounded-full hover:bg-[var(--c-overlay)] text-sm font-bold"
        aria-label="Transpose down"
      >
        -
      </button>
      <span className="text-sm font-semibold min-w-[80px] text-center">
        Transpose {transpose > 0 ? "+" : ""}{transpose}
      </span>
      <button
        onClick={() => handle(transpose + 1)}
        className="w-8 h-8 flex items-center justify-center bg-[var(--c-overlay-soft)] rounded-full hover:bg-[var(--c-overlay)] text-sm font-bold"
        aria-label="Transpose up"
      >
        +
      </button>
      {transpose !== 0 && (
        <button
          onClick={() => onTranspose(0)}
          className="ml-1 px-2 py-1 text-xs bg-[var(--c-overlay-soft)] rounded hover:bg-[var(--c-overlay)] text-brand-muted"
          aria-label="Reset transpose"
        >
          Reset
        </button>
      )}
    </div>
  );
}
