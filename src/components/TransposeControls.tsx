"use client";

interface TransposeControlsProps {
  transpose: number;
  onTranspose: (value: number) => void;
}

export default function TransposeControls({ transpose, onTranspose }: TransposeControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onTranspose(transpose - 1)}
        className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-sm font-bold"
        aria-label="Transpose down"
      >
        -
      </button>
      <span className="text-sm font-semibold min-w-[80px] text-center">
        Transpose {transpose > 0 ? "+" : ""}{transpose}
      </span>
      <button
        onClick={() => onTranspose(transpose + 1)}
        className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 text-sm font-bold"
        aria-label="Transpose up"
      >
        +
      </button>
      {transpose !== 0 && (
        <button
          onClick={() => onTranspose(0)}
          className="ml-1 px-2 py-1 text-xs bg-white/5 rounded hover:bg-white/10 text-brand-muted"
          aria-label="Reset transpose"
        >
          Reset
        </button>
      )}
    </div>
  );
}
