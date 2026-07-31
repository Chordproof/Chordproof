"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import ChordHover from "@/components/ChordHover";
import ChordGallery from "@/components/ChordGallery";
import { BadgeCheck, Bookmark, Share2, Play, Pause, Plus, Minus, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import { recordAction } from "@/lib/gamification";

interface TabRow {
  id: string;
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  is_verified: boolean;
  key_sig: string;
  capo: string | null;
  content: string;
}

const transposeMap: Record<string, string> = {
  "C": "C#", "C#": "D", "D": "D#", "D#": "E", "E": "F",
  "F": "F#", "F#": "G", "G": "G#", "G#": "A", "A": "A#",
  "A#": "B", "B": "C", "Cm": "C#m", "C#m": "Dm", "Dm": "D#m",
  "D#m": "Em", "Em": "Fm", "Fm": "F#m", "F#m": "Gm", "Gm": "G#m",
  "G#m": "Am", "Am": "A#m", "A#m": "Bm", "Bm": "Cm",
  "Em7": "Fm7", "Fm7": "F#m7", "F#m7": "Gm7", "Gm7": "G#m7",
  "G#m7": "Am7", "Am7": "A#m7", "A#m7": "Bm7", "Bm7": "Cm7",
  "Cm7": "C#m7", "C#m7": "Dm7", "Dm7": "D#m7", "D#m7": "Em7",
  "D4": "D#4", "D#4": "E4", "E4": "F4", "F4": "F#4", "F#4": "G4",
  "G4": "G#4", "G#4": "A4", "A4": "A#4", "A#4": "B4", "B4": "C4",
  "C4": "C#4", "C#4": "D4",
  "A7(4)": "A#7(4)", "A#7(4)": "B7(4)", "B7(4)": "C7(4)", "C7(4)": "C#7(4)",
  "C#7(4)": "D7(4)", "D7(4)": "D#7(4)", "D#7(4)": "E7(4)", "E7(4)": "F7(4)",
  "F7(4)": "F#7(4)", "F#7(4)": "G7(4)", "G7(4)": "G#7(4)", "G#7(4)": "A7(4)",
  "C9": "C#9", "C#9": "D9", "D9": "D#9", "D#9": "E9", "E9": "F9",
  "F9": "F#9", "F#9": "G9", "G9": "G#9", "G#9": "A9", "A9": "A#9",
  "A#9": "B9", "B9": "C9",
  "D11/F#": "D#11/G", "D#11/G": "E11/G#", "E11/G#": "F11/A",
  "F11/A": "F#11/A#", "F#11/A#": "G11/B", "G11/B": "G#11/C",
  "G#11/C": "A11/C#", "A11/C#": "A#11/D", "A#11/D": "B11/D#",
  "B11/D#": "C11/E", "C11/E": "C#11/F", "C#11/F": "D11/F#",
  "E7": "F7", "F7": "F#7", "F#7": "G7", "G7": "G#7",
  "G#7": "A7", "A7": "A#7", "A#7": "B7", "B7": "C7",
  "C7": "C#7", "C#7": "D7", "D7": "D#7", "D#7": "E7",
  "Ab": "A", "Bb": "B", "Db": "D", "Eb": "E", "Gb": "G",
};

function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  let result = chord;
  for (let i = 0; i < Math.abs(semitones); i++) {
    result = transposeMap[result] || result;
  }
  return result;
}

function renderChordLine(line: string, semitones: number) {
  const chordRegex = /\*\*([^*]+)\*\*/g;
  const parts: { text: string; isChord: boolean }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), isChord: false });
    }
    parts.push({ text: transposeChord(match[1], semitones), isChord: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), isChord: false });
  }

  return (
    <p className="mb-1 leading-relaxed">
      {parts.map((part, i) =>
        part.isChord ? (
          <ChordHover key={i} chord={part.text}>
            {part.text}
          </ChordHover>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
}

export default function TabDetail({ params }: { params: { artist:
