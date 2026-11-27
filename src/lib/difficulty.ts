/**
 * difficulty.ts — QUANTO A CIFRA É DIFÍCIL DE TOCAR, calculado do conteúdo.
 *
 * POR QUE NÃO USAR O CAMPO `difficulty` DO BANCO
 * Medi os 1.166 registros: "Beginner" tem média de 7,3 acordes distintos e
 * "Advanced" 9,1 — praticamente a mesma coisa. O rótulo é decorativo e, num
 * site que quer ENSINAR, mandar um iniciante para uma música rotulada
 * "Beginner" com pestana destrói a confiança na hora.
 *
 * O QUE PESA DE VERDADE (em ordem de dificuldade real para quem aprende):
 *   1. PESTANA — é o divisor de águas. Um acorde fechado custa mais que
 *      quatro abertos juntos.
 *   2. Acordes DISTINTOS — quantos shapes a memória precisa segurar.
 *   3. ANDAMENTO — 3 acordes a 60 BPM é outra coisa que a 160.
 *   4. TABLATURA / dedilhado — a mão direita deixa de ser batida.
 *   5. CAPOTRASTE — muda o shape que a cabeça precisa achar.
 *
 * CILADAS QUE JÁ ME ENGANARAM AQUI (o detector ingênuo contava tudo):
 *   a) linha de ACORDES seguida de linha de TABLATURA ("Bbm / Gb" + "e|-…")
 *      é um TRECHO, não a grade da música — contava 34 acordes num Believer.
 *   b) PROSA: "the guitar enters with the three-note arpeggio on the D" —
 *      uma frase em inglês tem a mesma sequência de palavras que uma cifra
 *      ("the", "D", "G", "B"). Só é grade se a MAIORIA for acorde.
 *   c) acorde isolado com dígito de dedilhado colado ("F#m (xx4222)") é
 *      anotação de shape, não acorde novo.
 *
 * LIMITE HONESTO: isto mede a CIFRA, não a música. Não sabe de harmonia, de
 * mudança de métrica nem de tempo composto. É um mapa de progressão confiável,
 * não um veredito de professor.
 */

/** Acordes de pestana mais comuns (forma fechada obrigatória no violão). */
const BARRE_ROOTS = new Set([
  "F", "F#", "Gb", "C#", "Db", "G#", "Ab", "D#", "Eb", "A#", "Bb", "B",
]);

/** Acordes que se tocam com cordas soltas na forma mais comum. */
const OPEN_CHORDS = new Set([
  "C", "D", "E", "G", "A",
  "Am", "Dm", "Em",
  "Cadd9", "Dsus2", "Dsus4", "Asus2", "Asus4", "Esus4", "Gsus4",
  "Em7", "Am7", "Dm7", "Cmaj7", "G7", "C7", "E7", "A7", "D7", "B7",
  "G/B", "C/G", "D/F#", "G5", "C5", "D5", "A5", "E5",
]);

