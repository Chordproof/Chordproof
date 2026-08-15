"use client";
import { useState } from "react";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, AlertTriangle, Share2, Bookmark, Play, ChevronDown, MousePointer2 } from "lucide-react";

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("2.1");
  const [versionOpen, setVersionOpen] = useState(false);
  const [transpose, setTranspose] = useState(0);

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

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-2xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"}`}
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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-brand-muted">Version</span>
          <div className="relative">
            <button
              onClick={() => setVersionOpen(!versionOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg text-sm"
            >
              {version} <ChevronDown size={14} />
            </button>
            {versionOpen && (
              <div className="absolute right-0 mt-1 bg-brand-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                {["2.1", "2.0", "1.0"].map((v) => (
                  <button
                    key={v}
                    onClick={() => { setVersion(v); setVersionOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-brand-gold/10 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-brand-card rounded-2xl p-8 border border-white/5">
        <div className="cifra-content">
          <p className="text-brand-muted italic">Tab content loads here from the database.</p>
        </div>
      </div>

      {/* Report */}
      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <AlertTriangle size={16} className="text-brand-gold" />
        <span>Found an error? </span>
        <button className="text-brand-gold hover:underline">Report this tab</button>
      </div>
    </div>
  );
}
