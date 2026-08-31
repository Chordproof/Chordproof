"use client";
import { useState } from "react";
import { BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, Palette, X } from "lucide-react";
import { CHORD_SHAPES } from "./chordData";

export type ThemeKey = "amber" | "classic" | "emerald" | "crimson" | "ocean";
export type Theme = {
  label: string;
  swatch: string;
  wood1: string; wood2: string; wood3: string; wood4: string; wood5: string;
  border: string;
  nut1: string; nut2: string; nut3: string;
  fret1: string; fret2: string; fret3: string;
  strThick1: string; strThick2: string; strThin1: string; strThin2: string;
  dot: string; dotHi: string; dotGlow: string;
  text: string; muted: string;
  x: string; o: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
  amber: {
    label: "Amber", swatch: "#f0b429",
    wood1: "#6a4a30", wood2: "#4a2a18", wood3: "#2a1810", wood4: "#1a0e08", wood5: "#3a2418",
    border: "#7a5a3a", nut1: "#f8ecd8", nut2: "#d4c4a6", nut3: "#a09078",
    fret1: "#c8c8c8", fret2: "#8a8a8a", fret3: "#5a5a5a",
    strThick1: "#c4a46a", strThick2: "#f0e0a0", strThin1: "#c8c8c8", strThin2: "#f8f8f8",
    dot: "#f0b429", dotHi: "#ffe080", dotGlow: "rgba(240,180,41,0.5)",
    text: "#f0b429", muted: "#a09070", x: "#e74c3c", o: "#27ae60",
  },
  classic: {
    label: "Classic", swatch: "#ffffff",
    wood1: "#5a3a28", wood2: "#3a2418", wood3: "#2a1810", wood4: "#1a0e08", wood5: "#3a2418",
    border: "#6a4a2a", nut1: "#f0e4d0", nut2: "#c4b496", nut3: "#908068",
    fret1: "#b8b8b8", fret2: "#787878", fret3: "#484848",
    strThick1: "#a08858", strThick2: "#d4c496", strThin1: "#b0b0b0", strThin2: "#e0e0e0",
    dot: "#ffffff", dotHi: "#f0f0f0", dotGlow: "rgba(255,255,255,0.3)",
    text: "#666", muted: "#888", x: "#e74c3c", o: "#27ae60",
  },
  emerald: {
    label: "Emerald", swatch: "#10b981",
    wood1: "#4a3a2a", wood2: "#2a2010", wood3: "#1a1408", wood4: "#0a0604", wood5: "#2a2010",
    border: "#5a4a2a", nut1: "#e8e4d0", nut2: "#c0bca0", nut3: "#888470",
    fret1: "#b0b8b0", fret2: "#7a8a7a", fret3: "#4a5a4a",
    strThick1: "#9ab08a", strThick2: "#c4d4b0", strThin1: "#a8b8a0", strThin2: "#d0e0c8",
    dot: "#10b981", dotHi: "#5eead4", dotGlow: "rgba(16,185,129,0.5)",
    text: "#34d399", muted: "#5a8a6a", x: "#e74c3c", o: "#27ae60",
  },
  crimson: {
    label: "Crimson", swatch: "#dc2626",
    wood1: "#5a1a1a", wood2: "#3a0e0e", wood3: "#2a0808", wood4: "#1a0404", wood5: "#3a0e0e",
    border: "#6a2a2a", nut1: "#e8d4d0", nut2: "#c4a0a0", nut3: "#906868",
    fret1: "#b8a8a8", fret2: "#8a6868", fret3: "#5a3838",
    strThick1: "#b08888", strThick2: "#d4a8a8", strThin1: "#b0a0a0", strThin2: "#e0d0d0",
    dot: "#dc2626", dotHi: "#ff6b6b", dotGlow: "rgba(220,38,38,0.5)",
    text: "#ff6b6b", muted: "#a07070", x: "#e74c3c", o: "#27ae60",
  },
  ocean: {
    label: "Ocean", swatch: "#2563eb",
    wood1: "#3a4a6a", wood2: "#1a2a4a", wood3: "#0a1a3a", wood4: "#040a1e", wood5: "#1a2a4a",
    border: "#3a4a7a", nut1: "#d8e0f0", nut2: "#a0b0c8", nut3: "#687890",
    fret1: "#a8b8c8", fret2: "#6a7a8a", fret3: "#3a4a5a",
    strThick1: "#8898b8", strThick2: "#b8c8e0", strThin1: "#a0b0c8", strThin2: "#d0e0f0",
    dot: "#2563eb", dotHi: "#60a5fa", dotGlow: "rgba(37,99,235,0.5)",
    text: "#60a5fa", muted: "#5a7090", x: "#e74c3c", o: "#27ae60",
  },
};

