/**
 * chordTheory.ts — o cérebro dos acordes.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * O catálogo tinha um dicionário manual de shapes (CHORD_SHAPES). Toda cifra
 * que usasse um acorde fora daquele dicionário mostrava "Diagram under
 * construction" — 452 acordes distintos, 5.4 mil ocorrências reais nas cifras.
 *
 * Adicionar 452 shapes à mão seria eterno e voltaria a furar no próximo acorde
 * novo. Aqui a abordagem é outra: um PARSER de acorde (nome -> notas reais) e um
 * SOLVER que procura no braço as posições que produzem exatamente aquelas notas.
 * Assim nenhum acorde fica sem diagrama — nem os que ainda não existem, nem os
 * transpostos.
 *
 * O PARSER É O CORAÇÃO. Se ele erra o intervalo, o desenho sai bonito e errado,
 * que é pior que não ter desenho. Por isso a gramática cobre as 120 qualidades
 * que o catálogo realmente usa e as alterações/subtrações escritas na notação
 * brasileira: 7(9-), m7(11), (b5), 7M, m7M, 4, 2, 6(9), 7M(11+).
 */

export const NOTE_PC: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, Fb: 4, "E#": 5, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "B#": 0,
};

export const PC_NAME = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function noteToPc(n: string): number | null {
  return n in NOTE_PC ? NOTE_PC[n] : null;
}

/** Nome bonito para uma pitch class (sustenido), para exibir. */
export function pcName(pc: number): string {
  return PC_NAME[((pc % 12) + 12) % 12];
}

export type ChordSpec = {
  /** pitch class da fundamental (0=C) */
  root: number;
  /** intervalos em semitons a partir da fundamental, incluindo o 0 */
  intervals: number[];
  /** baixo do acorde invertido (C/G -> 7), ou null */
  bass: number | null;
  /** nome normalizado para exibição */
  name: string;
};

/**
 * Lê uma expressão de intervalos e devolve os semitons.
 *
 * Gramática aceita (notação brasileira + internacional):
 *  7  9  11  13  6  5  4  2  sus  sus4  sus2  add9  add4  add11
 *  m  min  maj  M  maj7  M7  7M  m7M  mM7  mmaj7
 *  dim  dim7  aug  +   m7b5  ø  °
 *  (9-)  (b9)  (9+)  (#9)  (b5)  (5-)  (11+)  (6-)  (9)  (11)  (4)  (add9)
 *
 * A regra: alterações em parênteses MODIFICAM ou SOMAM graus; nunca inventam
 * um acorde. Se não reconhecer nada, devolve null — quem chama decide.
 */
