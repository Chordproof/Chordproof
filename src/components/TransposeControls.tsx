"use client";

import { recordAction } from "@/lib/gamification";

interface TransposeControlsProps {
  transpose: number;
  onTranspose: (value: number) => void;
}

/**
 * TransposeControls — grupo segmentado da action bar.
 *
 * Desenho: "−  0  +" dentro de uma pastilha, com o rótulo pequeno em cima do
 * número (antes era "Transpose 0" numa linha longa, que empurrava os outros
 * controles e fazia a barra quebrar em duas linhas).
 */
export default function TransposeControls({ transpose, onTranspose }: TransposeControlsProps) {
  const handle = (value: number) => {
    onTranspose(value);
    if (value !== 0) recordAction("TRANSPOSE");
  };
  return (
    <div className="tgroup">
      <button onClick={() => handle(transpose - 1)} className="tstep" aria-label="Transpose down" title="Transpose down">
        −
      </button>
      <div className="tval">
        <span className="lb">Transpose</span>
        <span className="nm">{transpose > 0 ? "+" : ""}{transpose}</span>
      </div>
      <button onClick={() => handle(transpose + 1)} className="tstep" aria-label="Transpose up" title="Transpose up">
        +
      </button>
      {transpose !== 0 && (
        <button
          onClick={() => onTranspose(0)}
          className="tstep"
          style={{ width: "auto", flex: "0 0 auto", padding: "0 7px", fontSize: 11, fontWeight: 800 }}
          aria-label="Reset transpose"
          title="Reset transpose"
        >
          Reset
        </button>
      )}
    </div>
  );
}
