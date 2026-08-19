"use client";
import { useState } from "react";
import { BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, Palette, X } from "lucide-react";
import { CHORD_SHAPES } from "./chordData";

export type ThemeKey = "amber" | "classic" | "emerald" | "crimson" | "ocean";

export const THEMES: Record<ThemeKey, {
  label: string; swatch: string;
  dot: string; dotHi: string; dotGlow: string;
  text: string; muted: string; x: string; o: string;
}> = {
  amber: {
    label: "Amber", swatch: "#f0b429",
    dot: "#f0b429", dotHi: "#ffd966", dotGlow: "rgba(240,180,41,0.3)",
    text: "#8a6a2a", muted: "#a09070", x: "#e74c3c", o: "#27ae60",
  },
  classic: {
    label: "Classic", swatch: "#333333",
    dot: "#333", dotHi: "#555", dotGlow: "rgba(0,0,0,0.2)",
    text: "#333", muted: "#666", x: "#e74c3c", o: "#27ae60",
  },
  emerald: {
    label: "Emerald", swatch: "#10b981",
    dot: "#10b981", dotHi: "#34d399", dotGlow: "rgba(16,185,129,0.3)",
    text: "#2a6a4a", muted: "#5a8a6a", x: "#e74c3c", o: "#27ae60",
  },
  crimson: {
    label: "Crimson", swatch: "#dc2626",
    dot: "#dc2626", dotHi: "#ff6b6b", dotGlow: "rgba(220,38,38,0.3)",
    text: "#8a2a2a", muted: "#a07070", x: "#e74c3c", o: "#27ae60",
  },
  ocean: {
    label: "Ocean", swatch: "#2563eb",
    dot: "#2563eb", dotHi: "#60a5fa", dotGlow: "rgba(37,99,235,0.3)",
    text: "#2a4a8a", muted: "#5a7090", x: "#e74c3c", o: "#27ae60",
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
}

function getVariations(chord: string): { shapes: number[][]; fingers: number[][] } {
  const base = CHORD_SHAPES[chord];
  if (!base) return { shapes: [[-1,-1,-1,-1,-1,-1]], fingers: [[-1,-1,-1,-1,-1,-1]] };
  const baseFingers = CHORD_FINGERS[chord] || autoGenerateFingers(base);
  const barre = generateBarre(chord);
  if (barre.shape) {
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
  const stringW = [3, 2.6, 2.2, 1.8, 1.4, 1];
  const dotSize = 18;
  const fretH = 28;

  return (
    <div style={{ width: "130px", background: "#fff", borderRadius: "4px", padding: "8px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", marginBottom: "2px" }}>
        {shape.map((f: number, i: number) => (
          <div key={i} style={{ textAlign: "center", fontSize: "12px", color: f === -1 ? C.x : f === 0 ? C.o : "transparent", fontWeight: 700, height: "16px", lineHeight: "16px" }}>
            {f === -1 ? "×" : f === 0 ? "○" : ""}
          </div>
        ))}
      </div>
      <div style={{ height: "4px", background: "#333", borderRadius: "1px" }} />
      {frets.map((fret: number, fi: number) => (
        <div key={fret} style={{ position: "relative", height: fretH + "px", borderBottom: "1px solid #bbb" }}>
          {shape.map((f: number, i: number) => (
            <div key={i} style={{
              position: "absolute", left: ((i + 0.5) / 6 * 100) + "%", top: "0", bottom: "0",
              width: stringW[i] + "px", marginLeft: -(stringW[i] / 2) + "px",
              background: i < 3 ? "#b8860b" : "#ccc", opacity: 0.5,
            }} />
          ))}
          {shape.map((f: number, i: number) => (
            f === fret ? (
              <div key={"d" + i} style={{
                position: "absolute", left: ((i + 0.5) / 6 * 100) + "%", top: "50%",
                width: dotSize + "px", height: dotSize + "px",
                marginLeft: -(dotSize / 2) + "px", marginTop: -(dotSize / 2) + "px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 25%," + C.dotHi + "," + C.dot + " 60%," + C.dot + " 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)",
                zIndex: "2", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700, lineHeight: 1 }}>
                  {fingers[i] || ""}
                </span>
              </div>
            ) : null
          ))}
        </div>
      ))}
      {baseFret > 0 && (
        <div style={{ textAlign: "right", fontSize: "10px", color: "#999", marginTop: "2px" }}>{baseFret + 1}fr</div>
      )}
    </div>
  );
}

export function MiniFretboard({ chord, theme }: { chord: string; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const { shapes, fingers } = getVariations(chord);
  const [varIdx, setVarIdx] = useState(0);
  const shape = shapes[varIdx] || shapes[0];
  const finger = fingers[varIdx] || fingers[0];

  return (
    <div style={{
      background: "#fff", borderRadius: "6px", width: "146px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)", overflow: "hidden",
      border: "1px solid #e0e0e0",
    }}>
      <div style={{ background: "#f8f8f8", padding: "6px 8px", borderBottom: "1px solid #e0e0e0", textAlign: "center" }}>
        <span style={{ color: C.text, fontWeight: "bold", fontSize: "15px" }}>{chord}</span>
      </div>
      <div style={{ padding: "8px", display: "flex", justifyContent: "center" }}>
        <FretboardSVG shape={shape} fingers={finger} theme={theme} />
      </div>
      <div style={{
        background: "#f8f8f8", borderTop: "1px solid #e0e0e0", padding: "4px 8px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx - 1 + shapes.length) % shapes.length); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#666", display: "flex" }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: "10px", color: "#666", fontWeight: 600 }}>
          Variation {varIdx + 1} of {shapes.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx + 1) % shapes.length); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#666", display: "flex" }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function ChordDiagram({ chord, onClose, theme }: { chord: string; onClose: () => void; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
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

  return (
    <div style={{ position: "fixed", inset: "0", zIndex: "9999", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", padding: "16px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#f8f8f8", borderBottom: "1px solid #e0e0e0" }}>
          <span style={{ color: C.text, fontWeight: "bold", fontSize: "24px" }}>{chord}</span>
          <button onClick={onClose} style={{ background: "#e8e8e8", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "240px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", marginBottom: "4px" }}>
              {shape.map((f: number, i: number) => (
                <div key={i} style={{ textAlign: "center", fontSize: "20px", color: f === -1 ? C.x : f === 0 ? C.o : "transparent", fontWeight: 700 }}>
                  {f === -1 ? "×" : f === 0 ? "○" : ""}
                </div>
              ))}
            </div>
            <div style={{ height: "8px", background: "#333", borderRadius: "2px" }} />
            {frets.map((fret: number, fi: number) => (
              <div key={fret} style={{ position: "relative", height: "48px", borderBottom: "2px solid #bbb" }}>
                {shape.map((f: number, i: number) => (
                  <div key={i} style={{
                    position: "absolute", left: ((i + 0.5) / 6 * 100) + "%", top: "0", bottom: "0",
                    width: stringW[i] + "px", marginLeft: -(stringW[i] / 2) + "px",
                    background: i < 3 ? "#b8860b" : "#ccc", opacity: 0.5,
                  }} />
                ))}
                {shape.map((f: number, i: number) => (
                  f === fret ? (
                    <div key={"d" + i} style={{
                      position: "absolute", left: ((i + 0.5) / 6 * 100) + "%", top: "50%",
                      width: dotSize + "px", height: dotSize + "px",
                      marginLeft: -(dotSize / 2) + "px", marginTop: -(dotSize / 2) + "px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 30% 25%," + C.dotHi + "," + C.dot + " 60%," + C.dot + " 100%)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 2px rgba(0,0,0,0.2), inset 0 2px 2px rgba(255,255,255,0.4)",
                      zIndex: "2", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "#fff", fontSize: "16px", fontWeight: 700, lineHeight: 1 }}>
                        {finger[i] || ""}
                      </span>
                    </div>
                  ) : null
                ))}
              </div>
            ))}
            {baseFret > 0 && <div style={{ textAlign: "right", fontSize: "14px", color: "#999", marginTop: "6px" }}>Starting at fret {baseFret + 1}</div>}
          </div>
        </div>
        <div style={{ background: "#f8f8f8", borderTop: "1px solid #e0e0e0", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <button onClick={() => setVarIdx((varIdx - 1 + shapes.length) % shapes.length)} style={{ background: "#e8e8e8", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>Variation {varIdx + 1} of {shapes.length}</span>
          <button onClick={() => setVarIdx((varIdx + 1) % shapes.length)} style={{ background: "#e8e8e8", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <p style={{ color: "#999", fontSize: "11px", textAlign: "center", padding: "8px" }}>Click anywhere to close</p>
      </div>
    </div>
  );
}

export function ChordSpan({ chord, onClick, theme }: { chord: string; onClick: (chord: string) => void; theme: typeof THEMES[ThemeKey] }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", color: "#34d399", fontWeight: 700, cursor: "pointer" }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => onClick(chord)}>
      {chord}
      {showTip && (
        <span style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "8px", zIndex: "9999", display: "block" }}>
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
      <button onClick={() => setOpen(!open)} className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (open ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}>
        <Palette size={16} /> Theme: {THEMES[current].label}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", right: "0", marginTop: "8px", background: "#1a1a2e", border: "1px solid #333", borderRadius: "12px", padding: "8px", zIndex: "9999", minWidth: "180px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>
          {THEME_KEYS.map((k) => (
            <button key={k} onClick={() => { onChange(k); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px 12px", background: k === current ? "rgba(240,180,41,0.1)" : "transparent", border: "none", borderRadius: "8px", cursor: "pointer", color: k === current ? "#f0b429" : "#e0e0e0", fontSize: "13px", fontWeight: k === current ? 700 : 400 }}>
              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "radial-gradient(circle at 30% 25%," + THEMES[k].dotHi + "," + THEMES[k].dot + ")", border: "1px solid " + THEMES[k].text, flexShrink: 0 }} />
              {THEMES[k].label}
              {k === current && <BadgeCheck size={14} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}