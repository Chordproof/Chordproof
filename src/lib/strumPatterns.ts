/**
 * strumPatterns.ts — padrões de BATIDA (strumming) por gênero.
 *
 * POR QUE EXISTE: tocar a progressão com UMA palhetada por acorde mostra os
 * acordes, mas não mostra a música — quem quer aprender precisa da mão
 * direita, o ritmo. Referência de comportamento: o player do Cifra Club, que
 * toca o padrão de batida do estilo.
 *
 * COMO O PADRÃO É ESCRITO AQUI
 * Um compasso = 16 semicolcheias (steps 0..15). Os tempos (1, 2, 3, 4) caem
 * nos múltiplos de 4; as colcheias, nos índices pares.
 *
 *   "D"  palhetada para baixo (down)   — mais forte
 *   "U"  palhetada para cima (up)      — mais leve
 *   ""   nada (a corda continua soando)
 */

export type Strum = "D" | "U" | "";

export interface StrumPattern {
  id: string;
  /** nome do padrão como o aluno o conhece */
  label: string;
  steps: Strum[];
  /** BPM de referência, usado enquanto o BPM real da música não chega */
  typicalBpm: number;
}

/** Monta os 16 steps a partir das 8 colcheias do padrão. */
function fromEighths(e: Strum[]): Strum[] {
  const out: Strum[] = new Array(16).fill("");
  e.forEach((v, i) => {
    if (v) out[i * 2] = v;
  });
  return out;
}

/**
 * Texto do padrão, GERADO dos steps — nunca escrito à mão.
 * Escrever a legenda separada dos dados já me custou uma legenda mentindo
 * sobre o padrão que ele realmente toca. Aqui não há como divergir.
 *
 * Mostra as 8 colcheias do compasso, que é como o aluno lê uma batida. Quando
 * o padrão usa semicolcheias (Funk, Samba), mostra os 16 — em colcheias os
 * acentos ímpares do funk simplesmente sumiriam da legenda.
 */
export function patternDisplay(p: StrumPattern): string {
  const usa16 = p.steps.some((s, i) => Boolean(s) && i % 2 === 1);
  if (usa16) return p.steps.map((s) => s || "·").join(" ");
  const eighths: string[] = [];
  for (let i = 0; i < 16; i += 2) eighths.push(p.steps[i] || "·");
  return eighths.join(" ");
}

/** Conta as palhetadas (para exibir "6 strokes" e para testar). */
export function strokeCount(p: StrumPattern): number {
  return p.steps.filter(Boolean).length;
}

export const STRUM_PATTERNS: StrumPattern[] = [
  {
    id: "standard",
    label: "Standard",
    // D · D U · U D U — a batida mais usada do violão popular
    steps: fromEighths(["D", "", "D", "U", "", "U", "D", "U"]),
    typicalBpm: 110,
  },
  {
    id: "folk",
    label: "Folk / Country",
    // baixo no 1 e no 3, "chicka" no 2 e no 4 (boom-chicka)
    steps: fromEighths(["D", "", "D", "U", "D", "", "D", "U"]),
    typicalBpm: 100,
  },
  {
    id: "ballad",
    label: "Ballad",
    // lenta, deixa soar: D · · D U · · U
    steps: fromEighths(["D", "", "", "D", "U", "", "", "U"]),
    typicalBpm: 72,
  },
  {
    id: "reggae",
    label: "Reggae",
    // contratempos: só para cima
    steps: fromEighths(["", "U", "", "U", "", "U", "", "U"]),
    typicalBpm: 78,
  },
  {
    id: "funk",
    label: "Funk / R&B",
    // síncope: acentos deslocados, com semicolcheias
    steps: (() => {
      const s: Strum[] = new Array(16).fill("");
      s[0] = "D"; s[3] = "U"; s[4] = "D"; s[7] = "U";
      s[8] = "D"; s[10] = "U"; s[12] = "D"; s[14] = "U";
      return s;
    })(),
    typicalBpm: 100,
  },
  {
    id: "downstrokes",
    label: "Downstrokes",
    // punk / metal: só para baixo, em colcheias
    steps: fromEighths(["D", "D", "D", "D", "D", "D", "D", "D"]),
    typicalBpm: 140,
  },
  {
    id: "samba",
    label: "Samba / Bossa",
    // baixo no 1 e no 3, acordes sincopados
    steps: (() => {
      const s: Strum[] = new Array(16).fill("");
      s[0] = "D"; s[4] = "U"; s[8] = "D"; s[11] = "U";
      s[12] = "D"; s[14] = "U";
      return s;
    })(),
    typicalBpm: 96,
  },
];

/**
 * TABELA DE PRIORIDADE gênero -> padrão.
 *
 * A ORDEM É A REGRA, e por isso ela não é alfabética. O banco tem 33 gêneros
 * compostos ("Indie Folk", "Folk Rock", "Blues Rock", "Soft Rock"): se eu
 * testasse "Indie" antes de "Folk", "Indie Folk" tocaria batida de rock —
 * errado. O critério é o instrumento que define o ritmo: folk, country e
 * soul têm batida própria, e ela vence o "rock" que vem escrito junto.
 *
 * "Soul" fica em Funk/R&B, não em Ballad: soul é ritmo sincopado.
 */
const GENRE_PRIORITY: Array<[string, string]> = [
  // 1º: ritmos que o gênero composto herda (o mais característico primeiro)
  ["samba", "samba"], ["bossa", "samba"], ["mpb", "samba"],
  ["sertanejo", "samba"], ["forró", "samba"], ["forro", "samba"],
  ["brasileira", "samba"],

  ["reggae", "reggae"], ["ska", "reggae"], ["dancehall", "reggae"], ["latin", "reggae"],

  ["punk", "downstrokes"], ["metal", "downstrokes"], ["grunge", "downstrokes"],
  ["garage", "downstrokes"], ["hard rock", "downstrokes"],

  ["folk", "folk"], ["country", "folk"], ["americana", "folk"],
  ["bluegrass", "folk"], ["heartland", "folk"],

  ["funk", "funk"], ["r&b", "funk"], ["rnb", "funk"], ["hip-hop", "funk"],
  ["hiphop", "funk"], ["rap", "funk"], ["soul", "funk"],

  ["ballad", "ballad"], ["worship", "ballad"], ["gospel", "ballad"], ["jazz", "ballad"],

  // 2º: os genéricos, que só valem se nada acima casou
  ["rock", "standard"], ["pop", "standard"], ["indie", "standard"],
  ["alternative", "standard"], ["britpop", "standard"], ["emo", "standard"],
  ["blues", "standard"], ["psychedelic", "standard"],
];

/** Escolhe o padrão pelo gênero da cifra (padrão: Standard). */
export function strumPatternForGenre(genre: string | null | undefined): StrumPattern {
  const standard = STRUM_PATTERNS[0];
  if (!genre) return standard;
  const g = genre.toLowerCase().trim();
  if (!g || g === "none" || g === "other") return standard;

  for (const [token, id] of GENRE_PRIORITY) {
    if (g.includes(token)) {
      return STRUM_PATTERNS.find((p) => p.id === id) || standard;
    }
  }
  return standard;
}
