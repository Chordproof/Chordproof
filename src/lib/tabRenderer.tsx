"use client";
import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ChordSpan } from "./fretboard";
import { CHORD_TOKEN_RE, CHORD_STRICT_RE, TAB_LINE_RE, transposeChord } from "./chordData";

export function renderPair(chordLine: string, lyricLine: string, key: number, transpose: number, onChord: (c: string) => void, theme: any): ReactNode {
  const parts: ReactNode[] = [];
  let li = 0, c = 0;
  const re = new RegExp(CHORD_TOKEN_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(chordLine)) !== null) {
    if (m[0] === "") { re.lastIndex++; continue; }
    if (m.index > li) parts.push(<span key={"sp" + c} style={{ color: "transparent" }}>{chordLine.slice(li, m.index)}</span>);
    const ch = transposeChord(m[1], transpose);
    parts.push(<ChordSpan key={c++} chord={ch} onClick={onChord} theme={theme} />);
    li = m.index + m[1].length;
  }
  if (li < chordLine.length) parts.push(<span key="rest" style={{ color: "transparent" }}>{chordLine.slice(li)}</span>);

  return (
    <div key={key} style={{ marginBottom: "2px" }}>
      <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: "1.4em", height: lyricLine ? "1.4em" : "auto" }}>{parts}</div>
      {lyricLine && <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6em", fontFamily: "monospace", color: "#e0e0e0" }}>{lyricLine}</div>}
    </div>
  );
}

function renderInlineChords(chords: string[], lyricLine: string, key: number, onChord: (c: string) => void, theme: any): ReactNode {
  if (chords.length === 0 || !lyricLine.trim()) {
    return <div key={key} style={{ whiteSpace: "pre-wrap", lineHeight: "1.6em", fontFamily: "monospace", color: "#e0e0e0" }}>{lyricLine}</div>;
  }

  const words: { text: string; start: number }[] = [];
  const wordRe = /\S+/g;
  let wm: RegExpExecArray | null;
  while ((wm = wordRe.exec(lyricLine)) !== null) {
    words.push({ text: wm[0], start: wm.index });
  }

  const chordPositions: number[] = [];
  if (words.length > 0) {
    for (let i = 0; i < chords.length; i++) {
      const wordIdx = Math.min(Math.floor((i * words.length) / chords.length), words.length - 1);
      chordPositions.push(words[wordIdx].start);
    }
  } else {
    for (let i = 0; i < chords.length; i++) chordPositions.push(0);
  }

  const parts: ReactNode[] = [];
  let lastPos = 0;
  for (let i = 0; i < chords.length; i++) {
    const pos = chordPositions[i];
    if (pos > lastPos) {
      parts.push(<span key={"t" + i} style={{ color: "#e0e0e0" }}>{lyricLine.slice(lastPos, pos)}</span>);
    }
    parts.push(<ChordSpan key={"c" + i} chord={chords[i]} onClick={onChord} theme={theme} />);
    lastPos = pos;
  }
  if (lastPos < lyricLine.length) {
    parts.push(<span key="rest" style={{ color: "#e0e0e0" }}>{lyricLine.slice(lastPos)}</span>);
  }

  return (
    <div key={key} style={{ marginBottom: "4px", fontFamily: "monospace", lineHeight: "1.8em" }}>
      {parts}
    </div>
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

    if (!tr) {
      result.push(<div key={kc++} style={{ height: "0.8em" }}> </div>);
      i++; continue;
    }

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
        if (chordLines.length === 1) {
          result.push(renderPair(chordLines[0], lyricLine, kc++, transpose, onChord, theme));
        } else {
          const allChords: string[] = [];
          for (const cl of chordLines) {
            const re = new RegExp(CHORD_TOKEN_RE.source, "g");
            let m: RegExpExecArray | null;
            while ((m = re.exec(cl)) !== null) {
              if (m[0] === "") { re.lastIndex++; continue; }
              allChords.push(transposeChord(m[1], transpose));
            }
          }
          result.push(renderInlineChords(allChords, lyricLine, kc++, onChord, theme));
        }
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
