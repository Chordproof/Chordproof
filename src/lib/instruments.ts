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

// ============ Identidade visual do braço por instrumento ============
// Cada instrumento tem madeira, cordas, inlays e nut próprios — o diagrama
// deve "parecer" o braço daquele instrumento, não um genérico.
export interface InstrumentVisual {
  wood1: string; wood2: string; wood3: string; wood4: string; wood5: string;
  binding: string;         // borda lateral do braço
  bindingWidth: number;
  nut: string;             // cor do nut (osso/plástico/metal)
  nutHeight: number;
  stringColor: string;     // cordas graves
  stringHighlight: string; // cordas agudas
  stringWidths: number[];  // espessura por corda (grave → aguda)
  inlay: string;           // cor dos marcadores de posição (casas 3/5/7/9/12)
  inlayRadius: number;
  fretColor: string; fretColor2: string;
}

export const INSTRUMENT_VISUALS: Record<InstrumentKey, InstrumentVisual> = {
  guitar: {
    // Guitarra elétrica: rosewood escuro frio, cordas de aço finas, nut metálico
    wood1: "#5a3a28", wood2: "#332015", wood3: "#1e120b", wood4: "#120a06", wood5: "#2a1a10",
    binding: "#1a0f08", bindingWidth: 1.5,
    nut: "#d8d8d8", nutHeight: 6,
    stringColor: "#c8c8c8", stringHighlight: "#f0f0f0",
    stringWidths: [2.8, 2.4, 2.0, 1.6, 1.3, 1.1],
    inlay: "#e8e0d0", inlayRadius: 3,
    fretColor: "#c0c0c0", fretColor2: "#787878",
  },
  acoustic: {
    // Violão: rosewood quente mais claro, cordas de BRONZE, nut de osso, binding creme
    wood1: "#8a5a38", wood2: "#6a3f24", wood3: "#4a2a16", wood4: "#2e1a0c", wood5: "#5a3820",
    binding: "#f0e4d0", bindingWidth: 2.5,
    nut: "#f0e4d0", nutHeight: 7,
    stringColor: "#d4a860", stringHighlight: "#f0d090",
    stringWidths: [3.4, 2.9, 2.4, 1.9, 1.5, 1.2],
    inlay: "#f0e4d0", inlayRadius: 3.5,
    fretColor: "#c8b090", fretColor2: "#8a7050",
  },
  bass: {
    // Baixo: madeira quase preta, cordas GROSSAS de aço, nut largo
    wood1: "#3a2418", wood2: "#241410", wood3: "#160c08", wood4: "#0c0604", wood5: "#1e120c",
    binding: "#0a0503", bindingWidth: 2,
    nut: "#f0f0f0", nutHeight: 8,
    stringColor: "#d0d0d0", stringHighlight: "#f8f8f8",
    stringWidths: [6, 5, 4.2, 3.6],
    inlay: "#e0d8c8", inlayRadius: 4,
    fretColor: "#b8b8b8", fretColor2: "#6a6a6a",
  },
};

export function getInstrumentVisual(instrument: InstrumentKey): InstrumentVisual {
  return INSTRUMENT_VISUALS[instrument];
}