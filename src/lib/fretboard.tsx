"use client";
import { useState, type ReactNode } from "react";
import { BadgeCheck, ChevronDown, Palette, X } from "lucide-react";
import { CHORD_SHAPES } from "./chordData";

export type ThemeKey = "amber" | "classic" | "emerald" | "crimson" | "ocean";

export const THEMES: Record<ThemeKey, {
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

export const THEME_KEYS: ThemeKey[] = ["amber", "classic", "emerald", "crimson", "ocean"];

export function MiniFretboard({ chord, theme }: { chord: string; theme: typeof THEMES[ThemeKey] }) {
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

export function ChordDiagram({ chord, onClose, theme }: { chord: string; onClose: () => void; theme: typeof THEMES[ThemeKey] }) {
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

export function ChordSpan({ chord, onClick, theme }: { chord: string; onClick: (chord: string) => void; theme: typeof THEMES[ThemeKey] }) {
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

export function ThemePicker({ current, onChange }: { current: ThemeKey; onChange: (k: ThemeKey) => void }) {
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
