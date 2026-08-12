"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, Bookmark, Share2, Play, ChevronDown, MousePointer2, Youtube, X, ExternalLink } from "lucide-react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Raiz MAIÚSCULA [A-G] para não detectar letras minúsculas (a, e, g, am, em)
// dentro das palavras da letra como acordes.
const CHORD_PATTERN =
  "[A-G](?:#|b)?(?:[0-9]|M|m|7|9|11|13|4|6|add|sus|dim|aug|\([0-9]+\)|\/[A-G](?:#|b)?)*";

function transposeChord(chord: string, semitones: number) {
  const match = chord.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return chord;
  const root = match[1];
  const acc = match[2];
  const rest = match[3];
  let idx = NOTES.indexOf(root.toUpperCase());
  if (acc === "#") idx = (idx + 1) % 12;
  if (acc === "b") idx = (idx + 11) % 12;
  const newRoot = NOTES[((idx + semitones) % 12 + 12) % 12];
  return newRoot + rest;
}

function transposeContent(content: string, semitones: number) {
  if (semitones === 0) return content;
  const re = new RegExp(String.raw`\b${CHORD_PATTERN}\b`, "gi");
  return content
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (/^\s*[eEBGDA]{1,2}\|/.test(t) || /^\s*[1-6]\|/.test(t)) return line;
      return line.replace(re, (chord) => {
        try {
          return transposeChord(chord, semitones);
        } catch {
          return chord;
        }
      });
    })
    .join("\n");
}

function extractChords(content: string) {
  const re = new RegExp(String.raw`\b${CHORD_PATTERN}\b`, "gi");
  const matches = content.match(re) || [];
  if (matches.length > 0) return Array.from(new Set(matches));
  const tokenRe = new RegExp(String.raw`^\b${CHORD_PATTERN}\b$`, "i");
  const tokens = content.split(/[\s\n\r\t]+/).map((t) =>
    t.replace(/^[\[\(\{\&lt;]+|[\]\)\}\>\,\.\;\¡\?]+$/g, "")
  );
  return Array.from(new Set(tokens.filter((t) => tokenRe.test(t))));
}

