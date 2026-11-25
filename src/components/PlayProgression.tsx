"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, Music2 } from "lucide-react";
import {
  audioEngine,
  chordMidiFromName,
  chordMidiFromShape,
  bassMidiForChord,
} from "@/lib/audio";
import { CHORD_SHAPES } from "@/lib/chordData";
import { isChordToken, TAB_LINE_RE } from "@/lib/tabRenderer";

/**
 * PlayProgression — "Ouvir a progressão".
 *
 * Toca os acordes NA ORDEM EM QUE APARECEM na cifra, no andamento escolhido,
 * e destaca visualmente qual está soando (o destaque é o que liga o som ao
 * texto: a pessoa vê de onde vem).
 *
 * Decisões:
 *  - Teto de 16 acordes: uma cifra de 60 acordes tocada inteira é um álbum.
 *  - Usa o desenho real de violão quando existe (vozes de verdade); senão
 *    calcula por nome (tríade).
 *  - `unlock()` roda no clique — é o gesto que libera o áudio no navegador.
 */

const MAX_CHORDS = 16;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function PlayProgression({
  content,
  transpose = 0,
}: {
  content: string;
  transpose?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [bpm, setBpm] = useState(90);
  const [chordList, setChordList] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);

  /**
   * Extrai os acordes na MESMA REGRA do renderizador do site.
   *
   * A primeira versão só aceitava [Am] entre colchetes — e as cifras reais
   * usam linha de acorde solta ("Em    C    G    D"). Resultado: lista vazia
   * e o bloco "Hear the progression" nunca aparecia. Bug pego no Billie Jean,
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
        // aceita tanto [Am] quanto Am
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
    const step = (60000 / bpm) * 4; // 1 compasso por acorde

    chordList.forEach((name, i) => {
      timersRef.current.push(
        window.setTimeout(() => audioEngine.playChord(midisFor(name), name), i * step)
      );
      timersRef.current.push(
        window.setTimeout(() => setCurrentIdx(i), i * step)
      );
    });

    timersRef.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        setCurrentIdx(-1);
      }, chordList.length * step)
    );
  }, [playing, chordList, bpm, midisFor, stop]);

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
            max={160}
            step={5}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 accent-[var(--c-gold)]"
            aria-label="Tempo in BPM"
          />
          <span className="tabular-nums w-8">{bpm}</span>
        </label>
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

      <p className="text-[11px] text-[var(--c-text-tertiary)]">
        Tap any chord to hear it. Sound comes from your browser — nothing to download.
      </p>
    </div>
  );
}