export const THEME_KEYS: ThemeKey[] = ["amber", "classic", "emerald", "crimson", "ocean"];

const CHORD_FINGERS: Record<string, number[]> = {
  "Am": [-1, 0, 2, 3, 1, 0],
  "C": [-1, 3, 2, 0, 1, 0],
  "D": [-1, -1, 0, 1, 3, 2],
  "Dm": [-1, -1, 0, 2, 3, 1],
  "E": [0, 2, 3, 1, 0, 0],
  "Em": [0, 2, 3, 0, 0, 0],
  "G": [2, 1, 0, 0, 0, 3],
  "F": [1, 3, 4, 2, 1, 1],
  "A": [-1, 0, 1, 2, 3, 0],
  "Bm": [-1, 1, 3, 4, 2, 1],
  "B": [-1, 1, 3, 4, 4, 1],
  "B7": [-1, 2, 1, 2, 0, 2],
  "D7": [-1, -1, 0, 2, 1, 2],
  "A7": [-1, 0, 2, 0, 3, 0],
  "E7": [0, 2, 0, 1, 0, 0],
  "G7": [3, 2, 0, 0, 0, 1],
  "C7": [-1, 3, 2, 3, 1, 0],
  "Am7": [-1, 0, 2, 0, 1, 0],
  "Em7": [0, 2, 0, 0, 0, 0],
  "Dm7": [-1, -1, 0, 2, 1, 1],
  "Bm7": [-1, 2, 0, 2, 0, 2],
  "Cmaj7": [-1, 3, 2, 0, 0, 0],
  "Fmaj7": [-1, -1, 3, 2, 1, 0],
  "Gmaj7": [3, 2, 0, 0, 0, 2],
  "Dmaj7": [-1, -1, 0, 2, 2, 2],
  "Amaj7": [-1, 0, 2, 1, 2, 0],
  "Emaj7": [0, 2, 1, 1, 0, 0],
  "Csus4": [-1, 3, 3, 0, 1, 0],
  "Dsus4": [-1, -1, 0, 2, 3, 3],
  "Asus4": [-1, 0, 2, 2, 3, 0],
  "Esus4": [0, 2, 2, 2, 0, 0],
  "Gsus4": [3, 3, 0, 0, 1, 3],
  "Cadd9": [-1, 3, 2, 0, 3, 0],
  "Dadd9": [-1, -1, 0, 2, 3, 0],
  "Gadd9": [3, 0, 0, 0, 1, 3],
  "Aadd9": [-1, 0, 2, 4, 2, 0],
  "D9": [-1, -1, 0, 2, 1, 2],
  "E9": [0, 2, 0, 1, 2, 0],
  "A9": [-1, 0, 2, 4, 2, 0],
  "Am7M": [-1, 0, 2, 1, 1, 0],
  "F7M": [-1, -1, 3, 2, 1, 0],
  "D4": [-1, -1, 0, 2, 3, 3],
  "D2": [-1, -1, 0, 2, 3, 0],
  "D/F#": [-1, -1, 0, 2, 3, 2],
  "G/B": [-1, 2, 0, 0, 0, 3],
  "E5": [0, 2, 2, -1, -1, -1],
  "A5": [-1, 0, 2, 2, -1, -1],
  "D5": [-1, -1, 0, 2, 3, -1],
  "G5": [3, 5, 5, -1, -1, -1],
  "B5": [-1, 2, 4, 4, -1, -1],
  "C5": [-1, 3, 5, 5, -1, -1],
  "F5": [-1, -1, -1, 2, 3, 1],
};

function autoGenerateFingers(shape: number[]): number[] {
  const frets = shape.filter(f => f > 0);
  if (frets.length === 0) return shape.map(f => f);
  const uniqueFrets = frets.filter((f: number, i: number) => frets.indexOf(f) === i).sort((a, b) => a - b);
  const fretToFinger: Record<number, number> = {};
  uniqueFrets.forEach((f, i) => { fretToFinger[f] = i + 1; });
  return shape.map(f => f > 0 ? (fretToFinger[f] || 1) : f);
}

