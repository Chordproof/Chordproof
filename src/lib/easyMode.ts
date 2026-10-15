// easyMode.ts — Easy Mode do ChordProof+ (feature 7 do roadmap)
// Troca acordes difíceis (com pestana) por formas fáceis + capo sugerido.
// A cifra continua tocando no MESMO tom: o capo compensa a transposição.

// Acordes que exigem pestana e são conhecidos "vilões" de iniciante
const HARD_CHORDS = new Set([
  "F", "Fm", "F7", "Fm7", "Fmaj7",
  "B", "Bm", "B7", "Bm7",
  "Bb", "Bbm", "Bb7",
  "Cm", "Cm7", "C#m", "C#m7", "Dbm",
  "F#m", "F#m7", "Gbm",
  "Gm", "Gm7", "Abm", "G#m",
  "Eb", "Ebm", "D#m",
  "Db", "Ab", "G#", "Eb7",
]);

// Mapa de substituição: acorde difícil -> { capo: casa do capo, chord: forma fácil com o capo }
// O som final é idêntico: forma tocada + casa do capo = acorde original.
export const EASY_SUBSTITUTIONS: Record<string, { capo: number; chord: string }> = {
  // F -> formas de E com capo 1 (soa F)
  "F": { capo: 1, chord: "E" },
  "Fm": { capo: 1, chord: "Em" },
  "F7": { capo: 1, chord: "E7" },
  "Fmaj7": { capo: 1, chord: "Emaj7" },
  "Fm7": { capo: 1, chord: "Em7" },
  // Bb / A# -> formas de A com capo 1 (soa Bb)
  "Bb": { capo: 1, chord: "A" },
  "Bbm": { capo: 1, chord: "Am" },
  "Bb7": { capo: 1, chord: "A7" },
  "A#": { capo: 1, chord: "A" },
  // B -> formas de A com capo 2 (soa B)
  "B": { capo: 2, chord: "A" },
  "Bm": { capo: 2, chord: "Am" },
  "B7": { capo: 2, chord: "A7" },
  "Bm7": { capo: 2, chord: "Am7" },
  // C# / Db -> formas de A com capo 4
  "C#m": { capo: 4, chord: "Am" },
  "Dbm": { capo: 4, chord: "Am" },
  "C#m7": { capo: 4, chord: "Am7" },
  "C#": { capo: 1, chord: "C" },
  "Db": { capo: 1, chord: "C" },
  // F# / Gb -> formas de E com capo 2
  "F#m": { capo: 2, chord: "Em" },
  "Gbm": { capo: 2, chord: "Em" },
  "F#m7": { capo: 2, chord: "Em7" },
  "F#": { capo: 2, chord: "E" },
  "Gb": { capo: 2, chord: "E" },
  // Gm -> formas de Em com capo 3
  "Gm": { capo: 3, chord: "Em" },
  "Gm7": { capo: 3, chord: "Em7" },
  // Ab / G# -> formas de G com capo 1
  "Ab": { capo: 1, chord: "G" },
  "G#": { capo: 1, chord: "G" },
  "Abm": { capo: 4, chord: "Em" },
  "G#m": { capo: 4, chord: "Em" },
  // Eb / D# -> formas de D com capo 1
  "Eb": { capo: 1, chord: "D" },
  "D#": { capo: 1, chord: "D" },
  "Ebm": { capo: 1, chord: "Dm" },
  "D#m": { capo: 1, chord: "Dm" },
  "Eb7": { capo: 1, chord: "D7" },
  // Cm -> formas de Am com capo 3
  "Cm": { capo: 3, chord: "Am" },
  "Cm7": { capo: 3, chord: "Am7" },
};

// Analisa a cifra e devolve a análise do Easy Mode
export function analyzeEasyMode(content: string, transpose: number): {
  hasHard: boolean;
  hardChords: string[];
  suggestedCapo: number | null;
  substitutionMap: Record<string, string>;
} {
  const hardChords = new Set<string>();
  const capos = new Map<number, number>(); // capo -> contagem

  for (const token of extractChords(content)) {
    if (!HARD_CHORDS.has(token)) continue;
    hardChords.add(token);
    const sub = EASY_SUBSTITUTIONS[token];
    if (sub) capos.set(sub.capo, (capos.get(sub.capo) ?? 0) + 1);
  }

  // Capo sugerido = o que resolve mais acordes
  let suggestedCapo: number | null = null;
  let best = 0;
  for (const [capo, count] of capos) {
    if (count > best) { best = count; suggestedCapo = capo; }
  }

  const substitutionMap: Record<string, string> = {};
  for (const ch of hardChords) {
    const sub = EASY_SUBSTITUTIONS[ch];
    if (sub) substitutionMap[ch] = sub.chord;
  }

  return { hasHard: hardChords.size > 0, hardChords: Array.from(hardChords).sort(), suggestedCapo, substitutionMap };
}

function extractChords(content: string): string[] {
  const out = new Set<string>();
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("[") || /^[eBGDAE]\|/.test(line)) continue;
    for (const token of line.split(/\s+/)) {
      if (/^[A-G][#b]?(m|m7|maj7|7|sus4|sus2|add9|dim|aug|5|6|9|11|13)?(\/[A-G][#b]?)?$/.test(token)) {
        out.add(token);
      }
    }
  }
  return Array.from(out);
}
