"use client";
import { useState, useEffect, useRef } from "react";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, Bookmark, Share2, Play, Pause, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function TabDetail({ params }: { params: { artist: string, song: string } }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("2.1");
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logic
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
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScroll, scrollSpeed]);

  const speedLabel =
    scrollSpeed <= 3 ? "Slow" :
    scrollSpeed <= 6 ? "Normal" :
    scrollSpeed <= 8 ? "Fast" : "Very Fast";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
          <li>/</li>
          <li>
            <Link
              href={`/artist/${params.artist}`}
              className="hover:text-white transition-colors capitalize"
            >
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
          <div className="flex gap-3 text-sm">
            <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">Key: <strong>F#m</strong></span>
            <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">Difficulty: <strong className="text-green-400">Beginner</strong></span>
            <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">Version: <strong>{version}</strong></span>
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

      {/* Transpose Controls */}
      <TransposeControls />

      {/* Auto Scroll Controls - Estilo Cifra Club */}
      <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06]">
        <div className="flex items-center justify-between gap-4">
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

      {/* Cifra Content (Mock) */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-white/[0.06]">
        <div className="cifra-content text-brand-text/90 leading-relaxed space-y-6">
          {/* Verse 1 */}
          <div>
            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-3">[Verse 1]</p>
            <p className="mb-1"><span className="chord">F#m</span> Today is gonna be the day</p>
            <p><span className="chord">A</span> That they're gonna throw it back to you</p>
            <p className="mb-1"><span className="chord">D</span> By now you should've somehow</p>
            <p><span className="chord">E</span> Realized what you gotta do</p>
            <p className="mb-1"><span className="chord">F#m</span> I don't believe that anybody</p>
            <p><span className="chord">A</span> Feels the way I do about you now</p>
          </div>

          {/* Chorus */}
          <div>
            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-3">[Chorus]</p>
            <p className="mb-1"><span className="chord">D</span> And backbeat, the word is on the street</p>
            <p><span className="chord">E</span> That the fire in your heart is out</p>
            <p className="mb-1"><span className="chord">F#m</span> I'm sure you've heard it all before</p>
            <p><span className="chord">E</span> But you never really had a doubt</p>
          </div>

          {/* Verse 2 */}
          <div>
            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-3">[Verse 2]</p>
            <p className="mb-1"><span className="chord">F#m</span> And all the roads we have to walk</p>
            <p><span className="chord">A</span> Are winding, and all the lights</p>
            <p className="mb-1"><span className="chord">D</span> That lead us there are blinding</p>
            <p><span className="chord">E</span> There are many things that I would</p>
            <p className="mb-1"><span className="chord">F#m</span> Like to say to you</p>
            <p><span className="chord">A</span> But I don't know how</p>
          </div>

          {/* Bridge */}
          <div>
            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider mb-3">[Bridge]</p>
            <p className="mb-1"><span className="chord">Bm</span> Because maybe</p>
            <p><span className="chord">D</span> You're gonna be the one that saves me</p>
            <p className="mb-1"><span className="chord">E</span> And after all</p>
            <p><span className="chord">F#m</span> You're my Wonderwall</p>
          </div>
        </div>
      </div>

      {/* Section indicator for auto-scroll */}
      {autoScroll && (
        <div className="fixed bottom-6 right-6 bg-brand-accent text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-pulse">
          Auto Scrolling...
        </div>
      )}
    </div>
  );
}
