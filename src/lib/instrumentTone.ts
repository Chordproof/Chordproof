/**
 * instrumentTone.ts — TIMBRE por instrumento na síntese de áudio.
 *
 * PROBLEMA que isto resolve (pedido do dono, 26/11): "o som dos acordes parece
 * que são todos de guitarra... quando mudo de guitar para piano o som do
 * acorde [deve ser] relativo ao instrumento". O motor de áudio só tinha UMA
 * voz: Karplus-Strong com decaimento de corda de aço. Piano, baixo, cavaco e
 * ukulele soavam todos como a mesma guitarra.
 *
 * COMO CADA INSTRUMENTO É FEITO AQUI (síntese, sem sample — nada de arquivo,
 * nada de licença):
 *
 *  guitar  — Karplus-Strong de aço: ruído curto excitando corda, decaimento
 *            médio, brilho alto. (o que já existia)
 *  acoustic— corda de bronze: excitação mais macia, decaimento longo, menos
 *            agudo (bronze toca mais "cheio" e menos "estalado").
 *  bass    — corda grossa: ruído grave (filtro passa-baixa na excitação),
 *            decaimento longo, ataque abafado.
 *  cavaco  — aço mas corda curta e muito tensa: decaimento MUITO rápido,
 *            ataque metálico brilhante, pouco corpo.
 *  ukulele — nylon: ataque macio, quase sem brilho, decaimento curto.
 *  piano   — NÃO é corda dedilhada. É soma de harmônicos com envelope de
 *            piano (ataque instantâneo, decaimento exponencial, harmônicos
 *            agudos caindo mais rápido) + um leve "thunk" de martelo.
 *
 * O ponto importante: piano, baixo, cavaco e ukulele MUDAM a nota também.
 * Um acorde de piano não é o mesmo voicing de uma guitarra — e um baixo toca
 * uma nota por vez, na região grave. Isso está em `voicingFor`.
 */

import type { InstrumentKey } from "./instruments";

/** Perfil de timbre: o que diferencia o som de cada instrumento. */
export interface ToneProfile {
  /** técnica de geração */
  kind: "string" | "piano";
  /** 0..1 — quanto o ataque é brilhante/metálico */
  brightness: number;
  /** 0..1 — quão rápido o som morre (1 = morre rápido) */
  decay: number;
  /** duração base do buffer, em segundos */
  duration: number;
  /** atenuação aplicada ao filtro passa-baixa da corda (menor = mais abafado) */
  damping: number;
  /** volume relativo do instrumento */
  gain: number;
  /** tempo entre cordas de um acorde, em ms (0 = todas juntas, como piano) */
  strumMs: number;
}

export const TONE_PROFILES: Record<InstrumentKey, ToneProfile> = {
  guitar: {
    kind: "string",
    brightness: 1.0,
    decay: 0.55,
    duration: 2.6,
    damping: 0.9955,
    gain: 1.0,
    strumMs: 11,
  },
  acoustic: {
    // bronze: mais corpo, menos estalo, cauda longa
    kind: "string",
    brightness: 0.72,
    decay: 0.45,
    duration: 3.2,
    damping: 0.9972,
    gain: 1.05,
    strumMs: 14,
  },
  bass: {
    // corda grossa: bem abafado, cauda longa.
    // medi o brilho do buffer e 0.3 ainda saia mais claro que a guitarra
    // (a excitacao de ruido tem muito agudo quando o periodo e longo), por isso
    // 0.18 — o baixo tem de soar mais escuro que a guitarra, sempre.
    kind: "string",
    brightness: 0.18,
    decay: 0.35,
    duration: 3.0,
    damping: 0.998,
    gain: 1.15,
    strumMs: 18,
  },
  cavaco: {
    // aço, tenso e curto: ataque brilhante, morre rápido
    kind: "string",
    brightness: 1.25,
    decay: 0.88,
    duration: 1.3,
    damping: 0.986,
    gain: 0.85,
    strumMs: 7,
  },
  ukulele: {
    // nylon: macio, curto, pouco agudo
    kind: "string",
    brightness: 0.5,
    decay: 0.72,
    duration: 1.8,
    damping: 0.991,
    gain: 0.95,
    strumMs: 9,
  },
  piano: {
    // harmônicos + martelo; cordas "batem" juntas de um instrumento de tecla
    kind: "piano",
    brightness: 0.85,
    decay: 0.3,
    duration: 3.4,
    damping: 0.999,
    gain: 1.0,
    strumMs: 3,
  },
};

