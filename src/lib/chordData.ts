// chordData.ts — Complete chord library for ChordProof

export const SHARP = "#";
export const FLAT = "b";

// Chord shapes: [E, A, D, G, B, e] — -1 = mute, 0 = open, n = fret
export const CHORD_SHAPES: Record<string, number[]> = {};

// ============================================
// MAJOR CHORDS (all 12 keys)
// ============================================
CHORD_SHAPES["C"] = [-1,3,2,0,1,0];
CHORD_SHAPES["C"+SHARP] = [-1,4,6,6,6,4];
CHORD_SHAPES["D"] = [-1,-1,0,2,3,2];
CHORD_SHAPES["D"+SHARP] = [-1,6,8,8,8,6];
CHORD_SHAPES["E"] = [0,2,2,1,0,0];
CHORD_SHAPES["F"] = [1,3,3,2,1,1];
CHORD_SHAPES["F"+SHARP] = [2,4,4,3,2,2];
CHORD_SHAPES["G"] = [3,2,0,0,0,3];
CHORD_SHAPES["G"+SHARP] = [4,6,6,5,4,4];
CHORD_SHAPES["A"] = [-1,0,2,2,2,0];
CHORD_SHAPES["A"+SHARP] = [-1,1,3,3,3,1];
CHORD_SHAPES["B"] = [-1,2,4,4,4,2];
CHORD_SHAPES["Bb"] = [-1,1,3,3,3,1];
CHORD_SHAPES["Db"] = [-1,4,6,6,6,4];
CHORD_SHAPES["Eb"] = [-1,6,8,8,8,6];
CHORD_SHAPES["Gb"] = [2,4,4,3,2,2];
CHORD_SHAPES["Ab"] = [4,6,6,5,4,4];

// ============================================
// MINOR CHORDS (all 12 keys)
// ============================================
CHORD_SHAPES["Cm"] = [-1,3,5,5,4,3];
CHORD_SHAPES["C"+SHARP+"m"] = [-1,4,6,6,5,4];
CHORD_SHAPES["Dm"] = [-1,-1,0,2,3,1];
CHORD_SHAPES["D"+SHARP+"m"] = [-1,6,8,8,7,6];
CHORD_SHAPES["Em"] = [0,2,2,0,0,0];
CHORD_SHAPES["Fm"] = [1,3,3,1,1,1];
CHORD_SHAPES["F"+SHARP+"m"] = [2,4,4,2,2,2];
CHORD_SHAPES["Gm"] = [3,5,5,3,3,3];
CHORD_SHAPES["G"+SHARP+"m"] = [4,6,6,4,4,4];
CHORD_SHAPES["Am"] = [-1,0,2,2,1,0];
CHORD_SHAPES["A"+SHARP+"m"] = [-1,1,3,3,2,1];
CHORD_SHAPES["Bm"] = [-1,2,4,4,3,2];
CHORD_SHAPES["Bbm"] = [-1,1,3,3,2,1];
CHORD_SHAPES["Dbm"] = [-1,4,6,6,5,4];
CHORD_SHAPES["Ebm"] = [-1,6,8,8,7,6];
CHORD_SHAPES["Gbm"] = [2,4,4,2,2,2];
CHORD_SHAPES["Abm"] = [4,6,6,4,4,4];

// ============================================
// POWER CHORDS (5 chords — all 12 keys)
// ============================================
CHORD_SHAPES["C5"] = [-1,3,5,5,-1,-1];
CHORD_SHAPES["C"+SHARP+"5"] = [-1,4,6,6,-1,-1];
CHORD_SHAPES["D5"] = [-1,-1,0,2,3,-1];
CHORD_SHAPES["D"+SHARP+"5"] = [-1,6,8,8,-1,-1];
CHORD_SHAPES["E5"] = [0,2,2,-1,-1,-1];
CHORD_SHAPES["F5"] = [1,3,3,-1,-1,-1];
CHORD_SHAPES["F"+SHARP+"5"] = [2,4,4,-1,-1,-1];
CHORD_SHAPES["G5"] = [3,5,5,-1,-1,-1];
CHORD_SHAPES["G"+SHARP+"5"] = [4,6,6,-1,-1,-1];
CHORD_SHAPES["A5"] = [-1,0,2,2,-1,-1];
CHORD_SHAPES["A"+SHARP+"5"] = [-1,1,3,3,-1,-1];
CHORD_SHAPES["B5"] = [-1,2,4,4,-1,-1];

