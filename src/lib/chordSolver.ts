/**
 * chordSolver.ts — encontra no braço uma posição que TOCA o acorde pedido.
 *
 * POR QUE UM SOLVER E NÃO UMA TABELA
 * O dicionário manual (CHORD_SHAPES) cobre 415 acordes; o catálogo usa 804,
 * então 452 mostravam "Diagram under construction" — 5.4 mil ocorrências. Uma
 * tabela maior furaria de novo no acorde seguinte, e nos transpostos.
 *
 * O QUE FAZ UM DESENHO PARECER CERTO
 * A primeira versão buscava "todas as notas do acorde soando" e produzia
 * posições legais mas estranhas (Dó em 3ª/5ª casa em vez de x32010). As notas
 * estavam certas e o desenho, errado — pior que não ter desenho, porque o
 * iniciante confia. A pontuação abaixo segue o que um violonista faz de fato:
 *
 *  1. CORDAS SOLTAS: um acorde aberto soa cheio e é o que se aprende primeiro.
 *  2. FUNDAMENTAL NO BAIXO: D com F# na corda grave é D/F#, outro acorde.
 *  3. POSIÇÃO BAIXA: ninguém toca acorde de cifra na 9ª casa.
 *  4. MÃO COMPACTA: poucas casas distintas e abertura pequena.
 *  5. CORDA MUDA NO MEIO: dedo pulando corda é desconfortável — penaliza.
 *
 * Também cobre ACORDE INVERTIDO (C/E): a nota do baixo não pertence ao acorde,
 * então ela entra como nota permitida — antes esses 152 acordes ficavam sem
 * solução porque o baixo era "nota estranha".
 */

import { parseChordName, pcName } from "./chordTheory";

/** Afinação padrão, da 6ª (grave) para a 1ª (aguda): E A D G B E. */
export const TUNING = [4, 9, 2, 7, 11, 4];

export type SolvedShape = {
  /** trastes por corda: -1 = muda, 0 = solta, n = casa */
  frets: number[];
  /** dedos por corda: 0 = solta, -1 = muda, 1..4 = dedo */
  fingers: number[];
  /** casa base (0 = posição aberta) */
  baseFret: number;
  score: number;
};

const MAX_FRET = 12;
const PRIMARY_FRET = 7; // a busca principal não passa daqui: posição tocável
const MAX_SPAN = 4;
const MAX_FINGERS = 4;

function pcAt(string: number, fret: number): number {
  return (TUNING[string] + fret) % 12;
}

/** Dedilhado plausível: casa mais grave = dedo 1, próxima = 2, etc.
 *  Pestana (mesma casa em várias cordas) usa o mesmo dedo — é o que a mão faz. */
export function fingersFor(frets: number[]): number[] {
  const played = frets.filter((f) => f > 0);
  const distinct = Array.from(new Set(played)).sort((a, b) => a - b);
  const map: Record<number, number> = {};
  distinct.forEach((f, i) => (map[f] = Math.min(i + 1, 4)));
  return frets.map((f) => (f > 0 ? map[f] : f));
}

export function describeShape(s: SolvedShape): string {
  return s.frets.map((f) => (f < 0 ? "x" : String(f))).join(" ");
}

/**
 * CACHE — a mesma cifra redesenha os mesmos acordes o tempo todo (hover,
 * transposição, "Chords used"). A busca custa ~1ms; sem cache ela se repete
 * dezenas de vezes por página. Chave = nome pedido.
 */
const CACHE = new Map<string, SolvedShape[]>();

export function solveChord(name: string): SolvedShape[] {
  const cached = CACHE.get(name);
  if (cached) return cached;
  const result = solveChordUncached(name);
  CACHE.set(name, result);
  return result;
}

