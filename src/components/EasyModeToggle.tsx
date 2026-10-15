"use client";

import { useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { analyzeEasyMode } from "@/lib/easyMode";

// Easy Mode — troca acordes com pestana por formas fáceis + capo sugerido (ChordProof+).
export default function EasyModeToggle({
  content,
  transpose,
  onContentOverride,
}: {
  content: string;
  transpose: number;
  onContentOverride: (easyContent: string | null, capo: number | null) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const analysis = useMemo(() => analyzeEasyMode(content, transpose), [content, transpose]);

  function buildEasyContent(): string {
    return content
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("[") || /^[eBGDAE]\|/.test(trimmed)) return line;
        let newLine = line;
        for (const [hard, easy] of Object.entries(analysis.substitutionMap)) {
          const re = new RegExp(`(?<![A-Za-z0-9#b])${hard.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9#b])`, "g");
          newLine = newLine.replace(re, easy);
        }
        return newLine;
      })
      .join("\n");
  }

  function toggle() {
    if (enabled) {
      setEnabled(false);
      onContentOverride(null, null);
    } else {
      setEnabled(true);
      onContentOverride(buildEasyContent(), analysis.suggestedCapo);
    }
  }

  const showBadge = !enabled && !dismissed && analysis.hasHard && analysis.suggestedCapo !== null;

  return (
    <>
      <button
        onClick={toggle}
        title="Easy Mode — swap barre chords for easy shapes + capo"
        className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (enabled ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}
      >
        <Sparkles size={16} /> Easy Mode {enabled ? "ON" : "OFF"}
      </button>
      {showBadge && (
        <div className="flex items-center gap-2 text-xs text-brand-muted bg-white/5 px-3 py-1.5 rounded-full">
          <span>
            {analysis.hardChords.length} barre chord{analysis.hardChords.length > 1 ? "s" : ""} detected — Easy Mode suggests capo {analysis.suggestedCapo}
          </span>
          <button onClick={toggle} className="text-brand-gold font-bold hover:underline">Try it</button>
          <button onClick={() => setDismissed(true)} title="Dismiss"><X size={12} /></button>
        </div>
      )}
    </>
  );
}