// ============================================
// DOMINANT 7TH CHORDS (all 12 keys)
// ============================================
CHORD_SHAPES["C7"] = [-1,3,2,3,1,0];
CHORD_SHAPES["C"+SHARP+"7"] = [-1,4,3,4,2,4];
CHORD_SHAPES["D7"] = [-1,-1,0,2,1,2];
CHORD_SHAPES["D"+SHARP+"7"] = [-1,6,5,6,4,6];
CHORD_SHAPES["E7"] = [0,2,0,1,0,0];
CHORD_SHAPES["F7"] = [1,3,1,2,1,1];
CHORD_SHAPES["F"+SHARP+"7"] = [2,4,2,3,2,2];
CHORD_SHAPES["G7"] = [3,2,0,0,0,1];
CHORD_SHAPES["G"+SHARP+"7"] = [4,6,4,5,4,4];
CHORD_SHAPES["A7"] = [-1,0,2,0,2,0];
CHORD_SHAPES["A"+SHARP+"7"] = [-1,1,3,1,3,1];
CHORD_SHAPES["B7"] = [-1,2,1,2,0,2];

// ============================================
// MAJOR 7TH CHORDS (maj7 / M7 — all 12 keys)
// ============================================
CHORD_SHAPES["Cmaj7"] = [-1,3,2,0,0,0];
CHORD_SHAPES["C"+SHARP+"maj7"] = [-1,4,3,1,1,1];
CHORD_SHAPES["Dmaj7"] = [-1,-1,0,2,2,2];
CHORD_SHAPES["D"+SHARP+"maj7"] = [-1,6,5,3,3,3];
CHORD_SHAPES["Emaj7"] = [0,2,1,1,0,0];
CHORD_SHAPES["Fmaj7"] = [-1,-1,3,2,1,0];
CHORD_SHAPES["F"+SHARP+"maj7"] = [2,-1,3,3,2,2];
CHORD_SHAPES["Gmaj7"] = [3,2,0,0,0,2];
CHORD_SHAPES["G"+SHARP+"maj7"] = [4,6,5,4,4,4];
CHORD_SHAPES["Amaj7"] = [-1,0,2,1,2,0];
CHORD_SHAPES["A"+SHARP+"maj7"] = [-1,1,3,2,3,1];
CHORD_SHAPES["Bmaj7"] = [-1,2,4,3,4,2];
CHORD_SHAPES["CM"] = [-1,3,2,0,0,0];
CHORD_SHAPES["DM"] = [-1,-1,0,2,2,2];
CHORD_SHAPES["EM"] = [0,2,1,1,0,0];
CHORD_SHAPES["FM"] = [-1,-1,3,2,1,0];
CHORD_SHAPES["GM"] = [3,2,0,0,0,2];
CHORD_SHAPES["AM"] = [-1,0,2,1,2,0];
CHORD_SHAPES["BM"] = [-1,2,4,3,4,2];

// ============================================
// MINOR 7TH CHORDS (m7 — all 12 keys)
// ============================================
CHORD_SHAPES["Cm7"] = [-1,3,5,3,4,3];
CHORD_SHAPES["C"+SHARP+"m7"] = [-1,4,6,4,5,4];
CHORD_SHAPES["Dm7"] = [-1,-1,0,2,1,1];
CHORD_SHAPES["D"+SHARP+"m7"] = [-1,6,8,6,7,6];
CHORD_SHAPES["Em7"] = [0,2,0,0,0,0];
CHORD_SHAPES["Fm7"] = [1,3,1,1,1,1];
CHORD_SHAPES["F"+SHARP+"m7"] = [2,4,2,2,2,2];
CHORD_SHAPES["Gm7"] = [3,5,3,3,3,3];
CHORD_SHAPES["G"+SHARP+"m7"] = [4,6,4,4,4,4];
CHORD_SHAPES["Am7"] = [-1,0,2,0,1,0];
CHORD_SHAPES["A"+SHARP+"m7"] = [-1,1,3,1,2,1];
CHORD_SHAPES["Bm7"] = [-1,2,4,2,3,2];