function generateBarre(chord: string): { shape: number[] | null; fingers: number[] } {
  try {
    const isMinor = /m(?!aj)/.test(chord);
    const rootMatch = chord.match(/^([A-G][#b]?)/);
    if (!rootMatch) return { shape: null, fingers: [-1,-1,-1,-1,-1,-1] };
    const root = rootMatch[1];
    const E_STRING: Record<string, number> = {
      "E":0,"F":1,"F#":2,"Gb":2,"G":3,"G#":4,"Ab":4,"A":5,"A#":6,"Bb":6,
      "B":7,"C":8,"C#":9,"Db":9,"D":10,"D#":11,"Eb":11
    };
    const A_STRING: Record<string, number> = {
      "A":0,"A#":1,"Bb":1,"B":2,"C":3,"C#":4,"Db":4,"D":5,"D#":6,"Eb":6,
      "E":7,"F":8,"F#":9,"Gb":9,"G":10,"G#":11,"Ab":11
    };
    const eFret = E_STRING[root];
    if (eFret !== undefined && eFret > 0) {
      if (isMinor) {
        return { shape: [eFret,eFret+2,eFret+2,eFret,eFret,eFret], fingers: [1,3,4,1,1,1] };
      }
      return { shape: [eFret,eFret+2,eFret+2,eFret+1,eFret,eFret], fingers: [1,3,4,2,1,1] };
    }
    const aFret = A_STRING[root];
    if (aFret !== undefined && aFret > 0) {
      if (isMinor) {
        return { shape: [-1,aFret,aFret+2,aFret+2,aFret+1,aFret], fingers: [-1,1,2,3,4,1] };
      }
      return { shape: [-1,aFret,aFret+2,aFret+2,aFret+2,aFret], fingers: [-1,1,2,3,4,1] };
    }
    return { shape: null, fingers: [-1,-1,-1,-1,-1,-1] };
  } catch (e) {
    return { shape: null, fingers: [-1,-1,-1,-1,-1,-1] };
  }
}

function getVariations(chord: string): { shapes: number[][]; fingers: number[][] } {
  const base = CHORD_SHAPES[chord];
  if (!base || !Array.isArray(base) || base.length !== 6) {
    return { shapes: [[-1,-1,-1,-1,-1,-1]], fingers: [[-1,-1,-1,-1,-1,-1]] };
  }
  const baseFingers = CHORD_FINGERS[chord] || autoGenerateFingers(base);
  const barre = generateBarre(chord);
  if (barre.shape && Array.isArray(barre.shape) && barre.shape.length === 6) {
    const shapesEqual = JSON.stringify(base) === JSON.stringify(barre.shape);
    if (shapesEqual) return { shapes: [base], fingers: [baseFingers] };
    return { shapes: [base, barre.shape], fingers: [baseFingers, barre.fingers] };
  }
  return { shapes: [base], fingers: [baseFingers] };
}

function FretboardSVG({ shape, fingers, theme }: { shape: number[]; fingers: number[]; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const posFrets = shape.filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];
  const stringW = [3.5, 3, 2.5, 2, 1.5, 1.2];
  const dotSize = 18;
  const fretH = 28;
  const woodGrad = "linear-gradient(180deg," + C.wood1 + " 0%," + C.wood2 + " 18%," + C.wood3 + " 40%," + C.wood4 + " 65%," + C.wood5 + " 100%)";
  return (
    <svg width="100" height="130" viewBox="0 0 100 130">
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.wood1} />
          <stop offset="18%" stopColor={C.wood2} />
          <stop offset="40%" stopColor={C.wood3} />
          <stop offset="65%" stopColor={C.wood4} />
          <stop offset="100%" stopColor={C.wood5} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="130" fill="url(#wood)" rx="6" />
      <rect x="0" y="0" width="100" height="6" fill={C.nut1} />
      {frets.map((fret, fi) => (
        <line key={fi} x1="0" y1={6 + (fi + 1) * fretH} x2="100" y2={6 + (fi + 1) * fretH} stroke={C.fret1} strokeWidth="2" />
      ))}
      {shape.map((f, i) => (
        <line key={i} x1={10 + i * 16} y1="6" x2={10 + i * 16} y2="130" stroke={i < 3 ? C.strThick1 : C.strThin1} strokeWidth={stringW[i]} />
      ))}
      {shape.map((f, i) => (
        <text key={"m" + i} x={10 + i * 16} y="4" textAnchor="middle" fontSize="9" fill={f === -1 ? C.x : C.o} fontWeight="bold">
          {f === -1 ? "×" : f === 0 ? "○" : ""}
        </text>
      ))}
      {shape.map((f, i) => {
        if (f <= 0) return null;
        const fretIdx = f - baseFret;
        const y = 6 + fretIdx * fretH - fretH / 2;
        return (
          <g key={"d" + i}>
            <circle cx={10 + i * 16} cy={y} r={dotSize / 2} fill={C.dot} />
            <circle cx={10 + i * 16 - 2} cy={y - 2} r={dotSize / 4} fill={C.dotHi} opacity="0.6" />
            <text x={10 + i * 16} y={y + 4} textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">
              {fingers[i] || ""}
            </text>
          </g>
        );
      })}
      {baseFret > 0 && (
        <text x="98" y="34" textAnchor="end" fontSize="9" fill={C.muted}>
          {baseFret + 1}fr
        </text>
      )}
    </svg>
  );
}

export function MiniFretboard({ chord, theme }: { chord: string; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  // FALLBACK: acorde sem shape registrado → mostra só o nome, sem fretboard vazio
  if (!CHORD_SHAPES[chord]) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px" }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: "14px" }}>{chord}</span>
        <span style={{ color: C.muted, fontSize: "10px" }}>Sem diagrama</span>
      </div>
    );
  }
  const { shapes, fingers } = getVariations(chord);
  const [varIdx, setVarIdx] = useState(0);
  const shape = shapes[varIdx] || shapes[0];
  const finger = fingers[varIdx] || fingers[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <span style={{ color: C.text, fontWeight: 700, fontSize: "14px" }}>{chord}</span>
      <FretboardSVG shape={shape} fingers={finger} theme={theme} />
      {shapes.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx - 1 + shapes.length) % shapes.length); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: C.muted, display: "flex" }}
          >
            <ChevronLeft size={12} />
          </button>
          <span style={{ fontSize: "10px", color: C.muted }}>Variation {varIdx + 1} of {shapes.length}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx + 1) % shapes.length); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: C.muted, display: "flex" }}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