export function profileFor(instrument: InstrumentKey): ToneProfile {
  return TONE_PROFILES[instrument] || TONE_PROFILES.guitar;
}

// ---------------------------------------------------------------------------
// VOICING POR INSTRUMENTO
// ---------------------------------------------------------------------------

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function noteToPitchClass(name: string): number | null {
  const m = name.match(/^([A-G])([#b]?)/);
  if (!m) return null;
  let i = NOTE_NAMES.indexOf(m[1]);
  if (i < 0) return null;
  if (m[2] === "#") i = (i + 1) % 12;
  if (m[2] === "b") i = (i + 11) % 12;
  return i;
}

/**
 * Intervalos do acorde a partir do nome (tríade/7ª/sus...).
 * Mesma tabela do motor antigo, extraída aqui para poder escolher oitava por
 * instrumento.
 */
export function chordIntervals(name: string): number[] {
  const m = name.match(/^([A-G])([#b]?)/);
  const rest = m ? name.slice(m[0].length) : name;
  if (/^m(?!aj)/.test(rest) && !/^maj/.test(rest)) {
    if (/9/.test(rest)) return [0, 3, 7, 10, 14];
    return /7/.test(rest) ? [0, 3, 7, 10] : [0, 3, 7];
  }
  if (/^maj7|^M7/.test(rest)) return [0, 4, 7, 11];
  if (/^7/.test(rest)) return [0, 4, 7, 10];
  if (/^sus2/.test(rest)) return [0, 2, 7];
  if (/^sus4|^sus/.test(rest)) return [0, 5, 7];
  if (/^dim|^o/.test(rest)) return [0, 3, 6];
  if (/^aug|^\+/.test(rest)) return [0, 4, 8];
  if (/^6/.test(rest)) return [0, 4, 7, 9];
  if (/^add9/.test(rest)) return [0, 4, 7, 14];
  if (/^5/.test(rest)) return [0, 7];
  return [0, 4, 7];
}

/**
 * Notas MIDI de um acorde NO INSTRUMENTO ESCOLHIDO.
 *
 * Aqui está o que faz "C" soar como piano num piano e como baixo num baixo:
 *  - guitar  → região E3.. (a do violão)
 *  - acoustic→ idem guitarra (mesma afinação), timbre diferente
 *  - bass    → uma oitava abaixo, só fundamental + quinta (baixo não faz tríade)
 *  - cavaco  → região aguda (D3..E4), 4 cordas
 *  - ukulele → região muito aguda (G4..A4), 4 cordas
 *  - piano   → região central do teclado (C3..C4) com dobra de oitava
 */
export function voicingFor(chordName: string, instrument: InstrumentKey): number[] {
  const pc = noteToPitchClass(chordName);
  if (pc === null) return [];
  const intervals = chordIntervals(chordName);

  const build = (baseMidi: number, maxNotes: number, withOctave: boolean): number[] => {
    const basePc = baseMidi % 12;
    let root = baseMidi + ((pc - basePc + 12) % 12);
    const notes = intervals.map((i) => root + i);
    let all = notes;
    if (withOctave) {
      const copy = [...notes];
      let k = 0;
      while (all.length < maxNotes && k < copy.length) {
        all.push(copy[k] + 12);
        k++;
      }
    }
    return all.slice(0, maxNotes);
  };

  switch (instrument) {
    case "bass": {
      // baixo: fundamental + quinta, oitava abaixo do violão (E1 = 28)
      const root = 40 + ((pc - 4 + 12) % 12); // E2 = 40, desce uma oitava
      const out = [root - 12];
      if (intervals.includes(7)) out.push(root - 12 + 7);
      return out;
    }
    case "cavaco":
      return build(50, 4, false); // D3.., 4 cordas
    case "ukulele":
      return build(67, 4, false); // G4.., 4 cordas
    case "piano":
      return build(48, 5, true); // C3.., com dobra de oitava
    case "acoustic":
    case "guitar":
    default:
      return build(52, 6, true); // E3.., região do violão
  }
}

/**
 * Se o instrumento toca uma nota por vez (baixo) ou um acorde.
 * Usado pelo player para decidir entre arpejo/nota única e acorde.
 */
export function isMonophonic(instrument: InstrumentKey): boolean {
  return instrument === "bass";
}