const CHORD_SHAPES: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0], "C#": [-1, 4, 6, 6, 6, 4],
  D: [-1, -1, 0, 2, 3, 2], "D#": [-1, 6, 8, 8, 8, 6],
  E: [0, 2, 2, 1, 0, 0], F: [1, 3, 3, 2, 1, 1],
  "F#": [2, 4, 4, 3, 2, 2], G: [3, 2, 0, 0, 0, 3],
  "G#": [4, 6, 6, 5, 4, 4], A: [-1, 0, 2, 2, 2, 0],
  "A#": [-1, 1, 3, 3, 3, 1], B: [-1, 2, 4, 4, 4, 2],
  Cm: [3, 5, 5, 4, 3, 3], "C#m": [-1, 4, 6, 6, 5, 4],
  Dm: [-1, -1, 0, 2, 3, 1], "D#m": [-1, 6, 8, 8, 7, 6],
  Em: [0, 2, 2, 0, 0, 0], Fm: [1, 3, 3, 2, 1, 1],
  "F#m": [2, 4, 4, 2, 2, 2], Gm: [3, 5, 5, 3, 3, 3],
  "G#m": [4, 6, 6, 4, 4, 4], Am: [-1, 0, 2, 2, 1, 0],
  "A#m": [-1, 1, 3, 3, 2, 1], Bm: [-1, 2, 4, 4, 3, 2],
  C7: [-1, 3, 2, 3, 1, 0], "C#7": [-1, 4, 6, 4, 6, 4],
  D7: [-1, -1, 0, 2, 1, 2], "D#7": [-1, 6, 8, 6, 8, 6],
  E7: [0, 2, 0, 1, 0, 0], F7: [1, 3, 1, 2, 1, 1],
  "F#7": [2, 4, 2, 3, 2, 2], G7: [3, 2, 0, 0, 0, 1],
  "G#7": [4, 6, 4, 5, 4, 4], A7: [-1, 0, 2, 0, 2, 0],
  "A#7": [-1, 1, 3, 1, 3, 1], B7: [-1, 2, 1, 2, 0, 2],
  Cmaj7: [-1, 3, 2, 0, 0, 0], "C#maj7": [-1, 4, 6, 5, 6, 4],
  Dmaj7: [-1, -1, 0, 2, 2, 2], "D#maj7": [-1, 6, 8, 7, 8, 6],
  Emaj7: [0, 2, 1, 1, 0, 0], Fmaj7: [1, 3, 2, 2, 1, 1],
  "F#maj7": [2, 4, 3, 3, 2, 2], Gmaj7: [3, 2, 0, 0, 0, 2],
  "G#maj7": [4, 6, 5, 5, 4, 4], Amaj7: [-1, 0, 2, 1, 2, 0],
  "A#maj7": [-1, 1, 3, 2, 3, 1], Bmaj7: [-1, 2, 4, 3, 4, 2],
  Cm7: [-1, 3, 5, 3, 4, 3], "C#m7": [-1, 4, 6, 4, 5, 4],
  Dm7: [-1, -1, 0, 2, 1, 1], "D#m7": [-1, 6, 8, 6, 7, 6],
  Em7: [0, 2, 2, 0, 3, 0], Fm7: [1, 3, 1, 1, 1, 1],
  "F#m7": [2, 4, 2, 2, 2, 2], Gm7: [3, 5, 3, 3, 3, 3],
  "G#m7": [4, 6, 4, 4, 4, 4], Am7: [-1, 0, 2, 0, 1, 0],
  "A#m7": [-1, 1, 3, 1, 2, 1], Bm7: [-1, 2, 4, 2, 3, 2],
  Csus2: [-1, 3, 0, 0, 1, 0], "C#sus2": [-1, 4, 6, 6, 6, 4],
  Dsus2: [-1, -1, 0, 2, 3, 0], "D#sus2": [-1, 6, 8, 8, 8, 6],
  Esus2: [0, 2, 2, 2, 0, 0], Fsus2: [1, 3, 3, 1, 1, 1],
  "F#sus2": [2, 4, 4, 2, 2, 2], Gsus2: [3, 0, 0, 0, 0, 3],
  "G#sus2": [4, 6, 6, 4, 4, 4], Asus2: [-1, 0, 2, 2, 0, 0],
  "A#sus2": [-1, 1, 3, 3, 1, 1], Bsus2: [-1, 2, 4, 4, 2, 2],
  Csus4: [-1, 3, 3, 0, 1, 1], "C#sus4": [-1, 4, 6, 6, 6, 4],
  Dsus4: [-1, -1, 0, 2, 3, 3], "D#sus4": [-1, 6, 8, 8, 8, 6],
  Esus4: [0, 2, 2, 2, 0, 0], Fsus4: [1, 3, 3, 1, 1, 1],
  "F#sus4": [2, 4, 4, 2, 2, 2], Gsus4: [3, 3, 0, 0, 1, 3],
  "G#sus4": [4, 6, 6, 4, 4, 4], Asus4: [-1, 0, 2, 2, 3, 0],
  "A#sus4": [-1, 1, 3, 3, 4, 1], Bsus4: [-1, 2, 4, 4, 4, 2],
  Cadd9: [-1, 3, 2, 0, 3, 0], "C#add9": [-1, 4, 6, 6, 6, 4],
  Dadd9: [-1, -1, 0, 2, 0, 2], "D#add9": [-1, 6, 8, 8, 8, 6],
  Eadd9: [0, 2, 2, 1, 0, 2], Fadd9: [1, 3, 3, 2, 1, 1],
  "F#add9": [2, 4, 4, 3, 2, 2], Gadd9: [3, 2, 0, 2, 0, 3],
  "G#add9": [4, 6, 6, 5, 4, 4], Aadd9: [-1, 0, 2, 4, 2, 0],
  "A#add9": [-1, 1, 3, 5, 3, 1], Badd9: [-1, 2, 4, 6, 4, 2],
  C6: [-1, 3, 2, 2, 1, 0], "C#6": [-1, 4, 6, 6, 6, 4],
  D6: [-1, -1, 0, 2, 0, 2], "D#6": [-1, 6, 8, 8, 8, 6],
  E6: [0, 2, 2, 1, 2, 0], F6: [1, 3, 3, 2, 1, 1],
  "F#6": [2, 4, 4, 3, 2, 2], G6: [3, 2, 0, 0, 0, 0],
  "G#6": [4, 6, 6, 5, 4, 4], A6: [-1, 0, 2, 2, 2, 2],
  "A#6": [-1, 1, 3, 3, 3, 3], B6: [-1, 2, 4, 4, 4, 4],
  Cm6: [-1, 3, 5, 5, 4, 3], "C#m6": [-1, 4, 6, 6, 5, 4],
  Dm6: [-1, -1, 0, 2, 1, 1], "D#m6": [-1, 6, 8, 8, 7, 6],
  Em6: [0, 2, 2, 0, 2, 0], Fm6: [1, 3, 3, 2, 1, 1],
  "F#m6": [2, 4, 4, 2, 2, 2], Gm6: [3, 5, 5, 3, 3, 3],
  "G#m6": [4, 6, 6, 4, 4, 4], Am6: [-1, 0, 2, 2, 1, 0],
  "A#m6": [-1, 1, 3, 3, 2, 1], Bm6: [-1, 2, 4, 4, 3, 2],
  C9: [-1, 3, 2, 3, 3, 3], "C#9": [-1, 4, 6, 4, 6, 4],
  D9: [-1, 5, 4, 5, 5, 5], "D#9": [-1, 6, 8, 6, 8, 6],
  E9: [0, 2, 0, 1, 0, 2], F9: [1, 3, 1, 2, 1, 1],
  "F#9": [2, 4, 2, 3, 2, 2], G9: [3, 2, 0, 0, 0, 1],
  "G#9": [4, 6, 4, 5, 4, 4], A9: [-1, 0, 2, 0, 2, 0],
  "A#9": [-1, 1, 3, 1, 3, 1], B9: [-1, 2, 1, 2, 0, 2],
  C7sus4: [-1, 3, 3, 3, 1, 1], "C#7sus4": [-1, 4, 6, 6, 6, 4],
  D7sus4: [-1, -1, 0, 2, 1, 3], "D#7sus4": [-1, 6, 8, 8, 8, 6],
  E7sus4: [0, 2, 0, 2, 0, 0], F7sus4: [1, 3, 1, 1, 1, 1],
  "F#7sus4": [2, 4, 2, 2, 2, 2], G7sus4: [3, 3, 0, 0, 1, 1],
  "G#7sus4": [4, 6, 4, 4, 4, 4], A7sus4: [-1, 0, 2, 0, 3, 0],
  "A#7sus4": [-1, 1, 3, 1, 4, 1], B7sus4: [-1, 2, 1, 2, 0, 2],
  Cdim: [-1, 3, 4, 3, 4, 2], "C#dim": [-1, 4, 5, 4, 5, 3],
  Ddim: [-1, -1, 0, 1, 2, 1], "D#dim": [-1, 6, 7, 6, 7, 5],
  Edim: [0, 1, 2, 1, 2, 0], Fdim: [1, 2, 3, 2, 3, 1],
  "F#dim": [2, 3, 4, 3, 4, 2], Gdim: [3, 4, 5, 4, 5, 3],
  "G#dim": [4, 5, 6, 5, 6, 4], Adim: [-1, 0, 1, 0, 1, 0],
  "A#dim": [-1, 1, 2, 1, 2, 1], Bdim: [-1, 2, 3, 2, 3, 2],
  Caug: [-1, 3, 2, 1, 1, 0], "C#aug": [-1, 4, 3, 2, 2, 1],
  Daug: [-1, -1, 0, 3, 3, 2], "D#aug": [-1, 6, 5, 4, 4, 3],
  Eaug: [0, 3, 2, 1, 1, 0], Faug: [1, 4, 3, 2, 2, 1],
  "F#aug": [2, 5, 4, 3, 3, 2], Gaug: [3, 2, 1, 0, 0, 3],
  "G#aug": [4, 3, 2, 1, 1, 4], Aaug: [-1, 0, 3, 2, 2, 1],
  "A#aug": [-1, 1, 4, 3, 3, 2], Baug: [-1, 2, 5, 4, 4, 3],
  C5: [-1, 3, 5, 5, -1, -1], "C#5": [-1, 4, 6, 6, -1, -1],
  D5: [-1, -1, 0, 2, 3, -1], "D#5": [-1, 6, 8, 8, -1, -1],
  E5: [0, 2, 2, -1, -1, -1], F5: [1, 3, 3, -1, -1, -1],
  "F#5": [2, 4, 4, -1, -1, -1], G5: [3, 5, 5, -1, -1, -1],
  "G#5": [4, 6, 6, -1, -1, -1], A5: [-1, 0, 2, 2, -1, -1],
  "A#5": [-1, 1, 3, 3, -1, -1], B5: [-1, 2, 4, 4, -1, -1],
  D4: [-1, -1, 0, 2, 3, 3], "A7(4)": [-1, 0, 2, 0, 3, 0],
  "G/B": [-1, 2, 0, 0, 0, 3], "D/F#": [2, -1, 0, 2, 3, 2],
  "C/E": [0, 3, 2, 0, 1, 0], "A/E": [0, 0, 2, 2, 2, 0],
  "Em/G": [3, 2, 2, 0, 0, 0], "C/G": [3, 3, 2, 0, 1, 0],
  "Am/G": [3, 0, 2, 2, 1, 0], "Fm/C": [-1, 3, 3, 1, 1, 1],
};