const CHORD_TOKEN =
  /^([A-G][#b]?)(maj7|maj|min7|min|m7|m|M7|M|sus4|sus2|sus|add9|add|dim7|dim|aug|[0-9]+|[+\-])*(\([^)]*\))*(\/[A-G][#b]?)?$/;

const TAB_LINE = /^\s*[eBGDAE]\|/;
const SECTION = /^\[(.+)\]$/;

export interface DifficultyInput {
  content: string | null | undefined;
  bpm?: number | null;
  capo?: number | string | null;
}

export interface DifficultyBreakdown {
  /** 1 = mais fácil da escala */
  level: 1 | 2 | 3 | 4;
  label: "Beginner" | "Easy" | "Intermediate" | "Advanced";
  score: number;
  distinctChords: number;
  barreChords: string[];
  openChords: string[];
  hasTab: boolean;
  sections: number;
  /** frases curtas do que torna esta cifra difícil (para a interface) */
  reasons: string[];
}

/** Só o nome do acorde, limpo de anotação de dedilhado ("F#m (xx4222)"). */
function cleanToken(token: string): string {
  return token
    .replace(/^\[|\]$/g, "")
    .replace(/[,;:]+$/, "")
    .replace(/\((?:x{0,2}[0-9x]{1,2}){3,6}\)$/i, "") // (xx4222), (022000)
    .trim();
}

function isChordName(t: string): boolean {
  return t.length > 0 && t.length <= 12 && CHORD_TOKEN.test(t);
}

/**
 * Extração dos acordes.
 *
 * REGRA CENTRAL: uma linha só é grade de acordes se a MAIORIA das palavras
 * for acorde válido (>= 70%). Isso separa "G D Em C" de prosa como "the
 * guitar enters with the three-note arpeggio on the D" — nesta, 3 de 12
 * palavras são acordes e a linha é descartada.
 */
export function chordLinesOf(content: string | null | undefined): string[][] {
  if (!content) return [];
  const out: string[][] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (SECTION.test(line)) continue;
    if (TAB_LINE.test(line)) continue;
    const words = line.split(/\s+/).filter((w) => w && !/^[|:\-–—]+$/.test(w));
    if (!words.length) continue;
    const chords = words.map(cleanToken).filter(isChordName);
    if (chords.length === 0) continue;
    if (chords.length / words.length < 0.7) continue;
    out.push(chords);
  }
  return out;
}

/** Acordes distintos, na ordem de aparição. */
export function chordsInTabContent(content: string | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of chordLinesOf(content)) {
    for (const c of line) {
      if (seen.has(c)) continue;
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

function rootOf(chord: string): string {
  const m = chord.match(/^([A-G][#b]?)/);
  return m ? m[1] : chord;
}

/** Um acorde pede pestana? Raízes fechadas em maior/menor sustentam a regra. */
function isBarre(chord: string): boolean {
  if (OPEN_CHORDS.has(chord)) return false;
  const root = rootOf(chord);
  if (!BARRE_ROOTS.has(root)) return false;
  const quality = chord.slice(root.length);
  if (/^5$/.test(quality)) return false; // power chord de 2 notas não é pestana
  return /^(m|maj|min|7|maj7|m7|sus|[0-9])/.test(quality) || quality === "";
}

export function scoreDifficulty({
  content,
  bpm,
  capo,
}: DifficultyInput): DifficultyBreakdown {
  const chords = chordsInTabContent(content);
  const text = content || "";
  const lines = chordLinesOf(content);

  const barre = chords.filter(isBarre);
  const open = chords.filter((c) => OPEN_CHORDS.has(c));

  const hasTab = text.split("\n").some((l) => TAB_LINE.test(l.trim()));
  const sections = new Set<string>();
  for (const l of text.split("\n")) {
    const m = l.trim().match(SECTION);
    if (m) sections.add(m[1].replace(/\s*\d+$/, "").toLowerCase());
  }

  const capoNum = (() => {
    const n = parseInt(String(capo ?? "").replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) && n > 0 && n <= 12 ? n : 0;
  })();

  const tempo = Number(bpm) > 30 ? Number(bpm) : 100;
  const conjuntos = lines.length;

  /**
   * ACORDE COM PESTANA CONTA MAIS QUE ACORDE ABERTO.
   *
   * Medido no catálogo: "Someone Like You" tem 13 acordes e só 3 pestanas —
   * é acompanhamento simples com inversões de baixo. Já "Dream On" tem 7
   * acordes e 5 pestanas. Contar só o TOTAL punha as duas no mesmo lugar,
   * o que é falso para quem aprende: a pestana é o custo.
   */
  const abertosConhecidos = chords.filter((c) => OPEN_CHORDS.has(c)).length;
  const outros = chords.length - abertosConhecidos;
  let score = 0;
  score += abertosConhecidos * 0.45; // formas abertas: memória, custo baixo
  score += outros * 0.9;             // inversões e formas menos comuns: custo médio
  score += Math.min(conjuntos, 8) * 0.25; // estrutura, com teto
  score += barre.length * 2.6;       // pestana: o divisor de águas
  score += Math.max(0, (tempo - 100) / 40);
  score += hasTab ? 1.8 : 0;
  score += capoNum > 0 ? 0.8 : 0;
  score += Math.max(0, sections.size - 3) * 0.2;

  if (!chords.length) score = 4;

  let level: 1 | 2 | 3 | 4;
  if (score < 8) level = 1;
  else if (score < 13) level = 2;
  else if (score < 19) level = 3;
  else level = 4;

  const label = (["Beginner", "Easy", "Intermediate", "Advanced"] as const)[level - 1];

  const reasons: string[] = [];
  if (barre.length) {
    reasons.push(
      `${barre.length} barre chord${barre.length > 1 ? "s" : ""} (${barre.slice(0, 3).join(", ")})`
    );
  }
  if (chords.length >= 9) reasons.push(`${chords.length} different chords to remember`);
  if (outros >= 4) reasons.push("slash chords and inversions");
  if (tempo >= 130) reasons.push(`${Math.round(tempo)} BPM`);
  if (hasTab) reasons.push("picked or fingerpicked part written in tablature");
  if (capoNum) reasons.push(`capo on fret ${capoNum}`);
  if (!barre.length && chords.length <= 6) reasons.push("all open chords");

  return {
    level,
    label,
    score: Math.round(score * 10) / 10,
    distinctChords: chords.length,
    barreChords: barre,
    openChords: open,
    hasTab,
    sections: sections.size,
    reasons,
  };
}

/** Só o rótulo, para listas e ordenação. */
export function difficultyLabelOf(input: DifficultyInput): string {
  return scoreDifficulty(input).label;
}
