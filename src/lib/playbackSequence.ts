/**
 * playbackSequence.ts — a ordem REAL dos acordes da cifra, linha por linha.
 *
 * POR QUE EXISTE
 * O player tocava 16 acordes (MAX_CHORDS) e parava. Medido nas 50 mais
 * visitadas: a música mediana tem 80 acordes e 4min24, então o botão "Play"
 * entregava 33s — 15% da música. Pior: a cifra NÃO acompanhava o som, e quem
 * tem as duas mãos no instrumento não pode rolar a tela.
 *
 * O QUE ESTE MÓDULO FAZ
 * Percorre o conteúdo com A MESMA REGRA do renderizador (renderContent):
 * linha de seção, linha de tablatura, linha de acorde (com ou sem a letra
 * embaixo) e linha de letra solta. Devolve cada acorde na ordem em que aparece,
 * junto com o NÚMERO DA LINHA onde ele está desenhado. É esse número que
 * permite destacar e rolar a linha certa.
 *
 * REGRA DE OURO: se a regra do renderizador mudar, este arquivo muda junto —
 * senão o destaque cai na linha errada. Os dois usam isChordToken/TAB_LINE_RE.
 */
import { TAB_LINE_RE, isChordLine, isChordToken } from "./tabRenderer";

const SECTION_RE = /^\[(.+)\]$/;

export interface ChordEvent {
  /** acorde como está escrito na cifra (sem transposição) */
  chord: string;
  /** índice da linha do acorde no content.split("\n") */
  line: number;
  /** linha da letra logo abaixo, quando a cifra desenha o par acorde+letra */
  lyricLine?: number;
}

/**
 * Sequência completa de acordes, na ordem de leitura da cifra.
 * `showTablature` NÃO afeta a sequência: tablatura não é acorde, e esconder o
 * desenho não muda o que se toca.
 */
export function buildPlaybackSequence(content: string | null | undefined): ChordEvent[] {
  if (!content) return [];
  const lines = content.split("\n");
  const out: ChordEvent[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;
    if (SECTION_RE.test(line)) continue;
    // tablatura: o renderizador a desenha (ou esconde), mas não há acorde nela
    if (TAB_LINE_RE.test(line)) continue;
    if (!isChordLine(line)) continue;

    const chords = line.split(/\s+/).filter((t) => isChordToken(t));
    if (!chords.length) continue;

    const next = (lines[i + 1] ?? "").trim();
    const paired =
      next.length > 0 &&
      !SECTION_RE.test(next) &&
      !TAB_LINE_RE.test(next) &&
      !isChordLine(next);

    for (const c of chords) {
      out.push(paired ? { chord: c, line: i, lyricLine: i + 1 } : { chord: c, line: i });
    }
    if (paired) i++; // a linha da letra já foi consumida pelo par
  }

  return out;
}

