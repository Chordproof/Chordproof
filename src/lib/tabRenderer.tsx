"use client";

import { Fragment, type ReactNode } from "react";

export const TAB_LINE_RE = /^\s*(e|B|G|D|A|E)\|/;

export const CHORD_RE =
  /^[A-G](#|b)?(maj7|maj|min7|min|m7|m|M7|M|sus4|sus2|sus|add9|add|dim7|dim|aug|[0-9]+|[+\-])*(\([^)]*\))*(\/[A-G](#|b)?)?$/;

const SECTION_RE = /^\[(.+)\]$/;
const RHYTHM_RE = /^[↓↑v^]+$/;

const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ENHARMONIC: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", "B#": "C", "E#": "F", Cb: "B",
};

export function transposeChord(name: string, semitones: number): string {
  if (!semitones) return name;
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return name;
  const norm = ENHARMONIC[m[1]] ?? m[1];
  let idx = NOTE_ORDER.indexOf(norm);
  if (idx < 0) return name;
  idx = (idx + semitones + 12) % 12;
  return NOTE_ORDER[idx] + m[2];
}

export function isChordToken(token: string): boolean {
  if (RHYTHM_RE.test(token)) return false;
  return CHORD_RE.test(token);
}

export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.every((t) => RHYTHM_RE.test(t) || isChordToken(t));
}

export function hasInlineTablature(content: string): boolean {
  if (!content) return false;
  return content.split("\n").some((line: string) => TAB_LINE_RE.test(line.trim()));
}

export function extractUniqueChords(content: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || SECTION_RE.test(line) || TAB_LINE_RE.test(line) || !isChordLine(line)) continue;
    for (const token of line.split(/\s+/)) {
      if (!isChordToken(token)) continue;
      if (!seen.has(token)) { seen.add(token); out.push(token); }
    }
  }
  return out;
}

interface TabTheme {
  chordColor?: string;
  lyricColor?: string;
  sectionColor?: string;
  tabColor?: string;
}

const DEFAULT_THEME: Required<TabTheme> = {
  chordColor: "#34d399",
  lyricColor: "#e5e7eb",
  sectionColor: "#f0b429",
  tabColor: "#9ca3af",
};

function renderChordToken(
  token: string,
  transpose: number,
  theme: Required<TabTheme>,
  onChord?: (c: string) => void,
  key?: React.Key
): ReactNode {
  const name = transposeChord(token, transpose);
  return (
    <span
      key={key}
      role="button"
      tabIndex={0}
      onClick={() => onChord?.(name)}
      onKeyDown={(e) => { if (e.key === "Enter") onChord?.(name); }}
      className="cursor-pointer font-bold hover:underline"
      style={{ color: theme.chordColor }}
    >
      {name}
    </span>
  );
}

export function renderChordLine(
  line: string,
  transpose: number,
  theme: Required<TabTheme>,
  onChord?: (c: string) => void,
  key?: React.Key
): ReactNode {
  const nodes: ReactNode[] = [];
  const re = /\s+|\S+/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(line)) !== null) {
    const seg = m[0];
    if (/^\s+$/.test(seg)) {
      nodes.push(<Fragment key={`ws${i}`}>{seg}</Fragment>);
    } else if (isChordToken(seg)) {
      nodes.push(renderChordToken(seg, transpose, theme, onChord, `ch${i}`));
    } else {
      nodes.push(<Fragment key={`tx${i}`}>{seg}</Fragment>);
    }
    i++;
  }
  return (
    <div key={key} style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
      {nodes}
    </div>
  );
}

export function renderPair(
  chordLine: string,
  lyricLine: string,
  transpose: number,
  theme: Required<TabTheme>,
  onChord?: (c: string) => void,
  key?: React.Key
): ReactNode {
  const mono: React.CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  };
  return (
    <div key={key} style={{ marginBottom: "0.5rem" }}>
      {renderChordLine(chordLine, transpose, theme, onChord)}
      <div style={{ ...mono, color: theme.lyricColor }}>{lyricLine}</div>
    </div>
  );
}

function renderSection(line: string, theme: Required<TabTheme>, key?: React.Key): ReactNode {
  const title = line.match(SECTION_RE)?.[1] ?? line;
  return (
    <div
      key={key}
      className="font-bold uppercase tracking-wide"
      style={{ color: theme.sectionColor, marginTop: "1rem", marginBottom: "0.4rem" }}
    >
      {title}
    </div>
  );
}

function renderTabLine(line: string, theme: Required<TabTheme>, key?: React.Key): ReactNode {
  return (
    <div
      key={key}
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        whiteSpace: "pre-wrap",
        color: theme.tabColor,
        lineHeight: 1.4,
      }}
    >
      {line}
    </div>
  );
}

export function renderContent(
  content: string,
  showTablature: boolean,
  transpose: number,
  onChord: (c: string) => void,
  themeData?: object
): ReactNode[] {
  const theme = { ...DEFAULT_THEME, ...(themeData ?? {}) } as Required<TabTheme>;
  const lines = content.split("\n");
  const out: ReactNode[] = [];
  let k = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;

    if (SECTION_RE.test(line)) {
      out.push(renderSection(line, theme, k++));
      continue;
    }

    if (TAB_LINE_RE.test(line)) {
      if (showTablature) out.push(renderTabLine(raw, theme, k++));
      continue;
    }

    if (isChordLine(line)) {
      const next = lines[i + 1]?.trim() ?? "";
      if (next && !SECTION_RE.test(next) && !TAB_LINE_RE.test(next) && !isChordLine(next)) {
        out.push(renderPair(raw, lines[i + 1], transpose, theme, onChord, k++));
        i++;
      } else {
        out.push(
          <div
            key={k++}
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              whiteSpace: "pre-wrap",
              marginBottom: "0.5rem",
            }}
          >
            {renderChordLine(raw, transpose, theme, onChord)}
          </div>
        );
      }
      continue;
    }

    out.push(
      <div
        key={k++}
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          whiteSpace: "pre-wrap",
          color: theme.lyricColor,
          lineHeight: 1.5,
          marginBottom: "0.5rem",
        }}
      >
        {line}
      </div>
    );
  }

  return out;
}

export function renderTablature(content?: string | null, ..._extra: unknown[]): ReactNode[] {
  const text = content ?? "";
  const themeLocal = { ...DEFAULT_THEME } as Required<TabTheme>;
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let k = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (SECTION_RE.test(line)) {
      out.push(renderSection(line, themeLocal, k++));
      continue;
    }

    if (TAB_LINE_RE.test(line)) {
      out.push(renderTabLine(raw, themeLocal, k++));
      continue;
    }

    if (isChordLine(line)) {
      out.push(
        <div
          key={k++}
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            whiteSpace: "pre-wrap",
            color: themeLocal.chordColor,
            lineHeight: 1.5,
            marginBottom: "0.5rem",
          }}
        >
          {renderChordLine(line, 0, themeLocal, undefined)}
        </div>
      );
      continue;
    }

    out.push(
      <div
        key={k++}
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          whiteSpace: "pre-wrap",
          color: themeLocal.lyricColor,
          lineHeight: 1.5,
          marginBottom: "0.5rem",
        }}
      >
        {line}
      </div>
    );
  }

  return out;
}
