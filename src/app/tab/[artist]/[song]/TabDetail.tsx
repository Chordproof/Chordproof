"use client";
import { useEffect, useState, type ReactNode } from "react";
import TransposeControls from "@/components/TransposeControls";
import {
  BadgeCheck, AlertTriangle, Share2, Bookmark, Play, MousePointer2,
  Loader2, ChevronDown, Youtube, X, Palette,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  CHORD_TOKEN_RE, CHORD_STRICT_RE, TAB_LINE_RE, CHORD_SHAPES,
  transposeChord, chordsUsed,
} from "@/lib/chordData";

type ThemeKey = "amber" | "classic" | "emerald" | "crimson" | "ocean";

const THEMES: Record<ThemeKey, {
  label: string; swatch: string;
  wood1: string; wood2: string; wood3: string; wood4: string; wood5: string;
  border: string; nut1: string; nut2: string; nut3: string;
  fret1: string; fret2: string; fret3: string;
  strThick1: string; strThick2: string; strThin1: string; strThin2: string;
  dot: string; dotHi: string; dotGlow: string;
  text: string; muted: string; x: string; o: string;
}> = {
  amber: {
    label: "Amber", swatch: "#f0b429",
    wood1: "#5a3a28", wood2: "#3e2418", wood3: "#2a1810", wood4: "#1e1208", wood5: "#3a2418",
    border: "#6a4a2a", nut1: "#f8ecd8", nut2: "#d4c4a6", nut3: "#a09078",
    fret1: "#b8b8b8", fret2: "#7a7a7a", fret3: "#4a4a4a",
    strThick1: "#b8a06a", strThick2: "#e8d8a0", strThin1: "#c0c0c0", strThin2: "#f0f0f0",
    dot: "#f0b429", dotHi: "#ffe080", dotGlow: "rgba(240,180,41,0.4)",
    text: "#f0b429", muted: "#a09070", x: "#ff6b6b", o: "#69db7c",
  },
  classic: {
    label: "Classic", swatch: "#333333",
    wood1: "#4a3020", wood2: "#3a2418", wood3: "#2a1810", wood4: "#1e1208", wood5: "#3a2418",
    border: "#5a3a1a", nut1: "#f0e4d0", nut2: "#c4b496", nut3: "#908068",
    fret1: "#b0b0b0", fret2: "#707070", fret3: "#404040",
    strThick1: "#a08858", strThick2: "#d4c496", strThin1: "#b0b0b0", strThin2: "#e0e0e0",
    dot: "#2a2a2a", dotHi: "#5a5a5a", dotGlow: "rgba(0,0,0,0.3)",
    text: "#e0e0e0", muted: "#888", x: "#ff6b6b", o: "#69db7c",
  },
  emerald: {
    label: "Emerald", swatch: "#10b981",
    wood1: "#3a2a1a", wood2: "#2a2010", wood3: "#1a1408", wood4: "#100a04", wood5: "#2a2010",
    border: "#4a3a1a", nut1: "#e8e4d0", nut2: "#c0bca0", nut3: "#888470",
    fret1: "#a8b0a8", fret2: "#6a7a6a", fret3: "#3a4a3a",
    strThick1: "#9ab08a", strThick2: "#c4d4b0", strThin1: "#a8b8a0", strThin2: "#d0e0c8",
    dot: "#10b981", dotHi: "#5eead4", dotGlow: "rgba(16,185,129,0.4)",
    text: "#34d399", muted: "#5a8a6a", x: "#ff6b6b", o: "#69db7c",
  },
  crimson: {
    label: "Crimson", swatch: "#dc2626",
    wood1: "#4a1a1a", wood2: "#3a0e0e", wood3: "#2a0808", wood4: "#1e0404", wood5: "#3a0e0e",
    border: "#5a1a1a", nut1: "#e8d4d0", nut2: "#c4a0a0", nut3: "#906868",
    fret1: "#b0a0a0", fret2: "#7a6060", fret3: "#4a3838",
    strThick1: "#b08888", strThick2: "#d4a8a8", strThin1: "#b0a0a0", strThin2: "#e0d0d0",
    dot: "#dc2626", dotHi: "#ff6b6b", dotGlow: "rgba(220,38,38,0.4)",
    text: "#ff6b6b", muted: "#a07070", x: "#ff6b6b", o: "#69db7c",
  },
  ocean: {
    label: "Ocean", swatch: "#2563eb",
    wood1: "#2a3a5a", wood2: "#1a2a4a", wood3: "#0a1a3a", wood4: "#040a1e", wood5: "#1a2a4a",
    border: "#2a3a6a", nut1: "#d8e0f0", nut2: "#a0b0c8", nut3: "#687890",
    fret1: "#a0b0c0", fret2: "#6a7a8a", fret3: "#3a4a5a",
    strThick1: "#8898b8", strThick2: "#b8c8e0", strThin1: "#a0b0c8", strThin2: "#d0e0f0",
    dot: "#2563eb", dotHi: "#60a5fa", dotGlow: "rgba(37,99,235,0.4)",
    text: "#60a5fa", muted: "#5a7090", x: "#ff6b6b", o: "#69db7c",
  },
};

