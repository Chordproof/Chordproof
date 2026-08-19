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

const CHORD_VARIATIONS: Record<string, number[][]> = {
  Am: [[-1, 0, 2, 2, 1, 0], [5, 7, 7, 5, 5, 5]],
  C: [[-1, 3, 2, 0, 1, 0], [8, 10, 10, 9, 8, 8], [-1, 3, 5, 5, 5, 3]],
  D: [[-1, -1, 0, 2, 3, 2], [10, 12, 12, 11, 10, 10], [-1, -1, 0, 2, 3, 2]],
  E: [[0, 2, 2, 1, 0, 0], [7, 9, 9, 8, 7, 7], [0, 2, 2, 1, 0, 0]],
  Em: [[0, 2, 2, 0, 0, 0], [7, 9, 9, 0, 0, 0], [0, 2, 2, 0, 0, 0]],
  G: [[3, 2, 0, 0, 0, 3], [10, 12, 12, 11, 10, 10], [3, 2, 0, 0, 0, 3]],
  F: [[1, 3, 3, 2, 1, 1], [8, 10, 10, 9, 8, 8], [1, 3, 3, 2, 1, 1]],
  A: [[-1, 0, 2, 2, 2, 0], [5, 7, 7, 6, 5, 5], [-1, 0, 2, 2, 2, 0]],
  Bm: [[-1, 2, 4, 4, 3, 2], [7, 9, 9, 7, 7, 7], [-1, 2, 4, 4, 3, 2]],
};

function getVariations(chord: string): number[][] {
  if (CHORD_VARIATIONS[chord]) return CHORD_VARIATIONS[chord];
  const base = CHORD_SHAPES[chord];
  return base ? [base] : [[-1, -1, -1, -1, -1, -1]];
}

function FretboardSVG({ shape, theme }: { shape: number[]; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const posFrets = shape.filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];
  const stringW = [3, 2.6, 2.2, 1.8, 1.4, 1];
  const dotSize = 14;
  const fretH = 26;
  const totalH = 5 + fretH * 4 + 20;
  const totalW = 130;

  return (
    <div style={{ width: totalW + "px", background: "#fff", borderRadius: "4px", padding: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", marginBottom: "2px" }}>
        {shape.map((f: number, i: number) => (
          <div key={i} style={{ textAlign: "center", fontSize: "12px", color: f === -1 ? C.x : f === 0 ? C.o : "transparent", fontWeight: 700, height: "16px", lineHeight: "16px" }}>
            {f === -1 ? "×" : f === 0 ? "○" : ""}
          </div>
        ))}
      </div>
      <div style={{ height: "4px", background: "#333", borderRadius: "1px", marginBottom: "0" }} />
      {frets.map((fret: number, fi: number) => (
        <div key={fret} style={{ position: "relative", height: fretH + "px", borderBottom: "1px solid #bbb" }}>
          {shape.map((f: number, i: number) => (
            <div key={i} style={{
              position: "absolute",
              left: ((i + 0.5) / 6 * 100) + "%",
              top: "0", bottom: "0",
              width: stringW[i] + "px",
              marginLeft: -(stringW[i] / 2) + "px",
              background: i < 3 ? "#b8860b" : "#ccc",
              opacity: 0.5,
            }} />
          ))}
          {shape.map((f: number, i: number) => (
            f === fret ? (
              <div key={"d" + i} style={{
                position: "absolute",
                left: ((i + 0.5) / 6 * 100) + "%",
                top: "50%",
                width: dotSize + "px", height: dotSize + "px",
                marginLeft: -(dotSize / 2) + "px", marginTop: -(dotSize / 2) + "px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 25%," + C.dotHi + "," + C.dot + " 60%," + C.dot + " 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)",
                zIndex: "2",
              }} />
            ) : null
          ))}
        </div>
      ))}
      {baseFret > 0 && (
        <div style={{ textAlign: "right", fontSize: "10px", color: "#999", marginTop: "2px" }}>{baseFret + 1}ª casa</div>
      )}
    </div>
  );
}

export function MiniFretboard({ chord, theme }: { chord: string; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const variations = getVariations(chord);
  const [varIdx, setVarIdx] = useState(0);
  const shape = variations[varIdx] || variations[0];

  return (
    <div style={{
      background: "#fff", borderRadius: "6px", padding: "0", width: "146px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)", overflow: "hidden",
      border: "1px solid #e0e0e0",
    }}>
      <div style={{
        background: "#f8f8f8", padding: "6px 8px", borderBottom: "1px solid #e0e0e0",
        textAlign: "center",
      }}>
        <span style={{ color: C.text, fontWeight: "bold", fontSize: "15px" }}>{chord}</span>
      </div>
      <div style={{ padding: "8px", display: "flex", justifyContent: "center" }}>
        <FretboardSVG shape={shape} theme={theme} />
      </div>
      {variations.length > 1 && (
        <div style={{
          background: "#f8f8f8", borderTop: "1px solid #e0e0e0", padding: "4px 8px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx - 1 + variations.length) % variations.length); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#666", display: "flex" }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: "10px", color: "#666", fontWeight: 600 }}>
            Variação {varIdx + 1} de {variations.length}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setVarIdx((varIdx + 1) % variations.length); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#666", display: "flex" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function ChordDiagram({ chord, onClose, theme }: { chord: string; onClose: () => void; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const variations = getVariations(chord);
  const [varIdx, setVarIdx] = useState(0);
  const shape = variations[varIdx] || variations[0];
  const posFrets = shape.filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];
  const stringW = [5, 4.5, 4, 3.5, 3, 2.5];
  const dotSize = 28;

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
                      zIndex: "2",
                    }} />
                  ) : null
                ))}
              </div>
            ))}
            {baseFret > 0 && <div style={{ textAlign: "right", fontSize: "14px", color: "#999", marginTop: "6px" }}>Starting at fret {baseFret + 1}</div>}
          </div>
        </div>
        {variations.length > 1 && (
          <div style={{ background: "#f8f8f8", borderTop: "1px solid #e0e0e0", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <button onClick={() => setVarIdx((varIdx - 1 + variations.length) % variations.length)} style={{ background: "#e8e8e8", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>Variação {varIdx + 1} de {variations.length}</span>
            <button onClick={() => setVarIdx((varIdx + 1) % variations.length)} style={{ background: "#e8e8e8", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
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