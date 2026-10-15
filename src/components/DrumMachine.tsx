"use client";
import { useEffect, useRef, useState } from "react";
import { DRUM_GROOVES, DRUM_VOICES, VOICE_LABELS, grooveForGenre, playDrumVoice, type DrumGroove, type DrumVoice } from "@/lib/drumGrooves";

/**
 * DrumMachine — Fase 4: grid de ritmo por gênero, tocado no BPM da música.
 * 16 semicolcheias por compasso; vozes kick/snare/hi-hat/etc sintetizadas via
 * Web Audio (zero samples externos). Groove auto-escolhido pelo gênero da cifra.
 */
export default function DrumMachine({
  genre,
  artist,
  song,
  onClose,
  accentColor = "#f0b429",
}: {
  genre: string | null;
  artist: string;
  song: string;
  onClose: () => void;
  accentColor?: string;
}) {
  const [groove, setGroove] = useState<DrumGroove>(() => grooveForGenre(genre));
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(grooveForGenre(genre).typicalBpm);
  const [bpmAuto, setBpmAuto] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStep, setCurrentStep] = useState(-1);

  // BPM real da música via Deezer (mesma API do Stage Mode); fallback = typicalBpm do groove
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/bpm?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`);
        const d = await r.json();
        if (active && d?.bpm) { setTempo(d.bpm); setBpmAuto(true); }
      } catch {}
    })();
    return () => { active = false; };
  }, [artist, song]);

  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const playingRef = useRef(false);
  const grooveRef = useRef(groove);
  const tempoRef = useRef(tempo);
  const volRef = useRef(volume);

  useEffect(() => { grooveRef.current = groove; }, [groove]);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { volRef.current = volume; }, [volume]);

  // Para o loop ao desmontar
  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    ctxRef.current?.close().catch(() => {});
  }, []);

  function start() {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    ctxRef.current.resume().catch(() => {});
    playingRef.current = true;
    setPlaying(true);
    stepRef.current = 0;

    let nextTime = ctxRef.current!.currentTime + 0.05;

    const tick = () => {
      if (!playingRef.current || !ctxRef.current) return;
      // Agenda todos os steps dentro da janela de lookahead
      while (nextTime < ctxRef.current.currentTime + 0.12) {
        const step = stepRef.current % 16;
        const g = grooveRef.current;
        for (const v of DRUM_VOICES) {
          if (g.pattern[v][step]) {
            playDrumVoice(ctxRef.current, v, nextTime, volRef.current);
          }
        }
        // Visual: agenda o highlight do step
        const stepAt = nextTime - ctxRef.current.currentTime;
        window.setTimeout(() => setCurrentStep(step), Math.max(0, stepAt * 1000));
        nextTime += 60 / tempoRef.current / 4;
        stepRef.current++;
      }
    };
    timerRef.current = window.setInterval(tick, 30);
    tick();
  }

  function stop() {
    playingRef.current = false;
    setPlaying(false);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setCurrentStep(-1);
  }

  function toggleStep(voice: DrumVoice, step: number) {
    const g = { ...groove, pattern: { ...groove.pattern, [voice]: [...groove.pattern[voice]] } };
    g.pattern[voice][step] = !g.pattern[voice][step];
    setGroove(g);
  }

  const isDownbeat = (s: number) => s % 4 === 0;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseLeave={onClose}
        style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "16px", padding: "20px", boxShadow: "0 12px 40px rgba(0,0,0,0.7)", minWidth: "380px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "18px", fontWeight: 700, color: accentColor }}>🥁 Drum Machine</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "16px" }}>✕</button>
        </div>

        {/* Seletor de groove */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
          {DRUM_GROOVES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroove(g)}
              style={{
                padding: "5px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
                background: g.id === groove.id ? accentColor : "rgba(255,255,255,0.08)",
                color: g.id === groove.id ? "#000" : "#aaa",
                border: "none",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Grid 6 vozes × 16 steps */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(16, 1fr)", gap: "3px", marginBottom: "12px" }}>
          <div />
          {Array.from({ length: 16 }, (_, s) => (
            <div key={"h" + s} style={{ fontSize: "9px", color: isDownbeat(s) ? "#fff" : "#555", textAlign: "center", fontWeight: isDownbeat(s) ? 700 : 400 }}>
              {isDownbeat(s) ? s / 4 + 1 : "·"}
            </div>
          ))}
          {DRUM_VOICES.map((v) => (
            <div key={v} style={{ display: "contents" }}>
              <div style={{ fontSize: "10px", color: "#888", display: "flex", alignItems: "center" }}>{VOICE_LABELS[v]}</div>
              {Array.from({ length: 16 }, (_, s) => (
                <div
                  key={v + s}
                  onClick={() => toggleStep(v, s)}
                  style={{
                    height: "18px", borderRadius: "3px", cursor: "pointer",
                    background: groove.pattern[v][s] ? accentColor : isDownbeat(s) ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                    outline: currentStep === s ? "2px solid #fff" : "none",
                    transition: "background 0.1s",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Controles: play, BPM, volume */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => (playing ? stop() : start())}
            style={{
              width: "44px", height: "44px", borderRadius: "50%", border: "none", cursor: "pointer",
              background: playing ? "#e74c3c" : accentColor, color: "#000", fontSize: "16px", fontWeight: 700,
            }}
          >
            {playing ? "■" : "▶"}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>BPM: {tempo}{bpmAuto ? " · auto" : ""}</div>
            <input type="range" min={40} max={220} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>Volume</div>
            <input type="range" min={0} max={100} value={volume * 100} onChange={(e) => setVolume(Number(e.target.value) / 100)} style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "#666", textAlign: "center", marginTop: "10px" }}>
          {genre ? `Genre: ${genre}` : "No genre — using Rock"} · Click cells to edit
        </div>
      </div>
    </div>
  );
}
