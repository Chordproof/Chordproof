// drumGrooves.ts — Fase 4: grids de ritmo de bateria por gênero
// Um acorde não define um groove — o ritmo vem do GÊNERO da música. Esta
// biblioteca mapeia gênero → padrão de bateria de 1 compasso (16 semicolcheias),
// com kick/snare/hihat, tocado no BPM real da música (Deezer).

export type DrumVoice = "kick" | "snare" | "hihat" | "openhat" | "ride" | "clap";

export interface DrumGroove {
  id: string;
  label: string;
  /** 16 steps (semicolcheias) por voz. true = bate. */
  pattern: Record<DrumVoice, boolean[]>;
  /** Gêneros do banco que usam este groove (match case-insensitive). */
  genres: string[];
  /** BPM típico de referência (para fallback quando Deezer falha). */
  typicalBpm: number;
}

const empty = () => new Array(16).fill(false) as boolean[];

/** Helper: cria pattern a partir de listas de steps por voz. */
function makePattern(kick: number[], snare: number[], hihat: number[], openhat: number[] = [], ride: number[] = [], clap: number[] = []): Record<DrumVoice, boolean[]> {
  const p: Record<DrumVoice, boolean[]> = {
    kick: empty(), snare: empty(), hihat: empty(), openhat: empty(), ride: empty(), clap: empty(),
  };
  kick.forEach((i) => (p.kick[i] = true));
  snare.forEach((i) => (p.snare[i] = true));
  hihat.forEach((i) => (p.hihat[i] = true));
  openhat.forEach((i) => (p.openhat[i] = true));
  ride.forEach((i) => (p.ride[i] = true));
  clap.forEach((i) => (p.clap[i] = true));
  return p;
}

export const DRUM_GROOVES: DrumGroove[] = [
  {
    id: "rock",
    label: "Rock",
    // Kick 1 e 3(+), snare 2 e 4, hi-hat em colcheias
    pattern: makePattern([0, 7, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 14]),
    genres: ["rock", "indie", "alternative"],
    typicalBpm: 120,
  },
  {
    id: "pop",
    label: "Pop",
    // Kick 1, 2.5, 4(+); snare 2 e 4; hi-hat em semicolcheias
    pattern: makePattern([0, 6, 10], [4, 12], [0, 2, 4, 6, 8, 10, 12, 13, 14, 15]),
    genres: ["pop", "dance", "electronic"],
    typicalBpm: 110,
  },
  {
    id: "ballad",
    label: "Ballad",
    // Kick 1 e 3; snare no 3; hi-hat em colcheias suaves
    pattern: makePattern([0, 8], [8], [0, 2, 4, 6, 8, 10, 12, 14]),
    genres: ["ballad", "worship", "gospel", "soul"],
    typicalBpm: 72,
  },
  {
    id: "country",
    label: "Country",
    // Train beat: kick 1 e 3, snare 2 e 4, hihat quase contínuo
    pattern: makePattern([0, 8], [4, 12], [0, 2, 4, 5, 6, 8, 10, 12, 14]),
    genres: ["country", "folk", "americana", "bluegrass"],
    typicalBpm: 100,
  },
  {
    id: "funk",
    label: "Funk / R&B",
    // Kick sincopado; snare 2 e 4; hi-hat 16ths
    pattern: makePattern([0, 3, 10], [4, 12], Array.from({ length: 16 }, (_, i) => i)),
    genres: ["funk", "r&b", "rnb", "hip-hop", "hiphop", "rap"],
    typicalBpm: 98,
  },
  {
    id: "blues",
    label: "Blues shuffle",
    // Shuffle: kick 1 e 3, snare 2 e 4, ride em colcheias swing
    pattern: makePattern([0, 8], [4, 12], [], [], [0, 3, 4, 7, 8, 11, 12, 15]),
    genres: ["blues", "jazz"],
    typicalBpm: 88,
  },
  {
    id: "metal",
    label: "Metal",
    // Double-time: kick denso; snare 2 e 4; ride contínuo
    pattern: makePattern([0, 2, 5, 8, 10, 14], [4, 12], [], [], Array.from({ length: 16 }, (_, i) => i)),
    genres: ["metal", "hard rock", "punk"],
    typicalBpm: 140,
  },
  {
    id: "samba",
    label: "Samba / MPB",
    // Surdo 1 e 3(+); tamborim = hihat sincopado; palma no 2 e 4
    pattern: makePattern([0, 6, 8, 14], [4, 12], [0, 3, 6, 9, 12, 15], [], [], [4, 12]),
    genres: ["samba", "mpb", "bossa", "bossa nova", "brasileira", "sertanejo", "forró", "forro"],
    typicalBpm: 96,
  },
  {
    id: "reggae",
    label: "Reggae",
    // One drop: kick+snare juntos no tempo 3; hi-hat colcheias
    pattern: makePattern([8], [8], [0, 2, 4, 6, 8, 10, 12, 14]),
    genres: ["reggae", "ska", "dancehall"],
    typicalBpm: 78,
  },
];

/** Escolhe o groove pelo gênero da música (fallback: rock). */
export function grooveForGenre(genre: string | null | undefined): DrumGroove {
  if (!genre) return DRUM_GROOVES[0];
  const g = genre.toLowerCase().trim();
  const found = DRUM_GROOVES.find((gr) => gr.genres.some((x) => g.includes(x) || x.includes(g)));
  return found ?? DRUM_GROOVES[0];
}

export const DRUM_VOICES: DrumVoice[] = ["kick", "snare", "hihat", "openhat", "ride", "clap"];

export const VOICE_LABELS: Record<DrumVoice, string> = {
  kick: "Kick",
  snare: "Snare",
  hihat: "Hi-hat",
  openhat: "Open hat",
  ride: "Ride",
  clap: "Clap",
};

/** Sintetiza um golpe de bateria via Web Audio (sem samples externos). */
export function playDrumVoice(ctx: AudioContext, voice: DrumVoice, when: number, gain = 0.5): void {
  switch (voice) {
    case "kick": {
      // Kick: queda de frequência 150→50Hz
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(50, when + 0.1);
      g.gain.setValueAtTime(gain * 1.2, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(when); osc.stop(when + 0.3);
      break;
    }
    case "snare":
    case "clap": {
      // Snare/clap: ruído filtrado
      const bufferSize = Math.floor(ctx.sampleRate * 0.2);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = voice === "clap" ? 1200 : 800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain * 0.8, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + (voice === "clap" ? 0.12 : 0.18));
      noise.connect(filter); filter.connect(g); g.connect(ctx.destination);
      noise.start(when); noise.stop(when + 0.2);
      break;
    }
    case "hihat":
    case "openhat":
    case "ride": {
      // Hi-hat/ride: ruído metálico curto (highpass alto)
      const dur = voice === "openhat" ? 0.3 : voice === "ride" ? 0.25 : 0.06;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = voice === "ride" ? 5000 : 8000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain * (voice === "hihat" ? 0.35 : 0.5), when);
      g.gain.exponentialRampToValueAtTime(0.001, when + dur);
      noise.connect(filter); filter.connect(g); g.connect(ctx.destination);
      noise.start(when); noise.stop(when + dur);
      break;
    }
  }
}
