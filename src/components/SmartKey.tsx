"use client";
import { useMemo, useState } from "react";
import { KeyRound, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { parseKey, playabilityScore, suggestEasierKey, relatedKeys, transposeKey } from "@/lib/smartKey";
import { transposeChord } from "@/lib/chordData";

/**
 * SmartKey — ChordProof+ feature 6 (sem API paga)
 * Mostra o tom da cifra, avalia a dificuldade dos acordes e sugere
 * transposição + capo para facilitar. Tudo com teoria musical local.
 */
export default function SmartKey({
  keySig,
  chords,
  onApplyTranspose,
  currentTranspose,
}: {
  keySig: string | null;
  chords: string[];
  onApplyTranspose?: (semitones: number) => void;
  currentTranspose: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const info = useMemo(() => (keySig ? parseKey(keySig) : null), [keySig]);
  const playability = useMemo(() => playabilityScore(chords), [chords]);
  const suggestion = useMemo(
    () => (keySig ? suggestEasierKey(keySig, chords, transposeChord) : null),
    [keySig, chords]
  );
  const related = useMemo(() => (keySig ? relatedKeys(keySig) : []), [keySig]);

  if (!keySig || !info) return null;

  const scoreColor = playability.score >= 70 ? "#34d399" : playability.score >= 40 ? "#f0b429" : "#e74c3c";
  const scoreLabel = playability.score >= 70 ? "Easy to play" : playability.score >= 40 ? "Moderate" : "Challenging";

  return (
    <section className="bg-brand-card rounded-2xl p-6 border border-white/5" style={{ marginBottom: "24px" }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <KeyRound size={22} className="text-brand-gold" /> Smart Key
        </h2>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-sm text-brand-muted hover:text-white transition"
        >
          {expanded ? "Hide details" : "Show details"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Linha principal: tom + dificuldade */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
          <span className="text-sm text-brand-muted">Original key</span>
          <span className="text-xl font-bold text-brand-gold">{keySig}</span>
          <span className="text-xs text-brand-muted">({info.mode})</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
          <span className="text-sm text-brand-muted">Chord difficulty</span>
          <span className="text-xl font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
          <span className="text-xs text-brand-muted">{playability.score}/100</span>
        </div>
        {currentTranspose !== 0 && (
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <span className="text-sm text-brand-muted">Transposed</span>
            <span className="text-xl font-bold" style={{ color: "#34d399" }}>
              {transposeKey(keySig, currentTranspose)} {currentTranspose > 0 ? `(+${currentTranspose})` : `(${currentTranspose})`}
            </span>
          </div>
        )}
      </div>

      {/* Sugestão de capo */}
      {suggestion && (
        <div className="mt-4 p-4 rounded-xl border" style={{ background: "rgba(240,180,41,0.06)", borderColor: "rgba(240,180,41,0.25)" }}>
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-brand-gold shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                Easier version: transpose {suggestion.semitones > 0 ? "+" : ""}{suggestion.semitones} → <span className="text-brand-gold">{suggestion.newKey}</span>
                {suggestion.capo > 0 && <> with a <span className="text-brand-gold">capo on fret {suggestion.capo}</span></>}
              </p>
              <p className="text-xs text-brand-muted mt-1">
                Chords become: {suggestion.preview.join(" · ")}{chords.length > 6 ? " …" : ""}
              </p>
              {onApplyTranspose && (
                <button
                  onClick={() => onApplyTranspose(suggestion.semitones)}
                  className="mt-2 px-4 py-1.5 bg-brand-gold text-black rounded-full text-xs font-bold hover:scale-105 transition"
                >
                  Try it
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Chord breakdown</p>
            <div className="flex gap-4 flex-wrap">
              <span className="text-green-400">● {playability.easy} open chords</span>
              <span className="text-brand-gold">● {playability.medium} barre/simple</span>
              <span className="text-red-400">● {playability.hard} complex</span>
            </div>
          </div>
          {related.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Related keys</p>
              <div className="flex gap-2 flex-wrap">
                {related.map((r) => (
                  <div key={r.key + r.label} className="bg-white/5 px-3 py-1.5 rounded-lg">
                    <span className="font-bold text-white">{r.key}</span>
                    <span className="text-xs text-brand-muted ml-2">{r.label}</span>
                    {onApplyTranspose && r.semitones !== 0 && (
                      <button
                        onClick={() => onApplyTranspose(r.semitones)}
                        className="ml-2 text-xs text-brand-gold hover:underline"
                      >
                        transpose
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}