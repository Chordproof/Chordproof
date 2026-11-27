"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square, Music2, ChevronDown, Info } from "lucide-react";
import {
  audioEngine,
  chordMidiFromName,
  chordMidiFromShape,
  bassMidiForChord,
} from "@/lib/audio";
import { CHORD_SHAPES } from "@/lib/chordData";
import { isChordToken, TAB_LINE_RE } from "@/lib/tabRenderer";
import { patternDisplay, type StrumPattern } from "@/lib/strumPatterns";
import { allPatterns, arpeggioSteps, resolveRhythm, type RhythmMode } from "@/lib/rhythmFromTab";
import { isMonophonic } from "@/lib/instrumentTone";
import type { InstrumentKey } from "@/lib/instruments";

/**
 * PlayProgression — "Hear the progression".
 *
 * A BATIDA VEM DA MÚSICA. Ordem de prioridade (lib/rhythmFromTab.ts):
 *   1. CURADORIA (lib/rhythmCuration.ts) — o padrão da gravação, escrito à mão
 *   2. instrução escrita na cifra
 *   3. gênero — reserva genérica
 * O selo ao lado do ritmo diz de onde veio: "this song", "this tab" ou
 * "genre". Nada de vender chute como certeza.
 *
 * O SOM SEGUE O INSTRUMENTO: `playChordFor` sintetiza no timbre escolhido na
 * barra (piano com martelo, baixo uma oitava abaixo, ukulele de nylon, cavaco
 * curto e metálico). Ver lib/instrumentTone.ts.
 *
 * DEDILHADO: quando a música é dedilhada, toca arpejo — uma corda por vez.
 */

