"use client";
import { useEffect, useState, type ReactNode } from "react";
import TransposeControls from "@/components/TransposeControls";
import {
  BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2,
  Loader2, ChevronDown, Youtube, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  CHORD_TOKEN_RE, CHORD_STRICT_RE, TAB_LINE_RE, CHORD_SHAPES,
  transposeChord, chordsUsed,
} from "@/lib/chordData";

function MiniFretboard({ chord }: { chord: string }) {
  const shape = CHORD_SHAPES[chord];
  if (!shape) {
    return (
      <div style={{
        background:"linear-gradient(180deg,#3a2418,#1a0e08)",
        border:"2px solid #5a3a1a",
        borderRadius:"6px",
        padding:"6px",
        width:"96px",
        textAlign:"center",
        boxShadow:"0 4px 12px rgba(0,0,0,0.6)",
      }}>
        <div style={{color:"#f0b429",fontWeight:"bold",fontSize:"12px",marginBottom:"2px"}}>{chord}</div>
        <div style={{color:"#666",fontSize:"10px"}}>N/A</div>
      </div>
    );
  }
  const posFrets = shape.filter((f:number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret+1, baseFret+2, baseFret+3, baseFret+4];
  const stringWidths = [2.5, 2, 1.5, 1.2, 1, 0.8];

  return (
    <div style={{
      background:"linear-gradient(180deg,#3a2418 0%,#2a1810 30%,#1e1208 60%,#2a1810 100%)",
      border:"2px solid #4a2a10",
      borderRadius:"6px",
      padding:"5px",
      width:"96px",
      boxShadow:"0 4px 14px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,200,100,0.05)",
    }}>
      <div style={{color:"#f0b429",fontWeight:"bold",textAlign:"center",fontSize:"12px",marginBottom:"3px"}}>
        {chord}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",marginBottom:"1px"}}>
        {shape.map((f:number,i:number) => (
          <div key={i} style={{textAlign:"center",fontSize:"9px",color:f===-1?"#ff6b6b":f===0?"#69db7c":"#555"}}>
            {f===-1?"\u00d7":f===0?"\u25cb":""}
          </div>
        ))}
      </div>
      <div style={{
        height:"3px",
        background:"linear-gradient(180deg,#e8dcc8,#c4b496,#a09078)",
        borderRadius:"1px",
        marginBottom:"0",
        boxShadow:"0 1px 2px rgba(0,0,0,0.4)",
      }} />
      {frets.map((fret:number,fi:number) => (
        <div key={fret} style={{position:"relative",height:"13px"}}>
          <div style={{
            position:"absolute",top:"0",left:"0",right:"0",height:"1px",
            background:"linear-gradient(180deg,#8a8a8a,#5a5a5a,#3a3a3a)",
            boxShadow:"0 1px 0 rgba(255,255,255,0.03)",
          }} />
          {shape.map((f:number,i:number) => (
            <div key={i} style={{
              position:"absolute",
              left:((i+0.5)/6*100)+"%",
              top:"0",bottom:"0",
              width:stringWidths[i]+"px",
              marginLeft:-(stringWidths[i]/2)+"px",
              background: i < 3
                ? "linear-gradient(90deg,#8a7a5a,#d4c496,#8a7a5a)"
                : "linear-gradient(90deg,#aaa,#eee,#aaa)",
              borderRadius:"0.5px",
              boxShadow:"0 0 1px rgba(0,0,0,0.3)",
            }} />
          ))}
          {shape.map((f:number,i:number) => (
            f===fret ? (
              <div key={"d"+i} style={{
                position:"absolute",
                left:((i+0.5)/6*100)+"%",
                top:"50%",
                width:"9px",height:"9px",
                marginLeft:"-4.5px",marginTop:"-4.5px",
                borderRadius:"50%",
                background:"radial-gradient(circle at 35% 30%,#ffd966,#f0b429 50%,#b8860b 100%)",
                boxShadow:"0 1px 2px rgba(0,0,0,0.5), inset 0 -1px 1px rgba(0,0,0,0.2)",
                zIndex:"2",
              }} />
            ) : null
          ))}
        </div>
      ))}
      {baseFret > 0 && (
        <div style={{textAlign:"right",fontSize:"8px",color:"#888",marginTop:"1px"}}>
          {baseFret+1}fr
        </div>
      )}
    </div>
  );
}

function ChordDiagram({ chord, onClose }: { chord: string; onClose: () => void }) {
  const shape = CHORD_SHAPES[chord];
  const posFrets = (shape||[]).filter((f:number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret+1, baseFret+2, baseFret+3, baseFret+4];
  const stringWidths = [4, 3.5, 3, 2.5, 2, 1.5];

  return (
    <div style={{position:"fixed",inset:"0",zIndex:"9999",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",padding:"16px"}} onClick={onClose}>
      <div style={{
        background:"linear-gradient(180deg,#3a2418 0%,#2a1810 30%,#1e1208 60%,#2a1810 100%)",
        border:"3px solid #4a2a10",
        borderRadius:"12px",
        padding:"24px",
        boxShadow:"0 8px 40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,200,100,0.08)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          <span style={{color:"#f0b429",fontWeight:"bold",fontSize:"28px"}}>{chord}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:"36px",height:"36px",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={18} />
          </button>
        </div>
        {shape ? (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",marginBottom:"4px"}}>
              {shape.map((f:number,i:number) => (
                <div key={i} style={{textAlign:"center",fontSize:"18px",color:f===-1?"#ff6b6b":f===0?"#69db7c":"#555"}}>
                  {f===-1?"\u00d7":f===0?"\u25cb":""}
                </div>
              ))}
            </div>
            <div style={{
              height:"6px",
              background:"linear-gradient(180deg,#f0e4d0,#d4c4a6,#a09078)",
              borderRadius:"2px",
              marginBottom:"0",
              boxShadow:"0 2px 4px rgba(0,0,0,0.5)",
            }} />
            {frets.map((fret:number,fi:number) => (
              <div key={fret} style={{position:"relative",height:"36px"}}>
                <div style={{
                  position:"absolute",top:"0",left:"0",right:"0",height:"2px",
                  background:"linear-gradient(180deg,#9a9a9a,#6a6a6a,#3a3a3a)",
                  boxShadow:"0 1px 0 rgba(255,255,255,0.05)",
                }} />
                {shape.map((f:number,i:number) => (
                  <div key={i} style={{
                    position:"absolute",
                    left:((i+0.5)/6*100)+"%",
                    top:"0",bottom:"0",
                    width:stringWidths[i]+"px",
                    marginLeft:-(stringWidths[i]/2)+"px",
                    background: i < 3
                      ? "linear-gradient(90deg,#8a7a5a,#e4d4a6,#8a7a5a)"
                      : "linear-gradient(90deg,#bbb,#fff,#bbb)",
                    borderRadius:"1px",
                    boxShadow:"0 0 2px rgba(0,0,0,0.4)",
                  }} />
                ))}
                {shape.map((f:number,i:number) => (
                  f===fret ? (
                    <div key={"d"+i} style={{
                      position:"absolute",
                      left:((i+0.5)/6*100)+"%",
                      top:"50%",
                      width:"22px",height:"22px",
                      marginLeft:"-11px",marginTop:"-11px",
                      borderRadius:"50%",
                      background:"radial-gradient(circle at 35% 30%,#ffd966,#f0b429 50%,#b8860b 100%)",
                      boxShadow:"0 2px 4px rgba(0,0,0,0.6), inset 0 -2px 2px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.3)",
                      zIndex:"2",
                    }} />
                  ) : null
                ))}
              </div>
            ))}
            {baseFret > 0 && (
              <div style={{textAlign:"right",fontSize:"13px",color:"#888",marginTop:"6px"}}>
                Starting at fret {baseFret+1}
              </div>
            )}
          </div>
        ) : (
          <p style={{color:"#9E9E9E",fontSize:"14px"}}>Diagram not available for {chord}.</p>
        )}
        <p style={{color:"#666",fontSize:"11px",textAlign:"center",marginTop:"16px"}}>Click anywhere to close</p>
      </div>
    </div>
  );
}

function ChordSpan({ chord, onClick }: { chord: string; onClick: (chord: string) => void }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <span style={{position:"relative",display:"inline-block",color:"#34d399",fontWeight:700,cursor:"pointer"}}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => onClick(chord)}>
      {chord}
      {showTip && (
        <span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",marginBottom:"8px",zIndex:"9999",display:"block"}}>
          <MiniFretboard chord={chord} />
        </span>
      )}
    </span>
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
  const [youtubeId, setYoutubeId] = useState<string>("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);

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
    const existingId = tab.youtube_id || tab.video_id || tab.youtube || tab.video_url || tab.yt_id || "";
    if (existingId) { setYoutubeId(existingId); return; }
    setYoutubeLoading(true);
    const a = tab.artist || params.artist.replace(/-/g, " ");
    const s = tab.song || params.song.replace(/-/g, " ");
    fetch("/api/youtube-search?q=" + encodeURIComponent(a + " " + s + " official"))
      .then((r) => r.json())
      .then((d) => { if (d.videoId) setYoutubeId(d.videoId); })
      .catch(() => {})
      .finally(() => setYoutubeLoading(false));
  }, [tab]);

  useEffect(() => {
    if (!autoScroll) return;
    const id = setInterval(() => { window.scrollBy({ top: scrollSpeed * 2, behavior: "smooth" }); }, 100);
    return () => clearInterval(id);
  }, [autoScroll, scrollSpeed]);

  function renderPair(chordLine: string, lyricLine: string, key: number): ReactNode {
    const parts: ReactNode[] = [];
    let li = 0, c = 0;
    const re = new RegExp(CHORD_TOKEN_RE.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(chordLine)) !== null) {
      if (m[0] === "") { re.lastIndex++; continue; }
      parts.push(chordLine.slice(li, m.index));
      const ch = transposeChord(m[1], transpose);
      parts.push(<ChordSpan key={c++} chord={ch} onClick={setActiveChord} />);
      li = m.index + m[1].length;
    }
    parts.push(chordLine.slice(li));
    return (
      <div key={key} style={{marginBottom:"2px"}}>
        <div style={{whiteSpace:"pre-wrap",height:"1.3em",lineHeight:"1.3em",fontFamily:"monospace",color:"#34d399",fontWeight:700}}>{parts}</div>
        {lyricLine && <div style={{whiteSpace:"pre-wrap",lineHeight:"1.3em",fontFamily:"monospace",color:"#e0e0e0"}}>{lyricLine}</div>}
      </div>
    );
  }

  function renderContent(content: string): ReactNode[] {
    const lines = content.split("\n");
    const result: ReactNode[] = [];
    let i = 0, kc = 0;
    while (i < lines.length) {
      const line = lines[i] || "";
      const tr = line.trim();
      if (!tr) { result.push(<div key={kc++} style={{height:"0.8em"}}>&nbsp;</div>); i++; continue; }
      if (tr.startsWith("[") && tr.endsWith("]")) {
        result.push(<div key={kc++} style={{color:"#f0b429",fontWeight:700,marginTop:"16px",marginBottom:"4px",fontSize:"1.1em"}}>{tr}</div>);
        i++; continue;
      }
      const tokens = tr.split(/\s+/).filter(Boolean);
      const isChord = tokens.length > 0 && tokens.every((t:string) => CHORD_STRICT_RE.test(t));
      if (isChord) {
        const nl = lines[i+1] || "";
        const nt = nl.trim();
        let pair = false;
        if (nt) {
          const ntk = nt.split(/\s+/).filter(Boolean);
          const nIsChord = ntk.length > 0 && ntk.every((t:string) => CHORD_STRICT_RE.test(t));
          const nIsHdr = nt.startsWith("[") && nt.endsWith("]");
          const nIsTab = TAB_LINE_RE.test(nt);
          if (!nIsChord && !nIsHdr && !nIsTab) pair = true;
        }
        if (pair) { result.push(renderPair(line, nl, kc++)); i += 2; continue; }
        else { result.push(renderPair(line, "", kc++)); i++; continue; }
      }
      if (TAB_LINE_RE.test(tr)) {
        if (showTablature) { result.push(<div key={kc++} style={{whiteSpace:"pre-wrap",fontFamily:"monospace",color:"#9E9E9E",fontSize:"0.9em",lineHeight:"1.3em"}}>{line}</div>); }
        i++; continue;
      }
      result.push(<div key={kc++} style={{whiteSpace:"pre-wrap",lineHeight:"1.6em",fontFamily:"monospace",color:"#e0e0e0"}}>{line}</div>);
      i++;
    }
    return result;
  }

  function renderTablature(tab: string): ReactNode {
    if (!tab || !tab.trim()) return null;
    const lines = tab.split("\n");
    return (
      <div style={{background:"#0a0a0a",borderRadius:"12px",padding:"16px",border:"1px solid #333",marginTop:"16px",maxHeight:"500px",overflowY:"auto"}}>
        <div style={{color:"#f0b429",fontWeight:700,fontSize:"14px",marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}>
          <ChevronDown size={16} /> Tablature Notation
        </div>
        {lines.map((line, i) => (
          <div key={i} style={{whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:"0.85em",lineHeight:"1.4em",color:TAB_LINE_RE.test(line)?"#69db7c":"#9E9E9E"}}>{line || "\u00a0"}</div>
        ))}
      </div>
    );
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-brand-muted"><Loader2 className="animate-spin mr-3" /> Loading tab...</div>;
  }
  if (notFound || !tab) {
    return (
      <div className="text-center py-32 space-y-4">
        <h1 className="text-3xl font-bold">Tab not found</h1>
        <p className="text-brand-muted">This tab isn't in our database yet.</p>
        <a href="/request" className="inline-block bg-brand-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition">Request this tab</a>
      </div>
    );
  }

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");
  const content: string = tab.content || "";
  const tablature: string = tab.tablature || "";
  const versions: string[] = Array.isArray(tab.versions) ? tab.versions : [];
  const usedChords = chordsUsed(content, transpose);
  const hasTab = tablature && tablature.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li><a href="/" className="hover:text-white">Home</a></li>
          <li>/</li>
          <li><a href="/browse" className="hover:text-white">Browse</a></li>
          <li>/</li>
          <li><a href={"/artist/"+params.artist} className="hover:text-white capitalize">{artistName}</a></li>
        </ol>
      </nav>

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
            {tab.key_sig && <span className="bg-white/5 px-3 py-1 rounded text-sm">Key: <strong>{tab.key_sig}</strong></span>}
            {tab.difficulty && <span className="bg-white/5 px-3 py-1 rounded text-sm">Difficulty: <strong className="text-green-400">{tab.difficulty}</strong></span>}
            {tab.capo && <span className="bg-white/5 px-3 py-1 rounded text-sm">Capo: <strong>{tab.capo}</strong></span>}
            {tab.views !== undefined && <span className="bg-white/5 px-3 py-1 rounded text-sm">{tab.views} views</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleShare} className="p-3 bg-white/5 rounded-full hover:bg-white/10" title={copied ? "Link copied!" : "Share"}>
            <Share2 size={20} className={copied ? "text-brand-gold" : ""} />
          </button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" title="Bookmark"><Bookmark size={20} /></button>
          <a href="#tab-content" className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition"><Play size={18} /> Play</a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-2xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoScroll(!autoScroll)} className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}>
            <MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>
          {autoScroll && <input type="range" min={1} max={10} value={scrollSpeed} onChange={(e) => setScrollSpeed(Number(e.target.value))} className="w-32" aria-label="Scroll speed" />}
        </div>
        <button onClick={() => setShowTablature(!showTablature)} className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (showTablature ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}>
          <ChevronDown size={16} /> Tablatura {showTablature ? "ON" : "OFF"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div id="tab-content" className="bg-brand-card rounded-2xl p-8 border border-white/5">
            <div style={{fontFamily:"monospace",fontSize:"1rem",lineHeight:"1.6"}}>{renderContent(content)}</div>
            {showTablature && hasTab && renderTablature(tablature)}
          </div>

          {usedChords.length > 0 && (
            <section className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
              <h2 className="text-2xl font-bold">Chords used in this tab</h2>
              <p className="text-sm text-brand-muted">Hover over a chord in the tab to see its shape. Click to enlarge:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:"16px"}}>
                {usedChords.map((c) => (
                  <div key={c} onClick={() => setActiveChord(c)} style={{cursor:"pointer"}}><MiniFretboard chord={c} /></div>
                ))}
              </div>
            </section>
          )}

          {versions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">Other versions</h2>
              <select className="bg-brand-card border border-white/10 rounded-lg px-4 py-2 text-sm">
                {versions.map((v:string) => <option key={v} value={v}>Version {v}</option>)}
              </select>
            </section>
          )}

          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <AlertTriangle size={16} className="text-brand-gold" />
            <span>Found an error? </span>
            <button className="text-brand-gold hover:underline">Report this tab</button>
          </div>
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
                  {usedChords.map((c) => (
                    <button key={c} onClick={() => setActiveChord(c)} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm hover:bg-brand-gold/10 transition-colors" style={{color:"#34d399",fontWeight:700}}>{c}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} />}
    </div>
  );
}
