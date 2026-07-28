"use client";
import { useState } from "react";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, History, Bookmark, Share2, Play, ChevronDown, AlertTriangle, MousePointer2 } from "lucide-react";
import Link from "next/link";

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("2.1");
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2 flex-wrap">
          <li><Link href="/" className="hover:text-white">Home</Link></li>
          <li>/</li>
          <li><Link href={`/artist/${params.artist}`} className="hover:text-white capitalize">{params.artist.replace(/-/g, " ")}</Link></li>
          <li>/</li>
          <li className="text-white capitalize">{params.song.replace(/-/g, " ")}</li>
        </ol>
      </nav>

      {/* Header Bar */}
      <div className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold capitalize">{params.song.replace(/-/g, " ")}</h1>
              <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim">
                <BadgeCheck size={14} /> VERIFIED
              </div>
            </div>
            <p className="text-lg text-brand-muted capitalize">{params.artist.replace(/-/g, " ")}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition"><Bookmark size={18} /></button>
            <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition"><Share2 size={18} /></button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">Key: <strong className="text-brand-gold">F#m</strong></span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">Difficulty: <strong className="text-green-400">Beginner</strong></span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">Tuning: <strong>EADGBe</strong></span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">Capo: <strong>1st fret</strong></span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-card rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-3">
          <TransposeControls />
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <Play size={16} /> Auto-scroll
            </button>
            {autoScroll && (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-20 accent-brand-gold"
                />
                <span className="text-xs text-brand-muted w-6">{scrollSpeed}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted">v{version}</span>
          <button
            onClick={() => setReportOpen(!reportOpen)}
            className="p-2 text-brand-muted hover:text-red-400 transition"
            title="Report error"
          >
            <AlertTriangle size={16} />
          </button>
        </div>
      </div>

      {/* Report Panel */}
      {reportOpen && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
          <p className="text-sm text-red-400 font-bold mb-2">Report an error</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Describe the error..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-400"
            />
            <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-brand-card rounded-2xl p-6 md:p-10 border border-white/5">
        <div className="cifra-content text-sm md:text-base leading-relaxed">
          <p className="text-center text-brand-gold font-bold mb-6 text-lg">
            SONG: {params.song.replace(/-/g, " ").toUpperCase()}
          </p>

          <p className="text-center text-brand-muted text-xs mb-8">
            [Intro]
          </p>

          <div className="space-y-1 font-mono text-center">
            <p><span className="chord">F#m</span>          <span className="chord">E</span>          <span className="chord">D</span></p>
            <p className="text-brand-muted">e|--2-------0-------2-----|</p>
            <p className="text-brand-muted">B|--2-------0-------3-----|</p>
            <p className="text-brand-muted">G|--2-------1-------2-----|</p>
            <p className="text-brand-muted">D|--4-------2-------0-----|</p>
            <p className="text-brand-muted">A|--4-------2-------0-----|</p>
            <p className="text-brand-muted">E|--2-------0-------0-----|</p>
          </div>

          <div className="my-8 border-t border-white/5" />

          <p className="text-center text-brand-muted text-xs mb-6">
            [Verse 1]
          </p>

          <div className="space-y-4">
            <p>
              <span className="chord">F#m</span> Today is gonna be the day
            </p>
            <p>
              That they're gonna throw it back to <span className="chord">E</span> you
            </p>
            <p>
              <span className="chord">D</span> By now you should've somehow
            </p>
            <p>
              Realized what you gotta <span className="chord">E</span> do
            </p>
            <p>
              <span className="chord">F#m</span> I don't believe that anybody
            </p>
            <p>
              Feels the way I <span className="chord">E</span> do
            </p>
            <p>
              About you <span className="chord">D</span> now
            </p>
          </div>

          <div className="my-8 border-t border-white/5" />

          <p className="text-center text-brand-muted text-xs mb-6">
            [Chorus]
          </p>

          <div className="space-y-4">
            <p>
              And <span className="chord">A</span> after all
            </p>
            <p>
              You're my <span className="chord">E</span> wonderwall
            </p>
          </div>
        </div>
      </div>

      {/* Version History */}
      <details className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <summary className="p-4 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition font-bold text-sm">
          <History size={16} /> Version History <ChevronDown size={14} className="ml-auto" />
        </summary>
        <div className="px-4 pb-4 space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-t border-white/5">
            <div>
              <span className="font-bold">v2.1</span>
              <span className="text-brand-muted ml-2">Minor chord corrections in bridge</span>
            </div>
            <span className="text-brand-muted text-xs">2 days ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-white/5">
            <div>
              <span className="font-bold">v2.0</span>
              <span className="text-brand-muted ml-2">Full re-verification by pro team</span>
            </div>
            <span className="text-brand-muted text-xs">1 week ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-white/5">
            <div>
              <span className="font-bold">v1.0</span>
              <span className="text-brand-muted ml-2">Original community submission</span>
            </div>
            <span className="text-brand-muted text-xs">1 month ago</span>
          </div>
        </div>
      </details>

      {/* Request Edit CTA */}
      <div className="bg-brand-card rounded-2xl p-6 border border-white/5 text-center space-y-3">
        <p className="text-sm text-brand-muted">
          <MousePointer2 size={16} className="inline mr-1" />
          Is something off? Our community keeps tabs accurate.
        </p>
        <Link href={`/request?edit=${params.artist}-${params.song}`} className="inline-block text-brand-gold text-sm font-bold hover:underline">
          Suggest an edit
        </Link>
      </div>

      {/* Related Tabs */}
      <div className="pt-4">
        <h3 className="text-xl font-bold mb-4">More from {params.artist.replace(/-/g, " ")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Champagne Supernova", "Don't Look Back in Anger", "Live Forever", "Slide Away"].map((s) => (
            <Link
              key={s}
              href={`/tab/${params.artist}/${s.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-brand-card border border-white/5 rounded-xl p-4 hover:border-brand-gold/30 transition text-center"
            >
              <p className="font-bold text-sm truncate">{s}</p>
              <p className="text-brand-muted text-xs mt-1">{params.artist.replace(/-/g, " ")}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
