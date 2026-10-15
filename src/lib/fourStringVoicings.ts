// fourStringVoicings.ts — Fase 2: voicings de cavaquinho/ukulele gerados por teoria musical
// Em vez de dicionário manual, geramos o voicing a partir do nome do acorde:
// 1. Parse do nome → fórmula de intervalos (maior, menor, 7, m7, maj7, sus, dim, aug...)
// 2. Notas do acorde = fundamental + intervalos
// 3. Para cada corda, escolher a casa cuja nota pertence ao acorde, com dedos ≤ 3.

import { noteToSemitone, type InstrumentKey, INSTRUMENTS } from "./instruments";

const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function pcToName(pc: number): string {
  return PITCH_NAMES[((pc % 12) + 12) % 12];
}

interface ChordSpec {
  root: number; // pitch class 0-11
  intervals: number[]; // semitons a partir da fundamental
}

/** Parseia o nome do acorde para fundamental + intervalos. */
export function parseChord(name: string): ChordSpec | null {
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return null;
  const root = noteToSemitone(m[1]);
  const rest = m[2];

  // Remove baixo slash para o voicing (ex: Fm/C → Fm)
  const quality = rest.split("/")[0];

  // Fórmulas (semitons além da fundamental)
  const F: Record<string, number[]> = {
    "": [0, 4, 7],           // maior
    m: [0, 3, 7],            // menor
    "7": [0, 4, 7, 10],
    m7: [0, 3, 7, 10],
    maj7: [0, 4, 7, 11],
    "m7M": [0, 3, 7, 11],
    "6": [0, 4, 7, 9],
    m6: [0, 3, 7, 9],
    sus4: [0, 5, 7],
    sus2: [0, 2, 7],
    dim: [0, 3, 6],
    "°": [0, 3, 6],
    aug: [0, 4, 8],
    "+": [0, 4, 8],
    "5": [0, 7],
    "9": [0, 4, 7, 10, 14],
    m9: [0, 3, 7, 10, 14],
    maj9: [0, 4, 7, 11, 14],
    add9: [0, 4, 7, 14],
    madd9: [0, 3, 7, 14],
    "7M": [0, 4, 7, 11],
    dim7: [0, 3, 6, 9],
    m7b5: [0, 3, 6, 10],
    "ø": [0, 3, 6, 10],
  };

  // Normaliza variações comuns
  let key = quality;
  const aliases: Record<string, string> = {
    "maj": "", "M": "", "major": "",
    "min": "m", "minor": "m", "-": "m",
    "7M": "maj7", "△7": "maj7", "Δ": "maj7",
    "º": "°", "o": "°",
  };
  if (key in aliases) key = aliases[key];

  const intervals = F[key];
  if (!intervals) {
    // Qualidade desconhecida: cai para tríade maior (melhor que nada)
    return { root, intervals: F[""] };
  }
  return { root, intervals };
}

/** Notas do acorde como pitch classes. */
function chordPitchClasses(spec: ChordSpec): Set<number> {
  return new Set(spec.intervals.map((i) => (spec.root + i) % 12));
}

/**
 * Gera um voicing de 4 cordas para o instrumento.
 * shape[i] = casa da corda i (0 = solta, -1 = não tocar), cordas da GRAVE à AGUDA.
 */
export function generateVoicing(chordName: string, instrument: InstrumentKey): number[] {
  const inst = INSTRUMENTS[instrument];
  const spec = parseChord(chordName);
  if (!spec) return [-1, -1, -1, -1];

  const pcs = chordPitchClasses(spec);
  const nStrings = inst.strings;
  const stringPcs = inst.tuning.map((t) => noteToSemitone(t.replace(/\d/, "")));

  const shape: number[] = new Array(nStrings).fill(-1);
  let usedFingers = 0;

  // 1. FUNDAMENTAL na corda mais grave possível (casa 0-7)
  for (let s = 0; s < nStrings; s++) {
    const spc = stringPcs[s];
    let found = -1;
    for (let fret = 0; fret <= 7; fret++) {
      if ((spc + fret) % 12 === spec.root) { found = fret; break; }
    }
    if (found >= 0) {
      shape[s] = found;
      if (found > 0) usedFingers++;
      break;
    }
  }

  // 2. Demais cordas (da AGUDA para a GRAVE): menor casa com nota do acorde,
  //    sem exceder 3 dedos pressionados (corda solta não conta).
  for (let s = nStrings - 1; s >= 0; s--) {
    if (shape[s] !== -1) continue;
    const spc = stringPcs[s];
    let chosen = -1;
    for (let fret = 0; fret <= 5; fret++) {
      if (!pcs.has((spc + fret) % 12)) continue;
      if (fret > 0 && usedFingers >= 3) break; // limite de dedos
      chosen = fret;
      break;
    }
    if (chosen >= 0) {
      shape[s] = chosen;
      if (chosen > 0) usedFingers++;
    }
  }

  return shape;
}

/**
 * Dedos sugeridos: 1 para cada casa distinta (aproximação para 4 cordas simples).
 */
export function suggestFingers(shape: number[]): number[] {
  const fretToFinger: Record<number, number> = {};
  const sorted = [...new Set(shape.filter((f) => f > 0))].sort((a, b) => a - b);
  sorted.forEach((f, i) => { fretToFinger[f] = i + 1; });
  return shape.map((f) => (f > 0 ? (fretToFinger[f] || 1) : f));
}

/** Nome da nota tocada em cada corda (para tooltip/debug). */
export function voicingNotes(shape: number[], instrument: InstrumentKey): string[] {
  const inst = INSTRUMENTS[instrument];
  const stringPcs = inst.tuning.map((t) => noteToSemitone(t.replace(/\d/, "")));
  return shape.map((f, i) => {
    if (f < 0) return "";
    return pcToName((stringPcs[i] + f) % 12);
  });
}
