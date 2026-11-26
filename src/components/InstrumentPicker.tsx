"use client";
import { useEffect, useRef, useState } from "react";
import { INSTRUMENTS, INSTRUMENT_ORDER, type InstrumentKey } from "@/lib/instruments";

/**
 * InstrumentPicker — dropdown compacto na action bar.
 * Um botão único mostra o instrumento atual; o menu abre a lista completa
 * com mini-descrição. Reduz ~40% da largura da toolbar.
 *
 * No celular o rótulo escrito some (classe .tlbl) e fica o ícone + seta;
 * o nome continua no `title` e o rótulo no aria-label do botão.
 */
export default function InstrumentPicker({
  current,
  onChange,
}: {
  current: InstrumentKey;
  onChange: (k: InstrumentKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const inst = INSTRUMENTS[current];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="tbtn tinst"
        title={inst.description}
        aria-label={`Instrument: ${inst.label}`}
        aria-expanded={open}
      >
        <span aria-hidden>{inst.icon}</span>
        <span className="tlbl">{inst.label}</span>
        <span className="chev" aria-hidden>▾</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: "100%", right: 0, marginTop: "8px",
            background: "var(--c-bg-elevated)", border: "1px solid var(--c-hairline)", borderRadius: "12px",
            padding: "6px", minWidth: "210px", zIndex: 60, boxShadow: "var(--c-shadow)",
          }}
        >
          {INSTRUMENT_ORDER.map((k) => {
            const i = INSTRUMENTS[k];
            const active = k === current;
            return (
              <button
                key={k}
                onClick={() => { onChange(k); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", width: "100%",
                  padding: "8px 12px", background: active ? "var(--c-gold-soft)" : "transparent",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                  color: active ? "var(--c-gold)" : "var(--c-text)", fontSize: "13px",
                  fontWeight: active ? 700 : 400, textAlign: "left",
                }}
              >
                <span style={{ fontSize: "16px" }}>{i.icon}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block" }}>{i.label}</span>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--c-text-tertiary)" }}>{i.description}</span>
                </span>
                {active && <span style={{ color: "var(--c-gold)" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
