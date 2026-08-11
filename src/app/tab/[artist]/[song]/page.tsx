"use client";
import { useState, useEffect, useRef } from "react";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, History, AlertTriangle, Share2, Bookmark, Play, ChevronDown, MousePointer2 } from "lucide-react";

export default function TabDetail({ params }: { params: { artist: string, song: string } }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("2.1");
  const [showTabs, setShowTabs] = useState(true); // NOVO: controla a tablatura
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: rola o conteúdo automaticamente quando ON
  useEffect(() => {
    if (!autoScroll || !contentRef.current) return;
    const interval = setInterval(() => {
      contentRef.current?.scrollBy({ top: scrollSpeed, behavior: "smooth" });
    }, 100);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  // Conteúdo da cifra (no app real, vem do banco via Supabase)
  // A tablatura fica EMBUTIDA no meio da letra, onde o riff/solo acontece
  const rawContent = `
[Verse 1]
Em                C
There's a lady who's sure all that glitters is gold

e|--5--7-----7--8-----8-2-----2-0-------0--------|
B|----5-----5-------5-------3-------1---1---1-----|
G|--5---------5-------5-------2-------2-------2---|
D|7-------6-------5-------4-------3---------------|

Em                C
And she's buying a stairway to heaven

[Chorus]
C                 D
Ooh, ooh, and she's buying a stairway to heaven

e|--5--7-----7--8-----8-2-----2-0-------0--------|
B|----5-----5-------5-------3-------1---1---1-----|
G|--5---------5-------5-------2-------2-------2---|
D|7-------6-------5-------4-------3---------------|
`;

  // Filtra as linhas de tablatura quando showTabs = false
  // Detecta linhas que começam com e|, B|, G|, D|, A|, E| (padrão universal de tab ASCII)
  function renderContent(raw: string, show: boolean) {
    return raw.split("\n").map((line, i) => {
      const isTabLine = /^[eBGDAE]\|/.test(line.trim());
      if (isTabLine && !show) return null; // oculta quando toggle OFF
      return (
        <div key={i} className={isTabLine ? "tab-line" : undefined}>
          {line || "\u00A0"} {/* preserva linhas em branco */}
        </div>
      );
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-white">Home</a></li>
          <li>/</li>
          <li><a href={`/artist/${params.artist}`} className="hover:text-white capitalize">{params.artist.replace("-", " ")}</a></li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold capitalize">{params.song.replace("-", " ")}</h1>
            <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim">
              <BadgeCheck size={14} /> VERIFIED
            </div>
          </div>
          <p className="text-xl text-brand-muted capitalize">{params.artist.replace("-", " ")}</p>
          <div className="flex gap-4 pt-2">
            <span className="bg-white/5 px-3 py-1 rounded text-sm">Key: <strong>F#m</strong></span>
            <span className="bg-white/5 px-3 py-1 rounded text-sm">Difficulty: <strong className="text-green-400">Beginner</strong></span>
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

      {/* Barra de controles */}
      <div className="flex flex-wrap items-center gap-3 bg-brand-card rounded-xl p-3 border border-white/5">
        {/* Auto-scroll: VERDE quando ON */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${
            autoScroll
              ? "bg-green-500 text-black shadow-lg shadow-green-500/30"
              : "bg-white/5 text-brand-muted hover:bg-white/10"
          }`}
        >
          <Play size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
        </button>

        {/* NOVO: Toggle de tablatura */}
        <button
          onClick={() => setShowTabs(!showTabs)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${
            showTabs
              ? "bg-brand-gold text-black"
              : "bg-white/5 text-brand-muted hover:bg-white/10"
          }`}
        >
          <ChevronDown size={16} /> Tablatura {showTabs ? "ON" : "OFF"}
        </button>

        {/* Controle de velocidade (visível quando auto-scroll ON) */}
        {autoScroll && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-brand-muted">Velocidade</span>
            <input
              type="range"
              min={1}
              max={10}
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-bold">{scrollSpeed}</span>
          </div>
        )}
      </div>

      {/* Conteúdo da cifra com tablatura embutida */}
      <div className="bg-brand-card rounded-2xl p-6 border border-white/5">
        <div ref={contentRef} className="cifra-content max-h-[70vh] overflow-y-auto">
          {renderContent(rawContent, showTabs)}
        </div>
      </div>
    </div>
  );
}
