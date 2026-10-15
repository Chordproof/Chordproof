// instruments.ts — Versões por instrumento (guitarra, violão, baixo, cavaco, ukulele)

export type InstrumentKey = "guitar" | "acoustic" | "bass" | "cavaco" | "ukulele";

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
    key: "guitar", label: "Guitar", icon: "🎸", strings: 6,
    tuning: ["E2", "A2", "D3", "G3", "B3", "E4"], maxFret: 22,
    description: "6-string electric guitar",
  },
  acoustic: {
    key: "acoustic", label: "Acoustic", icon: "🪕", strings: 6,
    tuning: ["E2", "A2", "D3", "G3", "B3", "E4"], maxFret: 19,
    description: "6-string acoustic guitar (same shapes)",
  },
  bass: {
    key: "bass", label: "Bass", icon: "🎸", strings: 4,
    tuning: ["E1", "A1", "D2", "G2"], maxFret: 20,
    description: "4-string bass — root notes, one octave below",
  },
  cavaco: {
    key: "cavaco", label: "Cavaco", icon: "🎵", strings: 4,
    tuning: ["D3", "G3", "B3", "E4"], maxFret: 17,
    description: "4-string cavaquinho (D-G-B-E)",
  },
  ukulele: {
    key: "ukulele", label: "Ukulele", icon: "🪕", strings: 4,
    tuning: ["G4", "C4", "E4", "A4"], maxFret: 17,
    description: "4-string ukulele (G-C-E-A)",
  },
};

export const INSTRUMENT_ORDER: InstrumentKey[] = ["guitar", "acoustic", "bass", "cavaco", "ukulele"];

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
export function guitarToBass(chordName: string): number[] {
  const m = chordName.match(/^([A-G][#b]?)/);
  if (!m) return [-1, -1, -1, -1];
  const rootPc = noteToSemitone(m[1]);

  // Casa da fundamental em cada corda: (pc alvo - pc da corda solta) mod 12
  // E1 tem pc 4, A1 tem pc 9
  const eFret = (rootPc - 4 + 12) % 12;
  const aFret = (rootPc - 9 + 12) % 12;

  // Fundamental na corda com a MENOR casa (posição mais confortável)
  const useE = eFret <= aFret;
  const shape: number[] = [-1, -1, -1, -1];
  shape[0] = useE ? eFret : -1;
  shape[1] = useE ? -1 : aFret;

  // Quinta (+7 semitons): prefere a corda G (casa ≤ 5), senão a D (casa ≤ 7)
  const fifthPc = (rootPc + 7) % 12;
  const gFret = (fifthPc - 7 + 12) % 12; // G2 tem pc 7
  const dFret = (fifthPc - 2 + 12) % 12; // D2 tem pc 2
  if (gFret <= 5) {
    shape[3] = gFret;
  } else if (dFret <= 7) {
    shape[2] = dFret;
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
      return guitarToBass(chordName);
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
export interface InstrumentVisual {
  wood1: string; wood2: string; wood3: string; wood4: string; wood5: string;
  binding: string;
  bindingWidth: number;
  nut: string;
  nutHeight: number;
  stringColor: string;
  stringHighlight: string;
  stringWidths: number[];
  inlay: string;
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
  cavaco: {
    // Cavaquinho: madeira clara (freijó), cordas de aço finas, nut pequeno
    wood1: "#b08048", wood2: "#946234", wood3: "#744824", wood4: "#503014", wood5: "#845830",
    binding: "#2a180c", bindingWidth: 1.5,
    nut: "#e8dcc8", nutHeight: 5,
    stringColor: "#b8c0c8", stringHighlight: "#d8e0e8",
    stringWidths: [2.4, 2.0, 1.7, 1.4],
    inlay: "#f0e8d8", inlayRadius: 3,
    fretColor: "#c8c0b0", fretColor2: "#8a8070",
  },
  ukulele: {
    // Ukulele: koa dourado avermelhado, cordas de NYLON pálidas, nut de osso
    wood1: "#a87040", wood2: "#8a5630", wood3: "#6a3e1e", wood4: "#482a10", wood5: "#7a4c28",
    binding: "#3a2410", bindingWidth: 2,
    nut: "#f0e8d8", nutHeight: 6,
    stringColor: "#e8e0cc", stringHighlight: "#f8f4e8",
    stringWidths: [2.8, 2.4, 2.0, 1.7],
    inlay: "#f5eedd", inlayRadius: 3,
    fretColor: "#d0c0a0", fretColor2: "#96825e",
  },
};

export function getInstrumentVisual(instrument: InstrumentKey): InstrumentVisual {
  return INSTRUMENT_VISUALS[instrument];
}
