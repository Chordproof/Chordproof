"use client";
import { useEffect, useState } from "react";
import TransposeControls from "@/components/TransposeControls";
import {
  BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
};
const CHORD_TOKEN_RE = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|5|6|7|9|11|13|4|2)*\d*)/g;
const CHORD_STRICT_RE = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|5|6|7|9|11|13|4|2)*\d*$/;

function transposeChord(chord: string, steps: number): string {
  if (!steps) return chord;
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  const root = FLAT_TO_SHARP[match[1]] || match[1];
  const suffix = match[2];
  let idx = CHROMATIC.indexOf(root);
  if (idx === -1) return chord;
  idx = (idx + steps + 12) % 12;
  return CHROMATIC[idx] + suffix;
}

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tabs")
        .select("song, artist, slug_artist, slug_song, key_sig, difficulty, is_verified, content")
        .eq("slug_artist", params.artist)
        .eq("slug_song", params.song)
        .maybeSingle();
      if (!active) return;
      if (error || !data) setNotFound(true);
      else setTab(data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [params.artist, params.song]);

  function renderLine(line: string, key: number) {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    const allChords = tokens.length > 0 && tokens.every((t) => CHORD_STRICT_RE.test(t));
    if (!allChords) {
      return <div key={key}>{line || "\u00A0"}</div>;
    }
    const nodes: React.ReactNode[] = [];
    let last = 0;
    let n = 0;
    const re = new RegExp(CHORD_TOKEN_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      const token = m[1];
      nodes.push(line.slice(last, m.index));
      nodes.push(<span key={n++} className="chord">{transposeChord(token, transpose)}</span>);
      last = m.index + token.length;
    }
    nodes.push(line.slice(last));
    return <div key={key}>{nodes}</div>;
  }

  function chordsUsed(content: string): string[] {
    const seen: string[] = [];
    for (const line of content.split("\n")) {
      const tokens = line.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0 && tokens.every((t) => CHORD_STRICT_RE.test(t))) {
        for (const t of tokens) {
          const transposed = transposeChord(t, transpose);
          if (!seen.includes(transposed)) seen.push(transposed);
        }
      }
    }
    return seen;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-brand-muted">
        <Loader2 className="animate-spin mr-3" /> Loading tab...
      </div>
    );
  }

  if (notFound || !tab) {
    return (
      <div className="text-center py-32 space-y-4">
        <h1 className="text-3xl font-bold">Tab not found</h1>
        <p className="text-brand-muted">This tab isn't in our database yet.</p>
        <a
          href="/request"
          className="inline-block bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
        >
          Request this tab
        </a>
      </div>
    );
  }

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-white">Home</a></li>
          <li>/</li>
          <li><a href="/browse" className="hover:text-white">Browse</a></li>
          <li>/</li>
          <li>
            <a href={`/artist/${params.artist}`} className="hover:text-white capitalize">
              {artistName}
            </a>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && (
              <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim">
                <BadgeCheck size={14} /> VERIFIED
              </div>
            )}
          </div>
          <p className="text-xl text-brand-muted">{artistName}</p>
          <div className="flex gap-4 pt-2">
            {tab.key_sig && (
              <span className="bg-white/5 px-3 py-1 rounded text-sm">
                Key: <strong>{tab.key_sig}</strong>
              </span>
            )}
            {tab.difficulty && (
              <span className="bg-white/5 px-3 py-1 rounded text-sm">
                Difficulty: <strong className="text-green-400">{tab.difficulty}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10"><Bookmark size={20} /></button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10"><Share2 size={20} /></button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition">
            <Play size={18} /> Play
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-2xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <MousePointer2 size={16} /> Auto-scroll
          </button>
          {autoScroll && (
            <input
              type="range"
              min={1}
              max={10}
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-32"
            />
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-brand-card rounded-2xl p-8 border border-white/5">
        <div className="cifra-content whitespace-pre-wrap">
          {(tab.content || "").split("\n").map((line: string, i: number) => renderLine(line, i))}
        </div>
      </div>

      {/* Chords Used */}
      {chordsUsed(tab.content || "").length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Chords used in this tab</h2>
          <p className="text-sm text-brand-muted">Hover over a chord in the tab to see its shape.</p>
          <div className="flex flex-wrap gap-2">
            {chordsUsed(tab.content || "").map((c) => (
              <span key={c} className="chord px-4 py-2 bg-white/5 rounded-lg">
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Report */}
      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <AlertTriangle size={16} className="text-brand-gold" />
        <span>Found an error? </span>
        <button className="text-brand-gold hover:underline">Report this tab</button>
      </div>
    </div>
  );
}