// ============================================
// SUS2 CHORDS (all 12 keys)
// ============================================
CHORD_SHAPES["Csus2"] = [-1,3,5,5,3,3];
CHORD_SHAPES["C"+SHARP+"sus2"] = [-1,4,6,6,4,4];
CHORD_SHAPES["Dsus2"] = [-1,-1,0,2,3,0];
CHORD_SHAPES["D"+SHARP+"sus2"] = [-1,6,8,8,6,6];
CHORD_SHAPES["Esus2"] = [0,2,4,4,0,0];
CHORD_SHAPES["Fsus2"] = [-1,-1,3,0,1,1];
CHORD_SHAPES["F"+SHARP+"sus2"] = [-1,-1,4,1,2,2];
CHORD_SHAPES["Gsus2"] = [3,5,5,0,3,3];
CHORD_SHAPES["G"+SHARP+"sus2"] = [4,6,6,1,4,4];
CHORD_SHAPES["Asus2"] = [-1,0,2,2,0,0];
CHORD_SHAPES["A"+SHARP+"sus2"] = [-1,1,3,3,1,1];
CHORD_SHAPES["Bsus2"] = [-1,2,4,4,2,2];

// ============================================
// SUS4 CHORDS (all 12 keys)
// ============================================
CHORD_SHAPES["Csus4"] = [-1,3,3,0,1,1];
CHORD_SHAPES["C"+SHARP+"sus4"] = [-1,4,4,1,2,2];
CHORD_SHAPES["Dsus4"] = [-1,-1,0,2,3,3];
CHORD_SHAPES["D"+SHARP+"sus4"] = [-1,6,6,3,4,4];
CHORD_SHAPES["Esus4"] = [0,2,2,2,0,0];
CHORD_SHAPES["Fsus4"] = [1,3,3,3,1,1];
CHORD_SHAPES["F"+SHARP+"sus4"] = [2,4,4,4,2,2];
CHORD_SHAPES["Gsus4"] = [3,5,5,5,3,3];
CHORD_SHAPES["G"+SHARP+"sus4"] = [4,6,6,6,4,4];
CHORD_SHAPES["Asus4"] = [-1,0,2,2,3,0];
CHORD_SHAPES["A"+SHARP+"sus4"] = [-1,1,3,3,4,1];
CHORD_SHAPES["Bsus4"] = [-1,2,4,4,5,2];
CHORD_SHAPES["C4"] = [-1,3,3,0,1,1];
CHORD_SHAPES["D4"] = [-1,-1,0,2,3,3];
CHORD_SHAPES["E4"] = [0,2,2,2,0,0];
CHORD_SHAPES["F4"] = [1,3,3,3,1,1];
CHORD_SHAPES["G4"] = [3,5,5,5,3,3];
CHORD_SHAPES["A4"] = [-1,0,2,2,3,0];
CHORD_SHAPES["B4"] = [-1,2,4,4,5,2];

// ============================================
// ADD9 CHORDS
// ============================================
CHORD_SHAPES["Cadd9"] = [-1,3,2,0,3,0];
CHORD_SHAPES["Dadd9"] = [-1,-1,0,2,3,2];
CHORD_SHAPES["Eadd9"] = [0,2,2,1,0,2];
CHORD_SHAPES["Fadd9"] = [-1,-1,3,2,1,3];
CHORD_SHAPES["Gadd9"] = [3,2,0,0,0,3];
CHORD_SHAPES["Aadd9"] = [-1,0,2,2,2,4];
CHORD_SHAPES["Badd9"] = [-1,2,4,4,4,6];
CHORD_SHAPES["C2"] = [-1,3,5,5,3,3];
CHORD_SHAPES["D2"] = [-1,-1,0,2,3,0];
CHORD_SHAPES["E2"] = [0,2,4,4,0,0];
CHORD_SHAPES["F2"] = [-1,-1,3,0,1,1];
CHORD_SHAPES["G2"] = [3,0,0,0,0,3];
CHORD_SHAPES["A2"] = [-1,0,2,2,0,0];
CHORD_SHAPES["B2"] = [-1,2,4,4,2,2];

