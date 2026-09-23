"use client";

import { useRef, useState } from "react";
import ChordTooltip from "@/components/ChordTooltip";

export function ChordSpan({ children }: { children: string }) {
  const [hover, setHover] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHover(true), 250); // delay anti-poluição
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHover(false), 150);
  };

  return (
    <span
      className="relative font-bold text-[#34d399] cursor-pointer hover:text-white transition-colors"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {hover && <ChordTooltip chordName={children} />}
    </span>
  );
}
export function hasInlineTablature(content: string): boolean {
  if (!content) return false;
  return content.split("\n").some((line: string) => TAB_LINE_RE.test(line.trim()));
}

export function renderContent(content: string, showTablature: boolean, transpose: number, onChord: (c: string) => void, theme: any): ReactNode[] {
  const lines = content.split("\n");
  const result: ReactNode[] = [];
  let i = 0, kc = 0;
  while (i < lines.length) {
    const line = lines[i] || "";
    const tr = line.trim();
    if (!tr) { result.push(<div key={kc++} style={{ height: "0.8em" }}> </div>); i++; continue; }
    if (tr.startsWith("[") && tr.endsWith("]")) {
      result.push(<div key={kc++} style={{ color: "#f0b429", fontWeight: 700, marginTop: "16px", marginBottom: "4px", fontSize: "1.1em" }}>{tr}</div>);
      i++; continue;
    }
    const tokens = tr.split(/\s+/).filter(Boolean);
    const isChord = tokens.length > 0 && tokens.every((t: string) => CHORD_STRICT_RE.test(t));
    if (isChord) {
      const chordLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length) {
        const nl = lines[j] || "";
        const nt = nl.trim();
        if (!nt) break;
        if (nt.startsWith("[") && nt.endsWith("]")) break;
        if (TAB_LINE_RE.test(nt)) break;
        const ntk = nt.split(/\s+/).filter(Boolean);
        const nIsChord = ntk.length > 0 && ntk.every((t: string) => CHORD_STRICT_RE.test(t));
        if (nIsChord) { chordLines.push(nl); j++; } else { break; }
      }
      const lyricLine = lines[j] || "";
      const lyricTrim = lyricLine.trim();
      const lyricTokens = lyricTrim.split(/\s+/).filter(Boolean);
      const lyricIsChord = lyricTokens.length > 0 && lyricTokens.every((t: string) => CHORD_STRICT_RE.test(t));
      const hasLyric = lyricTrim && !lyricTrim.startsWith("[") && !TAB_LINE_RE.test(lyricTrim) && !lyricIsChord;
      if (hasLyric) {
        for (let k = 0; k < chordLines.length - 1; k++) {
          result.push(renderPair(chordLines[k], "", kc++, transpose, onChord, theme));
        }
        result.push(renderPair(chordLines[chordLines.length - 1], lyricLine, kc++, transpose, onChord, theme));
        i = j + 1;
        continue;
      } else {
        for (const cl of chordLines) {
          result.push(renderPair(cl, "", kc++, transpose, onChord, theme));
        }
        i = j;
        continue;
      }
    }
    if (TAB_LINE_RE.test(tr)) {
      if (showTablature) {
        result.push(<div key={kc++} style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", color: "#69db7c", fontSize: "0.85em", lineHeight: "1.3em" }}>{line}</div>);
      }
      i++; continue;
    }
    result.push(<div key={kc++} style={{ whiteSpace: "pre-wrap", lineHeight: "1.6em", fontFamily: "monospace", color: "#e0e0e0" }}>{line}</div>);
    i++;
  }
  return result;
}

export function renderTablature(tab: string): ReactNode {
  if (!tab || !tab.trim()) return null;
  const lines = tab.split("\n");
  return (
    <div style={{ background: "#0a0a0a", borderRadius: "12px", padding: "16px", border: "1px solid #333", marginTop: "16px", maxHeight: "500px", overflowY: "auto" }}>
      <div style={{ color: "#f0b429", fontWeight: 700, fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
        <ChevronDown size={16} /> Tablature Notation
      </div>
      {lines.map((line: string, i: number) => (
        <div key={i} style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.85em", lineHeight: "1.4em", color: TAB_LINE_RE.test(line) ? "#69db7c" : "#9E9E9E" }}>{line || "\u00a0"}</div>
      ))}
    </div>
  );
}
