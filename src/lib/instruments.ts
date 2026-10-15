// instruments.ts — Fase 1: versões por instrumento (violão, guitarra, baixo)
// Cada instrumento define: nº de cordas, afinação e como converter os voicings de 6 cordas.

export type InstrumentKey = "guitar" | "acoustic" | "bass";

export interface InstrumentDef {
  key: InstrumentKey;
  label: string;
  icon: string;
  strings: number;
  tuning: string[];
  maxFret: number;
  description: string;
}

export const INSTRUMENTS: Record<InstrumentKey, InstrumentDef> = {
  guitar: {
    key: "guitar",
    label: "Guitar",
    icon: "🎸",
    strings: 6,
    tuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
    maxFret: 22,
    description: "6-string electric guitar",
  },
  acoustic: {
    key: "acoustic",
    label: "Acoustic",
    icon: "🪕",
    strings: 6,
    tuning: ["E2", "A2", "D3", "G3", "B3", "E4"],
    maxFret: 19,
    description: "6-string acoustic guitar (same shapes)",
  },
  bass: {
    key: "bass",
    label: "Bass",
    icon: "🎸",
    strings: 4,
    tuning: ["E1", "A1", "D2", "G2"],
    maxFret: 20,
    description: "4-string bass — root notes, one octave below",
  },
};

export const INSTRUMENT_ORDER: InstrumentKey[] = ["guitar", "acoustic", "bass"];

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

export function noteToSemitone(note: string): number {
  return NOTE_TO_SEMITONE[note] ?? 0;
}

/**
 * Converte um voicing de guitarra (6 cordas) para baixo (4 cordas).
 * Baixo = melodia de fundamento: fundamental na corda grave + quinta opcional.
 */
export function guitarToBass(chordName: string, _guitarShape: number[]): number[] {
  const m = chordName.match(/^([A-G][#b]?)/);
  if (!m) return [-1, -1, -1, -1];
  const root = m[1];
  const rootSemi = noteToSemitone(root);

  const eStringFret = rootSemi; // corda E1: casa 0-11 para as 12 notas
  const aStringFret = ((rootSemi - 5) % 12 + 12) % 12; // corda A1

  let shape: number[];
  if (eStringFret <= 12) {
    shape = [eStringFret, -1, -1, -1];
  } else {
    shape = [-1, aStringFret, -1, -1];
  }

  // Quinta (+7 semitons) na corda D, quando couber
  const fifthSemi = (rootSemi + 7) % 12;
  const dStringFret = ((fifthSemi - 10) % 12 + 12) % 12; // D2 = E1+10 semitons
  if (dStringFret >= 0 && dStringFret <= 15) {
    shape[2] = dStringFret;
  }

  return shape;
}

/**
 * Para violão: voicings idênticos aos de guitarra (mesma afinação/casas).
 */
export function guitarToAcoustic(shape: number[]): number[] {
  return [...shape];
}

/**
 * Converte um shape de guitarra para o instrumento escolhido.
 */
export function adaptShape(chordName: string, guitarShape: number[], instrument: InstrumentKey): number[] {
  switch (instrument) {
    case "bass":
      return guitarToBass(chordName, guitarShape);
    case "acoustic":
      return guitarToAcoustic(guitarShape);
    default:
      return [...guitarShape];
  }
}

export function stringCount(instrument: InstrumentKey): number {
  return INSTRUMENTS[instrument].strings;
}

export function openStringLabels(instrument: InstrumentKey): string[] {
  return INSTRUMENTS[instrument].tuning.map((t) => t.replace(/\d/, ""));
}