// ============================================
// 6TH CHORDS
// ============================================
CHORD_SHAPES["C6"] = [-1,3,2,0,1,3];
CHORD_SHAPES["D6"] = [-1,-1,0,2,0,2];
CHORD_SHAPES["E6"] = [0,2,2,1,2,0];
CHORD_SHAPES["F6"] = [1,3,3,2,1,3];
CHORD_SHAPES["G6"] = [3,2,0,0,0,0];
CHORD_SHAPES["A6"] = [-1,0,2,2,2,4];
CHORD_SHAPES["B6"] = [-1,2,4,4,4,6];

// ============================================
// MINOR 6TH CHORDS
// ============================================
CHORD_SHAPES["Cm6"] = [-1,3,5,3,4,5];
CHORD_SHAPES["Dm6"] = [-1,-1,0,2,0,1];
CHORD_SHAPES["Em6"] = [0,2,0,0,0,2];
CHORD_SHAPES["Fm6"] = [1,3,1,1,1,3];
CHORD_SHAPES["Gm6"] = [3,5,3,3,3,5];
CHORD_SHAPES["Am6"] = [-1,0,2,2,1,2];
CHORD_SHAPES["Bm6"] = [-1,2,4,2,3,4];

// ============================================
// 9TH CHORDS (dominant 9 — all 12 keys)
// ============================================
CHORD_SHAPES["C9"] = [-1,3,2,3,3,3];
CHORD_SHAPES["C"+SHARP+"9"] = [-1,4,3,4,4,4];
CHORD_SHAPES["D9"] = [-1,-1,0,2,1,2];
CHORD_SHAPES["D"+SHARP+"9"] = [-1,6,5,6,5,6];
CHORD_SHAPES["E9"] = [0,2,0,1,0,2];
CHORD_SHAPES["F9"] = [1,3,1,2,1,3];
CHORD_SHAPES["F"+SHARP+"9"] = [2,4,2,3,2,4];
CHORD_SHAPES["G9"] = [3,2,0,0,0,1];
CHORD_SHAPES["G"+SHARP+"9"] = [4,6,4,5,4,5];
CHORD_SHAPES["A9"] = [-1,0,2,0,2,4];
CHORD_SHAPES["A"+SHARP+"9"] = [-1,1,3,1,2,3];
CHORD_SHAPES["B9"] = [-1,2,1,2,0,2];

// ============================================
// MINOR 9TH CHORDS
// ============================================
CHORD_SHAPES["Cm9"] = [-1,3,5,3,3,3];
CHORD_SHAPES["Dm9"] = [-1,-1,0,2,1,0];
CHORD_SHAPES["Em9"] = [0,2,0,0,0,2];
CHORD_SHAPES["Fm9"] = [1,3,1,1,1,3];
CHORD_SHAPES["Gm9"] = [3,5,3,3,3,5];
CHORD_SHAPES["Am9"] = [-1,0,2,0,1,0];
CHORD_SHAPES["Bm9"] = [-1,2,4,2,3,2];

// ============================================
// MAJOR 9TH CHORDS
// ============================================
CHORD_SHAPES["Cmaj9"] = [-1,3,2,0,0,3];
CHORD_SHAPES["Dmaj9"] = [-1,-1,0,2,2,4];
CHORD_SHAPES["Emaj9"] = [0,2,1,1,0,2];
CHORD_SHAPES["Fmaj9"] = [-1,-1,3,2,1,0];
CHORD_SHAPES["Gmaj9"] = [3,2,0,0,0,2];
CHORD_SHAPES["Amaj9"] = [-1,0,2,1,2,4];
CHORD_SHAPES["Bmaj9"] = [-1,2,4,3,4,6];