function getChordShape(chord: string): number[] | undefined {
  const exact = CHORD_SHAPES[chord];
  if (exact) return exact;
  const upper = CHORD_SHAPES[chord.charAt(0).toUpperCase() + chord.slice(1)];
  if (upper) return upper;
  const rootMatch = chord.match(/^([A-G](?:#|b)?)/);
  if (rootMatch) {
    const root = rootMatch[1];
    const rootUpper = root.charAt(0).toUpperCase() + root.slice(1);
    const base = CHORD_SHAPES[rootUpper] || CHORD_SHAPES[root];
    if (base) return base;
  }
  return CHORD_SHAPES["C"];
}

function ChordDiagram({ chord }: { chord: string }) {
  const shape = getChordShape(chord)!;
  const positions = shape.slice(0, 6);
  const frets = positions.filter((p) => p > 0);
  const baseFret = frets.length ? Math.min(...frets) : 1;
  const stringXs = [22, 36, 50, 64, 78, 92];
  const topY = 34;
  const fretGap = 26;
  const woodX = 16;
  const woodW = 82;
  const woodY = 26;
  const woodH = 112;
  const gradId =
    "neckWood-" + chord.replace(/[^a-zA-Z0-9]/g, "") + "-" + ChordDiagram.__counter++;
  return (
    <svg width="120" height="160" viewBox="0 0 120 160" className="mx-auto">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A06A35" />
          <stop offset="50%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#6B421F" />
        </linearGradient>
      </defs>
      <rect x={woodX} y={woodY} width={woodW} height={woodH} rx="8" fill={"url(#" + gradId + ")"} />
      {[2, 4].map((fret) => (
        <circle key={fret} cx={57} cy={topY + fret * fretGap} r="4" fill="#4A2E14" opacity="0.5" />
      ))}
      {[0, 1, 2, 3, 4].map((f) => (
        <line
          key={f}
          x1={woodX + 2}
          y1={topY + fretGap * f}
          x2={woodX + woodW - 2}
          y2={topY + fretGap * f}
          stroke={f === 0 ? "#F2DCA8" : "#D4B183"}
          strokeWidth={f === 0 ? 6 : 1.2}
        />
      ))}
      {baseFret > 1 && (
        <text x={10} y={topY + fretGap / 2 + 4} fontSize="11" fill="#E8B84B" fontWeight="bold">
          {baseFret}
        </text>
      )}
      {stringXs.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={topY}
          x2={x}
          y2={topY + fretGap * 4}
          stroke="#EAD9BC"
          strokeWidth={i === 5 ? 2 : 1.4}
          opacity="0.9"
        />
      ))}
      {positions.map((pos, i) => {
        const x = stringXs[i];
        if (pos === 0) {
          return (
            <text key={i} x={x} y={topY - 10} fontSize="13" textAnchor="middle" fill="#F5EFE0">
              ○
            </text>
          );
        }
        if (pos < 0) {
          return (
            <text key={i} x={x} y={topY - 10} fontSize="13" textAnchor="middle" fill="#F5EFE0">
              ×
            </text>
          );
        }
        const y = topY + (pos - baseFret) * fretGap + fretGap / 2;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="7" fill="#E8B84B" stroke="#3A2413" strokeWidth="1.5" />
            <circle cx={x - 2.2} cy={y - 2.2} r="2.4" fill="#FCE3A0" opacity="0.85" />
          </g>
        );
      })}
      <text x="60" y="154" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#E8B84B">
        {chord}
      </text>
    </svg>
  );
}
ChordDiagram.__counter = 0;

