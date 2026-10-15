// smartKey.ts — ChordProof+ feature 6: Smart Key
// Sugestões inteligentes de tom/capo usando o key_sig da cifra (já auditado no banco).
// Sem API paga — 100% teoria musical + heurísticas de tocabilidade.

// Tons por número de sustenidos/bemóis (círculo das quintas)
const SHARP_ORDER = ["C", "G", "D", "A", "E", "B", "F#", "C#"];
const FLAT_ORDER = ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"];

export type KeyInfo = {
  tonic: string;      // "Em", "C", "F#"...
  mode: "major" | "minor";
  accidentals: number; // nº de sustenidos (+) ou bemóis (-)
};

export function parseKey(keySig: string): KeyInfo | null {
  if (!keySig) return null;
  const m = keySig.match(/^([A-G][#b]?)(m)?$/);
  if (!m) return null;
  const tonic = m[1];
  const mode = m[2] ? "minor" : "major";
  // relativa maior de um tom menor
  const majorTonic = mode === "minor" ? relativeMajor(tonic) : tonic;
  const accidentals = countAccidentals(majorTonic);
  return { tonic: keySig, mode, accidentals };
}

function relativeMajor(minor: string): string {
  const idx = NOTE_INDEX[minor];
  if (idx === undefined) return minor;
  return NOTE_NAMES[(idx + 3) % 12];
}

function countAccidentals(majorTonic: string): number {
  const si = SHARP_ORDER.indexOf(majorTonic);
  if (si >= 0) return si;
  const fi = FLAT_ORDER.indexOf(majorTonic);
  if (fi >= 0) return -fi;
  return 0;
}

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const NOTE_INDEX: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8,
  "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11,
};

// Acordes abertos "fáceis" (formas sem pestana ou com pestana simples)
const EASY_CHORDS = new Set([
  "C", "D", "E", "Em", "G", "A", "Am", "Dm", "D7", "A7", "E7", "G7", "Am7", "Em7", "Dsus4", "Asus4", "Cadd9", "G/B", "D/F#",
]);
const MEDIUM_CHORDS = new Set([
  "F", "B7", "Bm", "C7", "Fmaj7", "Cmaj7", "Dmaj7", "Em7", "Amaj7", "F#m", "Bb", "Ebm", "C#m", "F#m7", "Bm7", "Fm",
]);

/**
 * Transpõe o tom (tonic + mode) N semitons.
 */
export function transposeKey(keySig: string, semitones: number): string {
  const m = keySig.match(/^([A-G][#b]?)(m)?$/);
  if (!m || !semitones) return keySig;
  const idx = NOTE_INDEX[m[1]];
  if (idx === undefined) return keySig;
  const newTonic = NOTE_NAMES[((idx + semitones) % 12 + 12) % 12];
  return newTonic + (m[2] || "");
}

/**
 * Avalia a "tocabilidade" de uma cifra: proporção de acordes fáceis.
 * Retorna score 0-100 (100 = todos acordes abertos).
 */
export function playabilityScore(chords: string[]): { score: number; easy: number; medium: number; hard: number } {
  if (!chords.length) return { score: 100, easy: 0, medium: 0, hard: 0 };
  let easy = 0, medium = 0, hard = 0;
  for (const c of chords) {
    const base = c.split("/")[0]; // ignora slash bass
    if (EASY_CHORDS.has(base)) easy++;
    else if (MEDIUM_CHORDS.has(base)) medium++;
    else hard++;
  }
  const total = chords.length;
  const score = Math.round(((easy * 1 + medium * 0.5 + hard * 0) / total) * 100);
  return { score, easy, medium, hard };
}

/**
 * Sugere a melhor transposição + capo para facilitar os acordes.
 * Estratégia: para cada deslocamento -5..+5, calcula os acordes resultantes
 * e o score de tocabilidade. Prefere deslocamentos pequenos e capo baixo.
 */
export function suggestEasierKey(
  keySig: string,
  chords: string[],
  transposeChordFn: (chord: string, semitones: number) => string
): { semitones: number; newKey: string; capo: number; score: number; preview: string[] } | null {
  if (!chords.length) return null;

  let best: { semitones: number; score: number; capo: number } | null = null;

  for (let s = -5; s <= 5; s++) {
    if (s === 0) continue;
    const transposed = chords.map((c) => transposeChordFn(c, s));
    const { score } = playabilityScore(transposed);
    const capo = s > 0 ? s : 0; // subir tom = capo na casa s (com formas do tom original)
    // Penaliza capos altos (>5) e deslocamentos grandes
    const penalty = Math.abs(s) * 0.5 + (capo > 5 ? 10 : 0);
    const adjusted = score - penalty;
    if (!best || adjusted > best.score) {
      best = { semitones: s, score: adjusted, capo };
    }
  }

  if (!best || best.score <= playabilityScore(chords).score) return null; // já está fácil

  return {
    semitones: best.semitones,
    newKey: transposeKey(keySig, best.semitones),
    capo: best.capo,
    score: Math.round(best.score),
    preview: chords.slice(0, 6).map((c) => transposeChordFn(c, best.semitones)),
  };
}

/**
 * Tons relativos úteis: relativa menor/maior e a dominante/subdominante
 * (para "soa melhor em X para voz grave/aguda").
 */
export function relatedKeys(keySig: string): { label: string; key: string; semitones: number }[] {
  const m = keySig.match(/^([A-G][#b]?)(m)?$/);
  if (!m) return [];
  const idx = NOTE_INDEX[m[1]];
  if (idx === undefined) return [];
  const isMinor = !!m[2];

  const out: { label: string; key: string; semitones: number }[] = [];

  if (isMinor) {
    const relMaj = NOTE_NAMES[(idx + 3) % 12];
    out.push({ label: "Relative major", key: relMaj, semitones: 3 });
    // tom menor vizinho: dominante (5ª acima) e subdominante (5ª abaixo)
    out.push({ label: "Dominant minor", key: keySig, semitones: 0 });
  } else {
    const relMin = NOTE_NAMES[(idx + 9) % 12] + "m";
    out.push({ label: "Relative minor", key: relMin, semitones: 9 });
  }

  // 2 semitons abaixo (voz mais grave) e 2 acima (mais aguda)
  out.push({ label: "Lower (darker voice)", key: transposeKey(keySig, -2), semitones: -2 });
  out.push({ label: "Higher (brighter voice)", key: transposeKey(keySig, 2), semitones: 2 });

  return out.filter((k, i, arr) => arr.findIndex((x) => x.key === k.key) === i);
}