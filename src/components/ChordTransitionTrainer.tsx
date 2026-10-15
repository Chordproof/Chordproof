"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, X, Zap, CheckCircle2, ChevronRight, Volume2, VolumeX } from "lucide-react";

/**
 * ChordTransitionTrainer — ChordProof+ feature 2
 * Treina a troca entre 2 acordes (ou progressão da cifra) com timer de 30s.
 * Conta trocas limpas (benchmark: 20+ em 30s = nível pro).
 */

type Phase = "idle" | "countdown" | "running" | "done";

const ROUND_SECONDS = 30;

export default function ChordTransitionTrainer({
  chords,
  onClose,
  theme,
}: {
  chords: string[];
  onClose: () => void;
  theme: any;
}) {
  const C = theme;
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<"pair" | "progression">("pair");
  const [pairIdx, setPairIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [switches, setSwitches] = useState(0);
  const [best, setBest] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("chordproof-trainer-best") || "0", 10);
  });
  const [sessions, setSessions] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("chordproof-trainer-sessions") || "0", 10);
  });
  const [soundOn, setSoundOn] = useState(true);
  const [targetChord, setTargetChord] = useState(0);

  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pairs = useMemo(() => {
    const out: [string, string][] = [];
    if (chords.length < 2) return out;
    if (chords.length === 2) return [[chords[0], chords[1]]];
    for (let i = 0; i < chords.length - 1; i++) out.push([chords[i], chords[i + 1]]);
    if (chords.length > 2) out.push([chords[chords.length - 1], chords[0]]);
    return out;
  }, [chords]);

  const activePair = pairs[pairIdx] || null;

  const beep = useCallback((freq: number, dur = 0.08) => {
    if (!soundOn) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch {}
  }, [soundOn]);

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const startRound = () => {
    setSwitches(0);
    setTargetChord(0);
    setSecondsLeft(ROUND_SECONDS);
    setPhase("countdown");
    setCountdown(3);
    let cd = 3;
    beep(880, 0.12);
    timerRef.current = setInterval(() => {
      cd -= 1;
      setCountdown(cd);
      if (cd > 0) { beep(880, 0.12); }
      else {
        stopTimer();
        beep(1320, 0.25);
        setPhase("running");
      }
    }, 1000);
  };

  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          stopTimer();
          setPhase("done");
          beep(660, 0.3);
          return 0;
        }
        if (s <= 5) beep(440, 0.05);
        return s - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const total = sessions + 1;
    setSessions(total);
    localStorage.setItem("chordproof-trainer-sessions", String(total));
    if (switches > best) {
      setBest(switches);
      localStorage.setItem("chordproof-trainer-best", String(switches));
    }
  }, [phase]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => () => stopTimer(), []);

  const registerSwitch = () => {
    if (phase !== "running") return;
    setSwitches((s) => s + 1);
    beep(990, 0.05);
    setTargetChord((t) => t + 1);
  };

  const nextPair = () => { setPairIdx((i) => (i + 1) % Math.max(pairs.length, 1)); setPhase("idle"); };
  const prevPair = () => { setPairIdx((i) => (i - 1 + pairs.length) % Math.max(pairs.length, 1)); setPhase("idle"); };

  const level = switches >= 30 ? "Guitar Hero 🎸" : switches >= 20 ? "Avançado" : switches >= 12 ? "Intermediário" : switches >= 6 ? "Em progresso" : "Iniciante";

  return (
    <div
      onClick={phase === "idle" ? onClose : undefined}
      style={{ position: "fixed", inset: 0, background: "#000", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div style={{ position: "absolute", top: "20px", left: "24px", right: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f0b429", fontWeight: 700 }}>
          <Zap size={20} /> Chord Transition Trainer
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={() => setSoundOn(!soundOn)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} title={soundOn ? "Sound on" : "Sound off"}>
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} title="Exit (Esc)">
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", top: "24px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "24px", fontSize: "13px", color: "#888" }}>
        <span>Best: <strong style={{ color: "#f0b429" }}>{best}</strong> changes</span>
        <span>Sessions: <strong style={{ color: "#f0b429" }}>{sessions}</strong></span>
      </div>

      {phase === "idle" && (
        <div style={{ textAlign: "center", maxWidth: "640px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Train your chord changes</h2>
          <p style={{ color: "#888", marginBottom: "28px", fontSize: "14px" }}>
            How many clean changes can you make in {ROUND_SECONDS} seconds?
          </p>

          {chords.length < 2 ? (
            <p style={{ color: "#e74c3c" }}>This tab needs at least 2 chords to train transitions.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
                <button
                  onClick={() => setMode("pair")}
                  style={{ padding: "10px 20px", borderRadius: "999px", border: "1px solid " + (mode === "pair" ? "#f0b429" : "#333"), background: mode === "pair" ? "rgba(240,180,41,0.12)" : "transparent", color: mode === "pair" ? "#f0b429" : "#aaa", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
                >
                  Two chords
                </button>
                {chords.length > 2 && (
                  <button
                    onClick={() => setMode("progression")}
                    style={{ padding: "10px 20px", borderRadius: "999px", border: "1px solid " + (mode === "progression" ? "#f0b429" : "#333"), background: mode === "progression" ? "rgba(240,180,41,0.12)" : "transparent", color: mode === "progression" ? "#f0b429" : "#aaa", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}
                  >
                    Full progression ({chords.length})
                  </button>
                )}
              </div>

              {mode === "pair" && activePair && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
                  <button onClick={prevPair} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "8px" }}>‹</button>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", background: "rgba(255,255,255,0.04)", padding: "20px 32px", borderRadius: "20px", border: "1px solid #222" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "36px", fontWeight: 700, color: "#34d399" }}>{activePair[0]}</div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>FROM</div>
                    </div>
                    <ChevronRight size={28} color="#f0b429" />
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "36px", fontWeight: 700, color: "#34d399" }}>{activePair[1]}</div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>TO</div>
                    </div>
                  </div>
                  <button onClick={nextPair} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "8px" }}>›</button>
                </div>
              )}

              {mode === "progression" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
                  {chords.map((c, i) => (
                    <span key={i} style={{ padding: "8px 16px", borderRadius: "12px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", fontWeight: 700, fontSize: "18px" }}>{c}</span>
                  ))}
                </div>
              )}

              <button
                onClick={startRound}
                style={{ padding: "16px 48px", borderRadius: "999px", background: "#f0b429", color: "#000", fontWeight: 700, fontSize: "18px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px" }}
              >
                <Play size={20} /> Start ({ROUND_SECONDS}s)
              </button>
              <p style={{ color: "#555", fontSize: "12px", marginTop: "16px" }}>
                Benchmark: 20+ clean changes in 30s = pro-level transition
              </p>
            </>
          )}
        </div>
      )}

      {phase === "countdown" && (
        <div style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: "120px", fontWeight: 700, color: "#f0b429" }}>{countdown}</div>
          <p style={{ color: "#888" }}>Get ready...</p>
          <button onClick={() => { stopTimer(); setPhase("idle"); }} style={{ marginTop: "24px", background: "none", border: "1px solid #333", color: "#888", padding: "8px 20px", borderRadius: "999px", cursor: "pointer" }}>Cancel</button>
        </div>
      )}

      {phase === "running" && (
        <div style={{ textAlign: "center", width: "100%", maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: "64px", fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {secondsLeft}<span style={{ fontSize: "20px", color: "#666" }}>s</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#222", borderRadius: "3px", margin: "16px 0 32px", overflow: "hidden" }}>
            <div style={{ width: `${(secondsLeft / ROUND_SECONDS) * 100}%`, height: "100%", background: secondsLeft <= 5 ? "#e74c3c" : "#f0b429", transition: "width 1s linear" }} />
          </div>

          {mode === "pair" && activePair && (
            <>
              <p style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>Switch to:</p>
              <button
                onClick={registerSwitch}
                style={{ background: "rgba(52,211,153,0.12)", border: "2px solid #34d399", borderRadius: "24px", padding: "32px 64px", cursor: "pointer", marginBottom: "24px" }}
              >
                <div style={{ fontSize: "72px", fontWeight: 700, color: "#34d399" }}>{activePair[targetChord % 2]}</div>
              </button>
              <p style={{ color: "#666", fontSize: "13px" }}>Tap the big button EVERY TIME you play the chord</p>
            </>
          )}

          {mode === "progression" && (
            <>
              <p style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>Play in order — tap when you hit:</p>
              <button
                onClick={registerSwitch}
                style={{ background: "rgba(52,211,153,0.12)", border: "2px solid #34d399", borderRadius: "24px", padding: "32px 64px", cursor: "pointer", marginBottom: "24px" }}
              >
                <div style={{ fontSize: "72px", fontWeight: 700, color: "#34d399" }}>{chords[targetChord % chords.length]}</div>
              </button>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {chords.map((c, i) => (
                  <span key={i} style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, background: i === targetChord % chords.length ? "#34d399" : "rgba(255,255,255,0.06)", color: i === targetChord % chords.length ? "#000" : "#888" }}>{c}</span>
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: "24px", fontSize: "20px", color: "#f0b429", fontWeight: 700 }}>{switches} changes</div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
          <CheckCircle2 size={56} color="#34d399" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "32px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{switches} changes in {ROUND_SECONDS}s</h2>
          <p style={{ color: "#f0b429", fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{level}</p>
          {switches > best && <p style={{ color: "#34d399", fontSize: "14px", marginBottom: "8px" }}>🏆 New personal best!</p>}
          <p style={{ color: "#666", fontSize: "13px", marginBottom: "32px" }}>
            {switches * 2} changes per minute — {switches >= 20 ? "you're ready for the stage" : "keep practicing!"}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={startRound} style={{ padding: "14px 32px", borderRadius: "999px", background: "#f0b429", color: "#000", fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RotateCcw size={18} /> Again
            </button>
            <button onClick={() => { setPhase("idle"); }} style={{ padding: "14px 32px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer" }}>
              Change pair
            </button>
            <button onClick={onClose} style={{ padding: "14px 32px", borderRadius: "999px", background: "transparent", color: "#888", fontWeight: 600, border: "1px solid #333", cursor: "pointer" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