// ============================================
// DIMINISHED CHORDS
// ============================================
CHORD_SHAPES["Cdim"] = [-1,3,5,4,4,2];
CHORD_SHAPES["Ddim"] = [-1,-1,0,1,3,1];
CHORD_SHAPES["Edim"] = [0,1,2,0,2,0];
CHORD_SHAPES["Fdim"] = [1,2,3,1,3,1];
CHORD_SHAPES["Gdim"] = [3,4,5,3,5,3];
CHORD_SHAPES["Adim"] = [-1,0,1,2,1,2];
CHORD_SHAPES["Bdim"] = [-1,2,3,4,3,-1];
CHORD_SHAPES["Cdim7"] = [-1,3,5,3,4,2];
CHORD_SHAPES["Ddim7"] = [-1,-1,0,1,3,1];
CHORD_SHAPES["Edim7"] = [0,1,2,0,2,0];
CHORD_SHAPES["Fdim7"] = [1,2,3,1,3,1];
CHORD_SHAPES["Gdim7"] = [3,4,5,3,5,3];
CHORD_SHAPES["Adim7"] = [-1,0,1,2,1,2];
CHORD_SHAPES["Bdim7"] = [-1,2,3,4,3,-1];

// ============================================
// AUGMENTED CHORDS
// ============================================
CHORD_SHAPES["Caug"] = [-1,3,2,1,1,0];
CHORD_SHAPES["Daug"] = [-1,-1,0,3,3,2];
CHORD_SHAPES["Eaug"] = [0,3,2,1,0,0];
CHORD_SHAPES["Faug"] = [-1,-1,3,2,2,1];
CHORD_SHAPES["Gaug"] = [3,2,1,0,0,3];
CHORD_SHAPES["Aaug"] = [-1,0,3,2,2,1];
CHORD_SHAPES["Baug"] = [-1,2,1,2,1,2];

// ============================================
// HALF-DIMINISHED (m7b5)
// ============================================
CHORD_SHAPES["Cm7b5"] = [-1,3,4,3,4,3];
CHORD_SHAPES["Dm7b5"] = [-1,-1,0,1,1,1];
CHORD_SHAPES["Em7b5"] = [0,1,0,0,0,0];
CHORD_SHAPES["Fm7b5"] = [1,2,1,1,1,1];
CHORD_SHAPES["Gm7b5"] = [3,4,3,3,3,3];
CHORD_SHAPES["Am7b5"] = [-1,0,1,0,1,0];
CHORD_SHAPES["Bm7b5"] = [-1,2,3,2,3,2];

// ============================================
// SLASH CHORDS
// ============================================
CHORD_SHAPES["C/B"] = [-1,2,0,0,1,0];
CHORD_SHAPES["C/F"+SHARP] = [-1,4,-1,2,1,0];
CHORD_SHAPES["D/F"+SHARP] = [2,-1,0,2,3,2];
CHORD_SHAPES["F/B"] = [-1,1,3,2,1,0];
CHORD_SHAPES["F/F"+SHARP] = [2,3,3,2,1,1];
CHORD_SHAPES["G/B"] = [-1,2,0,0,0,3];
CHORD_SHAPES["G/F"+SHARP] = [3,4,0,0,0,2];
CHORD_SHAPES["A/F"+SHARP] = [2,-1,4,2,2,0];
CHORD_SHAPES["E7sus4/B"] = [-1,2,0,2,0,0];
CHORD_SHAPES["Esus4/F"+SHARP] = [2,-1,2,2,0,0];
CHORD_SHAPES["D11/F"+SHARP] = [2,-1,0,2,1,3];

// ============================================
// 7sus4 CHORDS
// ============================================
CHORD_SHAPES["A7sus4"] = [-1,0,2,0,3,0];
CHORD_SHAPES["D7sus4"] = [-1,-1,0,2,1,1];
CHORD_SHAPES["E7sus4"] = [0,2,0,2,0,0];
CHORD_SHAPES["G7sus4"] = [3,5,3,0,3,1];

