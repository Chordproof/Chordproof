"use client";
import { useEffect, useState, type ReactNode } from "react";
import TransposeControls from "@/components/TransposeControls";
import {
  BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2,
  Loader2, ChevronDown, Youtube, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
};
const CHORD_TOKEN_RE = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2)*\d*)/g;
const CHORD_STRICT_RE = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2)*\d*$/;
const TAB_LINE_RE = /[\d\-|]{4,}/;

// shapes de acordes: [6ª corda → 1ª corda]; 0 = aberta, -1 = não tocada, n = casa
const CHORD_SHAPES: Record<string, number[]> = {
  E: [0, 2, 2, 1, 0, 0],
  Em: [0, 2, 2, 0, 0, 0],
  A: [-1, 0, 2, 2, 2, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  D: [-1, -1, 0, 2, 3, 2],
  Dm: [-1, -1, 0, 2, 3, 1],
  C: [-1, 3, 2, 0, 1, 0],
  G: [3, 2, 0, 0, 0, 3],
  F: [1, 3, 3, 2, 1, 1],
  E5: [0, 2, 2, -1, -1, -1],
  A5: [-1, 0, 2, 2, -1, -1],
  D5: [-1, -1, 0, 2, 3, -1],
  G5: [3, 5, 5, -1, -1, -1],
  Bm: [-1, 2, 4, 4, 3, 2],
  F#m: [2, 4, 4, 2, 2, 2],
  B: [-1, 2, 4, 4, 4, 2],
};

function transposeChord(chord: string, steps: number): string {
  if (!steps) return chord;
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  const root = FLAT_TO_SHARP[match[1]] || match[1];
  let idx = CHROMATIC.indexOf(root);
  if (idx === -1) return chord;
  idx = (idx + steps + 12) % 12;
  return CHROMATIC[idx] + match[2];
}

function ChordDiagram({ chord, onClose }: { chord: string; onClose: () => void }) {
  const shape = CHORD_SHAPES[chord];
  const posFrets = (shape || []).filter((f: number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const fretRange = [baseFret + 1, baseFret + 2, baseFret + 3, baseFret + 4];

  return (
    
       e.stopPropagation()}
      >
        
          {chord}
          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        



        {shape ? (
          
            
              {shape.map((f: number, si: number) => (
                
                  {f === 0 ? "○" : f === -1 ? "×" : si === 0 && baseFret > 0 ? baseFret : ""}
                


              ))}
            


            {fretRange.map((fret: number) => (
              
                {shape.map((f: number, si: number) => (
                  
                    {f === fret && }
                  


                ))}
              


            ))}
          


        ) : (
          Diagram not available for {chord}.


        )}

        Click anywhere to close


      


    


  );
}

export default function TabView({ params }: { params: { artist: string; song: string } }) {
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
      if (error || !data) setNotFound(true);
      else setTab(data);
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
    if (!trimmed) return  

;
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const isChordLine = tokens.length > 0 && tokens.every((t: string) => CHORD_STRICT_RE.test(t));
    if (!isChordLine) return {line}

;

    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let count = 0;
    const re = new RegExp(CHORD_TOKEN_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      parts.push(line.slice(lastIndex, m.index));
      const chord = transposeChord(m[1], transpose);
      parts.push(
         setActiveChord(chord)}
        >
          {chord}
        
      );
      lastIndex = m.index + m[1].length;
    }
    parts.push(line.slice(lastIndex));
    return {parts}

;
  }

  function chordsUsed(content: string): string[] {
    const seen: string[] = [];
    for (const line of content.split("\n")) {
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

  if (loading) {
    return (
      
        <Loader2 className="animate-spin mr-3" /> Loading tab...
      


    );
  }

  if (notFound || !tab) {
    return (
      
        <h1 className="text-3xl font-bold">Tab not found</h1>
        This tab isn't in our database yet.


        <a
          href="/request"
          className="inline-block bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
        >
          Request this tab
        </a>
      


    );
  }

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");
  const content: string = tab.content || "";
  const youtubeId: string = (tab as any)?.youtube_id || (tab as any)?.video_id || "";
  const versions: string[] = Array.isArray((tab as any)?.versions) ? (tab as any).versions : [];

  const visibleLines = showTablature
    ? content.split("\n")
    : content.split("\n").filter((l: string) => !TAB_LINE_RE.test(l));

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        
          - <a href="/" className="hover:text-white">Home</a>

          - /

          - <a href="/browse" className="hover:text-white">Browse</a>

          - /

          - 
            <a href={`/artist/${params.artist}`} className="hover:text-white capitalize">
              {artistName}
            </a>
          

        
      </nav>

      {/* Header */}
      
        
          
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && (
              
                <BadgeCheck size={14} /> VERIFIED
              


            )}
          


          {artistName}


          
            {tab.key_sig && (
              
                Key: **{tab.key_sig}**
              
            )}
            {tab.difficulty && (
              
                Difficulty: **{tab.difficulty}**
              
            )}
            
              Version: **1.0**
            
          


        



        
          <button
            onClick={handleShare}
            className="p-3 bg-white/5 rounded-full hover:bg-white/10"
            title={copied ? "Link copied!" : "Share"}
          >
            <Share2 size={20} className={copied ? "text-brand-gold" : ""} />
          </button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" title="Bookmark">
            <Bookmark size={20} />
          </button>
          <a
            href="#tab-content"
            className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition"
          >
            <Play size={18} /> Play
          </a>
        


      



      {/* Controls */}
      
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>
          {autoScroll && (
            <input
              type="range"
              min={1}
              max={10}
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-32"
              aria-label="Scroll speed"
            />
          )}
        


        <button
          onClick={() => setShowTablature(!showTablature)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
            showTablature ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <ChevronDown size={16} /> Tablatura {showTablature ? "ON" : "OFF"}
        </button>
      



      {/* Tab Content */}
      
        
          {visibleLines.map((line: string, i: number) => renderLine(line, i))}
        


      



      {/* Chords Used */}
      {chordsUsed(content).length > 0 && (
        
          <h2 className="text-2xl font-bold">Chords used in this tab</h2>
          Hover over a chord in the tab, or view them all below:


          
            {chordsUsed(content).map((c) => (
              <button
                key={c}
                onClick={() => setActiveChord(c)}
                className="chord px-4 py-2 bg-white/5 rounded-lg hover:bg-brand-gold/10 transition-colors"
              >
                {c}
              </button>
            ))}
          


        


      )}

      {/* Other versions */}
      {versions.length > 0 && (
        
          <h2 className="text-xl font-bold">Other versions</h2>
          <select className="bg-brand-card border border-white/10 rounded-lg px-4 py-2 text-sm">
            {versions.map((v: string) => (
              <option key={v} value={v}>Version {v}</option>
            ))}
          </select>
        


      )}

      {/* YouTube */}
      {youtubeId && (
        
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Youtube size={20} className="text-red-500" /> Watch on YouTube
          </h2>
          <iframe
            className="w-full aspect-video rounded-xl border border-white/10"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={`${songName} - ${artistName}`}
            allowFullScreen
          />
        


      )}

      {/* Report */}
      
        <AlertTriangle size={16} className="text-brand-gold" />
        Found an error? 
        <button className="text-brand-gold hover:underline">Report this tab</button>
      



      {/* Chord diagram modal */}
      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} />}
    


  );
}