const MAX_CHORDS = 16;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function PlayProgression({
  content,
  transpose = 0,
  genre = null,
  artist = "",
  song = "",
  instrument = "guitar",
  artistSlug = "",
  songSlug = "",
}: {
  content: string;
  transpose?: number;
  genre?: string | null;
  artist?: string;
  song?: string;
  /** o instrumento do seletor da barra: define o TIMBRE e o voicing do som */
  instrument?: InstrumentKey;
  /** slugs para achar a curadoria da batida (lib/rhythmCuration.ts) */
  artistSlug?: string;
  songSlug?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(90);
  const [bpmAuto, setBpmAuto] = useState(false);
  const [chordList, setChordList] = useState<string[]>([]);
  const [patternId, setPatternId] = useState<string>("standard");
  const [mode, setMode] = useState<RhythmMode>("strum");
  const [source, setSource] = useState<"curated" | "tab" | "genre">("genre");
  const [evidence, setEvidence] = useState<string | undefined>(undefined);
  const [showWhy, setShowWhy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const timersRef = useRef<number[]>([]);

  const patterns = allPatterns();
  const pattern: StrumPattern = patterns.find((p) => p.id === patternId) || patterns[0];

  /** Extrai os acordes na MESMA REGRA do renderizador do site. */
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
        if (isChordToken(clean) && found[found.length - 1] !== clean) found.push(clean);
      }
      if (found.length >= MAX_CHORDS) break;
    }
    setChordList(found);
  }, [content]);

  /**
   * Decide o ritmo: curadoria, depois cifra, depois gênero.
   * Depende de content/genre/slugs — não roda a cada render, senão a escolha
   * do usuário seria sobrescrita.
   */
  useEffect(() => {
    const r = resolveRhythm(content, genre, { artist: artistSlug, song: songSlug });
    setPatternId(r.pattern.id);
    setMode(r.mode);
    setSource(r.source);
    setEvidence(r.evidence);
    setBpm(r.pattern.typicalBpm);
    setBpmAuto(false);
  }, [content, genre, artistSlug, songSlug]);

  // BPM real da gravação
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
        /* fica o BPM de referência */
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
    const barMs = (60000 / bpm) * 4; // 1 compasso por acorde
    const stepMs = barMs / 16;
    const arpSteps = arpeggioSteps(6);

    chordList.forEach((name, i) => {
      const midis = midisFor(name);
      const barStart = i * barMs;

      // O SOM SEGUE O INSTRUMENTO: playChordFor sintetiza no timbre escolhido
      const mono = isMonophonic(instrument);
      if ((mode === "arpeggio" || mono) && midis.length) {
        // dedilhado (ou baixo, que é monofônico): uma corda por colcheia
        arpSteps.forEach((stringIdx, k) => {
          const midi = midis[Math.min(stringIdx, midis.length - 1)];
          const at = barStart + k * stepMs * 2;
          timersRef.current.push(
            window.setTimeout(
              () => audioEngine.playChord([midi], `${instrument}:n${midi}`, { volume: 0.42 }),
              at
            )
          );
        });
      } else {
        // batida: cada palhetada do padrão, no timbre do instrumento
        pattern.steps.forEach((st, step) => {
          if (!st) return;
          const at = barStart + step * stepMs;
          timersRef.current.push(
            window.setTimeout(
              () =>
                audioEngine.playChordFor(name, instrument, {
                  direction: st === "U" ? "up" : "down",
                }),
              at
            )
          );
        });
      }

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
  }, [playing, chordList, bpm, midisFor, pattern, mode, stop, instrument]);

  if (chordList.length === 0) return null;

  const visualSteps: string[] =
    mode === "arpeggio"
      ? Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? "D" : ""))
      : pattern.steps;

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
          <span
            className="tabular-nums w-10"
            title={bpmAuto ? "Tempo read from the recording" : "Tempo from the style"}
          >
            {bpm}
            {bpmAuto ? " ·" : ""}
          </span>
        </label>
      </div>

      {/* ritmo: curadoria, cifra ou gênero — com o selo dizendo qual */}
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
              {mode === "arpeggio" ? "Pattern" : "Rhythm"}
            </span>
            <span className="font-bold truncate">
              {mode === "arpeggio" ? "Fingerpicked" : pattern.label}
            </span>
            <span
              className="text-[8px] font-bold uppercase px-1 rounded"
              style={{
                background: source !== "genre" ? "var(--c-gold-soft)" : "var(--c-overlay)",
                color: source !== "genre" ? "var(--c-gold)" : "var(--c-text-tertiary)",
              }}
              title={
                source === "curated"
                  ? "Pattern of the actual recording"
                  : source === "tab"
                  ? "Comes from this tab's own performance notes"
                  : "No note on this tab — this is the genre default"
              }
            >
              {source === "curated" ? "this song" : source === "tab" ? "this tab" : "genre"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {mode !== "arpeggio" && (
              <span className="tabular-nums tracking-widest" style={{ color: "var(--c-gold)", fontSize: 11 }}>
                {patternDisplay(pattern)}
              </span>
            )}
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
              maxHeight: "min(60vh, 320px)",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => {
                setMode("arpeggio");
                setPickerOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left"
              style={{
                background: mode === "arpeggio" ? "var(--c-gold-soft)" : "transparent",
                color: mode === "arpeggio" ? "var(--c-gold)" : "var(--c-text)",
                fontSize: 12,
                fontWeight: mode === "arpeggio" ? 700 : 500,
                border: 0,
                cursor: "pointer",
              }}
            >
              <span>Fingerpicked</span>
              <span style={{ fontSize: 10, opacity: 0.75 }}>one string at a time</span>
            </button>
            <div style={{ height: 1, background: "var(--c-hairline)", margin: "4px 6px" }} />
            {patterns.map((p) => {
              const active = p.id === patternId && mode === "strum";
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPatternId(p.id);
                    setMode("strum");
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

      {/* por que esse ritmo: mostra o excerto/nota que decidiu */}
      {evidence && evidence.trim().length > 0 && (
        <div>
          <button
            onClick={() => setShowWhy((v) => !v)}
            className="inline-flex items-center gap-1 text-[10px]"
            style={{
              color: "var(--c-text-tertiary)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Info size={10} />
            {showWhy ? "hide" : "why this rhythm?"}
          </button>
          {showWhy && (
            <p
              className="mt-1 text-[10px] italic"
              style={{
                color: "var(--c-text-tertiary)",
                borderLeft: "2px solid var(--c-gold-soft)",
                paddingLeft: 8,
                lineHeight: 1.45,
              }}
            >
              “{evidence}”
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {chordList.map((c, i) => {
          const active = i === currentIdx;
          return (
            <button
              key={`${c}-${i}`}
              onClick={async () => {
                await audioEngine.unlock();
                audioEngine.playChordFor(c, instrument);
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

      {/* régua do compasso */}
      <div className="flex items-center gap-[3px]" aria-hidden>
        {Array.from({ length: 16 }).map((_, step) => {
          const isStroke = Boolean(visualSteps[step]);
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
        {mode === "arpeggio"
          ? "One bar per chord, fingerpicked one string at a time."
          : `One bar per chord, played with the ${pattern.label.toLowerCase()} strumming pattern.`}{" "}
        Tap any chord to hear it. Sound comes from your browser — nothing to download.
      </p>
    </div>
  );
}
