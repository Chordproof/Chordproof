/**
 * audio.ts — sintese de violao com Web Audio, sem arquivo de som.
 *
 * POR QUE SINTESE E NAO MP3/OGG
 *  - Zero download: 1.166 paginas x arquivo de acorde = peso de CDN e licenca
 *  - Qualquer acorde, de qualquer tom, inclusive transposto (+7, -3...)
 *  - Sem direito autoral: o som e gerado, nao e gravacao
 *
 * TECNICA: Karplus-Strong (1983), o metodo classico de corda dedilhada.
 * Um buffer curto de ruido realimentado por um filtro passa-baixa com atraso
 * de 1 periodo: o ruido vira "corda" e decai como corda de verdade.
 *
 * TIMBRE POR INSTRUMENTO (lib/instrumentTone.ts): este arquivo era uma voz só
 * — tudo soava como guitarra. Agora `renderChordForInstrument` escolhe o perfil
 * e o voicing do instrumento escolhido pelo usuário: piano usa síntese de
 * harmônicos + martelo, baixo desce uma oitava com fundamental+quinta, cavaco é
 * curto e metálico, ukulele é nylon macio, violão é bronze.
 *
 * CUSTO: ~2ms para gerar um acorde de 6 cordas.
 */

// MIDI das cordas soltas em afinacao padrao, da 6a (grave) a 1a (aguda):
// E2 A2 D3 G3 B3 E4 -> 40, 45, 50, 55, 59, 64
const OPEN_STRINGS_MIDI = [40, 45, 50, 55, 59, 64];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

import { profileFor, voicingFor, type ToneProfile } from "./instrumentTone";
import type { InstrumentKey } from "./instruments";

/**
 * Sintese de PIANO — nao e corda dedilhada.
 *
 * Um piano soa por soma de harmonicos com envelope proprio: ataque instantaneo,
 * decaimento exponencial, e os harmonicos AGUDOS morrem antes dos graves (e o
 * que da a sensacao de "nota que amolece"). Somei tambem um "thunk" curto de
 * martelo, que e o barulho mecanico da tecla — sem ele, o piano soa como orgao.
 */
function renderPianoNote(
  freq: number,
  sampleRate: number,
  duration: number,
  volume: number
): Float32Array {
  const total = Math.floor(sampleRate * duration);
  const buf = new Float32Array(total);
  const twoPi = Math.PI * 2;

  // soma de harmonicos (1..8) com decaimento progressivamente mais rapido
  for (let h = 1; h <= 8; h++) {
    const f = freq * h;
    if (f > sampleRate / 2) break;
    const amp = 1 / Math.pow(h, 1.35);
    // harmonicos agudos caem mais rapido -> som "amolecendo"
    const decayRate = 2.6 + h * 1.5;
    const phase = (h * 0.37) % twoPi;
    for (let i = 0; i < total; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-decayRate * t) * (1 - Math.exp(-260 * t));
      buf[i] += Math.sin(twoPi * f * t + phase) * amp * env;
    }
  }

  // "thunk" do martelo: ruido muito curto e grave
  const thunkLen = Math.min(total, Math.floor(sampleRate * 0.02));
  for (let i = 0; i < thunkLen; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-180 * t) * 0.18;
    buf[i] += (Math.random() * 2 - 1) * env;
  }

  const norm = volume * 0.5;
  for (let i = 0; i < total; i++) buf[i] *= norm;
  return buf;
}

/**
 * Corda com o timbre do instrumento.
 * Reaproveita pluckString (Karplus-Strong) mas filtra o brilho e aplica
 * decaimento extra conforme o perfil: e isso que separa o aco da guitarra do
 * nylon do ukulele e da corda grossa do baixo.
 */