const THEME_KEYS: ThemeKey[] = ["amber", "classic", "emerald", "crimson", "ocean"];

function MiniFretboard({ chord, theme }: { chord: string; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const shape = CHORD_SHAPES[chord];
  if (!shape) {
    return (
      <div style={{
        background:"linear-gradient(180deg,"+C.wood2+","+C.wood4+")",
        border:"2px solid "+C.border, borderRadius:"8px", padding:"8px", width:"150px",
        textAlign:"center",
        boxShadow:"0 6px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,200,100,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
      }}>
        <div style={{color:C.text,fontWeight:"bold",fontSize:"14px",marginBottom:"4px"}}>{chord}</div>
        <div style={{color:C.muted,fontSize:"11px"}}>N/A</div>
      </div>
    );
  }
  const posFrets = shape.filter((f:number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret+1, baseFret+2, baseFret+3, baseFret+4];
  const stringW = [3.5, 3, 2.5, 2, 1.5, 1.2];
  const dotSize = 16;
  const woodGrad = "linear-gradient(180deg,"+C.wood1+" 0%,"+C.wood2+" 20%,"+C.wood3+" 45%,"+C.wood4+" 70%,"+C.wood5+" 100%)";

  return (
    <div style={{
      background: woodGrad,
      border:"2px solid "+C.border, borderRadius:"8px", padding:"8px", width:"150px",
      boxShadow:"0 6px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,200,100,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
    }}>
      <div style={{color:C.text,fontWeight:"bold",textAlign:"center",fontSize:"14px",marginBottom:"6px",
        textShadow:"0 1px 2px rgba(0,0,0,0.5)"}}>{chord}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",marginBottom:"2px"}}>
        {shape.map((f:number,i:number) => (
          <div key={i} style={{textAlign:"center",fontSize:"11px",color:f===-1?C.x:f===0?C.o:C.muted,fontWeight:600}}>
            {f===-1?"\u00d7":f===0?"\u25cb":""}
          </div>
        ))}
      </div>
      <div style={{
        height:"5px",
        background:"linear-gradient(180deg,"+C.nut1+","+C.nut2+","+C.nut3+")",
        borderRadius:"2px",
        boxShadow:"0 2px 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
      }} />
      {frets.map((fret:number,fi:number) => (
        <div key={fret} style={{position:"relative",height:"22px",
          background: fi % 2 === 0 ? "rgba(0,0,0,0.03)" : "transparent",
        }}>
          <div style={{
            position:"absolute",top:"0",left:"-2px",right:"-2px",height:"2px",
            background:"linear-gradient(180deg,"+C.fret1+","+C.fret2+","+C.fret3+")",
            boxShadow:"0 1px 1px rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.05)",
          }} />
          {shape.map((f:number,i:number) => (
            <div key={i} style={{
              position:"absolute",
              left:((i+0.5)/6*100)+"%",
              top:"-1px",bottom:"-1px",
              width:stringW[i]+"px",
              marginLeft:-(stringW[i]/2)+"px",
              background: i < 3
                ? "linear-gradient(90deg,"+C.strThick1+",#ffffff 45%,"+C.strThick2+" 55%,"+C.strThick1+")"
                : "linear-gradient(90deg,"+C.strThin1+",#ffffff 45%,"+C.strThin2+" 55%,"+C.strThin1+")",
              borderRadius:"1px",
              boxShadow:"0 0 2px rgba(0,0,0,0.5), 0 1px 1px rgba(0,0,0,0.2)",
            }} />
          ))}
          {shape.map((f:number,i:number) => (
            f===fret ? (
              <div key={"d"+i} style={{
                position:"absolute",
                left:((i+0.5)/6*100)+"%",
                top:"50%",
                width:dotSize+"px",height:dotSize+"px",
                marginLeft:-(dotSize/2)+"px",marginTop:-(dotSize/2)+"px",
                borderRadius:"50%",
                background:"radial-gradient(circle at 30% 25%,"+C.dotHi+" 0%,"+C.dot+" 45%,"+C.dot+" 70%,rgba(0,0,0,0.6) 100%)",
                boxShadow:"0 2px 4px rgba(0,0,0,0.6), 0 0 6px "+C.dotGlow+", inset 0 -2px 3px rgba(0,0,0,0.35), inset 0 2px 2px rgba(255,255,255,0.5)",
                zIndex:"2",
              }} />
            ) : null
          ))}
        </div>
      ))}
      {baseFret > 0 && <div style={{textAlign:"right",fontSize:"10px",color:C.muted,marginTop:"2px"}}>{baseFret+1}fr</div>}
    </div>
  );
}

function ChordDiagram({ chord, onClose, theme }: { chord: string; onClose: () => void; theme: typeof THEMES[ThemeKey] }) {
  const C = theme;
  const shape = CHORD_SHAPES[chord];
  const posFrets = (shape||[]).filter((f:number) => f > 0);
  const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
  const baseFret = minPos > 3 ? minPos - 1 : 0;
  const frets = [baseFret+1, baseFret+2, baseFret+3, baseFret+4];
  const stringW = [5, 4.5, 4, 3.5, 3, 2.5];
  const dotSize = 28;
  const woodGrad = "linear-gradient(180deg,"+C.wood1+" 0%,"+C.wood2+" 20%,"+C.wood3+" 45%,"+C.wood4+" 70%,"+C.wood5+" 100%)";

  return (
    <div style={{position:"fixed",inset:"0",zIndex:"9999",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.85)",padding:"16px"}} onClick={onClose}>
      <div style={{
        background: woodGrad,
        border:"3px solid "+C.border, borderRadius:"12px", padding:"28px",
        boxShadow:"0 8px 40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,200,100,0.1), inset 0 -1px 0 rgba(0,0,0,0.4)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          <span style={{color:C.text,fontWeight:"bold",fontSize:"28px",textShadow:"0 2px 4px rgba(0,0,0,0.5)"}}>{chord}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:"36px",height:"36px",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={18} />
          </button>
        </div>
        {shape ? (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",marginBottom:"4px"}}>
              {shape.map((f:number,i:number) => (
                <div key={i} style={{textAlign:"center",fontSize:"20px",color:f===-1?C.x:f===0?C.o:C.muted,fontWeight:600}}>
                  {f===-1?"\u00d7":f===0?"\u25cb":""}
                </div>
              ))}
            </div>
            <div style={{
              height:"8px",
              background:"linear-gradient(180deg,"+C.nut1+","+C.nut2+","+C.nut3+")",
              borderRadius:"2px",
              boxShadow:"0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
            }} />
            {frets.map((fret:number,fi:number) => (
              <div key={fret} style={{position:"relative",height:"44px",
                background: fi % 2 === 0 ? "rgba(0,0,0,0.04)" : "transparent",
              }}>
                <div style={{
                  position:"absolute",top:"0",left:"-3px",right:"-3px",height:"3px",
                  background:"linear-gradient(180deg,"+C.fret1+","+C.fret2+","+C.fret3+")",
                  boxShadow:"0 1px 2px rgba(0,0,0,0.4), 0 -1px 0 rgba(255,255,255,0.06)",
                }} />
                {shape.map((f:number,i:number) => (
                  <div key={i} style={{
                    position:"absolute",
                    left:((i+0.5)/6*100)+"%",
                    top:"-1px",bottom:"-1px",
                    width:stringW[i]+"px",
                    marginLeft:-(stringW[i]/2)+"px",
                    background: i < 3
                      ? "linear-gradient(90deg,"+C.strThick1+",#ffffff 45%,"+C.strThick2+" 55%,"+C.strThick1+")"
                      : "linear-gradient(90deg,"+C.strThin1+",#ffffff 45%,"+C.strThin2+" 55%,"+C.strThin1+")",
                    borderRadius:"1px",
                    boxShadow:"0 0 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.2)",
                  }} />
                ))}
                {shape.map((f:number,i:number) => (
                  f===fret ? (
                    <div key={"d"+i} style={{
                      position:"absolute",
                      left:((i+0.5)/6*100)+"%",
                      top:"50%",
                      width:dotSize+"px",height:dotSize+"px",
                      marginLeft:-(dotSize/2)+"px",marginTop:-(dotSize/2)+"px",
                      borderRadius:"50%",
                      background:"radial-gradient(circle at 30% 25%,"+C.dotHi+" 0%,"+C.dot+" 45%,"+C.dot+" 70%,rgba(0,0,0,0.6) 100%)",
                      boxShadow:"0 3px 6px rgba(0,0,0,0.6), 0 0 10px "+C.dotGlow+", inset 0 -3px 4px rgba(0,0,0,0.35), inset 0 3px 3px rgba(255,255,255,0.5)",
                      zIndex:"2",
                    }} />
                  ) : null
                ))}
              </div>
            ))}
            {baseFret > 0 && <div style={{textAlign:"right",fontSize:"14px",color:C.muted,marginTop:"6px"}}>Starting at fret {baseFret+1}</div>}
          </div>
        ) : (
          <p style={{color:C.muted,fontSize:"14px"}}>Diagram not available for {chord}.</p>
        )}
        <p style={{color:C.muted,fontSize:"11px",textAlign:"center",marginTop:"16px"}}>Click anywhere to close</p>
      </div>
    </div>
  );
}

function ChordSpan({ chord, onClick, theme }: { chord: string; onClick: (chord: string) => void; theme: typeof THEMES[ThemeKey] }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <span style={{position:"relative",display:"inline-block",color:"#34d399",fontWeight:700,cursor:"pointer"}}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => onClick(chord)}>
      {chord}
      {showTip && (
        <span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",marginBottom:"10px",zIndex:"9999",display:"block"}}>
          <MiniFretboard chord={chord} theme={theme} />
        </span>
      )}
    </span>
  );
}

function ThemePicker({ current, onChange }: { current: ThemeKey; onChange: (k: ThemeKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <button
        onClick={() => setOpen(!open)}
        className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition " + (open ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10")}
      >
        <Palette size={16} /> Theme: {THEMES[current].label}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"100%", right:"0", marginTop:"8px",
          background:"#1a1a2e", border:"1px solid #333", borderRadius:"12px",
          padding:"8px", zIndex:"9999", minWidth:"180px",
          boxShadow:"0 8px 24px rgba(0,0,0,0.6)",
        }}>
          {THEME_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpen(false); }}
              style={{
                display:"flex", alignItems:"center", gap:"10px",
                width:"100%", padding:"8px 12px",
                background: k === current ? "rgba(240,180,41,0.1)" : "transparent",
                border:"none", borderRadius:"8px", cursor:"pointer",
                color: k === current ? "#f0b429" : "#e0e0e0",
                fontSize:"13px", fontWeight: k === current ? 700 : 400,
              }}
            >
              <span style={{
                width:"16px", height:"16px", borderRadius:"50%",
                background:"radial-gradient(circle at 30% 25%,"+THEMES[k].dotHi+","+THEMES[k].dot+")",
                border:"1px solid "+THEMES[k].border,
                flexShrink:0,
                boxShadow:"0 0 4px "+THEMES[k].dotGlow,
              }} />
              {THEMES[k].label}
              {k === current && <BadgeCheck size={14} style={{marginLeft:"auto"}} />}
            </button>
          ))}
        </div>
      )}
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
  const [youtubeId, setYoutubeId] = useState<string>("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>("amber");

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-theme") as ThemeKey | null;
    if (saved && THEMES[saved]) setThemeKey(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("chordproof-theme", themeKey);
  }, [themeKey]);

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
      parts.push(<ChordSpan key={c++} chord={ch} onClick={setActiveChord} theme={theme} />);
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
          <ChevronDown size={16} /> Tablature {showTablature ? "ON" : "OFF"}
        </button>
        <div className="ml-auto">
          <ThemePicker current={themeKey} onChange={setThemeKey} />
        </div>
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
                  <div key={c} onClick={() => setActiveChord(c)} style={{cursor:"pointer"}}><MiniFretboard chord={c} theme={theme} /></div>
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

      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} theme={theme} />}
    </div>
  );
}
