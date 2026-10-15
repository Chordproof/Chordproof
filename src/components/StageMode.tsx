"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sun, Minus, Plus, X } from "lucide-react";

// Modo Palco: cifra em fullscreen com fundo preto puro, fonte gigante e controle de tamanho.
// Feito para leitura em cima do palco — recurso ChordProof+.
export default function StageMode({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(2);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const saved = Number(localStorage.getItem("chordproof-stage-scale") || 2);
    if (saved >= 1 && saved <= 4) setFontScale(saved);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function changeScale(delta: number) {
    setFontScale((s) => {
      const next = Math.min(4, Math.max(1, s + delta));
      localStorage.setItem("chordproof-stage-scale", String(next));
      return next;
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Stage Mode — fullscreen, pure black, giant text"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/5 hover:bg-white/10 transition"
      >
        <Sun size={16} /> Stage Mode
      </button>
      {mounted && open && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#000", color: "#fff",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            position: "fixed", top: 12, right: 12, zIndex: 10001,
            display: "flex", gap: 8, alignItems: "center",
            background: "rgba(30,30,30,0.85)", borderRadius: 999, padding: "6px 10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <button onClick={() => changeScale(-0.5)} title="Smaller text" style={ctlBtn}><Minus size={18} /></button>
            <span style={{ fontSize: 12, opacity: 0.7, minWidth: 32, textAlign: "center" }}>{Math.round(fontScale * 100)}%</span>
            <button onClick={() => changeScale(0.5)} title="Bigger text" style={ctlBtn}><Plus size={18} /></button>
            <button onClick={() => setOpen(false)} title="Exit Stage Mode (Esc)" style={ctlBtn}><X size={18} /></button>
          </div>
          <div style={{
            flex: 1, overflowY: "auto", padding: "56px 20px 80px",
            WebkitOverflowScrolling: "touch",
          }}>
            <div style={{
              fontFamily: "monospace",
              fontSize: `${fontScale}rem`,
              lineHeight: 1.9,
              whiteSpace: "pre-wrap",
              maxWidth: 900, margin: "0 auto",
            }}>
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const ctlBtn: React.CSSProperties = {
  padding: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)",
  display: "flex", alignItems: "center", cursor: "pointer",
};