type TabSection = { title: string; lines: string[] };

function splitIntoSections(text: string): TabSection[] {
  const lines = text.split("\n");
  const sections: TabSection[] = [];
  let current: TabSection | null = null;
  for (const line of lines) {
    const m = line.trim().match(/^\[([^\]]+)\]$/);
    if (m) {
      current = { title: m[1].trim(), lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      current = { title: "Intro", lines: [] };
      sections.push(current);
      current.lines.push(line);
    }
  }
  return sections;
}

function splitTabIntoSections(tab: string): TabSection[] {
  const lines = tab.split("\n");
  const sections: TabSection[] = [];
  let current: TabSection | null = null;
  const markerRe =
    /^\s*(?:_\s*)?(intro|verse|pre[- ]?chorus|chorus|bridge|solo|outro|riff|fill|final|ending|parte|part|guitar|rhythm|lead|base|verse solo|solo fill|chorus fill|rhythm fill)(?:\s+(?:part|fill|solo|riff)?\s*\d*)?\s*:?\s*_?\s*$/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (markerRe.test(trimmed) && trimmed.length <= 60) {
      current = { title: trimmed.replace(/[:=\-_]+$/g, "").trim(), lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      current = { title: "Tab", lines: [] };
      sections.push(current);
      current.lines.push(line);
    }
  }
  return sections;
}

