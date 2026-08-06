"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, Bookmark, Share2, Play, ChevronDown, MousePointer2 } from "lucide-react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Transpõe um acorde individual (suporta Em7, D4, A7(4), C9, etc.)
function transposeChord(chord: string, semitones: number) {
  const match = chord.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return chord;
  let root = match[1];
  const acc = match[2];
  const rest = match[3];
  let idx = NOTES.indexOf(root);
  if (acc === "#") idx = (idx + 1) % 12;
  if (acc === "b") idx = (idx + 11) % 12;
  const newRoot = NOTES[((idx + semitones) % 12 + 12) % 12];
  return newRoot + rest;
}

// Transpõe o conteúdo inteiro, reconhecendo acordes complexos
function transposeContent(content: string, semitones: number) {
  if (semitones === 0) return content;
  return content.replace(/\b[A-G](?:#|b)?(?:[0-9]|M|m|7|9|11|13|4|6|add|sus|dim|aug|\([0-9]+\)|\/[A-G](?:#|b)?)*\b/g, (chord) => {
    try { return transposeChord(chord, semitones); } catch { return chord; }
  });
}

// Extrai os acordes únicos do conteúdo para gerar os diagramas
function extractChords(content: string) {
  const matches = content.match(/\b[A-G](?:#|b)?(?:[0-9]|M|m|7|9|11|13|4|6|add|sus|dim|aug|\([0-9]+\)|\/[A-G](?:#|b)?)*\b/g) || [];
  return Array.from(new Set(matches));
}

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transpose, setTranspose] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("1.0");
  const [hoveredChord, setHoveredChord] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll suave do conteúdo
  useEffect(() => {
    if (!autoScroll || !contentRef.current) return;
    const interval = setInterval(() => {
      contentRef.current?.scrollBy({ top: scrollSpeed, behavior: "smooth" });
    }, 300);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  if (loading) return <p className="text-center py-20 text-brand-muted">Carregando cifra...</p>;
  if (!tab) return <p className="text-center py-20 text-brand-muted">Cifra não encontrada.</p>;

  // Conteúdo transposto
  const transposedContent = transposeContent(tab.content, transpose);
  // Acordes únicos (transpostos) para os diagramas
  const chords = extractChords(transposedContent);

  // Renderiza o conteúdo com os acordes clicáveis
  const renderContent = (text: string) => {
    const parts = text.split(/(\b[A-G](?:#|b)?(?:[0-9]|M|m|7|9|11|13|4|6|add|sus|dim|aug|\([0-9]+\)|\/[A-G](?:#|b)?)*\b)/g);
    return parts.map((part, i) => {
      if (/^[A-G](?:#|b)?(?:[0-9]|M|m|7|9|11|13|4|6|add|sus|dim|aug|\([0-9]+\)|\/[A-G](?:#|b)?)*$/.test(part)) {
        return (
          <span
            key={i}
            className="chord"
            onMouseEnter={() => setHoveredChord(part)}
            onMouseLeave={() => setHoveredChord(null)}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-white">Home</a></li>
          <li>/</li>
          <li><a href={`/browse`} className="hover:text-white">Browse</a></li>
          <li>/</li>
          <li className="capitalize">{params.artist.replace("-", " ")}</li>
        </ol>
      </nav>

      {/* Header */}
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
          <p className="text-xl text-brand-muted capitalize">{tab.artist}</p>
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

      {/* Controles: transposição + auto-scroll */}
      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="h-6 w-px bg-white/10" />
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
        </button>
        {autoScroll && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-muted">Velocidade</span>
            <input
              type="range" min={1} max={10} value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-28 accent-brand-gold"
            />
            <span className="text-brand-gold">{scrollSpeed}</span>
          </div>
        )}
      </div>

      {/* Conteúdo completo da cifra com acordes clicáveis */}
      <div
        ref={contentRef}
        className="cifra-content bg-brand-card rounded-2xl p-8 border border-white/5 max-h-[70vh] overflow-y-auto"
      >
        {renderContent(transposedContent)}
      </div>

      {/* Tooltip do acorde (hover) */}
      {hoveredChord && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-card border border-brand-gold/40 rounded-xl px-6 py-3 shadow-2xl z-50">
          <p className="text-sm text-brand-muted">Acorde</p>
          <p className="text-2xl font-bold text-brand-gold">{hoveredChord}</p>
        </div>
      )}

      {/* Diagramas dos acordes no final */}
      <div className="bg-brand-card rounded-2xl p-8 border border-white/5">
        <h3 className="text-xl font-bold mb-4">Acordes usados nesta cifra</h3>
        <div className="flex flex-wrap gap-3">
          {chords.map((chord) => (
            <span
              key={chord}
              className="chord bg-white/5 px-4 py-2 rounded-lg text-lg"
              onMouseEnter={() => setHoveredChord(chord)}
              onMouseLeave={() => setHoveredChord(null)}
            >
              {chord}
            </span>
          ))}
        </div>
      </div>

      {/* Versões */}
      <details className="bg-brand-card rounded-xl p-4 border border-white/5">
        <summary className="flex items-center gap-2 cursor-pointer font-semibold">
          <ChevronDown size={16} /> Outras versões
        </summary>
        <p className="text-sm text-brand-muted mt-3">Versão 1.0 (principal)</p>
      </details>
    </div>
  );
}
