"use client";
import { useEffect, useState } from "react";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2, Loader2, ChevronDown, Youtube } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { chordsUsed } from "@/lib/chordData";
import { MiniFretboard, ChordDiagram, ThemePicker, THEMES, type ThemeKey } from "@/lib/fretboard";
import { renderContent, renderTablature } from "@/lib/tabRenderer";

export default function TabDetailComponent({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [showTablature, setShowTablature] = useState(true);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [youtubeId, setYoutubeId] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>("amber");

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-theme") as ThemeKey | null;
    if (saved && THEMES[saved]) setThemeKey(saved);
  }, []);
  useEffect(() => { localStorage.setItem("chordproof-theme", themeKey); }, [themeKey]);
  const theme = THEMES[themeKey];

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("tabs").select("*").eq("slug_artist", params.artist).eq("slug_song", params.song).maybeSingle();
      if (!active) return;
      if (error || !data) { setNotFound(true); } else { setTab(data); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [params.artist, params.song]);

  useEffect(() => {
    if (!tab) return;
    const id = tab.youtube_id || tab.video_id || tab.youtube || tab.video_url || tab.yt_id || "";
    if (id) { setYoutubeId(id); return; }
    setYoutubeLoading(true);
    const a = tab.artist || params.artist.replace(/-/g, " ");
    const s = tab.song || params.song.replace(/-/g, " ");
    fetch("/api/youtube-search?q=" + encodeURIComponent(a + " " + s + " official")).then(r => r.json()).then(d => { if (d.videoId) setYoutubeId(d.videoId); }).catch(() => {}).finally(() => setYoutubeLoading(false));
  }, [tab]);

  useEffect(() => {
    if (!autoScroll) return;
    const id = setInterval(() => { window.scrollBy({ top: scrollSpeed * 2, behavior: "smooth" }); }, 100);
    return () => clearInterval(id);
  }, [autoScroll, scrollSpeed]);

  if (loading) return <div className="flex items-center justify-center py-32 text-brand-muted"><Loader2 className="animate-spin mr-3" /> Loading tab...</div>;
  if (notFound || !tab) return (
    <div className="text-center py-32 space-y-4">
      <h1 className="text-3xl font-bold">Tab not found</h1>
      <p className="text-brand-muted">This tab isn't in our database yet.</p>
      <a href="/request" className="inline-block bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition">Request this tab</a>
    </div>
  );

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");
  const content = tab.content || "";
  const tablature = tab.tablature || "";
  const usedChords = chordsUsed(content, transpose);
  const hasTab = tablature && tablature.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="text-sm text-brand-muted"><ol className="flex gap-2">
        <li><a href="/" className="hover:text-white">Home</a></li><li>/</li>
        <li><a href="/browse" className="hover:text-white">Browse</a></li><li>/</li>
        <li><a href={"/artist/"+params.artist} className="hover:text-white capitalize">{artistName}</a></li>
      </ol></nav>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim"><BadgeCheck size={14} /> VERIFIED</div>}
          </div>
          <p className="text-xl text-brand-muted">{artistName}</p>
          <div className="flex gap-4 pt-2 flex-wrap">
            {tab.key_sig && <span className="bg-white/5 px-3 py-1 rounded text-sm">Key: <strong>{tab.key_sig}</strong></span>}
            {tab.difficulty && <span className="bg-white/5 px-3 py-1 rounded text-sm">Difficulty: <strong className="text-green-400">{tab.difficulty}</strong></span>}
            {tab.capo && <span className="bg-white/5 px-3 py-1 rounded text-sm">Capo: <strong>{tab.capo}</strong></span>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-3 bg-white/5 rounded-full hover:bg-white/10" title={copied ? "Link copied!" : "Share"}><Share2 size={20} className={copied ? "text-brand-gold" : ""} /></button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" title="Bookmark"><Bookmark size={20} /></button>
          <a href="#tab-content" className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition"><Play size={18} /> Play</a>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-2xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoScroll(!autoScroll)} className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}><MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}</button>
          {autoScroll && <input type="range" min={1} max={10} value={scrollSpeed} onChange={(e) => setScrollSpeed(Number(e.target.value))} className="w-32" aria-label="Scroll speed" />}
        </div>
        <button onClick={() => setShowTablature(!showTablature)} className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (showTablature ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}><ChevronDown size={16} /> Tablature {showTablature ? "ON" : "OFF"}</button>
        <div className="ml-auto"><ThemePicker current={themeKey} onChange={setThemeKey} /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div id="tab-content" className="bg-brand-card rounded-2xl p-8 border border-white/5">
            <div style={{fontFamily:"monospace",fontSize:"1rem",lineHeight:"1.6"}}>{renderContent(content, showTablature, transpose, setActiveChord, theme)}</div>
            {showTablature && hasTab && renderTablature(tablature)}
          </div>
          {usedChords.length > 0 && (
            <section className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
              <h2 className="text-2xl font-bold">Chords used in this tab</h2>
              <p className="text-sm text-brand-muted">Hover over a chord in the tab to see its shape. Click to enlarge:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:"16px"}}>
                {usedChords.map((c) => (<div key={c} onClick={() => setActiveChord(c)} style={{cursor:"pointer"}}><MiniFretboard chord={c} theme={theme} /></div>))}
              </div>
            </section>
          )}
          <div className="flex items-center gap-2 text-sm text-brand-muted"><AlertTriangle size={16} className="text-brand-gold" /><span>Found an error? </span><button className="text-brand-gold hover:underline">Report this tab</button></div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {youtubeId ? (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Watch &amp; Play</h3>
                <iframe className="w-full aspect-video rounded-xl border border-white/10" src={"https://www.youtube.com/embed/" + youtubeId} title={songName + " - " + artistName} allowFullScreen />
                <p className="text-xs text-brand-muted">Play along with the video while reading the tab.</p>
              </div>
            ) : youtubeLoading ? (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Searching video...</h3>
                <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-brand-muted" size={24} /></div>
              </div>
            ) : (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-2">
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Video</h3>
                <p className="text-sm text-brand-muted">No video found for this tab.</p>
              </div>
            )}
            {usedChords.length > 0 && (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3">
                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider">Quick Reference</h3>
                <div className="flex flex-wrap gap-2">
                  {usedChords.map((c) => (<button key={c} onClick={() => setActiveChord(c)} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-brand-gold/10 transition-colors" style={{color:"#34d399",fontWeight:700}}>{c}</button>))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} theme={theme} />}
    </div>
  );
}
