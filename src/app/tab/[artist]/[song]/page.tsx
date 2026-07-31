"use client";
import { useState, useEffect, useRef } from "react";
import ChordHover from "@/components/ChordHover";
import ChordGallery from "@/components/ChordGallery";
import { BadgeCheck, Bookmark, Share2, Play, Pause, ChevronDown, Plus, Minus, ChevronUp } from "lucide-react";
import Link from "next/link";

const chordsUsed = ["Em7", "G", "D4", "A7(4)", "C9", "D", "D11/F#", "Em"];

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
    const transposed = transposeChord(match[1], semitones);
    parts.push({ text: transposed, isChord: true });
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

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [semitones, setSemitones] = useState(0);
  const [showFloating, setShowFloating] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cifraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, scrollSpeed * 0.4);
      }, 30);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [autoScroll, scrollSpeed]);

  // Detect scroll position to show/hide floating button
  useEffect(() => {
    const handleScroll = () => {
      if (cifraRef.current) {
        const rect = cifraRef.current.getBoundingClientRect();
        setShowFloating(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const speedLabel =
    scrollSpeed <= 3 ? "Slow" :
    scrollSpeed <= 6 ? "Normal" :
    scrollSpeed <= 8 ? "Fast" : "Very Fast";

  const cifraContent = `[Intro] **Em7**  **G**  **D4**  **A7(4)**
        **Em7**  **G**  **D4**  **A7(4)**

[Primeira Parte]

 **Em7**           **G**
    Today is gonna be the day
             **D4**
That they're gonna
                  **A7(4)**
Throw it back to you
 **Em7**              **G**
    By now you should've somehow
   **D4**                   **A7(4)**
Realized what you gotta do
 **Em7**                  **G**
I don't believe that anybody
 **D4**              **A7(4)**
Feels the way I do
           **C9**  **D4**  **A7(4)**
About you now

[Refrão]

         **C9**   **Em7**  **G**
Because maybe
        **Em7**
You're gonna be the one
      **C9**      **Em7**  **G**
That saves me
   **Em7**   **C9**  **Em7**  **G**
And after all
           **Em7**   **C9**  **Em7**  **G**  **Em7**  **A7(4)**
You're my wonderwall`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
          <li>/</li>
          <li>
            <Link href={`/artist/${params.artist}`} className="hover:text-white transition-colors capitalize">
              {params.artist.replace(/-/g, " ")}
            </Link>
          </li>
          <li>/</li>
          <li className="text-white/60 capitalize">{params.song.replace(/-/g, " ")}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b border-white/[0.06]">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-display font-bold capitalize">
              {params.song.replace(/-/g, " ")}
            </h1>
            <span className="flex items-center gap-1 bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full text-xs font-bold">
              <BadgeCheck size={14} /> VERIFIED
            </span>
          </div>
          <p className="text-lg text-brand-muted capitalize">{params.artist.replace(/-/g, " ")}</p>
          <div className="flex gap-3 text-sm flex-wrap">
            <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">Key: <strong>F#m</strong></span>
            <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">Difficulty: <strong className="text-green-400">Beginner</strong></span>
            <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">Capo: <strong>2ª casa</strong></span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white/[0.06] rounded-xl hover:bg-white/10 transition-colors">
            <Bookmark size={18} />
          </button>
          <button className="p-3 bg-white/[0.06] rounded-xl hover:bg-white/10 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#1A1A1A] rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
        {/* Transpose */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-brand-muted">Tom:</span>
            <span className="text-sm font-bold text-brand-accent">F#m</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSemitones(Math.max(-5, semitones - 1))}
              className="p-2 bg-white/[0.06] rounded-lg hover:bg-white/10 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold min-w-[60px] text-center">
              {semitones === 0 ? "Original" : `${semitones > 0 ? "+" : ""}${semitones} half`}
            </span>
            <button
              onClick={() => setSemitones(Math.min(5, semitones + 1))}
              className="p-2 bg-white/[0.06] rounded-lg hover:bg-white/10 transition-colors"
            >
              <Plus size={16} />
            </button>
            {semitones !== 0 && (
              <button onClick={() => setSemitones(0)} className="text-xs text-brand-accent hover:underline ml-2">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Auto Scroll */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                autoScroll
                  ? "bg-brand-accent text-black"
                  : "bg-white/[0.06] text-brand-muted hover:bg-white/10"
              }`}
            >
              {autoScroll ? <Pause size={16} /> : <Play size={16} />}
              {autoScroll ? "Pause" : "Auto Scroll"}
            </button>
            <span className="text-xs text-brand-muted px-2 py-1 bg-white/[0.04] rounded-lg font-medium">
              {speedLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <span className="text-xs text-brand-muted shrink-0">Slow</span>
            <input
              type="range"
              min="1"
              max="10"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-white/[0.1] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-brand-accent
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-125"
            />
            <span className="text-xs text-brand-muted shrink-0">Fast</span>
          </div>
        </div>
      </div>

      {/* Cifra Content */}
      <div ref={cifraRef} className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-white/[0.06]">
        <div className="cifra-content text-brand-text/90 leading-relaxed space-y-4">
          {cifraContent.split("\n").map((line, i) => {
            if (line.startsWith("[") && line.endsWith("]")) {
              return (
                <p key={i} className="text-sm font-bold text-brand-accent uppercase tracking-wider mt-6 mb-3">
                  {line}
                </p>
              );
            }
            if (line.trim() === "") return <div key={i} className="h-2" />;
            return <div key={i}>{renderChordLine(line, semitones)}</div>;
          })}
        </div>
      </div>

      {/* Chord Gallery */}
      <ChordGallery chords={chordsUsed} />

      {/* Floating Auto Scroll Button (mobile friendly) */}
      {showFloating && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {autoScroll && (
            <div className="bg-[#1A1A1A] border border-white/[0.06] rounded-xl p-3 shadow-xl flex items-center gap-3">
              <span className="text-xs text-brand-muted">{speedLabel}</span>
              <input
                type="range"
                min="1"
                max="10"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-20 h-1.5 bg-white/[0.1] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-brand-accent"
              />
            </div>
          )}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-4 rounded-full shadow-xl transition-all duration-200 ${
              autoScroll
                ? "bg-brand-accent text-black hover:brightness-110"
                : "bg-[#1A1A1A] text-brand-muted hover:bg-white/10 border border-white/[0.06]"
            }`}
          >
            {autoScroll ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      )}

      {/* Scroll to top button */}
      {showFloating && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 p-3 bg-[#1A1A1A] border border-white/[0.06] rounded-full shadow-xl hover:bg-white/10 transition-colors"
        >
          <ChevronUp size={18} className="text-brand-muted" />
        </button>
      )}
    </div>
  );
}
