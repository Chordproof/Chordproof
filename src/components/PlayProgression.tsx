"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, Music2, ChevronDown, Info, Crosshair } from "lucide-react";
import {
  audioEngine,
  chordMidiFromName,
  chordMidiFromShape,
  bassMidiForChord,
} from "@/lib/audio";
import { CHORD_SHAPES } from "@/lib/chordData";
import { patternDisplay, type StrumPattern } from "@/lib/strumPatterns";
import { allPatterns, arpeggioSteps, resolveRhythm, type RhythmMode } from "@/lib/rhythmFromTab";
import { isMonophonic } from "@/lib/instrumentTone";
import type { InstrumentKey } from "@/lib/instruments";
import { bpmForSong } from "@/lib/songBpm";
import {
  applySectionRepeats,
  buildPlaybackSequence,
  expandByRecordMap,
  uniqueChords,
  type ChordEvent,
} from "@/lib/playbackSequence";

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
 * TOCA A CIFRA INTEIRA (26/11): antes eram 16 acordes e parava. A mediana das
 * 50 mais visitadas tem 80 acordes e 4min24, então o botão entregava 15% da
 * música. A sequência sai de lib/playbackSequence.ts.
 *
 * A CIFRA ACOMPANHA: cada acorde tocado avisa a página (onActiveLine) qual
 * LINHA deve ser destacada e rolada. Quem toca tem as duas mãos ocupadas e não
 * pode rolar a tela — é esse o motivo de existir o "Follow".
 */

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
  onActiveLine,
  follow: followProp,
  onFollowChange,
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
  /** avisa a página qual LINHA da cifra está tocando (para destacar/rolar) */
  onActiveLine?: (line: number | null) => void;
  /** controle do "Follow the tab" — mora na página, que é quem rola */
  follow?: boolean;
  onFollowChange?: (v: boolean) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(90);
  const [bpmAuto, setBpmAuto] = useState(false);
  const [patternId, setPatternId] = useState<string>("standard");
  const [mode, setMode] = useState<RhythmMode>("strum");
  const [source, setSource] = useState<"curated" | "tab" | "genre">("genre");
  const [evidence, setEvidence] = useState<string | undefined>(undefined);
  const [showWhy, setShowWhy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [followLocal, setFollowLocal] = useState(true);
  const follow = followProp ?? followLocal;
  const setFollow = (v: boolean) => { setFollowLocal(v); onFollowChange?.(v); };
  const timersRef = useRef<number[]>([]);

  const patterns = allPatterns();
  const pattern: StrumPattern = patterns.find((p) => p.id === patternId) || patterns[0];

  /**
   * Sequência de acordes, em ordem. Três fontes, da mais fiel à mais genérica:
   *   1. record map declarado na cifra
   *   2. repetição por rótulo de seção ([Verse 2] repete [Verse 1])
   *   3. sequência linear
   */
  const sequence: ChordEvent[] = useMemo(() => {
    const linear = buildPlaybackSequence(content);
    const mapped = expandByRecordMap(content);
    if (mapped && mapped.length > linear.length) return mapped;
    return applySectionRepeats(linear, content || "");
  }, [content]);

  const chordButtons = useMemo(() => uniqueChords(sequence, 12), [sequence]);

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
    // BPM: gravação (tabela) > referência do padrão. O da API chega depois.
    const fixed = bpmForSong(artistSlug, songSlug);
    setBpm(fixed ?? r.pattern.typicalBpm);
    setBpmAuto(Boolean(fixed));
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
        // a tabela da gravação vence: /api/bpm devolve null em quase tudo
        if (active && d?.bpm && !bpmForSong(artistSlug, songSlug)) {
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
  }, [artist, song, artistSlug, songSlug]);

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
    onActiveLine?.(null);
  }, [onActiveLine]);

  useEffect(() => () => stop(), [stop]);

  const play = useCallback(async () => {
    if (playing) {
      stop();
      return;
    }
    if (sequence.length === 0) return;
    const ctx = await audioEngine.unlock();
    if (!ctx) return;

    setPlaying(true);
    const barMs = (60000 / bpm) * 4; // 1 compasso por acorde
    const stepMs = barMs / 16;
    const arpSteps = arpeggioSteps(6);
    const mono = isMonophonic(instrument);

    sequence.forEach((ev, i) => {
      const name = ev.chord;
      const midis = midisFor(name);
      const barStart = i * barMs;

      if ((mode === "arpeggio" || mono) && midis.length) {
        // dedilhado (ou baixo, que é monofônico): uma corda por colcheia
        arpSteps.forEach((stringIdx, k) => {
          const midi = midis[Math.min(stringIdx, midis.length - 1)];
          timersRef.current.push(
            window.setTimeout(
              () => audioEngine.playChord([midi], `${instrument}:n${midi}`, { volume: 0.42 }),
              barStart + k * stepMs * 2
            )
          );
        });
      } else {
        pattern.steps.forEach((st, step) => {
          if (!st) return;
          timersRef.current.push(
            window.setTimeout(
              () =>
                audioEngine.playChordFor(name, instrument, {
                  direction: st === "U" ? "up" : "down",
                }),
              barStart + step * stepMs
            )
          );
        });
      }

      // acende o acorde e AVISA A PÁGINA qual linha destacar
      timersRef.current.push(
        window.setTimeout(() => {
          setCurrentIdx(i);
          onActiveLine?.(ev.line);
        }, barStart)
      );
    });

    // régua anda só no primeiro compasso (barato) e o passo é global
    const total = sequence.length * barMs;
    const steps = Math.min(16, Math.max(1, Math.round(barMs / stepMs)));
    for (let s = 0; s < steps; s++) {
      timersRef.current.push(
        window.setTimeout(() => setCurrentStep(s), s * stepMs)
      );
    }

    timersRef.current.push(
      window.setTimeout(() => {
        setPlaying(false);
        setCurrentIdx(-1);
        setCurrentStep(-1);
        onActiveLine?.(null);
      }, total)
    );
  }, [
    playing,
    sequence,
    bpm,
    midisFor,
    pattern,
    mode,
    stop,
    instrument,
    onActiveLine,
  ]);

  if (sequence.length === 0) return null;

  const visualSteps: string[] =
    mode === "arpeggio"
      ? Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? "D" : ""))
      : pattern.steps;

  const totalSec = Math.round((sequence.length * (60000 / bpm) * 4) / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = String(totalSec % 60).padStart(2, "0");

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
          {playing ? "Stop" : "Play the whole tab"}
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

      {/* seguir a cifra: rola e destaca a linha que está tocando */}
      <button
        onClick={() => setFollow(!follow)}
        aria-pressed={follow}
        className="w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-[11px]"
        style={{
          background: follow ? "var(--c-gold-soft)" : "var(--c-overlay-soft)",
          border: "1px solid var(--c-hairline)",
          color: follow ? "var(--c-gold)" : "var(--c-text-tertiary)",
          fontWeight: 700,
        }}
        title="Keep the tab scrolling with the music"
      >
        <span className="inline-flex items-center gap-1.5">
          <Crosshair size={11} /> Follow the tab
        </span>
        <span>{follow ? "on" : "off"}</span>
      </button>

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
        {chordButtons.map((c) => (
          <button
            key={c}
            onClick={async () => {
              await audioEngine.unlock();
              audioEngine.playChordFor(c, instrument);
            }}
            className="px-2 py-1 rounded text-xs font-bold transition-all"
            style={{
              background: "var(--c-overlay-soft)",
              color: "var(--c-gold)",
            }}
            title={`Play ${c}`}
          >
            {transposeChord(c)}
          </button>
        ))}
      </div>

      {/* régua do compasso (do primeiro acorde) */}
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
        {sequence.length} chords · about {mm}:{ss} ·{" "}
        {mode === "arpeggio"
          ? "fingerpicked one string at a time"
          : `played with the ${pattern.label.toLowerCase()} strumming pattern`}
        .{" "}
        {follow ? "The tab scrolls with the music." : "The tab stays put."}
      </p>
    </div>
  );
}
