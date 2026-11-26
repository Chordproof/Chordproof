/**
 * rhythmFromTab.ts — a BATIDA vem da própria cifra, não do gênero.
 *
 * O PROBLEMA que isto resolve: o gênero dá uma batida genérica. "Rock" toca
 * igual em 423 músicas — e o dono apontou, com razão, que não é a batida da
 * música.
 *
 * TENTATIVA QUE FALHOU (registrada para não se repetir): extrair a batida
 * analisando o ÁUDIO da gravação (prévia do Deezer, envelope de onset, DP de
 * beat tracking). O BPM sai bom (7/10 dentro de 5%), mas o PADRÃO não: numa
 * mixagem masterizada, guitarra + voz + bateria + baixo somam num fluxo de
 * ataques quase idêntico em toda música pop (medido: 4–5 posições ativas em
 * 16, ~25% em tempos, ~50% em colcheias, em TODAS as 10 músicas testadas).
 * O ataque da guitarra não é separável do resto no master.
 *
 * O QUE FUNCIONA: as cifras do catálogo JÁ TRAZEM a mão direita escrita por
 * quem conhece a música — 688 das 1.166 (59%) mencionam execução, e 341 das
 * 631 com nota de execução (54%) casam uma regra objetiva:
 *   "one downstroke per chord" / "one downward sweep per beat" /
 *   "straight 8ths, no strumming pattern" / "do not strum" /
 *   "slow 6/8 feel inside 4/4"
 * É dado POR MÚSICA e é a instrução de quem toca. Prioridade:
 *   1. instrução escrita na cifra  -> source "tab"
 *   2. gênero (lib/strumPatterns)  -> source "genre"
 * A interface mostra de onde veio, para não vender chute como certeza.
 */
import {
  STRUM_PATTERNS,
  strumPatternForGenre,
  type StrumPattern,
  type Strum,
} from "./strumPatterns";

export type RhythmMode = "strum" | "arpeggio";

export interface ChosenRhythm {
  pattern: StrumPattern;
  mode: RhythmMode;
  /** de onde a decisão veio */
  source: "tab" | "genre";
  /** o trecho da cifra que decidiu (transparência na interface) */
  evidence?: string;
  label: string;
}

/** Um compasso de uma palhetada só (um acorde por compasso). */
const ONE_PER_CHORD: Strum[] = (() => {
  const s = new Array(16).fill("") as Strum[];
  s[0] = "D";
  return s;
})();

/** Um acorde por compasso, uma palhetada por TEMPO (4 no compasso). */
const ONE_PER_BEAT: Strum[] = (() => {
  const s = new Array(16).fill("") as Strum[];
  s[0] = "D"; s[4] = "D"; s[8] = "D"; s[12] = "D";
  return s;
})();

/** 6/8 dentro de 4/4: pulso ternário — 1 · · 4 · · (duas séries de 3). */
const SIX_EIGHT: Strum[] = (() => {
  const s = new Array(16).fill("") as Strum[];
  s[0] = "D"; s[2] = "U"; s[4] = "U";
  s[8] = "D"; s[10] = "U"; s[12] = "U";
  return s;
})();

export const EXTRA_PATTERNS: StrumPattern[] = [
  { id: "single", label: "One per chord", steps: ONE_PER_CHORD, typicalBpm: 80 },
  { id: "per-beat", label: "One per beat", steps: ONE_PER_BEAT, typicalBpm: 100 },
  { id: "six-eight", label: "6/8 feel", steps: SIX_EIGHT, typicalBpm: 90 },
];

const ALL_PATTERNS = [...STRUM_PATTERNS, ...EXTRA_PATTERNS];

export function allPatterns(): StrumPattern[] {
  return ALL_PATTERNS;
}

export function patternById(id: string): StrumPattern {
  return ALL_PATTERNS.find((p) => p.id === id) || STRUM_PATTERNS[0];
}

/** Janela de texto ao redor do casamento, para exibir como evidência. */
function around(text: string, idx: number, len: number, pad = 55): string {
  const a = Math.max(0, idx - pad);
  const b = Math.min(text.length, idx + len + pad);
  return text.slice(a, b).replace(/\s+/g, " ").trim();
}

interface Rule {
  re: RegExp;
  patternId: string;
  mode: RhythmMode;
}

/**
 * Regras em ORDEM DE ESPECIFICIDADE.
 *
 * A ordem resolve os casos compostos, que são a maioria: uma cifra pode dizer
 * "fingerpicked on the verse, light strumming on the chorus". Se eu testasse
 * "strum" primeiro, o dedilhado sumiria. As frases de dedilhado vêm antes.
 */
