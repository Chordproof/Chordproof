"use client";
import { useEffect, useState, type ReactNode } from "react";
import TransposeControls from "@/components/TransposeControls";
import {
  BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2,
  Loader2, ChevronDown, Youtube, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const SHARP = "\x23";

const CHROMATIC = [
  "C", "C" + SHARP, "D", "D" + SHARP, "E", "F",
  "F" + SHARP, "G", "G" + SHARP, "A", "A" + SHARP, "B",
];

const FLAT_TO_SHARP: Record<string, string> = {};
FLAT_TO_SHARP["Db"] = "C" + SHARP;
FLAT_TO_SHARP["Eb"] = "D" + SHARP;
FLAT_TO_SHARP["Gb"] = "F" + SHARP;
FLAT_TO_SHARP["Ab"] = "G" + SHARP;
FLAT_TO_SHARP["Bb"] = "A" + SHARP;

const CHORD_TOKEN_RE = new RegExp(
  "([A-G][" + SHARP + "b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2)*\d*)",
  "g"
);
const CHORD_STRICT_RE = new RegExp(
  "^[A-G][" + SHARP + "b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2)*\d*$"
);
const TAB_LINE_RE = /[\d\-|]{4,}/;

const CHORD_SHAPES: Record<string, number[]> = {};
CHORD_SHAPES["E"] = [0, 2, 2, 1, 0, 0];
CHORD_SHAPES["Em"] = [0, 2, 2, 0, 0, 0];
CHORD_SHAPES["A"] = [-1, 0, 2, 2, 2, 0];
CHORD_SHAPES["Am"] = [-1, 0, 2, 2, 1, 0];
CHORD_SHAPES["D"] = [-1, -1, 0, 2, 3, 2];
CHORD_SHAPES["Dm"] = [-1, -1, 0, 2, 3, 1];
CHORD_SHAPES["C"] = [-1, 3, 2, 0, 1, 0];
CHORD_SHAPES["G"] = [3, 2, 0, 0, 0, 3];
CHORD_SHAPES["F"] = [1, 3, 3, 2, 1, 1];
CHORD_SHAPES["E5"] = [0, 2, 2, -1, -1, -1];
CHORD_SHAPES["A5"] = [-1, 0, 2, 2, -1, -1];
CHORD_SHAPES["D5"] = [-1, -1, 0, 2, 3, -1];
CHORD_SHAPES["G5"] = [3, 5, 5, -1, -1, -1];
CHORD_SHAPES["B5"] = [-1, 2, 4, 4, -1, -1];
CHORD_SHAPES["C5"] = [-1, 3, 5, 5, -1, -1];
CHORD_SHAPES["F5"] = [-1, -1, -1, 2, 3, 1];
CHORD_SHAPES["Bm"] = [-1, 2, 4, 4, 3, 2];
CHORD_SHAPES["F" + SHARP + "m"] = [2, 4, 4, 2, 2, 2];
CHORD_SHAPES["C" + SHARP + "m"] = [-1, 4, 6, 6, 5, 4];
CHORD_SHAPES["G" + SHARP + "m"] = [-1, 4, 6, 6, 4, 4];
CHORD_SHAPES["D" + SHARP + "m"] = [-1, -1, 0, 2, 3, 1];
CHORD_SHAPES["A" + SHARP + "m"] = [-1, 1, 3, 3, 2, 1];
CHORD_SHAPES["B"] = [-1, 2, 4, 4, 4, 2];
CHORD_SHAPES["F" + SHARP] = [2, 4, 4, 3, 2, 2];
CHORD_SHAPES["C" + SHARP] = [-1, 4, 6, 6, 6, 4];
CHORD_SHAPES["G" + SHARP] = [4, 6, 6, 5, 4, 4];
CHORD_SHAPES["D" + SHARP] = [-1, -1, 0, 2, 3, -1];
CHORD_SHAPES["A" + SHARP] = [-1, 1, 3, 3, 3, 1];
CHORD_SHAPES["Bb"] = [-1, 1, 3, 3, 3, 1];
CHORD_SHAPES["Eb"] = [-1, -1, 0, 2, 3, -1];
CHORD_SHAPES["Ab"] = [4, 6, 6, 5, 4, 4];
CHORD_SHAPES["Db"] = [-1, -1, 4, 4, 4, 2];
CHORD_SHAPES["Gb"] = [2, 2, 3, 4, 4, 2];
CHORD_SHAPES["B7"] = [-1, 2, 1, 2, 0, 2];
CHORD_SHAPES["D7"] = [-1, -1, 0, 2, 1, 2];
CHORD_SHAPES["A7"] = [-1, 0, 2, 0, 2, 0];
CHORD_SHAPES["E7"] = [0, 2, 0, 1, 0, 0];
CHORD_SHAPES["G7"] = [3, 2, 0, 0, 0, 1];
CHORD_SHAPES["C7"] = [-1, 3, 2, 3, 1, 0];
CHORD_SHAPES["Am7"] = [-1, 0, 2, 0, 1, 0];
CHORD_SHAPES["Em7"] = [0, 2, 0, 0, 0, 0];
CHORD_SHAPES["Dm7"] = [-1, -1, 0, 2, 1, 1];
CHORD_SHAPES["Bm7"] = [-1, 2, 0, 2, 0, 2];
CHORD_SHAPES["Cmaj7"] = [-1, 3, 2, 0, 0, 0];
CHORD_SHAPES["Fmaj7"] = [-1, -1, 3, 2, 1, 0];
CHORD_SHAPES["Gmaj7"] = [3, 2, 0, 0, 0, 2];
CHORD_SHAPES["Dmaj7"] = [-1, -1, 0, 2, 2, 2];
CHORD_SHAPES["Amaj7"] = [-1, 0, 2, 1, 2, 0];
CHORD_SHAPES["Emaj7"] = [0, 2, 1, 1, 0, 0];
CHORD_SHAPES["Csus4"] = [-1, 3, 3, 0, 1, 0];
CHORD_SHAPES["Dsus4"] = [-1, -1, 0, 2, 3, 3];
CHORD_SHAPES["Asus4"] = [-1, 0, 2, 2, 3, 0];
CHORD_SHAPES["Esus4"] = [0, 2, 2, 2, 0, 0];
CHORD_SHAPES["Gsus4"] = [3, 3, 0, 0, 1, 3];
CHORD_SHAPES["Cadd9"] = [-1, 3, 2, 0, 3, 0];
CHORD_SHAPES["Dadd9"] = [-1, -1, 0, 2, 3, 0];
CHORD_SHAPES["Gadd9"] = [3, 0, 0, 0, 1, 3];
CHORD_SHAPES["Aadd9"] = [-1, 0, 2, 4, 2, 0];
CHORD_SHAPES["D9"] = [-1, -1, 0, 2, 1, 2];
CHORD_SHAPES["E9"] = [0, 2, 0, 1, 2, 0];
CHORD_SHAPES["A9"] = [-1, 0, 2, 4, 2, 0];

function transposeChord(chord: string, steps: number): string {
  if (!steps) return chord;
  const re = new RegExp("^([A-G][" + SHARP + "b]?)(.*)$");
  const match = chord.match(re);
  if (!match) return chord;
  const root = FLAT_TO_SHARP[match[1]] || match[1];
  let idx = CHROMATIC.indexOf(root);
  if (idx === -1) return chord;
  idx = (idx + steps + 12) % 12;
  return CHROMATIC[idx] + match[2];
}

function MiniChordDiagram({ chord }: { chord: string }) {
  const shape = CHORD_SHAPES[chord];
  if (!shape) {
    return (
      <div className="mini-chord">
        <div className="mini-chord-name">{chord}</div>
        <div style={{ textAlign: "center", fontSize: "10px", color: "#9E9E9E", padding: "8px 0" }}>N/A</div>
      </div>
    );
  }
  const posFrets = shape.filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];

  return (
    <div className="mini-chord">
      <div className="mini-chord-name">{chord}</div>
      <div className="mini-chord-markers">
        {shape.map((f: number, i: number) => (
          <div key={i} className="mini-marker">
            {f === -1 ? "x" : f === 0 ? "o" : ""}
          </div>
        ))}
      </div>
      <div className="mini-chord-frets">
        {frets.map((fret: number) => (
          <div key={fret} className="mini-fret-row">
            {shape.map((f: number, i: number) => (
              <div key={i} className="mini-fret-cell">
                {f === fret && <span className="mini-dot" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChordDiagram({ chord, onClose }: { chord: string; onClose: () => void }) {
  const shape = CHORD_SHAPES[chord];
  const posFrets = (shape || []).filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const fretRange = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-2xl p-6 border border-white/10 w-fit" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-brand-gold">{chord}</span>
          <button onClick={onClose} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {shape ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-6 gap-0">
              {shape.map((f: number, si: number) => (
                <div key={"m" + si} className="h-5 text-center text-xs text-brand-muted flex items-center justify-center">
                  {f === 0 ? "o" : f === -1 ? "x" : si === 0 && baseFret > 0 ? baseFret : ""}
                </div>
              ))}
            </div>
            {fretRange.map((fret: number) => (
              <div key={fret} className="grid grid-cols-6 gap-0">
                {shape.map((f: number, si: number) => (
                  <div key={si} className="relative h-8 flex items-center justify-center border-t border-white/15">
                    {f === fret && <span className="w-3.5 h-3.5 rounded-full bg-brand-gold" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Diagram not available for {chord}.</p>
        )}
        <p className="text-xs text-brand-muted mt-3 text-center">Click anywhere to close</p>
      </div>
    </div>
  );
}

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [showTablature, setShowTablature] = useState(true);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .eq("slug_song", params.song)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setNotFound(true);
      } else {
        setTab(data);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [params.artist, params.song]);

  useEffect(() => {
    if (!autoScroll) return;
    const id = setInterval(() => {
      window.scrollBy({ top: scrollSpeed * 2, behavior: "smooth" });
    }, 100);
    return () => clearInterval(id);
  }, [autoScroll, scrollSpeed]);

  function renderLine(line: string, index: number): ReactNode {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={index}>&nbsp;</div>;
    }
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const isChordLine = tokens.length > 0 && tokens.every((t: string) => CHORD_STRICT_RE.test(t));
    if (!isChordLine) {
      return <div key={index}>{line}</div>;
    }

    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let count = 0;
    const re = new RegExp(CHORD_TOKEN_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      parts.push(line.slice(lastIndex, m.index));
      const chord = transposeChord(m[1], transpose);
      parts.push(
        <span
          key={count++}
          className="chord-wrapper"
          title={"Click to enlarge " + chord}
          onClick={() => setActiveChord(chord)}
        >
          {chord}
          <span className="chord-tooltip">
            <MiniChordDiagram chord={chord} />
          </span>
        </span>
      );
      lastIndex = m.index + m[1].length;
    }
    parts.push(line.slice(lastIndex));
    return <div key={index}>{parts}</div>;
  }

  function chordsUsed(content: string): string[] {
    const seen: string[] = [];
    const lines = content.split("\n");
    for (const line of lines) {
      const tokens = line.trim().split(/\s+/).filter(Boolean);
      if (tokens.length > 0 && tokens.every((t: string) => CHORD_STRICT_RE.test(t))) {
        for (const t of tokens) {
          const transposed = transposeChord(t, transpose);
          if (!seen.includes(transposed)) seen.push(transposed);
        }
      }
    }
    return seen;
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        <a href="/request" className="inline-block bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition">
          Request this tab
        </a>
      </div>
    );
  }

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");
  const content: string = tab.content || "";
  const youtubeId: string = tab.youtube_id || tab.video_id || tab.youtube || tab.video_url || tab.yt_id || "";
  const versions: string[] = Array.isArray(tab.versions) ? tab.versions : [];

  const visibleLines = showTablature
    ? content.split("\n")
    : content.split("\n").filter((l: string) => !TAB_LINE_RE.test(l));

  const usedChords = chordsUsed(content);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-white">Home</a></li>
          <li>/</li>
          <li><a href="/browse" className="hover:text-white">Browse</a></li>
          <li>/</li>
          <li><a href={"/artist/" + params.artist} className="hover:text-white capitalize">{artistName}</a></li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && (
              <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim">
                <BadgeCheck size={14} /> VERIFIED
              </div>
            )}
          </div>
          <p className="text-xl text-brand-muted">{artistName}</p>
          <div className="flex gap-4 pt-2 flex-wrap">
            {tab.key_sig && (
              <span className="bg-white/5 px-3 py-1 rounded text-sm">Key: <strong>{tab.key_sig}</strong></span>
            )}
            {tab.difficulty && (
              <span className="bg-white/5 px-3 py-1 rounded text-sm">Difficulty: <strong className="text-green-400">{tab.difficulty}</strong></span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleShare} className="p-3 bg-white/5 rounded-full hover:bg-white/10" title={copied ? "Link copied!" : "Share"}>
            <Share2 size={20} className={copied ? "text-brand-gold" : ""} />
          </button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" title="Bookmark">
            <Bookmark size={20} />
          </button>
          <a href="#tab-content" className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition">
            <Play size={18} /> Play
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-2xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}
          >
            <MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>
          {autoScroll && (
            <input type="range" min={1} max={10} value={scrollSpeed} onChange={(e) => setScrollSpeed(Number(e.target.value))} className="w-32" aria-label="Scroll speed" />
          )}
        </div>
        <button
          onClick={() => setShowTablature(!showTablature)}
          className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (showTablature ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}
        >
          <ChevronDown size={16} /> Tablatura {showTablature ? "ON" : "OFF"}
        </button>
      </div>

      {/* Main grid: tab content + YouTube sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tab content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div id="tab-content" className="bg-brand-card rounded-2xl p-8 border border-white/5">
            <div className="cifra-content">
              {visibleLines.map((line: string, i: number) => renderLine(line, i))}
            </div>
          </div>

          {/* Chords used - with mini diagrams */}
          {usedChords.length > 0 && (
            <section className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
              <h2 className="text-2xl font-bold">Chords used in this tab</h2>
              <p className="text-sm text-brand-muted">Hover over a chord in the tab to see its shape. Click to enlarge:</p>
              <div className="chord-grid">
                {usedChords.map((c) => (
                  <div key={c} className="chord-grid-item" onClick={() => setActiveChord(c)}>
                    <MiniChordDiagram chord={c} />
                    <span className="chord-grid-label">{c}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Other versions */}
          {versions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Other versions</h2>
              <select className="bg-brand-card border border-white/10 rounded-lg px-4 py-2 text-sm">
                {versions.map((v: string) => (
                  <option key={v} value={v}>Version {v}</option>
                ))}
              </select>
            </section>
          )}

          {/* Report */}
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <AlertTriangle size={16} className="text-brand-gold" />
            <span>Found an error? </span>
            <button className="text-brand-gold hover:underline">Report this tab</button>
          </div>
        </div>

        {/* Sidebar - YouTube + info - 1 column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {youtubeId ? (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Youtube size={20} className="text-red-500" /> Watch & Play
                </h3>
                <iframe
                  className="w-full aspect-video rounded-xl border border-white/10"
                  src={"https://www.youtube.com/embed/" + youtubeId}
                  title={songName + " - " + artistName}
                  allowFullScreen
                />
                <p className="text-xs text-brand-muted">Play along with the video while reading the tab.</p>
              </div>
            ) : (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Youtube size={20} className="text-red-500" /> Video
                </h3>
                <p className="text-sm text-brand-muted">No video available for this tab yet.</p>
              </div>
            )}

            {/* Quick chord reference in sidebar */}
            {usedChords.length > 0 && (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider">Quick Reference</h3>
                <div className="flex flex-wrap gap-2">
                  {usedChords.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveChord(c)}
                      className="px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-brand-gold/10 transition-colors"
                      style={{ color: "#34d399", fontWeight: 700 }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chord diagram modal */}
      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} />}
    </div>
  );
}
