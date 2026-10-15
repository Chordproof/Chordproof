"use client";
import { INSTRUMENTS, INSTRUMENT_ORDER, type InstrumentKey } from "@/lib/instruments";

/**
 * InstrumentPicker — Fase 1: seletor de versão por instrumento.
 * Aparece na toolbar da cifra; a escolha persiste em localStorage.
 */
export default function InstrumentPicker({
  current,
  onChange,
}: {
  current: InstrumentKey;
  onChange: (k: InstrumentKey) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 rounded-full p-1">
      {INSTRUMENT_ORDER.map((k) => {
        const inst = INSTRUMENTS[k];
        const active = k === current;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            title={inst.description}
            className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition " + (active ? "bg-brand-gold text-black" : "text-brand-muted hover:text-white")}
          >
            <span>{inst.icon}</span>
            <span>{inst.label}</span>
          </button>
        );
      })}
    </div>
  );
}