"use client";
import { pianoVoicing, isBlackKey, midiToName } from "@/lib/pianoVoicings";

/**
 * PianoDiagram — Fase 3: teclado SVG com as notas do acorde destacadas.
 * 2 oitavas (C3-C5), notas em dourado. Mesma linguagem visual do ChordDiagram.
 */
export default function PianoDiagram({
  chord,
  onClose,
  accentColor = "#f0b429",
}: {
  chord: string;
  onClose: () => void;
  accentColor?: string;
}) {
  const notes = pianoVoicing(chord);
  const hasNotes = notes.length > 0;

  const LOW = 48;
  const HIGH = 72;
  const allMidis: number[] = [];
  for (let m = LOW; m <= HIGH; m++) allMidis.push(m);

  const whiteMidis = allMidis.filter((m) => !isBlackKey(m));
  const WHITE_W = 26;
  const WHITE_H = 110;
  const BLACK_W = 16;
  const BLACK_H = 68;

  const whiteIndex = new Map<number, number>();
  whiteMidis.forEach((m, i) => whiteIndex.set(m, i));

  // Offset horizontal das pretas (relativo à borda direita da branca anterior)
  const BLACK_OFFSET: Record<number, number> = { 1: 0.65, 3: 0.35, 6: 0.66, 8: 0.5, 10: 0.34 };

  const activePcs = new Set(notes.map((m) => m % 12));
  const totalW = whiteMidis.length * WHITE_W;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
        style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "16px", padding: "16px", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", minWidth: "220px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: accentColor }}>{chord}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>✕</button>
        </div>
        {hasNotes ? (
          <>
            <svg width={totalW} height={WHITE_H + 8} viewBox={`0 0 ${totalW} ${WHITE_H + 8}`}>
              {whiteMidis.map((m) => {
                const i = whiteIndex.get(m) ?? 0;
                return (
                  <rect
                    key={"w" + m}
                    x={i * WHITE_W}
                    y="4"
                    width={WHITE_W - 1}
                    height={WHITE_H}
                    rx="3"
                    fill={activePcs.has(m % 12) ? accentColor : "#f8f8f8"}
                    stroke="#222"
                    strokeWidth="1"
                  />
                );
              })}
              {allMidis.filter((m) => isBlackKey(m)).map((m) => {
                const prevIdx = whiteIndex.get(m - 1);
                if (prevIdx === undefined) return null;
                const x = (prevIdx + 1) * WHITE_W - BLACK_W * (BLACK_OFFSET[m % 12] ?? 0.5);
                return (
                  <rect
                    key={"b" + m}
                    x={x}
                    y="4"
                    width={BLACK_W}
                    height={BLACK_H}
                    rx="2"
                    fill={activePcs.has(m % 12) ? accentColor : "#111"}
                    stroke="#000"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "8px" }}>
              {notes.map((n) => midiToName(n)).join(" · ")}
            </div>
          </>
        ) : (
          <div style={{ fontSize: "13px", color: "#888", textAlign: "center", padding: "20px 0" }}>
            Diagram under construction
          </div>
        )}
        <div style={{ fontSize: "11px", color: "#666", textAlign: "center", marginTop: "8px" }}>
          Click anywhere to close
        </div>
      </div>
    </div>
  );
}

/** Mini versão para a seção "Chords used" e hover (como MiniFretboard). */
export function MiniPiano({ chord, accentColor = "#f0b429" }: { chord: string; accentColor?: string }) {
  const notes = pianoVoicing(chord);
  const LOW = 48;
  const HIGH = 72;
  const allMidis: number[] = [];
  for (let m = LOW; m <= HIGH; m++) allMidis.push(m);
  const whiteMidis = allMidis.filter((m) => !isBlackKey(m));
  const WHITE_W = 7;
  const WHITE_H = 34;
  const BLACK_W = 4.5;
  const BLACK_H = 21;
  const whiteIndex = new Map<number, number>();
  whiteMidis.forEach((m, i) => whiteIndex.set(m, i));
  const activePcs = new Set(notes.map((m) => m % 12));
  const totalW = whiteMidis.length * WHITE_W;

  if (notes.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px" }}>
        <span style={{ color: accentColor, fontWeight: 700, fontSize: "14px" }}>{chord}</span>
        <span style={{ color: "#888", fontSize: "10px" }}>Sem diagrama</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <span style={{ color: accentColor, fontWeight: 700, fontSize: "14px" }}>{chord}</span>
      <svg width={totalW} height={WHITE_H + 4} viewBox={`0 0 ${totalW} ${WHITE_H + 4}`}>
        {whiteMidis.map((m) => {
          const i = whiteIndex.get(m) ?? 0;
          return (
            <rect key={"w" + m} x={i * WHITE_W} y="2" width={WHITE_W - 0.5} height={WHITE_H} rx="1" fill={activePcs.has(m % 12) ? accentColor : "#f8f8f8"} stroke="#222" strokeWidth="0.5" />
          );
        })}
        {allMidis.filter((m) => isBlackKey(m)).map((m) => {
          const prevIdx = whiteIndex.get(m - 1);
          if (prevIdx === undefined) return null;
          const x = (prevIdx + 1) * WHITE_W - BLACK_W / 2;
          return (
            <rect key={"b" + m} x={x} y="2" width={BLACK_W} height={BLACK_H} rx="1" fill={activePcs.has(m % 12) ? accentColor : "#111"} stroke="#000" strokeWidth="0.5" />
          );
        })}
      </svg>
    </div>
  );
}
