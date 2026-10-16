"use client";
import { useEffect, useRef, useState } from "react";
import { INSTRUMENTS, INSTRUMENT_ORDER, type InstrumentKey } from "@/lib/instruments";

/**
 * InstrumentPicker — mockup Fase A: dropdown compacto.
 * Um botão único mostra o instrumento atual; o menu abre a lista completa
 * com mini-descrição. Reduz ~40% da largura da toolbar.
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
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const inst = INSTRUMENTS[current];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)]"
        title={inst.description}
      >
        <span>{inst.icon}</span>
        <span>{inst.label}</span>
        <span style={{ fontSize: "10px", opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, marginTop: "8px",
            background: "var(--c-bg-elevated)", border: "1px solid var(--c-hairline)", borderRadius: "12px",
            padding: "6px", minWidth: "190px", zIndex: 60, boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
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