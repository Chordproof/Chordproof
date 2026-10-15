"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sun, Minus, Plus, X, Play, Pause, Music } from "lucide-react";

// Modo Palco: cifra em fullscreen com fundo preto puro, fonte gigante e controle de tamanho.
// Autoscroll no ritmo da música: velocidade derivada do BPM (px por batida) com ajuste fino.
// Feito para leitura em cima do palco — recurso ChordProof+.

const MIN_BPM = 40;
const MAX_BPM = 220;
const DEFAULT_BPM = 90;

// Pixels por batida: quantos px a página avança a cada batida do BPM.
// Ajustável pelo usuário — depende do tamanho da fonte e da densidade da cifra.
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
  const [bpmFound, setBpmFound] = useState<number | null>(null); // BPM detectado (badge)
  const [pxPerBeat, setPxPerBeat] = useState(DEFAULT_PX_PER_BEAT);
  const [showPanel, setShowPanel] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const bpmRef = useRef(bpm);
  const pxRef = useRef(pxPerBeat);
  const accumulatorRef = useRef(0);
  const beatAccumRef = useRef(0); // acumulador de batidas (para o pulso visual)
  const [beatPulse, setBeatPulse] = useState(false);

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
  // (o componente pai injeta artist/song em window.__stageTrackInfo)
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
    setBpmFound(null); // ajuste manual = BPM detectado não é mais o ativo
  }

  function changePxPerBeat(delta: number) {
    setPxPerBeat((p) => {
      const next = Math.min(MAX_PX_PER_BEAT, Math.max(MIN_PX_PER_BEAT, Math.round((p + delta) * 10) / 10));
      localStorage.setItem("chordproof-stage-pxbeat", String(next));
      return next;
    });
  }

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

      // px/s = BPM/60 * pxPerBeat
      const speed = (bpmRef.current / 60) * pxRef.current;
      accumulatorRef.current += speed * dt;
      const px = Math.floor(accumulatorRef.current);
      if (px > 0 && scrollRef.current) {
        const el = scrollRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (el.scrollTop >= maxScroll) {
          stopScroll();
          setAutoScroll(false);
          return;
        }
        el.scrollBy({ top: px, behavior: "auto" });
        accumulatorRef.current -= px;
      }

      // Pulso visual a cada batida
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

  // Controla o autoscroll
  useEffect(() => {
    if (!open) { stopScroll(); setAutoScroll(false); return; }
    if (autoScroll) startScroll();
    else stopScroll();
    return stopScroll;
  }, [autoScroll, open]);

  // Espaço = play/pause do autoscroll (quando o Stage está aberto)
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

  useEffect(() => () => stopScroll(), [stopScroll]);

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
              title="Scroll rhythm settings (BPM)"
              style={{ ...ctlBtn, background: showPanel ? "rgba(240,180,41,0.25)" : "rgba(255,255,255,0.08)" }}
            >
              <Music size={18} color="#f0b429" />
            </button>
            <button onClick={() => changeScale(-0.5)} title="Smaller text" style={ctlBtn}><Minus size={18} /></button>
            <span style={{ fontSize: 12, opacity: 0.7, minWidth: 32, textAlign: "center" }}>{Math.round(fontScale * 100)}%</span>
            <button onClick={() => changeScale(0.5)} title="Bigger text" style={ctlBtn}><Plus size={18} /></button>
            <button onClick={() => setOpen(false)} title="Exit Stage Mode (Esc)" style={ctlBtn}><X size={18} /></button>
          </div>

          {/* Painel de ritmo (BPM) */}
          {showPanel && (
            <div style={{
              position: "fixed", top: 64, right: 12, zIndex: 10001,
              background: "rgba(30,30,30,0.95)", borderRadius: 16, padding: "16px 18px",
              border: "1px solid rgba(255,255,255,0.15)", width: 260,
              display: "flex", flexDirection: "column", gap: 12,
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

              <div style={{ fontSize: 10, color: "#666", lineHeight: 1.5 }}>
                The page advances one step per beat, matching the song tempo. Fine-tune until one lyric line passes per bar.
              </div>
            </div>
          )}

          {/* Pulso visual da batida */}
          {autoScroll && (
            <div style={{
              position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10001,
              display: "flex", alignItems: "center", gap: 10,
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