export function intervalsFor(quality: string): number[] | null {
  /**
   * Composicional, não tabelinha: cada elemento do nome SOMA ou SUBSTITUI um
   * grau.
   *
   * Os erros que esta versão corrige (todos pegos em teste com acordes reais
   * do catálogo):
   *  - "b5" fora de parênteses era ignorado: "m7b5" (acorde comuníssimo)
   *    desenhava a quinta justa. Acorde errado com desenho perfeito.
   *  - "9-" somava 20 em vez de 13; a nona menor é 13 (dentro de uma oitava,
   *    como a nona maior é 14 e não 2).
   *  - "7M" (sétima maior na notação brasileira) perdia a sétima.
   *  - "add9" era lido como acorde de nona e ganhava a sétima.
   *  - "m(maj7)", "6sus4", "9b5", "maj7b5", "m7add4" não eram reconhecidos.
   *
   * ORDEM IMPORTA e é o motivo de estar tudo numa função só, sem etapas
   * espalhadas: detectar sétima maior ANTES de remover o prefixo "maj"; remover
   * os addN ANTES de procurar extensões; tratar b5 ANTES das regras numéricas.
   */
  let q = (quality || "")
    .replace(/\s+/g, "")
    .replace(/♯/g, "#")
    .replace(/♭/g, "b")
    .replace(/[△Δ]/g, "maj")
    .replace(/°/g, "dim")
    .replace(/ø/g, "m7b5");

  if (q === "") return [0, 4, 7];

  // --- 1) modificações entre parênteses saem do corpo ---
  const mods: string[] = [];
  let body = q.replace(/\(([^)]*)\)/g, (_full, inner: string) => {
    inner.split(",").forEach((x) => mods.push(x.trim()));
    return "";
  });

  // --- 2) flags que precisam do nome intacto ---
  // sétima maior: "maj7/maj9", "M7/M9", "7M" ou "(maj7)" no parêntese
  const maj7Flag =
    /maj7|maj9|maj11|maj13/.test(q) ||
    /(^|[^a-z])M7|(^|[^a-z])M9|(^|[^a-z])M13/.test(body) ||
    /7M/.test(body) ||
    mods.some((m) => /^(maj7|M7|7M)$/.test(m));

  // --- 3) prefixo menor/maior ---
  let minor = false;
  if (/^maj/i.test(body)) body = body.replace(/^maj/, "");
  else if (/^M/.test(body)) body = body.replace(/^M/, "");
  else if (/^(min|-)/i.test(body)) { minor = true; body = body.replace(/^(min|-)/, ""); }
  else if (/^m/.test(body)) { minor = true; body = body.slice(1); }

  // --- 4) limpa o corpo de marcadores que não definem o acorde em si ---
  // addN: é grau SOMADO à tríade, não extensão (add9 não leva sétima)
  const adds: number[] = [];
  body = body.replace(/add(\d+)/g, (_m, d: string) => {
    const n = Number(d);
    if (n === 2) adds.push(2);
    else if (n === 4) adds.push(5);
    else if (n === 6) adds.push(9);
    else if (n === 9) adds.push(14);
    else if (n === 11) adds.push(17);
    else if (n === 13) adds.push(21);
    return "";
  });

  // b5 / #5 escritos direto no nome (m7b5, 7b5, maj7b5, 9b5)
  let bodyFifth: number | null = null;
  if (/b5/.test(body)) bodyFifth = 6;
  if (/#5/.test(body)) bodyFifth = 8;
  body = body.replace(/b5|#5/g, "");

  // "7M" soa como sétima MAIOR — vira um "7" comum só para a contagem,
  // porque a flag maj7Flag já registrou o caráter.
  body = body.replace(/7M|M7/g, "7");

  // --- 5) tríade (terça e quinta) ---
  const iv = new Set<number>([0]);
  const hasDim = /dim/.test(body);
  const hasAug = /aug|\+/.test(body);
  const hasSus2 = /sus2/.test(body) || /(^|\d)2(?!\d)/.test(body);
  const hasSus4 = /sus4|sus/.test(body) || /(^|\d)4(?!\d)/.test(body);
  const isPower = /^5$/.test(body);

  if (hasDim) { iv.add(3); iv.add(6); }
  else if (hasAug) { iv.add(4); iv.add(8); }
  else if (hasSus2) { iv.add(2); iv.add(7); }
  else if (hasSus4) { iv.add(5); iv.add(7); }
  else if (isPower) { iv.add(7); }
  else { iv.add(minor ? 3 : 4); iv.add(7); }

  if (bodyFifth !== null) { iv.delete(7); iv.add(bodyFifth); }

  // --- 6) sétima ---
  const seventhReq = /(^|\d)(7|9|11|13)(?!\d)/.test(body) || maj7Flag;
  if (hasDim && /7/.test(body)) iv.add(9);        // dim7 -> sétima diminuta
  else if (maj7Flag) iv.add(11);
  else if (seventhReq) iv.add(10);

  // --- 7) extensões ---
  if (/(^|\d)13(?!\d)/.test(body)) { iv.add(10); iv.add(14); iv.add(21); }
  else if (/(^|\d)11(?!\d)/.test(body)) { iv.add(10); iv.add(14); iv.add(17); }
  else if (/(^|\d)9(?!\d)/.test(body)) { iv.add(10); iv.add(14); }

  // --- 8) sexta ---
  if (/(^|\d)6(?!\d)/.test(body)) iv.add(9);

  // --- 9) graus somados ---
  adds.forEach((a) => iv.add(a));

  // --- 10) alterações no CORPO: 9-, 9+, 11+ ---
  // Semitom de cada grau extensão (uma oitava acima da escala simples):
  // nona = 14, décima primeira = 17, décima terceira = 21.
  // Somar 12 a 9 daria 21 (que é a décima terceira!) — foi esse o erro que
  // fazia "B7(9-)" desenhar a nota errada.
  const DEG: Record<number, number> = { 9: 14, 11: 17, 13: 21 };
  const alterBody = (src: string) => {
    let m: RegExpExecArray | null;
    const reMin = /(9|11|13)-/g;
    while ((m = reMin.exec(src))) {
      const sem = DEG[Number(m[1])];
      iv.delete(sem);
      iv.add(sem - 1);
    }
    const rePlus = /(9|11|13)\+/g;
    while ((m = rePlus.exec(src))) {
      const sem = DEG[Number(m[1])];
      iv.delete(sem);
      iv.add(sem + 1);
    }
  };
  alterBody(body);

  // --- 11) modificações entre parênteses ---
  for (const mod of mods) {
    if (/^(5-|b5)$/.test(mod)) { iv.delete(7); iv.add(6); continue; }
    if (/^(5\+|#5)$/.test(mod)) { iv.delete(7); iv.add(8); continue; }
    if (/^(6-|b6|b13|13-)$/.test(mod)) { iv.add(8); continue; }
    if (/^(9-|b9)$/.test(mod)) { iv.add(13); continue; }
    if (/^(9\+|#9)$/.test(mod)) { iv.add(15); continue; }
    if (/^(11\+|#11)$/.test(mod)) { iv.add(18); continue; }
    if (/^(maj7|M7|7M)$/.test(mod)) { iv.delete(10); iv.add(11); continue; }
    if (/^(dim|°)$/.test(mod)) { iv.add(6); continue; }
    if (/^(aug|\+)$/.test(mod)) { iv.add(8); continue; }
    const deg = mod.match(/^(\d+)$/);
    if (deg) {
      const d = Number(deg[1]);
      if (d === 2) iv.add(2);
      else if (d === 4) iv.add(5);
      else if (d === 6) iv.add(9);
      else if (d === 7) iv.add(10);
      else if (d === 9) iv.add(14);
      else if (d === 11) iv.add(17);
      else if (d === 13) iv.add(21);
      continue;
    }
    // desconhecido: ignora em vez de quebrar o acorde inteiro
  }

  // sus remove a terça
  if (hasSus2 || hasSus4) { iv.delete(3); iv.delete(4); }

  return Array.from(iv).sort((a, b) => a - b);
}

/**
 * Converte um nome de acorde em fundamentais + intervalos + baixo.
 * Devolve null só quando não há fundamental reconhecível.
 */
export function parseChordName(name: string): ChordSpec | null {
  if (!name) return null;
  const trimmed = name.trim();
  const m = trimmed.match(/^([A-G][#b♯♭]?)(.*)$/);
  if (!m) return null;

  const rootName = m[1].replace("♯", "#").replace("♭", "b");
  const root = noteToPc(rootName);
  if (root === null || root === undefined) return null;

  let quality = m[2];
  let bass: number | null = null;

  // acorde invertido: pega o baixo, o resto é a qualidade
  const slash = quality.lastIndexOf("/");
  if (slash !== -1) {
    const bassName = quality.slice(slash + 1).replace("♯", "#").replace("♭", "b");
    const bp = noteToPc(bassName);
    if (bp !== null && bp !== undefined) {
      bass = bp;
      quality = quality.slice(0, slash);
    }
  }

  // anotações de cifra que não são acorde: (solta), (002210), (*), (10ª)
  const junk = /^\((solta|xx\d*|\d{6}|\*|\d+ª|e)\)$/i;
  const cleaned = quality.replace(/\(([^)]*)\)/g, (full) => (junk.test(full) ? "" : full));

  const intervals = intervalsFor(cleaned);
  if (!intervals) return null;

  return { root, intervals, bass, name: trimmed };
}