export function ChordDiagram({ chord, onClose, theme }: { chord: string; onClose: () => void; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  // FALLBACK: acorde sem shape registrado → mostra só o nome, sem fretboard vazio
  if (!CHORD_SHAPES[chord]) {
    return (
      <div
        onClick={onClose}
        style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "16px", padding: "16px", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", minWidth: "220px", textAlign: "center", cursor: "pointer" }}
      >
        <div style={{ fontSize: "24px", fontWeight: 700, color: C.text }}>{chord}</div>
        <div style={{ fontSize: "12px", color: C.muted, marginTop: "8px" }}>Sem diagrama disponível</div>
        <div style={{ fontSize: "11px", color: "#666", marginTop: "12px" }}>Click anywhere to close</div>
      </div>
    );
  }
  const { shapes, fingers } = getVariations(chord);
  const [varIdx, setVarIdx] = useState(0);
  const shape = shapes[varIdx] || shapes[0];
  const finger = fingers[varIdx] || fingers[0];
  const posFrets = shape.filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];
  const stringW = [5, 4.5, 4, 3.5, 3, 2.5];
  const dotSize = 32;
  const woodGrad = "linear-gradient(180deg," + C.wood1 + " 0%," + C.wood2 + " 18%," + C.wood3 + " 40%," + C.wood4 + " 65%," + C.wood5 + " 100%)";
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "16px", padding: "16px", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", minWidth: "220px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: C.text }}>{chord}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}>
            <X size={18} />
          </button>
        </div>
        {baseFret > 0 && (
          <div style={{ fontSize: "11px", color: C.muted, marginBottom: "4px" }}>
            Starting at fret {baseFret + 1}
          </div>
        )}
        <FretboardSVG shape={shape} fingers={finger} theme={theme} />
        {shapes.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx - 1 + shapes.length) % shapes.length); }}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "12px", color: "#aaa" }}>Variation {varIdx + 1} of {shapes.length}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx + 1) % shapes.length); }}
              style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        <div style={{ fontSize: "11px", color: "#666", textAlign: "center", marginTop: "12px" }}>
          Click anywhere to close
        </div>
      </div>
    </div>
  );
}

eexport function ChordSpan({ chord, onClick, theme }: { chord: string; onClick: (chord: string) => void; theme: typeof THEMES[ThemeKey] }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <span
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => onClick(chord)}
      style={{ position: "relative", cursor: "pointer", color: "#34d399", fontWeight: 700 }}
    >
      {chord}
      {showTip && (
        <span style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <MiniFretboard chord={chord} theme={theme} />
        </span>
      )}
    </span>
  );
}

export function ThemePicker({ current, onChange }: { current: ThemeKey; onChange: (k: ThemeKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (open ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}
      >
        <Palette size={16} />
        Theme: {THEMES[current].label}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "12px", padding: "8px", minWidth: "180px", zIndex: 20 }}>
          {THEME_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px 12px", background: k === current ? "rgba(240,180,41,0.1)" : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: k === current ? "#f0b429" : "#e0e0e0", fontSize: "13px", fontWeight: k === current ? 700 : 400 }}
            >
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: THEMES[k].swatch }} />
              {THEMES[k].label}
              {k === current && <BadgeCheck size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
