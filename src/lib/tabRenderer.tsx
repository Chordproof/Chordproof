"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CHORD_TOKEN_RE, CHORD_STRICT_RE, TAB_LINE_RE, transposeChord } from "./chordData";
import { ChordSpan } from "./fretboard";

export function renderPair(chordLine: string, lyricLine: string, key: number, transpose: number, onChord: (c: string) => void, theme: any): ReactNode {
  const parts: ReactNode[] = [];
  let li = 0, c = 0;
  const re = new RegExp(CHORD_TOKEN_RE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(chordLine)) !== null) {
    if (m[0] === "") { re.lastIndex++; continue; }
    parts.push(chordLine.slice(li, m.index));
    const ch = transposeChord(m[1], transpose);
    parts.push(<ChordSpan key={c++} chord={ch} onClick={onChord} theme={theme} />);
    li = m.index + m[1].length;
  }
  parts.push(chordLine.slice(li));
  return (
    <div key={key} style={{marginBottom:"2px"}}>
      <div style={{whiteSpace:"pre-wrap",height:"1.3em",lineHeight:"1.3em",fontFamily:"monospace",color:"#34d399",fontWeight:700}}>{parts}</div>
      {lyricLine && <div style={{whiteSpace:"pre-wrap",lineHeight:"1.3em",fontFamily:"monospace",color:"#e0e0e0"}}>{lyricLine}</div>}
    </div>
  );
}

export function renderContent(content: string, showTablature: boolean, transpose: number, onChord: (c: string) => void, theme: any): ReactNode[] {
  const lines = content.split("\n");
  const result: ReactNode[] = [];
  let i = 0, kc = 0;
  while (i < lines.length) {
    const line = lines[i] || "";
    const tr = line.trim();
    if (!tr) { result.push(<div key={kc++} style={{height:"0.8em"}}>&nbsp;</div>); i++; continue; }
    if (tr.startsWith("[") && tr.endsWith("]")) {
      result.push(<div key={kc++} style={{color:"#f0b429",fontWeight:700,marginTop:"16px",marginBottom:"4px",fontSize:"1.1em"}}>{tr}</div>);
      i++; continue;
    }
    const tokens = tr.split(/\s+/).filter(Boolean);
    const isChord = tokens.length > 0 && tokens.every((t:string) => CHORD_STRICT_RE.test(t));
    if (isChord) {
      const nl = lines[i+1] || "";
      const nt = nl.trim();
      let pair = false;
      if (nt) {
        const ntk = nt.split(/\s+/).filter(Boolean);
        const nIsChord = ntk.length > 0 && ntk.every((t:string) => CHORD_STRICT_RE.test(t));
        const nIsHdr = nt.startsWith("[") && nt.endsWith("]");
        const nIsTab = TAB_LINE_RE.test(nt);
        if (!nIsChord && !nIsHdr && !nIsTab) pair = true;
      }
      if (pair) { result.push(renderPair(line, nl, kc++, transpose, onChord, theme)); i += 2; continue; }
      else { result.push(renderPair(line, "", kc++, transpose, onChord, theme)); i++; continue; }
    }
    if (TAB_LINE_RE.test(tr)) {
      if (showTablature) { result.push(<div key={kc++} style={{whiteSpace:"pre-wrap",fontFamily:"monospace",color:"#9E9E9E",fontSize:"0.9em",lineHeight:"1.3em"}}>{line}</div>); }
      i++; continue;
    }
    result.push(<div key={kc++} style={{whiteSpace:"pre-wrap",lineHeight:"1.6em",fontFamily:"monospace",color:"#e0e0e0"}}>{line}</div>);
    i++;
  }
  return result;
}

export function renderTablature(tab: string): ReactNode {
  if (!tab || !tab.trim()) return null;
  const lines = tab.split("\n");
  return (
    <div style={{background:"#0a0a0a",borderRadius:"12px",padding:"16px",border:"1px solid #333",marginTop:"16px",maxHeight:"500px",overflowY:"auto"}}>
      <div style={{color:"#f0b429",fontWeight:700,fontSize:"14px",marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}>
        <ChevronDown size={16} /> Tablature Notation
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:"0.85em",lineHeight:"1.4em",color:TAB_LINE_RE.test(line)?"#69db7c":"#9E9E9E"}}>{line || "\u00a0"}</div>
      ))}
    </div>
  );
}
