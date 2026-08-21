// chordData.ts — ChordProof chord definitions and utilities

export const SHARP = "#";

// Regex patterns
export const CHORD_TOKEN_RE = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2|M)*\d*(?:\/[A-G][#b]?)?)/g;
export const CHORD_STRICT_RE = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2|M)*\d*(?:\/[A-G][#b]?)?$/;
export const TAB_LINE_RE = /^[eBGDAE]\|.*\|/;

// Chord shapes: [E, A, D, G, B, e] fret positions (-1 = muted, 0 = open)
export const CHORD_SHAPES: Record<string, number[]> = {};

// === BASIC MAJOR ===
CHORD_SHAPES["A"] = [-1,0,2,2,2,0];
CHORD_SHAPES["B"] = [-1,2,4,4,4,2];
CHORD_SHAPES["C"] = [-1,3,2,0,1,0];
CHORD_SHAPES["D"] = [-1,-1,0,2,3,2];
CHORD_SHAPES["E"] = [0,2,2,1,0,0];
CHORD_SHAPES["F"] = [1,3,3,2,1,1];
CHORD_SHAPES["G"] = [3,2,0,0,0,3];

// === BASIC MINOR ===
CHORD_SHAPES["Am"] = [-1,0,2,2,1,0];
CHORD_SHAPES["Bm"] = [-1,2,4,4,3,2];
CHORD_SHAPES["Cm"] = [-1,3,5,5,4,3];
CHORD_SHAPES["Dm"] = [-1,-1,0,2,3,1];
CHORD_SHAPES["Em"] = [0,2,2,0,0,0];
CHORD_SHAPES["Fm"] = [1,3,3,1,1,1];
CHORD_SHAPES["Gm"] = [3,5,5,3,3,3];

// === SHARPS / FLATS ===
CHORD_SHAPES["A"+SHARP] = [-1,1,3,3,3,1];
CHORD_SHAPES["A"+SHARP+"m"] = [-1,1,3,3,2,1];
CHORD_SHAPES["Bb"] = [-1,1,3,3,3,1];
CHORD_SHAPES["C"+SHARP] = [-1,4,6,6,6,4];
CHORD_SHAPES["C"+SHARP+"m"] = [-1,4,6,6,5,4];
CHORD_SHAPES["D"+SHARP] = [-1,6,8,8,8,6];
CHORD_SHAPES["F"+SHARP] = [2,4,4,3,2,2];
CHORD_SHAPES["F"+SHARP+"m"] = [2,4,4,2,2,2];
CHORD_SHAPES["G"+SHARP+"m"] = [4,6,6,4,4,4];

// === POWER CHORDS ===
CHORD_SHAPES["A5"] = [-1,0,2,2,-1,-1];
CHORD_SHAPES["B5"] = [-1,2,4,4,-1,-1];
CHORD_SHAPES["C5"] = [-1,3,5,5,-1,-1];
CHORD_SHAPES["C"+SHARP+"5"] = [-1,4,6,6,-1,-1];
CHORD_SHAPES["D5"] = [-1,-1,0,2,3,-1];
CHORD_SHAPES["D"+SHARP+"5"] = [-1,6,8,8,-1,-1];
CHORD_SHAPES["E5"] = [0,2,2,-1,-1,-1];
CHORD_SHAPES["F5"] = [1,3,3,-1,-1,-1];
CHORD_SHAPES["F"+SHARP+"5"] = [2,4,4,-1,-1,-1];
CHORD_SHAPES["G5"] = [3,5,5,-1,-1,-1];
CHORD_SHAPES["G"+SHARP+"5"] = [4,6,6,-1,-1,-1];

// === 7TH CHORDS ===
CHORD_SHAPES["A7"] = [-1,0,2,0,2,0];
CHORD_SHAPES["B7"] = [-1,2,1,2,0,2];
CHORD_SHAPES["C7"] = [-1,3,2,3,1,0];
CHORD_SHAPES["D7"] = [-1,-1,0,2,1,2];
CHORD_SHAPES["E7"] = [0,2,0,1,0,0];
CHORD_SHAPES["F7"] = [1,3,1,2,1,1];
CHORD_SHAPES["G7"] = [3,2,0,0,0,1];

// === MINOR 7TH ===
CHORD_SHAPES["Am7"] = [-1,0,2,0,1,0];
CHORD_SHAPES["Bm7"] = [-1,2,0,2,0,2];
CHORD_SHAPES["Cm7"] = [-1,3,5,3,4,3];
CHORD_SHAPES["Dm7"] = [-1,-1,0,2,1,1];
CHORD_SHAPES["Em7"] = [0,2,0,0,0,0];
CHORD_SHAPES["Fm7"] = [1,3,1,1,1,1];
CHORD_SHAPES["Gm7"] = [3,5,3,3,3,3];

// === 9TH CHORDS ===
CHORD_SHAPES["C9"] = [-1,3,2,3,3,3];
CHORD_SHAPES["D9"] = [-1,-1,0,2,1,2];

// === SUS4 ===
CHORD_SHAPES["C4"] = [-1,3,3,0,1,0];
CHORD_SHAPES["D4"] = [-1,-1,0,2,3,3];
CHORD_SHAPES["E4"] = [0,2,2,2,0,0];
CHORD_SHAPES["F4"] = [1,1,1,2,1,1];
CHORD_SHAPES["G4"] = [3,3,0,0,1,3];
CHORD_SHAPES["A4"] = [-1,0,2,2,3,0];

// === SUS2 / ADD9 ===
CHORD_SHAPES["C2"] = [-1,3,0,0,3,0];
CHORD_SHAPES["D2"] = [-1,-1,0,2,3,0];
CHORD_SHAPES["E2"] = [0,2,4,4,0,0];
CHORD_SHAPES["G2"] = [3,0,0,0,0,3];
CHORD_SHAPES["A2"] = [-1,0,2,2,0,0];
CHORD_SHAPES["Asus2"] = [-1,0,2,2,0,0];
CHORD_SHAPES["Dsus2"] = [-1,-1,0,2,3,0];
CHORD_SHAPES["Esus2"] = [0,2,4,4,0,0];

// === MAJOR 7TH ===
CHORD_SHAPES["Cmaj7"] = [-1,3,2,0,0,0];
CHORD_SHAPES["Dmaj7"] = [-1,-1,0,2,2,2];
CHORD_SHAPES["Fmaj7"] = [-1,-1,3,2,1,0];
CHORD_SHAPES["Gmaj7"] = [3,2,0,0,0,2];
CHORD_SHAPES["Amaj7"] = [-1,0,2,1,2,0];
CHORD_SHAPES["Emaj7"] = [0,2,1,1,0,0];

// === MAJOR (M suffix) ===
CHORD_SHAPES["CM"] = [-1,3,2,0,1,0];
CHORD_SHAPES["DM"] = [-1,-1,0,2,3,2];
CHORD_SHAPES["EM"] = [0,2,2,1,0,0];
CHORD_SHAPES["FM"] = [1,3,3,2,1,1];
CHORD_SHAPES["GM"] = [3,2,0,0,0,3];
CHORD_SHAPES["AM"] = [-1,0,2,2,2,0];
CHORD_SHAPES["BM"] = [-1,2,4,4,4,2];

// === SLASH CHORDS ===
CHORD_SHAPES["A/F"+SHARP] = [2,-1,4,2,2,0];
CHORD_SHAPES["C/B"] = [-1,2,0,0,1,0];
CHORD_SHAPES["C/F"+SHARP] = [-1,4,-1,2,1,0];
CHORD_SHAPES["D/F"+SHARP] = [2,-1,0,2,3,2];
CHORD_SHAPES["F/B"] = [-1,1,3,2,1,0];
CHORD_SHAPES["F/F"+SHARP] = [2,3,3,2,1,1];
CHORD_SHAPES["G/B"] = [-1,2,0,0,0,3];
CHORD_SHAPES["G/F"+SHARP] = [3,4,0,0,0,2];

// === COMPLEX ===
CHORD_SHAPES["E7sus4/B"] = [-1,2,0,2,0,0];
CHORD_SHAPES["Esus4/F"+SHARP] = [2,-1,2,2,0,0];

// === TRANSPOSE ===
const NOTE_TO_SEMITONE: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8,
  "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11,
};

const SEMITONE_TO_NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord;
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  const root = match[1];
  const suffix = match[2];
  const semitone = NOTE_TO_SEMITONE[root];
  if (semitone === undefined) return chord;
  const newSemitone = (semitone + semitones + 12) % 12;
  return SEMITONE_TO_NOTE[newSemitone] + suffix;
}

// === CHORDS USED IN CONTENT ===
export function chordsUsed(content: string, transpose: number = 0): string[] {
  if (!content) return [];
  const chords = new Set<string>();
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("[")) continue;
    if (TAB_LINE_RE.test(trimmed)) continue;
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const isChordLine = tokens.length > 0 && tokens.every(t => CHORD_STRICT_RE.test(t));
    if (isChordLine) {
      for (const t of tokens) {
        const transposed = transposeChord(t, transpose);
        chords.add(transposed);
      }
    }
  }
  return Array.from(chords);
}