function normalizeSection(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function sectionType(s: string): string {
  const n = normalizeSection(s);
  const types = ["intro", "verse", "prechorus", "chorus", "bridge", "solo", "outro", "riff", "fill", "final", "ending"];
  for (const t of types) {
    if (n.includes(t)) return t;
  }
  return "";
}

function sectionNumber(s: string): number {
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function pickTabSection(contentTitle: string, tabSections: TabSection[], used: Set<number>) {
  const norm = normalizeSection(contentTitle);
  const cType = sectionType(contentTitle);
  const cNum = sectionNumber(contentTitle);

  let bestIdx = -1;
  let bestScore = 0;

  tabSections.forEach((s, i) => {
    if (used.has(i)) return;
    const sn = normalizeSection(s.title);
    const sType = sectionType(s.title);
    const sNum = sectionNumber(s.title);

    let score = 0;
    if (norm === sn) score = 100;
    else if (cType && cType === sType && cNum === sNum && cNum > 0) score = 90;
    else if (cType && cType === sType) score = 70;
    else if (cType && sType && (cType.includes(sType) || sType.includes(cType))) score = 60;
    else if (cType && sType) {
      const kws = ["intro", "verse", "prechorus", "chorus", "bridge", "solo", "outro", "riff", "fill", "final", "ending"];
      for (const k of kws) {
        if (norm.includes(k) || sn.includes(k)) {
          const a = norm.replace(k, "").trim().slice(0, 4);
          const b = sn.replace(k, "").trim().slice(0, 4);
          if (a === b && a !== "") score = 30;
          break;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });

  return bestScore >= 30 ? bestIdx : -1;
}

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transpose, setTranspose] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("1.0");
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [showTabs, setShowTabs] = useState(true);

  useEffect(() => {
    async function fetchTab() {
      const { data } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .eq("slug_song", params.song)
        .single();
      setTab(data);
      setLoading(false);
    }
    fetchTab();
  }, [params.artist, params.song]);

  useEffect(() => {
    if (!tab) return;
    if (tab.video_id) {
      setVideoId(tab.video_id);
      setVideoLoading(false);
      return;
    }
    setVideoLoading(true);
    const query = tab.song + " " + tab.artist;
    fetch("/api/youtube-search?q=" + encodeURIComponent(query))
      .then((r) => r.json())
      .then((data) => {
        setVideoId(data.videoId || null);
        setVideoLoading(false);
      })
      .catch(() => {
        setVideoId(null);
        setVideoLoading(false);
      });
  }, [tab]);

  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      window.scrollBy({ top: scrollSpeed * 2, behavior: "smooth" });
    }, 300);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  if (loading) return <p className="text-center py-20 text-brand-muted">Loading tab...</p>;
  if (!tab) return <p className="text-center py-20 text-brand-muted">Tab not found.</p>;

  const transposedContent = transposeContent(tab.content, transpose);
  const chords = extractChords(transposedContent);
  const tablature = tab.tablature || tab.tab || tab.tab_content || "";

  const splitRe = new RegExp(String.raw`(\b${CHORD_PATTERN}\b)`, "gi");
  const testRe = new RegExp(String.raw`^\b${CHORD_PATTERN}\b$`, "i");
  const isTabLineRegex = /^\s*[eEBGDA]{1,2}\|/;

  const renderLine = (line: string, key: string, isTabLine: boolean) => {
    if (isTabLine) {
      return (
        <div key={key} className="tab-line">
          {line || "\u00A0"}
        </div>
      );
    }
    const parts = line.split(splitRe);
    return (
      <div key={key}>
        {parts.map((part, i) => {
          if (testRe.test(part)) {
            return (
              <span
                key={key + "-p" + i}
                className="relative inline-block group"
                onClick={() => setSelectedChord(part)}
              >
                <span className="chord">{part}</span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[60] bg-brand-card border border-brand-gold/40 rounded-xl p-2 shadow-2xl w-48 pointer-events-none">
                  <ChordDiagram chord={part} />
                  <span className="block text-center text-[10px] text-brand-muted">Click to enlarge</span>
                </span>
              </span>
            );
          }
          return <span key={key + "-p" + i}>{part}</span>;
        })}
      </div>
    );
  };

  const renderContent = (text: string) => {
    const sections = splitIntoSections(text);
    const tabSections = tablature ? splitTabIntoSections(tablature) : [];
    const usedTab = new Set<number>();
    const nodes: ReactNode[] = [];
    const unmatched: TabSection[] = [];

    sections.forEach((sec, secIdx) => {
      nodes.push(
        <div key={"h-" + secIdx} className="mt-4 mb-1 font-bold text-brand-gold">
          [{sec.title}]
        </div>
      );
      sec.lines.forEach((line, li) => {
        const isTabLine = isTabLineRegex.test(line.trim()) || /^\s*[1-6]\|/.test(line.trim());
        if (isTabLine && !showTabs) return;
        nodes.push(renderLine(line, "l-" + secIdx + "-" + li, isTabLine));
      });
      if (showTabs && tabSections.length) {
        const idx = pickTabSection(sec.title, tabSections, usedTab);
        if (idx >= 0) {
          usedTab.add(idx);
          const ts = tabSections[idx];
          ts.lines.forEach((line, li) => {
            nodes.push(renderLine(line, "t-" + secIdx + "-" + idx + "-" + li, true));
          });
        }
      }
    });

    tabSections.forEach((ts, i) => {
      if (!usedTab.has(i)) unmatched.push(ts);
    });
    if (showTabs && unmatched.length) {
      nodes.push(
        <div key="unmatched-h" className="mt-6 mb-1 font-bold text-brand-muted">
          Tablatura
        </div>
      );
      unmatched.forEach((ts, u) => {
        ts.lines.forEach((line, li) => {
          nodes.push(renderLine(line, "u-" + u + "-" + li, true));
        });
      });
    }
    return nodes;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-white">Home</Link></li>
          <li>/</li>
          <li><Link href="/browse" className="hover:text-white">Browse</Link></li>
          <li>/</li>
          <li><Link href={"/artist/" + tab.slug_artist} className="hover:text-white capitalize">{tab.artist}</Link></li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold capitalize">{tab.song}</h1>
            {tab.is_verified && (
              <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim">
                <BadgeCheck size={14} /> VERIFIED
              </div>
            )}
          </div>
          <Link
            href={"/artist/" + tab.slug_artist}
            className="text-xl text-brand-muted capitalize hover:text-brand-gold transition-colors"
          >
            {tab.artist}
          </Link>
          <div className="flex gap-4 pt-2">
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Key: <strong>{transpose !== 0 ? transposeChord(tab.key_sig || "C", transpose) : tab.key_sig}</strong>
            </span>
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Difficulty: <strong className="text-green-400">{tab.difficulty}</strong>
            </span>
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Version: <strong>{version}</strong>
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" aria-label="Bookmark"><Bookmark size={20} /></button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" aria-label="Share"><Share2 size={20} /></button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition">
            <Play size={18} /> Play
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="h-6 w-px bg-white/10" />
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition " + (autoScroll ? "bg-green-500 text-black shadow-lg shadow-green-500/30" : "bg-white/5 hover:bg-white/10")}
        >
          <MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => setShowTabs(!showTabs)}
          className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition " + (showTabs ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}
        >
          <ChevronDown size={16} /> Tablatura {showTabs ? "ON" : "OFF"}
        </button>
        {autoScroll && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-muted">Speed</span>
            <input
              type="range" min={1} max={10} value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-28 accent-brand-gold"
            />
            <span className="text-brand-gold">{scrollSpeed}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="cifra-content bg-brand-card rounded-2xl p-8 border border-white/5">
            {renderContent(transposedContent)}
          </div>

          <div className="bg-brand-card rounded-2xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-2">Chords used in this tab</h3>
            <p className="text-sm text-brand-muted mb-6">
              Hover over a chord in the tab, or view them all below:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {chords.map((chord) => (
                <div
                  key={chord}
                  className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-brand-gold/40 transition cursor-pointer"
                  onClick={() => setSelectedChord(chord)}
                >
                  <ChordDiagram chord={chord} />
                </div>
              ))}
            </div>
            {chords.length === 0 && (
              <p className="text-brand-muted text-sm">
                No chords identified automatically. Check that the tab uses the standard format (e.g. Em7, G, D4).
              </p>
            )}
          </div>

          <details className="bg-brand-card rounded-xl p-4 border border-white/5">
            <summary className="flex items-center gap-2 cursor-pointer font-semibold">
              <ChevronDown size={16} /> Other versions
            </summary>
            <p className="text-sm text-brand-muted mt-3">Version 1.0 (main)</p>
          </details>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-brand-card rounded-2xl p-4 border border-white/5">
            <h3 className="flex items-center gap-2 font-bold mb-3">
              <Youtube size={18} className="text-red-500" /> {tab.song} - {tab.artist}
            </h3>
            {videoId ? (
              <div>
                <iframe
                  src={"https://www.youtube.com/embed/" + videoId}
                  title={tab.song + " - " + tab.artist}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full aspect-video rounded-xl border border-white/5"
                />
                <a
                  href={"https://www.youtube.com/watch?v=" + videoId}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-3 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition text-sm"
                >
                  <ExternalLink size={16} /> Watch on YouTube
                </a>
                <p className="text-xs text-brand-muted mt-2">
                  We automatically picked a video that allows embedding on this site.
                </p>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
                <p className="text-sm text-brand-muted px-4 text-center">
                  {videoLoading ? "Searching for an embeddable video..." : "No embeddable video found on YouTube."}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {selectedChord && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedChord(null)}
        >
          <div
            className="bg-brand-card border border-brand-gold/40 rounded-2xl p-6 shadow-2xl max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Chord {selectedChord}</h3>
              <button
                onClick={() => setSelectedChord(null)}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <ChordDiagram chord={selectedChord} />
            <p className="text-center text-xs text-brand-muted mt-2">Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
