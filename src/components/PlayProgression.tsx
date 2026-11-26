"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, Music2, ChevronDown } from "lucide-react";
import {
  audioEngine,
  chordMidiFromName,
  chordMidiFromShape,
  bassMidiForChord,
} from "@/lib/audio";
import { CHORD_SHAPES } from "@/lib/chordData";
import { isChordToken, TAB_LINE_RE } from "@/lib/tabRenderer";
import {
  STRUM_PATTERNS,
  patternDisplay,
  strumPatternForGenre,
  type StrumPattern,
} from "@/lib/strumPatterns";

/**
 * PlayProgression — "Hear the progression", agora com BATIDA.
 *
 * Antes: uma palhetada por acorde, um acorde por compasso. Mostrava os acordes,
 * mas nao a musica — quem quer aprender precisa ouvir o ritmo da mao direita.
 *
 * Agora: um acorde por compasso, tocado com o PADRAO DE BATIDA do genero da
 * musica (lib/strumPatterns.ts), no BPM real da faixa (API do Deezer, com o BPM
 * de referencia do padrao como reserva).
 *
 * Decisoes:
 *  - Teto de 16 acordes: uma cifra de 60 acordes tocada inteira e um album.
 *  - Palhetada para baixo e para cima soam DIFERENTE (ordem das cordas e
 *    volume): sem isso "D-U-D-U" viraria metronomo.
 *  - Reflexo visual: o acorde aceso e o que esta soando, e a regua de 16 pontos
 *    mostra onde a mao esta dentro do compasso.
 *  - unlock() roda no clique — e o gesto que libera o audio no navegador.
 */