function renderStringNote(
  freq: number,
  sampleRate: number,
  profile: ToneProfile,
  volume: number
): Float32Array {
  const base = pluckString(freq, sampleRate, profile.duration, profile.damping);
  const n = base.length;

  // Filtro passa-baixa de 1 polo: corta o brilho conforme o perfil.
  const a = Math.min(0.99, Math.max(0.06, 0.06 + profile.brightness * 0.72));
  if (a < 0.985) {
    let y = 0;
    for (let i = 0; i < n; i++) {
      y += a * (base[i] - y);
      base[i] = y;
    }
  }

  // decaimento extra para instrumentos de cauda curta (cavaco, ukulele)
  if (profile.decay > 0.5) {
    const k = 1 - (profile.decay - 0.5) * 1.6; // 0.88 -> ~0.39
    for (let i = 0; i < n; i++) base[i] *= Math.pow(k, (i / sampleRate) * 10);
  }

  const gain = volume * profile.gain * 0.55;
  for (let i = 0; i < n; i++) base[i] *= gain;
  return base;
}

/**
 * Buffer de um acorde PARA UM INSTRUMENTO.
 * Este e o caminho que faz o som acompanhar o seletor de instrumento.
 */
export function renderChordForInstrument(
  ctx: BaseAudioContext,
  chordName: string,
  instrument: InstrumentKey,
  opts: { volume?: number; direction?: "down" | "up" } = {}
): AudioBuffer {
  const profile = profileFor(instrument);
  const up = opts.direction === "up";
  const volume = (opts.volume ?? 0.55) * (up ? 0.62 : 1);
  const midis = voicingFor(chordName, instrument);
  const sr = ctx.sampleRate;
  const total = Math.floor(sr * profile.duration);
  const buffer = ctx.createBuffer(1, total, sr);
  const out = buffer.getChannelData(0);

  const order = up ? [...midis].reverse() : midis;
  const strumMs = up ? profile.strumMs * 0.8 : profile.strumMs;

  order.forEach((midi, i) => {
    const freq = midiToFreq(midi);
    if (freq < 25 || freq > 6000) return;
    const weight = 1 - i / (order.length + 3);
    const offset = Math.floor((sr * strumMs * i) / 1000);
    const s =
      profile.kind === "piano"
        ? renderPianoNote(freq, sr, profile.duration, 1)
        : renderStringNote(freq, sr, profile, 1);
    const g = volume * weight * 0.5;
    for (let j = 0; j < s.length && offset + j < total; j++) {
      out[offset + j] += s[j] * g;
    }
  });

  let peak = 0;
  for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.92) {
    const k = 0.92 / peak;
    for (let i = 0; i < total; i++) out[i] *= k;
  }
  return buffer;
}

/** MIDI -> frequencia em Hz (A4 = 440) */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * MIDI de um shape de acorde.
 * shape: [E, A, D, G, B, e] com -1 = corda abafada, n = casa.
 */
export function chordMidiFromShape(shape: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 6; i++) {
    const fret = shape[i];
    if (fret === undefined || fret < 0) continue;
    out.push(OPEN_STRINGS_MIDI[i] + fret);
  }
  return out;
}

/**
 * Nome de acorde -> MIDI, sem precisar de shape.
 * Basta a fundamental e a qualidade; o que o parser nao entender cai em
 * triade maior (e melhor soar do que nao soar).
 */