// ============================================
// A7(4) — usado no Wonderwall
// ============================================
CHORD_SHAPES["A7(4)"] = [-1,0,2,0,3,0];

// ============================================
// COMPLEX / EXTENDED
// ============================================
CHORD_SHAPES["C9(11+)"] = [-1,3,2,3,3,4];
CHORD_SHAPES["D9(11+)"] = [-1,-1,0,2,1,4];
CHORD_SHAPES["C2sus4"] = [-1,3,3,0,3,3];

// ============================================
// SLASH / INVERTED & SPECIAL CHORDS
// ============================================
CHORD_SHAPES["C9/B"] = [-1,2,2,3,3,3];
CHORD_SHAPES["F7M/C"] = [-1,3,2,2,1,0];
CHORD_SHAPES["E/G#"] = [0,1,2,1,0,0];
CHORD_SHAPES["C7M"] = [-1,3,2,0,0,0];
CHORD_SHAPES["D6(9)/F#"] = [-1,2,0,2,0,0];
CHORD_SHAPES["D9(11)/F#"] = [-1,2,0,2,1,0];

// ============================================
// REGEX PATTERNS
// NOTE: alternation order matters — longer matches FIRST
// ============================================

// Matches a chord token within a line of text
export const CHORD_TOKEN_RE = /[A-G][#b]?(maj7|maj9|maj|min7|min9|min|dim7|dim|m7b5|dim|aug|sus2|sus4|sus|add9|add|m|6|7|9|11|13|5|4|2|M)*(b5)?(\([^)]*\))?(\/[A-G][#b]?)?/g;

// Strict chord regex — entire string must be a valid chord
export const CHORD_STRICT_RE = /^[A-G][#b]?(maj7|maj9|maj|min7|min9|min|dim7|dim|m7b5|aug|sus2|sus4|sus|add9|add|m|6|7|9|11|13|5|4|2|M)*(b5)?(\([^)]*\))?(\/[A-G][#b]?)?$/;

// Tablature line regex — matches lines like "e|---5---|" or "B|---3---|"
export const TAB_LINE_RE = /^[eBGDAE]\|.*\|/;

// ============================================
// TRANSPOSE FUNCTION
// ============================================

const NOTE_INDEX: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8,
  "A": 9, "A#": 10, "Bb": 10, "B": 11
};

const INDEX_NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const INDEX_NOTE_FLAT = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

export function transposeChord(chord: string, semitones: number): string {
  if (!chord) return chord;
  if (!Number.isInteger(semitones) || semitones === 0) return chord;

  try {
    const re = /([A-G])([#b]?)/g;
    let result = chord;
    let match: RegExpExecArray | null;
    const replacements: { index: number; replacement: string }[] = [];

    while ((match = re.exec(chord)) !== null) {
      const noteName = match[1] + (match[2] || "");
      const idx = NOTE_INDEX[noteName];
      if (idx === undefined) continue;

      const newIdx = ((idx + semitones) % 12 + 12) % 12;
      const useFlat = match[2] === "b";
      const newNote = useFlat ? INDEX_NOTE_FLAT[newIdx] : INDEX_NOTE[newIdx];

      replacements.push({ index: match.index, replacement: newNote });
    }

    for (let i = replacements.length - 1; i >= 0; i--) {
      const r = replacements[i];
      const matchedText = chord.substring(r.index).match(/^[A-G][#b]?/);
      const len = matchedText ? matchedText[0].length : 1;
      result = result.substring(0, r.index) + r.replacement + result.substring(r.index + len);
    }

    return result;
  } catch (e) {
    return chord;
  }
}

// ============================================
// CHORDS USED — extract unique chords from content
// ============================================

export function chordsUsed(content: string, transpose: number = 0): string[] {
  if (!content) return [];
  const lines = content.split("\n");
  const chords = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) continue;
    if (TAB_LINE_RE.test(trimmed)) continue;

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      if (CHORD_STRICT_RE.test(token)) {
        const transposed = transpose !== 0 ? transposeChord(token, transpose) : token;
        chords.add(transposed);
      }
    }
  }

  return Array.from(chords).sort();
}