const MAX_CHORDS = 16;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function PlayProgression({
  content,
  transpose = 0,
  genre = null,
  artist = "",
  song = "",
}: {
  content: string;
  transpose?: number;
  genre?: string | null;
  artist?: string;
  song?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(90);
  const [bpmAuto, setBpmAuto] = useState(false);
  const [chordList, setChordList] = useState<string[]>([]);
  const [patternId, setPatternId] = useState<string>(() => strumPatternForGenre(genre).id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const timersRef = useRef<number[]>([]);

  const pattern: StrumPattern =
    STRUM_PATTERNS.find((p) => p.id === patternId) || STRUM_PATTERNS[0];

  /**
   * Extrai os acordes na MESMA REGRA do renderizador do site.
   *
   * A primeira versao so aceitava [Am] entre colchetes — e as cifras reais
   * usam linha de acorde solta ("Em    C    G    D"). Resultado: lista vazia e
   * o bloco "Hear the progression" nunca aparecia. Bug pego no Billie Jean,
   * que tem acordes na cifra e devolvia zero.
   */
  useEffect(() => {
    if (!content) {
      setChordList([]);
      return;
    }
    const found: string[] = [];
    for (const raw of content.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (TAB_LINE_RE.test(line)) continue;

      for (const token of line.split(/\s+/)) {
        const clean = token.replace(/^\[|\]$/g, "").replace(/[,;]$/, "");
        if (!clean) continue;
        if (isChordToken(clean) && found[found.length - 1] !== clean) {
          found.push(clean);
        }
      }
      if (found.length >= MAX_CHORDS) break;
    }
    setChordList(found);
  }, [content]);

  // padrao e BPM acompanham a musica
  useEffect(() => {
    const p = strumPatternForGenre(genre);
    setPatternId(p.id);
    setBpm(p.typicalBpm);
    setBpmAuto(false);
  }, [genre]);

  // BPM real da gravacao (mesma fonte que o Drum Machine usa)
  useEffect(() => {
    if (!artist || !song) return;
    let active = true;
    (async () => {
      try {
        const r = await fetch(
          `/api/bpm?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`
        );
        const d = await r.json();
        if (active && d?.bpm) {
          setBpm(d.bpm);
          setBpmAuto(true);
        }
      } catch {
        /* fica o BPM de referencia do padrao */
      }
    })();
    return () => {
      active = false;
    };
  }, [artist, song]);

  const transposeChord = useCallback(
    (name: string) => {
      if (!transpose) return name;
      const m = name.match(/^([A-G])([#b]?)(.*)$/);
      if (!m) return name;
      let idx = NOTE_NAMES.indexOf(m[1]);
      if (m[2] === "#") idx += 1;
      if (m[2] === "b") idx += 11;
      idx = ((idx % 12) + transpose + 12) % 12;
      return NOTE_NAMES[idx] + (m[3] || "");
    },
    [transpose]
  );

  const midisFor = useCallback(
    (name: string): number[] => {
      const t = transposeChord(name);
      const shape = CHORD_SHAPES[t] || CHORD_SHAPES[name];
      if (shape && shape.length === 6) {
        const midis = chordMidiFromShape(shape);
        if (midis.length >= 3) return midis;
      }
      return chordMidiFromName(t, bassMidiForChord(name));
    },
    [transposeChord]
  );

  const stop = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setPlaying(false);
    setCurrentIdx(-1);
    setCurrentStep(-1);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const play = useCallback(async () => {
    if (playing) {
      stop();
      return;
    }
    if (chordList.length === 0) return;

    const ctx = await audioEngine.unlock();
    if (!ctx) return;

    setPlaying(true);

    // 1 compasso = 4 tempos; 1 compasso por acorde
    const beatMs = 60000 / bpm;
    const barMs = beatMs * 4;
    const stepMs = barMs / 16; // 16 semicolcheias

    chordList.forEach((name, i) => {
      const midis = midisFor(name);
      const barStart = i * barMs;

      // agenda cada palhetada do padrao
      pattern.steps.forEach((s, step) => {
        if (!s) return;
        const at = barStart + step * stepMs;
        timersRef.current.push(
          window.setTimeout(() => {
            audioEngine.playChord(midis, name, { direction: s === "U" ? "up" : "down" });
          }, at)
        );
      });

      // o acorde acende no comeco do compasso; a regua anda com o passo
      timersRef.current.push(window.setTimeout(() => setCurrentIdx(i), barStart));
      for (let step = 0; step < 16; step++) {
        timersRef.current.push(
          window.setTimeout(() => setCurrentStep(step), barStart + step * stepMs)
        );
      }
    });

    timersRef.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        setCurrentIdx(-1);
        setCurrentStep(-1);
      }, chordList.length * barMs)
    );
  }, [playing, chordList, bpm, midisFor, pattern, stop]);

  if (chordList.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Music2 size={16} className="text-brand-gold" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--c-text-secondary)]">
          Hear the progression
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={play}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-[1.02]"
          style={{
            background: playing ? "var(--c-overlay)" : "var(--c-cta-bg)",
            color: playing ? "var(--c-text)" : "var(--c-cta-text)",
          }}
        >
          {playing ? <Square size={14} /> : <Play size={14} />}
          {playing ? "Stop" : "Play progression"}
        </button>

        <label className="flex items-center gap-1.5 text-xs text-[var(--c-text-tertiary)]">
          <span className="sr-only">Tempo</span>
          <input
            type="range"
            min={50}
            max={180}
            step={5}
            value={bpm}
            onChange={(e) => {
              setBpm(Number(e.target.value));
              setBpmAuto(false);
            }}
            className="w-16 accent-[var(--c-gold)]"
            aria-label="Tempo in BPM"
          />
          <span className="tabular-nums w-10" title={bpmAuto ? "Tempo read from the recording" : "Tempo estimated from the style"}>
            {bpm}
            {bpmAuto ? " ·" : ""}
          </span>
        </label>
      </div>

      {/* seletor de ritmo: mostra o padrao e deixa trocar */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs"
          style={{
            background: "var(--c-overlay-soft)",
            border: "1px solid var(--c-hairline)",
            color: "var(--c-text)",
          }}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <span
              className="font-bold uppercase tracking-wider text-[9px]"
              style={{ color: "var(--c-text-tertiary)" }}
            >
              Rhythm
            </span>
            <span className="font-bold truncate">{pattern.label}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="tabular-nums tracking-widest" style={{ color: "var(--c-gold)", fontSize: 11 }}>
              {patternDisplay(pattern)}
            </span>
            <ChevronDown size={12} style={{ opacity: 0.6 }} />
          </span>
        </button>

        {pickerOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 6,
              background: "var(--c-bg-elevated)",
              border: "1px solid var(--c-hairline)",
              borderRadius: 12,
              padding: 5,
              zIndex: 60,
              boxShadow: "var(--c-shadow)",
              maxHeight: "min(60vh, 300px)",
              overflowY: "auto",
            }}
          >
            {STRUM_PATTERNS.map((p) => {
              const active = p.id === patternId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPatternId(p.id);
                    setPickerOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left"
                  style={{
                    background: active ? "var(--c-gold-soft)" : "transparent",
                    color: active ? "var(--c-gold)" : "var(--c-text)",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  <span>{p.label}</span>
                  <span className="tabular-nums tracking-widest" style={{ fontSize: 10, opacity: 0.75 }}>
                    {patternDisplay(p)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chordList.map((c, i) => {
          const active = i === currentIdx;
          return (
            <button
              key={`${c}-${i}`}
              onClick={async () => {
                await audioEngine.unlock();
                audioEngine.playChord(midisFor(c), c);
              }}
              className="px-2 py-1 rounded text-xs font-bold transition-all"
              style={{
                background: active ? "var(--c-gold)" : "var(--c-overlay-soft)",
                color: active ? "#1d1d1f" : "var(--c-gold)",
                transform: active ? "scale(1.12)" : "scale(1)",
                boxShadow: active ? "0 0 14px var(--c-gold-soft)" : "none",
              }}
              title={`Play ${c}`}
            >
              {transposeChord(c)}
            </button>
          );
        })}
      </div>

      {/* regua do compasso: 16 pontos, os altos sao palhetada */}
      <div className="flex items-center gap-[3px]" aria-hidden>
        {Array.from({ length: 16 }).map((_, step) => {
          const isStroke = Boolean(pattern.steps[step]);
          const isNow = playing && step === currentStep;
          const done = playing && step < currentStep;
          return (
            <span
              key={step}
              style={{
                flex: 1,
                height: isStroke ? 6 : 3,
                borderRadius: 3,
                background: isNow
                  ? "var(--c-gold)"
                  : isStroke
                  ? done
                    ? "var(--c-gold-soft)"
                    : "var(--c-overlay)"
                  : "var(--c-hairline)",
                opacity: isNow ? 1 : isStroke ? 0.9 : 0.5,
                transition: "background 90ms linear",
              }}
            />
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--c-text-tertiary)]">
        One bar per chord, played with the {pattern.label.toLowerCase()} strumming
        pattern. Tap any chord to hear it. Sound comes from your browser — nothing to download.
      </p>
    </div>
  );
}