export function chordMidiFromName(name: string, bassMidi?: number): number[] {
  const clean = name.trim();

  const m = clean.match(/^([A-G])([#b]?)/);
  if (!m) return [];
  const letter = m[1];
  const acc = m[2] || "";
  let root = NOTE_NAMES.indexOf(letter);
  if (root < 0) return [];
  if (acc === "#") root = (root + 1) % 12;
  if (acc === "b") root = (root + 11) % 12;

  const rest = clean.slice(m[0].length);

  let intervals: number[];
  if (/^m(?!aj)/.test(rest) && !/^maj/.test(rest)) {
    intervals = /7/.test(rest) ? [0, 3, 7, 10] : [0, 3, 7];
    if (/9/.test(rest)) intervals = [0, 3, 7, 10, 14];
  } else if (/^maj7|^M7/.test(rest)) {
    intervals = [0, 4, 7, 11];
  } else if (/^7/.test(rest)) {
    intervals = [0, 4, 7, 10];
  } else if (/^sus2/.test(rest)) {
    intervals = [0, 2, 7];
  } else if (/^sus4|^sus/.test(rest)) {
    intervals = [0, 5, 7];
  } else if (/^dim|^o/.test(rest)) {
    intervals = [0, 3, 6];
  } else if (/^aug|^\+/.test(rest)) {
    intervals = [0, 4, 8];
  } else if (/^6/.test(rest)) {
    intervals = [0, 4, 7, 9];
  } else if (/^add9/.test(rest)) {
    intervals = [0, 4, 7, 14];
  } else if (/^5/.test(rest)) {
    intervals = [0, 7];
  } else {
    intervals = [0, 4, 7];
  }

  // regiao do violao: fundamental C3..B3, sem "guincho" nem "lama"
  let base = 48 + root;
  if (base < 45) base += 12;

  const notes = intervals.map((i) => base + i);

  let all = notes;
  if (typeof bassMidi === "number") {
    all = [bassMidi, ...notes];
  }

  // Completa para 5 cordas como um violao: cada nota UMA OITAVA ACIMA.
  // Repetir a mesma oitava gera nota dobrada — soa flauta, nao corda.
  const copy = [...all];
  let k = 0;
  while (all.length < 5 && k < copy.length) {
    all.push(copy[k] + 12);
    k++;
  }

  return all.slice(0, 6);
}

/** Karplus-Strong: amostra de uma corda dedilhada. */
function pluckString(
  freq: number,
  sampleRate: number,
  duration: number,
  damping = 0.996
): Float32Array {
  const N = Math.max(2, Math.floor(sampleRate / freq));
  const total = Math.floor(sampleRate * duration);
  const buf = new Float32Array(total);

  // excitacao: ruido curto (a palheta/dedo tocando a corda)
  const delay = new Float32Array(N);
  for (let i = 0; i < N; i++) delay[i] = Math.random() * 2 - 1;
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const cur = delay[i];
    delay[i] = (cur + prev) * 0.5;
    prev = cur;
  }

  let idx = 0;
  let last = 0;
  for (let i = 0; i < total; i++) {
    const cur = delay[idx];
    buf[i] = cur;
    // passa-baixa: harmonicos agudos morrem antes (corda de verdade)
    const filtered = (cur + last) * 0.5 * damping;
    last = cur;
    delay[idx] = filtered;
    idx = (idx + 1) % N;
  }
  return buf;
}

/**
 * Buffer de um acorde inteiro.
 * As cordas nao entram juntas: ~11ms entre elas e o que faz soar dedilhado
 * em vez de orgao eletronico.
 */
export function renderChordBuffer(
  ctx: BaseAudioContext,
  midis: number[],
  opts: {
    duration?: number;
    strumMs?: number;
    volume?: number;
    /**
     * Sentido da palhetada. Muda o som, e nao e cosmetico:
     *  - "down" (para baixo) pega da 6a para a 1a corda, grave -> agudo,
     *    e e a palhetada FORTE;
     *  - "up" (para cima) pega da 1a para a 6a, agudo -> grave, e e a FRACA.
     * Sem essa diferenca o padrao vira metronomo: "D-U-D-U" soa identico.
     */
    direction?: "down" | "up";
  } = {}
): AudioBuffer {
  const duration = opts.duration ?? 2.6;
  const strumMs = opts.strumMs ?? 11;
  const up = opts.direction === "up";
  const volume = (opts.volume ?? 0.55) * (up ? 0.62 : 1);
  const sr = ctx.sampleRate;
  const total = Math.floor(sr * duration);
  const buffer = ctx.createBuffer(1, total, sr);
  const out = buffer.getChannelData(0);

  // para cima, a palheta atravessa as cordas na ordem inversa
  const order = up ? [...midis].reverse() : midis;

  order.forEach((midi, i) => {
    const freq = midiToFreq(midi);
    if (freq < 40 || freq > 4000) return;

    const weight = 1 - i / (order.length + 2); // graves soam mais
    const offset = Math.floor((sr * strumMs * i) / 1000);
    const s = pluckString(freq, sr, duration, 0.9955 - i * 0.0004);
    const gain = volume * weight * 0.5;

    for (let j = 0; j < s.length && offset + j < total; j++) {
      out[offset + j] += s[j] * gain;
    }
  });

  let peak = 0;
  for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.92) {
    const k = 0.92 / peak;
    for (let i = 0; i < total; i++) out[i] *= k;
  }

  return buffer;
}

/**
 * AudioEngine — um AudioContext para o site inteiro.
 * O contexto nasce "suspended": so um gesto do usuario libera o audio.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private cache = new Map<string, AudioBuffer>();
  private enabled = true;
  private volume = 0.55;

  async unlock(): Promise<AudioContext | null> {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        /* segue sem som */
      }
    }
    return this.ctx;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    try {
      localStorage.setItem("chordproof-sound", v ? "1" : "0");
    } catch {}
  }

  isEnabled() {
    return this.enabled;
  }

  restorePreference() {
    try {
      this.enabled = localStorage.getItem("chordproof-sound") !== "0";
    } catch {}
    return this.enabled;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master) this.master.gain.value = this.volume;
  }

  playChord(
    midis: number[],
    key?: string,
    opts?: { direction?: "down" | "up"; volume?: number }
  ): boolean {
    if (!this.enabled || !this.ctx || !this.master || midis.length === 0) return false;

    const dir = opts?.direction ?? "down";
    // a direcao entra na chave: para cima e outro buffer, nao o mesmo
    const cacheKey = `${key || midis.join(",")}|${dir}`;
    let buf = this.cache.get(cacheKey);
    if (!buf) {
      buf = renderChordBuffer(this.ctx, midis, { direction: dir, volume: opts?.volume });
      if (this.cache.size > 160) {
        const first = this.cache.keys().next().value;
        if (first) this.cache.delete(first);
      }
      this.cache.set(cacheKey, buf);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.master);
    src.start();
    return true;
  }

  /**
   * Toca um ACORDE no TIMBRE do instrumento escolhido pelo usuário.
   * É este método que faz "mudar de guitar para piano" mudar o som.
   * O instrumento entra na chave do cache: guitarra e piano do mesmo acorde
   * são buffers diferentes.
   */
  playChordFor(
    chordName: string,
    instrument: InstrumentKey,
    opts?: { direction?: "down" | "up"; volume?: number }
  ): boolean {
    if (!this.enabled || !this.ctx || !this.master) return false;
    const dir = opts?.direction ?? "down";
    const key = `inst:${instrument}:${chordName}|${dir}`;
    let buf = this.cache.get(key);
    if (!buf) {
      buf = renderChordForInstrument(this.ctx, chordName, instrument, {
        direction: dir,
        volume: opts?.volume,
      });
      if (this.cache.size > 200) {
        const first = this.cache.keys().next().value;
        if (first) this.cache.delete(first);
      }
      this.cache.set(key, buf);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.master);
    src.start();
    return true;
  }

  /**
   * Toca UMA nota só — dedilhado.
   * Reaproveita playChord com lista de 1 nota em vez de duplicar o caminho do
   * buffer: um buffer de acorde gerado para 1 nota é exatamente pluckString.
   */
  playNote(midi: number, opts?: { volume?: number }): boolean {
    return this.playChord([midi], `note:${midi}`, { volume: opts?.volume, direction: "down" });
  }

  get context() {
    return this.ctx;
  }
}

export const audioEngine = new AudioEngine();

/** Baixo de um acorde invertido ("C/G" -> G em E2..D#3). */
export function bassMidiForChord(name: string): number | undefined {
  const m = name.match(/\/\s*([A-G])([#b]?)/);
  if (!m) return undefined;
  let root = NOTE_NAMES.indexOf(m[1]);
  if (root < 0) return undefined;
  if (m[2] === "#") root = (root + 1) % 12;
  if (m[2] === "b") root = (root + 11) % 12;
  return 40 + root;
}