function solveChordUncached(name: string): SolvedShape[] {
  const spec = parseChordName(name);
  if (!spec) return [];

  const chordPcs = new Set(spec.intervals.map((i) => (spec.root + i) % 12));
  const rootPc = spec.root;
  const bassPc = spec.bass;

  /**
   * NOTAS OBRIGATÓRIAS — a regra que faz o desenho ser o clássico.
   *
   * Exigir todas as notas produzia posições corretas e esquisitas: o C7
   * clássico (x32310) ficava de fora porque OMITE a quinta (Sol), que é
   * exatamente o que todo violonista faz. O que define o acorde são a
   * fundamental, a terça (maior/menor) e, nos acordes de sétima, a sétima.
   * Quinta e demais graus embelezam, não identificam.
   */
  const isDimOrAug =
    chordPcs.has((rootPc + 6) % 12) || chordPcs.has((rootPc + 8) % 12);
  const required = new Set<number>([rootPc]);
  const has = (i: number) => chordPcs.has((rootPc + i) % 12);
  const isSus = has(7) && !has(3) && !has(4); // sus4 tem a 4a, sus2 a 2a
  if (has(3)) required.add((rootPc + 3) % 12);
  else if (has(4)) required.add((rootPc + 4) % 12);
  // dim/aug não têm quinta justa, mas a nota que os define já veio na
  // terça (ou na quarta/quinta do sus). Não exigimos a quinta deles aqui.
  else if (!isSus && !isDimOrAug) required.add((rootPc + 7) % 12);
  if (chordPcs.has((rootPc + 11) % 12)) required.add((rootPc + 11) % 12);
  else if (chordPcs.has((rootPc + 10) % 12)) required.add((rootPc + 10) % 12);

  // notas permitidas: as do acorde + o baixo pedido (inversão é nota de fora)
  const allowed = new Set(chordPcs);
  if (bassPc !== null) allowed.add(bassPc);

  const results: SolvedShape[] = [];

  const search = (limit: number) => {
    const options: number[][] = [];
    for (let s = 0; s < 6; s++) {
      const opts: number[] = [-1];
      for (let f = 0; f <= limit; f++) if (allowed.has(pcAt(s, f))) opts.push(f);
      options.push(opts);
    }

    const frets = new Array(6).fill(-1);

    const consider = () => {
      const sounding: number[] = [];
      for (let s = 0; s < 6; s++) if (frets[s] >= 0) sounding.push(pcAt(s, frets[s]));

      if (sounding.length < 3) return; // acorde precisa de 3 cordas

      const uniq = new Set(sounding);
      // toda nota tocada tem de pertencer ao acorde (ou ser o baixo pedido)
      for (const pc of uniq) if (!allowed.has(pc)) return;
      // as notas que IDENTIFICAM o acorde precisam estar todas presentes
      for (const pc of required) if (!uniq.has(pc)) return;

      const lowest = sounding[0];
      // sem baixo pedido, a fundamental tem de estar na corda mais grave
      if (bassPc === null && lowest !== rootPc) return;
      if (bassPc !== null && lowest !== bassPc) return;

      const played = frets.filter((f) => f > 0);
      const minF = played.length ? Math.min(...played) : 0;
      const maxF = played.length ? Math.max(...played) : 0;
      if (maxF - minF > MAX_SPAN) return;
      if (new Set(played).size > MAX_FINGERS) return;

      // ---------- PONTUAÇÃO ----------
      let score = 0;

      // 1) cordas soltas: a assinatura do acorde aberto
      const openCount = frets.filter((f) => f === 0).length;
      score += openCount * 7;

      // 3) posição: acorde de cifra mora no começo do braço
      score -= maxF * 4;

      // 4) mão compacta
      score -= (maxF - minF) * 2;
      score -= (new Set(played).size - 1) * 1.5;

      // 5) buracos na mão: corda muda entre cordas que soam
      let seenSound = false;
      for (let s = 5; s >= 0; s--) {
        if (frets[s] >= 0) { seenSound = true; continue; }
        if (seenSound) score -= 7; // muda no meio
      }
      // cordas agudas mudas: acorde truncado
      if (frets[5] === -1) score -= 5;

      // 6) corpo cheio: acorde de cifra quer as cordas soando
      score += sounding.length * 4;

      // 2) fundamento no baixo já foi exigido; bônus se a corda grave é solta
      if (frets[0] === 0) score += 3;

      // pestana: mesma casa em 2+ cordas é o desenho clássico de pestana
      const byFret: Record<number, number> = {};
      played.forEach((f) => (byFret[f] = (byFret[f] || 0) + 1));
      if (Object.values(byFret).some((c) => c >= 2)) score += 4;

      results.push({
        frets: frets.slice(),
        fingers: [],
        baseFret: minF > 3 ? minF : 0,
        score,
      });
    };

    const dive = (s: number) => {
      if (s === 6) { consider(); return; }
      for (const f of options[s]) { frets[s] = f; dive(s + 1); }
      frets[s] = -1;
    };
    dive(0);
  };

  // busca curta primeiro (posições tocáveis); só abre o braço se nada sair
  search(PRIMARY_FRET);
  if (!results.length) search(MAX_FRET);
  if (!results.length) return [];

  results.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: SolvedShape[] = [];
  for (const r of results) {
    const key = r.frets.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...r, fingers: fingersFor(r.frets) });
    if (out.length >= 4) break;
  }
  return out;
}

export { pcName };
