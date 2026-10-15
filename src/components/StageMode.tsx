"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sun, Minus, Plus, X, Play, Pause, Music, Repeat, Timer, Flag } from "lucide-react";

// Modo Palco: cifra em fullscreen com fundo preto puro, fonte gigante e controle de tamanho.
// Autoscroll no ritmo da música: velocidade derivada do BPM (px por batida) com ajuste fino.
// Loop de seção: marca início/fim do trecho e repete enquanto pratica.
// Metrônomo: clicks audíveis no BPM com accent no primeiro tempo do compasso.
// Feito para leitura em cima do palco — recurso ChordProof+.

const MIN_BPM = 40;
const MAX_BPM = 220;
const DEFAULT_BPM = 90;

// Pixels por batida: quantos px a página avança a cada batida do BPM.
const MIN_PX_PER_BEAT = 0.5;
const MAX_PX_PER_BEAT = 12;
const DEFAULT_PX_PER_BEAT = 2.5;

export default function StageMode({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(2);
  const [mounted, setMounted] = useState(false);

  // Autoscroll rítmico
  const [autoScroll, setAutoScroll] = useState(false);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [bpmLoading, setBpmLoading] = useState(false);
  const [bpmFound, setBpmFound] = useState<number | null>(null);
  const [pxPerBeat, setPxPerBeat] = useState(DEFAULT_PX_PER_BEAT);
  const [showPanel, setShowPanel] = useState(false);

  // Loop de seção
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [loopOn, setLoopOn] = useState(false);

  // Metrônomo
  const [metroOn, setMetroOn] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const bpmRef = useRef(bpm);
  const pxRef = useRef(pxPerBeat);
  const accumulatorRef = useRef(0);
  const beatAccumRef = useRef(0);
  const [beatPulse, setBeatPulse] = useState(false);

  // Refs do loop (acessíveis dentro do tick de animação)
  const loopOnRef = useRef(loopOn);
  const loopStartRef = useRef(loopStart);
  const loopEndRef = useRef(loopEnd);
  useEffect(() => { loopOnRef.current = loopOn; }, [loopOn]);
  useEffect(() => { loopStartRef.current = loopStart; }, [loopStart]);
  useEffect(() => { loopEndRef.current = loopEnd; }, [loopEnd]);

  // Metrônomo
  const metroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatCountRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { pxRef.current = pxPerBeat; }, [pxPerBeat]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const saved = Number(localStorage.getItem("chordproof-stage-scale") || 2);
    if (saved >= 1 && saved <= 4) setFontScale(saved);
    const savedBpm = Number(localStorage.getItem("chordproof-stage-bpm") || 0);
    if (savedBpm >= MIN_BPM && savedBpm <= MAX_BPM) setBpm(savedBpm);
    const savedPx = Number(localStorage.getItem("chordproof-stage-pxbeat") || 0);
    if (savedPx >= MIN_PX_PER_BEAT && savedPx <= MAX_PX_PER_BEAT) setPxPerBeat(savedPx);
  }, []);

  // Buscar BPM da música quando o Stage Mode abre
  useEffect(() => {
    if (!open) return;
    const info = (window as any).__stageTrackInfo;
    if (!info?.artist || !info?.song) return;
    let active = true;
    (async () => {
      setBpmLoading(true);
      try {
        const r = await fetch(`/api/bpm?artist=${encodeURIComponent(info.artist)}&song=${encodeURIComponent(info.song)}`);
        const d = await r.json();
        if (active && d?.bpm) {
          setBpmFound(d.bpm);
          setBpm(d.bpm);
          localStorage.setItem("chordproof-stage-bpm", String(d.bpm));
        }
      } catch {}
      if (active) setBpmLoading(false);
    })();
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function changeScale(delta: number) {
    setFontScale((s) => {
      const next = Math.min(4, Math.max(1, s + delta));
      localStorage.setItem("chordproof-stage-scale", String(next));
      return next;
    });
  }

  function changeBpm(delta: number) {
    setBpm((b) => {
      const next = Math.min(MAX_BPM, Math.max(MIN_BPM, b + delta));
      localStorage.setItem("chordproof-stage-bpm", String(next));
      return next;
    });
    setBpmFound(null);
  }

  function changePxPerBeat(delta: number) {
    setPxPerBeat((p) => {
      const next = Math.min(MAX_PX_PER_BEAT, Math.max(MIN_PX_PER_BEAT, Math.round((p + delta) * 10) / 10));
      localStorage.setItem("chordproof-stage-pxbeat", String(next));
      return next;
    });
  }

  // ===== Loop de seção =====
  function markStart() {
    if (!scrollRef.current) return;
    const pos = Math.round(scrollRef.current.scrollTop);
    setLoopStart(pos);
    setLoopOn(false); // re-marcar desliga até reativar
  }
  function markEnd() {
    if (!scrollRef.current) return;
    const pos = Math.round(scrollRef.current.scrollTop);
    setLoopEnd(pos);
    setLoopOn(false);
  }
  function toggleLoop() {
    if (loopStart === null || loopEnd === null || loopEnd <= loopStart) return;
    setLoopOn((v) => !v);
  }
  function clearLoop() {
    setLoopStart(null);
    setLoopEnd(null);
    setLoopOn(false);
  }

  // ===== Metrônomo =====
  const metroClick = useCallback((accent: boolean) => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = accent ? 1400 : 900;
      osc.type = "square";
      gain.gain.setValueAtTime(accent ? 0.2 : 0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }, []);

  const stopMetro = useCallback(() => {
    if (metroTimerRef.current) {
      clearInterval(metroTimerRef.current);
      metroTimerRef.current = null;
    }
  }, []);

  const startMetro = useCallback(() => {
    stopMetro();
    beatCountRef.current = 0;
    metroClick(true); // primeiro tempo com accent
    metroTimerRef.current = setInterval(() => {
      beatCountRef.current = (beatCountRef.current + 1) % beatsPerBar;
      metroClick(beatCountRef.current === 0);
    }, 60000 / bpmRef.current);
  }, [beatsPerBar, metroClick, stopMetro]);

  // Liga/desliga o metrônomo; reinicia quando BPM ou compasso mudam
  useEffect(() => {
    if (metroOn && open) startMetro();
    else stopMetro();
    return stopMetro;
  }, [metroOn, open, bpm, beatsPerBar]);

  const stopScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    accumulatorRef.current = 0;
    beatAccumRef.current = 0;
  }, []);

  const startScroll = useCallback(() => {
    if (rafRef.current) return;
    lastTimeRef.current = performance.now();
    accumulatorRef.current = 0;
    beatAccumRef.current = 0;

    const tick = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const speed = (bpmRef.current / 60) * pxRef.current;
      accumulatorRef.current += speed * dt;
      const px = Math.floor(accumulatorRef.current);
      if (px > 0 && scrollRef.current) {
        const el = scrollRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        let target = el.scrollTop + px;

        if (loopOnRef.current && loopEndRef.current !== null) {
          // Loop ativo: ao passar do fim do trecho, volta ao início
          if (target >= loopEndRef.current) {
            target = loopStartRef.current ?? 0;
            accumulatorRef.current = 0;
          }
        } else if (target >= maxScroll) {
          stopScroll();
          setAutoScroll(false);
          return;
        }
        el.scrollTop = target;
        accumulatorRef.current -= px;
      }

      beatAccumRef.current += dt * (bpmRef.current / 60);
      if (beatAccumRef.current >= 1) {
        beatAccumRef.current -= 1;
        setBeatPulse(true);
        setTimeout(() => setBeatPulse(false), 120);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopScroll]);

  useEffect(() => {
    if (!open) { stopScroll(); setAutoScroll(false); return; }
    if (autoScroll) startScroll();
    else stopScroll();
    return stopScroll;
  }, [autoScroll, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement)?.matches?.("input,button")) {
        e.preventDefault();
        setAutoScroll((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => { stopScroll(); stopMetro(); }, [stopScroll, stopMetro]);

  const loopValid = loopStart !== null && loopEnd !== null && loopEnd > loopStart;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Stage Mode — fullscreen, pure black, giant text"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/5 hover:bg-white/10 transition"
      >
        <Sun size={16} /> Stage Mode
      </button>
      {mounted && open && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#000", color: "#fff",
          display: "flex", flexDirection: "column",
        }}>
          {/* Barra de controle flutuante */}
          <div style={{
            position: "fixed", top: 12, right: 12, zIndex: 10001,
            display: "flex", gap: 8, alignItems: "center",
            background: "rgba(30,30,30,0.85)", borderRadius: 999, padding: "6px 10px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <button
              onClick={() => setAutoScroll((v) => !v)}
              title={autoScroll ? "Pause autoscroll (Space)" : "Play autoscroll (Space)"}
              style={{ ...ctlBtn, background: autoScroll ? "rgba(240,180,41,0.25)" : "rgba(255,255,255,0.08)" }}
            >
              {autoScroll ? <Pause size={18} color="#f0b429" /> : <Play size={18} color="#f0b429" />}
            </button>
            <button
              onClick={() => setShowPanel((v) => !v)}
              title="Scroll rhythm, loop & metronome"
              style={{ ...ctlBtn, background: showPanel ? "rgba(240,180,41,0.25)" : "rgba(255,255,255,0.08)" }}
            >
              <Music size={18} color="#f0b429" />
            </button>
            <button onClick={() => changeScale(-0.5)} title="Smaller text" style={ctlBtn}><Minus size={18} /></button>
            <span style={{ fontSize: 12, opacity: 0.7, minWidth: 32, textAlign: "center" }}>{Math.round(fontScale * 100)}%</span>
            <button onClick={() => changeScale(0.5)} title="Bigger text" style={ctlBtn}><Plus size={18} /></button>
            <button onClick={() => setOpen(false)} title="Exit Stage Mode (Esc)" style={ctlBtn}><X size={18} /></button>
          </div>

          {/* Painel de ritmo / loop / metrônomo */}
          {showPanel && (
            <div style={{
              position: "fixed", top: 64, right: 12, zIndex: 10001,
              background: "rgba(30,30,30,0.95)", borderRadius: 16, padding: "16px 18px",
              border: "1px solid rgba(255,255,255,0.15)", width: 280,
              display: "flex", flexDirection: "column", gap: 14,
              maxHeight: "calc(100vh - 90px)", overflowY: "auto",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0b429", display: "flex", alignItems: "center", gap: 8 }}>
                <Music size={14} /> Scroll rhythm
              </div>

              {/* BPM */}
              <div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>Tempo (BPM)</span>
                  {bpmFound && <span style={{ color: "#34d399" }}>auto-detected</span>}
                  {bpmLoading && <span style={{ color: "#666" }}>detecting...</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => changeBpm(-5)} style={ctlBtn}><Minus size={14} /></button>
                  <span style={{ flex: 1, textAlign: "center", fontSize: 22, fontWeight: 700, color: "#f0b429", fontVariantNumeric: "tabular-nums" }}>{bpm}</span>
                  <button onClick={() => changeBpm(5)} style={ctlBtn}><Plus size={14} /></button>
                </div>
                <input
                  type="range" min={MIN_BPM} max={MAX_BPM} value={bpm}
                  onChange={(e) => { setBpm(Number(e.target.value)); localStorage.setItem("chordproof-stage-bpm", e.target.value); setBpmFound(null); }}
                  style={{ width: "100%", marginTop: 8, accentColor: "#f0b429" }}
                />
              </div>

              {/* Pixels por batida */}
              <div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>Scroll per beat</span>
                  <span style={{ color: "#f0b429", fontWeight: 600 }}>{pxPerBeat.toFixed(1)} px</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => changePxPerBeat(-0.5)} style={ctlBtn}><Minus size={14} /></button>
                  <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#aaa" }}>{((bpm / 60) * pxPerBeat).toFixed(1)} px/s</span>
                  <button onClick={() => changePxPerBeat(0.5)} style={ctlBtn}><Plus size={14} /></button>
                </div>
              </div>

              {/* Metrônomo */}
              <div style={{ borderTop: "1px solid #333", paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0b429", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Timer size={14} /> Metronome</span>
                  <button
                    onClick={() => setMetroOn((v) => !v)}
                    style={{
                      padding: "4px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700,
                      background: metroOn ? "#f0b429" : "rgba(255,255,255,0.1)",
                      color: metroOn ? "#000" : "#aaa",
                    }}
                  >
                    {metroOn ? "ON" : "OFF"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#888" }}>Beats per bar:</span>
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setBeatsPerBar(n)}
                      style={{
                        width: 28, height: 24, borderRadius: 8, border: "1px solid " + (beatsPerBar === n ? "#f0b429" : "#333"),
                        background: beatsPerBar === n ? "rgba(240,180,41,0.15)" : "transparent",
                        color: beatsPerBar === n ? "#f0b429" : "#888",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>accent on 1</span>
                </div>
              </div>

              {/* Loop de seção */}
              <div style={{ borderTop: "1px solid #333", paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f0b429", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Repeat size={14} /> Section loop</span>
                  {loopOn && <span style={{ fontSize: 10, background: "#f0b429", color: "#000", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>LOOP</span>}
                </div>
                <div style={{ fontSize: 10, color: "#666", lineHeight: 1.5, marginBottom: 8 }}>
                  Scroll to the start of the section and mark it, then scroll to the end and mark it. The autoscroll will repeat that part.
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <button
                    onClick={markStart}
                    style={{
                      flex: 1, padding: "7px 4px", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 600,
                      border: "1px solid " + (loopStart !== null ? "#34d399" : "#333"),
                      background: loopStart !== null ? "rgba(52,211,153,0.12)" : "transparent",
                      color: loopStart !== null ? "#34d399" : "#888",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                  >
                    <Flag size={11} /> {loopStart !== null ? `Start: ${loopStart}px` : "Set start"}
                  </button>
                  <button
                    onClick={markEnd}
                    style={{
                      flex: 1, padding: "7px 4px", borderRadius: 10, cursor: "pointer", fontSize: 11, fontWeight: 600,
                      border: "1px solid " + (loopEnd !== null ? "#e74c3c" : "#333"),
                      background: loopEnd !== null ? "rgba(231,76,60,0.12)" : "transparent",
                      color: loopEnd !== null ? "#e74c3c" : "#888",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                  >
                    <Flag size={11} /> {loopEnd !== null ? `End: ${loopEnd}px` : "Set end"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={toggleLoop}
                    disabled={!loopValid}
                    style={{
                      flex: 1, padding: "8px", borderRadius: 999, cursor: loopValid ? "pointer" : "not-allowed",
                      border: "none", fontSize: 12, fontWeight: 700,
                      background: loopOn ? "#f0b429" : loopValid ? "rgba(240,180,41,0.2)" : "rgba(255,255,255,0.05)",
                      color: loopOn ? "#000" : loopValid ? "#f0b429" : "#555",
                    }}
                  >
                    {loopOn ? "Loop ON" : "Loop OFF"}
                  </button>
                  {(loopStart !== null || loopEnd !== null) && (
                    <button
                      onClick={clearLoop}
                      style={{ padding: "8px 12px", borderRadius: 999, cursor: "pointer", border: "1px solid #333", background: "transparent", color: "#888", fontSize: 12 }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {loopStart !== null && loopEnd !== null && loopEnd <= loopStart && (
                  <div style={{ fontSize: 10, color: "#e74c3c", marginTop: 6 }}>End must be after start — re-mark the points.</div>
                )}
              </div>

              <div style={{ fontSize: 10, color: "#666", lineHeight: 1.5 }}>
                Space = play/pause · autoscroll follows the song tempo · loop repeats the marked section.
              </div>
            </div>
          )}

          {/* Pulso visual da batida + badges */}
          {(autoScroll || metroOn) && (
            <div style={{
              position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10001,
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(30,30,30,0.85)", borderRadius: 999, padding: "8px 16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: beatPulse ? "#f0b429" : "rgba(240,180,41,0.2)",
                boxShadow: beatPulse ? "0 0 12px rgba(240,180,41,0.8)" : "none",
                transition: "background 0.1s, box-shadow 0.1s",
              }} />
              <span style={{ fontSize: 12, color: "#f0b429", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{bpm} BPM</span>
              {(window as any).__stageTrackInfo?.keySig && (
                <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>{(window as any).__stageTrackInfo.keySig}</span>
              )}
              {loopOn && <span style={{ fontSize: 10, background: "rgba(240,180,41,0.2)", color: "#f0b429", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>LOOP</span>}
              {metroOn && <span style={{ fontSize: 10, background: "rgba(52,211,153,0.2)", color: "#34d399", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>♪ {beatsPerBar}/4</span>}
            </div>
          )}

          {/* Conteúdo da cifra */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: "auto", padding: "56px 20px 80px",
            WebkitOverflowScrolling: "touch",
          }}>
            <div style={{
              fontFamily: "monospace",
              fontSize: `${fontScale}rem`,
              lineHeight: 1.9,
              whiteSpace: "pre-wrap",
              maxWidth: 900, margin: "0 auto",
            }}>
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

const ctlBtn: React.CSSProperties = {
  padding: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)",
  display: "flex", alignItems: "center", cursor: "pointer",
};