const RULES: Rule[] = [
  // 1) dedilhado explícito — a cifra manda NÃO bater.
  //    "no strumming PATTERN" é outra coisa (diz que não há variação de
  //    batida, não que não se bate) — daí o (?!\s*pattern). E "no chord is
  //    strummed" é voz passiva: o regex prevê o verbo no particípio.
  {
    re: /\b(?:do not|don't|never)\s+strum\b(?!\s*pattern)|\bno\s+strumming\b(?!\s+pattern)|\bno\s+(?:chord\s+is\s+)?strummed\b|\bpick(?:ed)?\s+the\s+(?:shapes|strings)\b|\bfingerpick(?:ed|ing)?\b|\barpeggi(?:o|os)\b|\bplay\s+the\s+bass\s+on\s+beat\b|\bnot\s+strummed\b/i,
    patternId: "arpeggio",
    mode: "arpeggio",
  },
  // 2) 6/8 — feel ternário. Exige NÃO estar dentro de número de casa de
  //    tablatura: "G|-0-3-/5--3-0-3/5--/6---5/6/8/10/8-|" casou aqui por engano.
  {
    re: /(?<![\d/])6\/8(?![\d/])/i,
    patternId: "six-eight",
    mode: "strum",
  },
  // 3) colcheias diretas — "straight 8ths" vale mesmo vindo junto de "no
  //    strumming pattern", porque ali o sentido é "sem variação"
  {
    re: /\b(?:straight|straightforward)\s*(?:8ths?|eighths?)\b|\bstrummed?\s+in\s+(?:straight\s+)?(?:8ths?|eighths?)\b|\beighth[- ]note\s+strums?\b/i,
    patternId: "downstrokes",
    mode: "strum",
  },
  // 4) uma palhetada POR ACORDE (o mais comum e o mais específico)
  {
    re: /\bone\s+downstroke\s+per\s+(?:chord|bar|measure)\b|\bone\s+strum\s+per\s+(?:chord|bar|measure)\b|\bsingle\s+downstroke\b|\bone\s+downward\s+(?:sweep|strum)\s+per\s+(?:chord|bar|measure)\b/i,
    patternId: "single",
    mode: "strum",
  },
  // 5) uma palhetada POR TEMPO
  {
    re: /\bone\s+downward\s+sweep\s+per\s+beat\b|\bone\s+strum\s+per\s+beat\b|\bdownstroke\s+per\s+beat\b|\bone\s+(?:strum|chord)\s+per\s+beat\b/i,
    patternId: "downstrokes",
    mode: "strum",
  },
];

/** Procura a instrução na cifra. Devolve null quando não há nada utilizável. */
export function rhythmFromTab(content: string | null | undefined): ChosenRhythm | null {
  if (!content || content.length < 20) return null;
  for (const rule of RULES) {
    const m = rule.re.exec(content);
    if (!m) continue;
    if (rule.mode === "arpeggio") {
      return {
        pattern: STRUM_PATTERNS[0],
        mode: "arpeggio",
        source: "tab",
        evidence: around(content, m.index, m[0].length),
        label: "Fingerpicked",
      };
    }
    const p = patternById(rule.patternId);
    return {
      pattern: p,
      mode: "strum",
      source: "tab",
      evidence: around(content, m.index, m[0].length),
      label: p.label,
    };
  }
  return null;
}

/** Decisão final: cifra primeiro, gênero como reserva. */
export function resolveRhythm(
  content: string | null | undefined,
  genre: string | null | undefined
): ChosenRhythm {
  const fromTab = rhythmFromTab(content);
  if (fromTab) return fromTab;
  const p = strumPatternForGenre(genre);
  return {
    pattern: p,
    mode: "strum",
    source: "genre",
    label: p.label,
  };
}

/**
 * Ordem das cordas num arpejo: sobe da grave para a aguda e desce, que é o
 * padrão clássico de dedilhado.
 */
export function arpeggioSteps(nStrings = 6): number[] {
  const up = Array.from({ length: nStrings }, (_, i) => i);
  const down = Array.from({ length: Math.max(0, nStrings - 2) }, (_, i) => nStrings - 2 - i);
  const seq = [...up, ...down];
  const out: number[] = [];
  for (let i = 0; i < 8; i++) out.push(seq[i % seq.length]);
  return out;
}
