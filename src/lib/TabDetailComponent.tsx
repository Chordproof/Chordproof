"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TransposeControls from "@/components/TransposeControls";
import AutoScrollControl from "@/components/AutoScrollControl";
import ArtistAvatar from "@/components/ArtistAvatar";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import StageMode from "@/components/StageMode";
import EasyModeToggle from "@/components/EasyModeToggle";
import PdfButton from "@/components/PdfButton";
import PrintButton from "@/components/PrintButton";
import AddToSetlist from "@/components/AddToSetlist";
import ChordTransitionTrainer from "@/components/ChordTransitionTrainer";
import SmartKey from "@/components/SmartKey";
import InstrumentPicker from "@/components/InstrumentPicker";
import DrumMachine from "@/components/DrumMachine";
import type { InstrumentKey } from "@/lib/instruments";
import { BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2, Loader2, ChevronDown, Youtube, Zap, MoreHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { recordAction } from "@/lib/gamification";
import { chordsUsed } from "@/lib/chordData";
import { MiniFretboard, ChordDiagram, ThemePicker, THEMES, type ThemeKey } from "@/lib/fretboard";
import { renderContent, renderTablature, hasInlineTablature } from "@/lib/tabRenderer";

function Sep() {
  return <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />;
}

export default function TabDetailComponent({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [showTablature, setShowTablature] = useState(true);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [youtubeId, setYoutubeId] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>("amber");
  const [easyOverride, setEasyOverride] = useState<{ content: string; capo: number | null } | null>(null);
  const [trainerOpen, setTrainerOpen] = useState(false);
  const [drumOpen, setDrumOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [instrument, setInstrument] = useState<InstrumentKey>("guitar");

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-instrument") as InstrumentKey | null;
    if (saved && ["guitar", "acoustic", "bass", "cavaco", "ukulele", "piano"].includes(saved)) setInstrument(saved);
  }, []);
  useEffect(() => { localStorage.setItem("chordproof-instrument", instrument); }, [instrument]);

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
      if (error || !data) { setNotFound(true); } else { setTab(data); recordAction("OPEN_TAB"); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [params.artist, params.song]);

  useEffect(() => {
    if (!tab) return;
    // Injeta info da música para o StageMode (BPM automático + tom no rodapé)
    (window as any).__stageTrackInfo = { artist: tab.artist || params.artist.replace(/-/g, " "), song: tab.song || params.song.replace(/-/g, " "), keySig: tab.key_sig || "" };
    const id = tab.youtube_id || tab.video_id || tab.youtube || tab.video_url || tab.yt_id || "";
    if (id) { setYoutubeId(id); return; }
    setYoutubeLoading(true);
    const a = tab.artist || params.artist.replace(/-/g, " ");
    const s = tab.song || params.song.replace(/-/g, " ");
    fetch("/api/youtube-search?q=" + encodeURIComponent(a + " " + s + " official")).then(r => r.json()).then(d => { if (d.videoId) setYoutubeId(d.videoId); }).catch(() => {}).finally(() => setYoutubeLoading(false));
  }, [tab]);

  if (loading) return <div className="flex items-center justify-center py-32 text-brand-muted"><Loader2 className="animate-spin mr-3" /> Loading tab...</div>;
  if (notFound || !tab) return (
    <div className="text-center py-32 space-y-4">
      <h1 className="text-4xl font-bold">Tab not found</h1>
      <p className="text-brand-muted">This tab isn't in our database yet.</p>
      <a href="/request" className="inline-block bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition">Request this tab</a>
    </div>
  );

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");
  const content = easyOverride ? easyOverride.content : tab.content || "";
  const tablature = tab.tablature || "";
  const usedChords = chordsUsed(content, transpose);
  const hasTab = tablature && tablature.trim().length > 0;

  return (
    <div style={{maxWidth:"1400px",margin:"0 auto"}}>
      <nav className="text-sm text-brand-muted" style={{marginBottom:"24px"}}><ol className="flex gap-2">
        <li><a href="/" className="hover:text-white">Home</a></li><li>/</li>
        <li><a href="/browse" className="hover:text-white">Browse</a></li><li>/</li>
        <li><a href={"/artist/"+params.artist} className="hover:text-white capitalize">{artistName}</a></li>
      </ol></nav>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6" style={{marginBottom:"24px"}}>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim"><BadgeCheck size={14} /> VERIFIED</div>}
          </div>
          <div className="flex items-center gap-2">
            <ArtistAvatar name={artistName} slug={params.artist} imageUrl={tab.artist_image_url} size="xs" />
            <Link href={`/artist/${params.artist}`} className="text-xl text-brand-muted hover:text-brand-gold hover:underline transition-colors inline-block">
              {artistName}
            </Link>
          </div>
          <div className="flex gap-4 pt-2 flex-wrap">
            {tab.key_sig && <span className="bg-white/5 px-3 py-1 rounded text-sm">Key: <strong>{tab.key_sig}</strong></span>}
            {tab.difficulty && <span className="bg-white/5 px-3 py-1 rounded text-sm">Difficulty: <strong className="text-green-400">{tab.difficulty}</strong></span>}
            {tab.capo && <span className="bg-white/5 px-3 py-1 rounded text-sm">Capo: <strong>{tab.capo}</strong></span>}
            {easyOverride?.capo && <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded text-sm font-bold">Easy capo: <strong>{easyOverride.capo}</strong></span>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-3 bg-white/5 rounded-full hover:bg-white/10" title={copied ? "Link copied!" : "Share"}><Share2 size={20} className={copied ? "text-brand-gold" : ""} /></button>
          <SaveOfflineButton tab={tab} slugArtist={params.artist} slugSong={params.song} />
          <AddToSetlist tabId={tab.id} song={songName} artist={artistName} />
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" title="Bookmark"><Bookmark size={20} /></button>
          <a href="#tab-content" className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition"><Play size={18} /> Play</a>
        </div>
      </div>
      {/* MOCKUP Fase A: toolbar sticky com grupos + separadores + menu ⋯ + dropdown de instrumento */}
      <div className="flex flex-wrap items-center gap-2 bg-brand-card rounded-2xl px-4 py-3 border border-white/5" style={{marginBottom:"24px", boxShadow: "0 4px 16px rgba(0,0,0,0.35)", position: "sticky", top: "56px", zIndex: 40}}>
        {/* Grupo LEITURA */}
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <button onClick={() => setShowTablature(!showTablature)} className={"flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition " + (showTablature ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}><ChevronDown size={14} /> Tab</button>
        <Sep />
        {/* Grupo PRÁTICA */}
        <StageMode>
          {renderContent(content, showTablature, transpose, setActiveChord, theme)}
          {showTablature && hasTab && !hasInlineTablature(content) && renderTablature(tablature)}
        </StageMode>
        <EasyModeToggle
          content={tab.content || ""}
          transpose={transpose}
          onContentOverride={(easyContent, capo) => setEasyOverride(easyContent ? { content: easyContent, capo } : null)}
        />
        <button onClick={() => setTrainerOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition bg-white/5 hover:bg-white/10" title="Train chord transitions with a timer"><Zap size={14} className="text-brand-gold" /> Trainer</button>
        <button onClick={() => setDrumOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition bg-white/5 hover:bg-white/10" title="Drum machine — groove by genre at the song BPM">🥁 Drums</button>
        <Sep />
        {/* Instrumento (dropdown compacto) */}
        <InstrumentPicker current={instrument} onChange={setInstrument} />
        {/* Menu ⋯: exportação + tema */}
        <div style={{position:"relative"}} className="ml-auto">
          <button onClick={() => setMoreOpen(!moreOpen)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition" title="More: PDF, Print, Theme">
            <MoreHorizontal size={18} />
          </button>
          {moreOpen && (
            <div style={{position:"absolute", top:"100%", right:0, marginTop:"8px", background:"#1a1a2e", border:"1px solid #333", borderRadius:"12px", padding:"6px", minWidth:"180px", zIndex:60, boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
              <div style={{padding:"6px 12px 2px", fontSize:"10px", color:"#666", textTransform:"uppercase", letterSpacing:"0.5px"}}>Export</div>
              <div style={{padding:"0 6px"}}><PdfButton
                song={songName}
                artist={artistName}
                content={content}
                transpose={transpose}
                capo={tab.capo}
                easyCapo={easyOverride?.capo ?? null}
                keySig={tab.key_sig}
              /></div>
              <div style={{padding:"0 6px"}}><PrintButton
                tab={tab}
                content={content}
                transpose={transpose}
                easyApplied={!!easyOverride}
                easyCapo={easyOverride?.capo ?? null}
              /></div>
              <div style={{padding:"6px 12px 2px", fontSize:"10px", color:"#666", textTransform:"uppercase", letterSpacing:"0.5px"}}>Appearance</div>
              <div style={{padding:"0 6px 6px"}}><ThemePicker current={themeKey} onChange={setThemeKey} /></div>
            </div>
          )}
        </div>
      </div>
      <div style={{display:"flex",gap:"24px",alignItems:"flex-start"}}>
        <div style={{flex:"3 1 0%",minWidth:"0"}}>
          <div id="tab-content" className="bg-brand-card rounded-2xl p-8 border border-white/5" style={{marginBottom:"24px"}}>
            <div style={{fontFamily:"monospace",fontSize:"1rem",lineHeight:"1.6"}}>{renderContent(content, showTablature, transpose, setActiveChord, theme)}</div>
            {showTablature && hasTab && !hasInlineTablature(content) && renderTablature(tablature)}
          </div>
          {usedChords.length > 0 && (
            <section className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4" style={{marginBottom:"24px"}}>
              <h2 className="text-2xl font-bold">Chords used in this tab</h2>
              <p className="text-sm text-brand-muted">Hover over a chord in the tab to see its shape. Click to enlarge:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:"12px"}}>
                {usedChords.map((c) => (<div key={c} onClick={() => setActiveChord(c)} style={{cursor:"pointer"}}><MiniFretboard chord={c} theme={theme} instrument={instrument} /></div>))}
              </div>
            </section>
          )}
          <SmartKey
            keySig={tab.key_sig}
            chords={usedChords}
            currentTranspose={transpose}
            onApplyTranspose={setTranspose}
          />
          <div className="flex items-center gap-2 text-sm text-brand-muted"><AlertTriangle size={16} className="text-brand-gold" /><span>Found an error? </span><button className="text-brand-gold hover:underline">Report this tab</button></div>
        </div>
        <div style={{flex:"1 0 320px",maxWidth:"360px"}}>
          <div style={{position:"sticky",top:"24px"}}>
            {youtubeId ? (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3" style={{marginBottom:"16px"}}>
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Watch &amp; Play</h3>
                <iframe className="w-full aspect-video rounded-xl border border-white/10" src={"https://www.youtube.com/embed/"+youtubeId} title={songName + " - " + artistName} allowFullScreen />
                <p className="text-xs text-brand-muted">Play along with the video while reading the tab.</p>
              </div>
            ) : youtubeLoading ? (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-3" style={{marginBottom:"16px"}}>
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Searching video...</h3>
                <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-brand-muted" size={24} /></div>
              </div>
            ) : (
              <div className="bg-brand-card rounded-2xl p-4 border border-white/5 space-y-2" style={{marginBottom:"16px"}}>
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
      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} theme={theme} instrument={instrument} />}
      {trainerOpen && <ChordTransitionTrainer chords={usedChords} onClose={() => setTrainerOpen(false)} theme={theme} />}
      {drumOpen && <DrumMachine genre={tab.genre || null} artist={artistName} song={songName} onClose={() => setDrumOpen(false)} accentColor={theme.dot} />}
      <AutoScrollControl />
    </div>
  );
}