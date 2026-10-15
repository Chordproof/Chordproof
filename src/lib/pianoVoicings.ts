// pianoVoicings.ts — Fase 3: notas de teclado a partir do nome do acorde
// Reaproveita o parser de qualidades do fourStringVoicings e converte para
// notas MIDI/nome, com voicing fechado na região média do piano (C3-C5).

import { parseChord } from "./fourStringVoicings";

const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function pcToName(pc: number): string {
  return PITCH_NAMES[((pc % 12) + 12) % 12];
}

/** Notas do acorde como pitch classes (0-11), fundamental primeiro. */
export function chordPitchClasses(chordName: string): number[] {
  const spec = parseChord(chordName);
  if (!spec) return [];
  return spec.intervals.map((i) => (spec.root + i) % 12);
}

/**
 * Voicing de teclado: notas do acorde posicionadas na região C3-C5 (MIDI 48-72).
 * Fundamental perto de C3, demais notas empilhadas acima (voicing fechado).
 */
export function pianoVoicing(chordName: string): number[] {
  const spec = parseChord(chordName);
  if (!spec) return [];

  // Pitch classes únicas preservando a ordem dos intervalos (fundamental primeiro)
  const seen = new Set<number>();
  const pcs: number[] = [];
  for (const i of spec.intervals) {
    const pc = (spec.root + i) % 12;
    if (!seen.has(pc)) {
      seen.add(pc);
      pcs.push(pc);
    }
  }

  // Fundamental na oitava mais grave da região C3-C5 (MIDI 48-71)
  const rootPc = spec.root;
  let rootMidi = 48 + ((rootPc - 0 + 12) % 12); // C3 + offset
  if (rootMidi > 59) rootMidi -= 12; // mantém na metade grave

  const voicing: number[] = [rootMidi];
  let last = rootMidi;
  // Empilha as demais notas acima da fundamental, cada uma na primeira ocorrência
  // acima da anterior (voicing fechado, sem cruzamento)
  for (let idx = 1; idx < pcs.length; idx++) {
    const pc = pcs[idx];
    let midi = last + 1;
    while (midi % 12 !== pc && midi < last + 13) midi++;
    if (midi <= 84) {
      voicing.push(midi);
      last = midi;
    }
  }

  return voicing;
}

/** Nome da nota com oitava (ex: "C3", "E4") para tooltip. */
export function midiToName(midi: number): string {
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1; // MIDI 60 = C4
  return PITCH_NAMES[pc] + octave;
}

/** É tecla preta? (para desenhar o piano) */
export function isBlackKey(midi: number): boolean {
  const pc = midi % 12;
  return [1, 3, 6, 8, 10].includes(pc);
}