/** Quantos acordes distintos, na ordem de aparição (para os botões de acorde). */
export function uniqueChords(events: ChordEvent[], limit = 24): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of events) {
    if (seen.has(e.chord)) continue;
    seen.add(e.chord);
    out.push(e.chord);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Reconstrução por SEÇÕES: a cifra omite refrão repetido, então a sequência
 * linear cobre só ~61% da música. Quando a cifra traz o "record map"
 * ("Intro - Verse - Chorus - ..."), dá para repetir as seções na ordem certa.
 *
 * Devolve a sequência expandida, ou null quando a cifra não descreve a ordem.
 */
export function expandByRecordMap(content: string | null | undefined): ChordEvent[] | null {
  if (!content) return null;

  // FORMATO 1 — "STRUCTURE: A | B | C" ou "SEQUENCE (record map)" seguido de lista.
  // Exige uma sequência de 3+ nomes separados por | - ou >, senão é prosa.
  let declared: string[] | null = null;
  const inline = content.match(
    /(?:structure|record map|sequence)\s*[:\(]?[^\n]*?[:\-]\s*([^\n]{10,300})/i
  );
  if (inline && /[|\-–>→]/.test(inline[1])) {
    const parts = inline[1]
      .split(/\s*[|]\s*|\s+[-–>→]\s+/)
      .map((v) => v.replace(/\(.*?\)/g, "").replace(/\bx\d+\b/gi, "").trim().toLowerCase())
      .filter((v) => v.length > 2 && v.length < 40);
    if (parts.length >= 3) declared = parts;
  }
  if (!declared) return null;

  // Corpo da cifra em seções: nome -> eventos.
  const lines = content.split("\n");
  const sections: { name: string; events: ChordEvent[] }[] = [];
  let current: { name: string; events: ChordEvent[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = line.match(SECTION_RE);
    if (m) {
      current = { name: m[1].toLowerCase(), events: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (TAB_LINE_RE.test(line)) continue;
    if (!isChordLine(line)) continue;
    const chords = line.split(/\s+/).filter((t) => isChordToken(t));
    const next = (lines[i + 1] ?? "").trim();
    const paired =
      next.length > 0 && !SECTION_RE.test(next) && !TAB_LINE_RE.test(next) && !isChordLine(next);
    for (const c of chords) {
      current.events.push(paired ? { chord: c, line: i, lyricLine: i + 1 } : { chord: c, line: i });
    }
    if (paired) i++;
  }

  const find = (want: string) => {
    const base = want.replace(/\s*\d+\s*$/, "").trim();
    return (
      sections.find((s) => s.name === want) ||
      sections.find((s) => s.name.startsWith(base)) ||
      sections.find((s) => s.name.includes(base)) ||
      null
    );
  };

  const expanded: ChordEvent[] = [];
  let hits = 0;
  for (const want of declared) {
    const s = find(want);
    if (!s || !s.events.length) continue;
    hits++;
    expanded.push(...s.events);
  }
  if (hits < 2) return null;
  return expanded;
}

/**
 * REPETIÇÃO POR RÓTULO — a reserva quando a cifra não descreve a ordem.
 *
 * A cifra escreve "[Verse 1]", "[Verse 2]", "[Verse 3]" e só o primeiro traz
 * os acordes. Para a segunda/terceira, o modelo musical é repetir o primeiro
 * que apareceu com aquele nome. Medido nas 50 mais visitadas: é o que mais
 * aparece, e é conservador (repete o verso, não inventa refrão novo).
 */
export function applySectionRepeats(events: ChordEvent[], content: string): ChordEvent[] {
  if (!events.length) return events;
  const lines = content.split("\n");

  // mapa linha -> nome da seção daquele ponto
  const sectionAt: (string | null)[] = [];
  let cur: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = (lines[i] ?? "").trim().match(SECTION_RE);
    if (m) cur = m[1].toLowerCase();
    sectionAt[i] = cur;
  }

  // primeiro trecho de eventos por seção-base (verse/chorus/bridge...)
  const base = (name: string) => name.replace(/\s*\d+\s*$/, "").trim();
  const primeiro = new Map<string, ChordEvent[]>();
  let i = 0;
  while (i < events.length) {
    const sec = sectionAt[events[i].line] ?? "";
    const b = base(sec);
    let j = i;
    while (j < events.length && (sectionAt[events[j].line] ?? "") === sec) j++;
    if (!primeiro.has(b)) primeiro.set(b, events.slice(i, j));
    i = j;
  }

  const out: ChordEvent[] = [];
  i = 0;
  while (i < events.length) {
    const sec = sectionAt[events[i].line] ?? "";
    const b = base(sec);
    let j = i;
    while (j < events.length && (sectionAt[events[j].line] ?? "") === sec) j++;
    const block = events.slice(i, j);
    const ref = primeiro.get(b);
    // seção vazia de acordes não existe aqui; se o bloco é MENOR que o
    // primeiro com o mesmo nome, é repetição resumida -> usa o primeiro
    if (ref && ref.length > block.length) out.push(...ref);
    else out.push(...block);
    i = j;
  }
  return out;
}
