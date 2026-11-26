"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import TransposeControls from "@/components/TransposeControls";
import StageMode from "@/components/StageMode";
import EasyModeToggle, { EasyModeNotice } from "@/components/EasyModeToggle";
import PdfButton from "@/components/PdfButton";
import PrintButton from "@/components/PrintButton";
import InstrumentPicker from "@/components/InstrumentPicker";
import { ThemePicker, type ThemeKey } from "@/lib/fretboard";
import type { InstrumentKey } from "@/lib/instruments";
import { Zap, Drum, MoreHorizontal } from "lucide-react";

/**
 * TabActionBar — a barra de ações da cifra.
 *
 * POR QUE EXISTE: antes essa barra vivia dentro do TabDetailComponent e, medida
 * em produção a 1280px, gastava 122px de altura em DUAS linhas — o seletor de
 * instrumento caía sozinho na segunda linha e nove controles tinham o mesmo
 * peso visual (Trainer, que é recurso Plus, igual a Tablature, que é o mais
 * usado na leitura).
 *
 * DESENHO NOVO: uma linha, com hierarquia.
 *   esquerda  → Transpose (âncora), depois os controles de leitura
 *   direita   → instrumento e o menu "More"
 *   Aviso do Easy Mode ganha faixa própria embaixo, em vez de empurrar nada.
 *
 * CELULAR (≤767px): os nove controles continuam TODOS visíveis, em ícone
 * (medido: 375px de conteúdo em 386px úteis). O rótulo escrito fica no
 * `title`/`aria-label`, então continua acessível e com tooltip.
 *
 * Nota de cor: só `Tablature ON` e `Easy ON` recebem dourado, porque são os
 * únicos com estado. O resto é neutro — antes o CTA escuro do Tablature
 * competia com cinco botões cinza idênticos.
 *
 * O CSS vive aqui dentro (styled-jsx global) porque esta barra é a única
 * consumidora; assim não é preciso republicar o globals.css inteiro.
 */
export default function TabActionBar({
  transpose,
  onTranspose,
  showTablature,
  onToggleTablature,
  plusAccess,
  onOpenTrainer,
  onOpenDrums,
  easyContent,
  easyOn,
  onEasyToggle,
  onEasyOverride,
  easyCapo,
  easyDismissed,
  onEasyDismiss,
  easyApply,
  onEasyTry,
  instrument,
  onInstrumentChange,
  themeKey,
  onThemeChange,
  songName,
  artistName,
  content,
  capo,
  keySig,
  tab,
  stageChildren,
}: {
  transpose: number;
  onTranspose: (n: number) => void;
  showTablature: boolean;
  onToggleTablature: () => void;
  plusAccess: boolean;
  onOpenTrainer: () => void;
  onOpenDrums: () => void;
  easyContent: string;
  easyOn: boolean;
  onEasyToggle: (next: boolean) => void;
  onEasyOverride: (easyContent: string | null, capo: number | null) => void;
  easyCapo: number | null;
  easyDismissed: boolean;
  onEasyDismiss: () => void;
  easyApply: number;
  onEasyTry: () => void;
  instrument: InstrumentKey;
  onInstrumentChange: (k: InstrumentKey) => void;
  themeKey: ThemeKey;
  onThemeChange: (k: ThemeKey) => void;
  songName: string;
  artistName: string;
  content: string;
  capo?: string | null;
  keySig?: string | null;
  tab: any;
  /** a cifra renderizada, para o Stage Mode abrir em tela cheia */
  stageChildren: ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  // fecha o menu com Esc ou clique fora (antes ele só fechava clicando no botão)
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <>
      <style jsx global>{`
/* ==================================================================
   ACTION BAR DA CIFRA (tbar)
   Uma linha no desktop; no celular todos os controles continuam
   visiveis, em icone. Antes a barra quebrava em 2 linhas (122px) e o
   seletor de instrumento caia sozinho na segunda linha.
   ================================================================== */
.tbar {
  background: var(--c-card);
  -webkit-backdrop-filter: blur(var(--c-glass-blur, 14px)) saturate(1.15);
          backdrop-filter: blur(var(--c-glass-blur, 14px)) saturate(1.15);
  border: 1px solid var(--c-hairline);
  border-radius: 14px;
  box-shadow: var(--c-shadow);
}
.tbar-in {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 8px 9px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}
.tbar-in::-webkit-scrollbar { display: none; }

.tgroup {
  display: flex;
  align-items: center;
  gap: 1px;
  flex: 0 0 auto;
  background: var(--c-overlay-soft);
  border-radius: 10px;
  padding: 3px;
}
.tstep {
  width: 27px; height: 27px; flex: 0 0 27px;
  display: grid; place-items: center;
  border: 0; border-radius: 7px; cursor: pointer;
  background: transparent; color: var(--c-text);
  font-size: 16px; font-weight: 700; line-height: 1;
  font-family: inherit;
  transition: background 140ms ease;
}
.tstep:hover { background: var(--c-overlay); }
.tstep:focus-visible { outline: 2px solid var(--c-gold); outline-offset: 1px; }
.tval { min-width: 48px; text-align: center; line-height: 1.05; }
.tval .lb {
  display: block; font-size: 8px; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--c-text-tertiary); font-weight: 800;
}
.tval .nm { display: block; font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }

.tsep { width: 1px; height: 22px; background: var(--c-hairline); margin: 0 5px; flex: 0 0 1px; }

.tbtn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 33px; padding: 0 10px;
  border: 1px solid transparent; border-radius: 9px;
  background: transparent; color: var(--c-text);
  font-size: 13px; font-weight: 650; white-space: nowrap;
  flex: 0 0 auto; cursor: pointer; font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.tbtn:hover { background: var(--c-overlay); }
.tbtn:focus-visible { outline: 2px solid var(--c-gold); outline-offset: 1px; }
.tbtn > svg { width: 15px; height: 15px; flex: 0 0 15px; }
.tbtn.on {
  background: var(--c-gold-soft);
  border-color: rgba(156, 91, 0, 0.26);
  color: var(--c-gold);
}
[data-theme="dark"] .tbtn.on, .dark .tbtn.on {
  border-color: rgba(240, 180, 41, 0.34);
}
.tstate {
  font-size: 9px; font-weight: 800; letter-spacing: 0.05em;
  padding: 2px 4px; border-radius: 4px;
  background: var(--c-overlay); color: var(--c-text-tertiary);
}
.tbtn.on .tstate { background: var(--c-gold); color: #fff; }
.dark .tbtn.on .tstate, [data-theme="dark"] .tbtn.on .tstate { color: #1b1408; }
.tplus { font-size: 9px; font-weight: 800; color: var(--c-gold); line-height: 1; transform: translateY(-5px); margin-left: -3px; }

.tspacer { flex: 1 1 auto; min-width: 4px; }
.tinst { gap: 5px; padding-right: 6px; }
.tinst .chev { width: 11px; height: 11px; opacity: 0.5; flex: 0 0 11px; }
.ticon {
  width: 33px; height: 33px; flex: 0 0 33px;
  display: grid; place-items: center; padding: 0;
  border: 1px solid transparent; border-radius: 9px;
  background: transparent; color: var(--c-muted); cursor: pointer;
}
.ticon:hover { background: var(--c-overlay); color: var(--c-text); }
.ticon:focus-visible { outline: 2px solid var(--c-gold); outline-offset: 1px; }
.ticon > svg { width: 16px; height: 16px; }

.tbar-msg { display: flex; align-items: center; gap: 8px; padding: 0 12px 10px; flex-wrap: wrap; }
.tbar-msg .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c-gold); flex: 0 0 6px; }
.tmsg-text { margin: 0; font-size: 12.5px; color: var(--c-muted); line-height: 1.3; }
.tmsg-text b { color: var(--c-text); font-weight: 700; }
.tmsg-try {
  border: 0; background: transparent; color: var(--c-gold);
  font-weight: 800; font-size: 12.5px; cursor: pointer; padding: 0;
  text-decoration: underline; text-underline-offset: 2px; font-family: inherit;
}
.tmsg-x {
  margin-left: auto; border: 0; background: transparent;
  color: var(--c-text-tertiary); cursor: pointer; font-size: 15px; line-height: 1;
  padding: 2px 5px; border-radius: 4px;
}
.tmsg-x:hover { background: var(--c-overlay); }

/* CELULAR: os 9 controles continuam visiveis, em icone. */
@media (max-width: 767px) {
  .tbar-in { gap: 2px; padding: 8px 7px; }
  .tbar-in .tbtn { padding: 0 8px; }
  .tbar-in .tbtn .tlbl { display: none; }
  .tbar-in .tbtn .tstate { display: none; }
  .tbar-in .tgroup { padding: 2px; }
  .tbar-in .tstep { width: 25px; height: 25px; flex: 0 0 25px; }
  .tbar-in .tval { min-width: 22px; }
  .tbar-in .tval .lb { display: none; }
  .tbar-in .tval .nm { font-size: 13px; }
  .tbar-in .tsep { margin: 0 3px; }
  .tbar-in .ticon { width: 30px; flex: 0 0 30px; }
  .tbar-in .tinst { padding: 0 5px; }
  .tbar-msg { padding: 0 11px 9px; }
}
      `}</style>

      <div className="tbar" style={{ marginBottom: 24, position: "sticky", top: 56, zIndex: 40 }}>
        <div className="tbar-in">
          <TransposeControls transpose={transpose} onTranspose={onTranspose} />
          <span className="tsep" aria-hidden />

          {/* Tablature: o controle mais usado — âncora, com estado dourado */}
          <button
            onClick={onToggleTablature}
            className={"tbtn" + (showTablature ? " on" : "")}
            aria-pressed={showTablature}
            title={showTablature ? "Tablature on" : "Tablature off"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M3 8.5h18M3 15.5h18" />
              <circle cx="8" cy="8.5" r="1.7" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="15.5" r="1.7" fill="currentColor" stroke="none" />
            </svg>
            <span className="tlbl">Tablature</span>
            <span className="tstate">{showTablature ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={onOpenTrainer}
            className="tbtn"
            title="Train chord transitions with a timer (ChordProof+)"
          >
            <Zap size={15} aria-hidden />
            <span className="tlbl">Trainer</span>
            {!plusAccess && <span className="tplus" aria-label="Plus feature">+</span>}
          </button>

          <button
            onClick={onOpenDrums}
            className="tbtn"
            title="Drum machine — groove by genre at the song BPM (ChordProof+)"
          >
            <Drum size={15} aria-hidden />
            <span className="tlbl">Drums</span>
            {!plusAccess && <span className="tplus" aria-label="Plus feature">+</span>}
          </button>

          <StageMode>{stageChildren}</StageMode>

          <EasyModeToggle
            content={easyContent}
            transpose={transpose}
            enabled={easyOn}
            onToggle={onEasyToggle}
            onContentOverride={onEasyOverride}
            applyRequest={easyApply}
          />

          <span className="tspacer" />

          <InstrumentPicker current={instrument} onChange={onInstrumentChange} />

          <div style={{ position: "relative" }} ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="ticon"
              title="More: export, print, theme"
              aria-label="More: export, print, theme"
              aria-expanded={moreOpen}
            >
              <MoreHorizontal size={18} />
            </button>
            {moreOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  /* superfície do TEMA: antes era #1a1a2e fixo — azul-escuro num
                     site de papel, sobra do tema antigo. */
                  background: "var(--c-bg-elevated)",
                  border: "1px solid var(--c-hairline)",
                  borderRadius: 13,
                  padding: 6,
                  minWidth: 236,
                  zIndex: 60,
                  boxShadow: "var(--c-shadow)",
                }}
              >
                <div style={{ fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "var(--c-text-tertiary)", fontWeight: 800, padding: "7px 8px 3px" }}>
                  Export
                </div>
                {plusAccess ? (
                  <>
                    <div style={{ padding: "0 1px" }}>
                      <PdfButton
                        song={songName}
                        artist={artistName}
                        content={content}
                        transpose={transpose}
                        capo={capo}
                        easyCapo={easyCapo}
                        keySig={keySig}
                      />
                    </div>
                    <div style={{ padding: "0 1px" }}>
                      <PrintButton
                        tab={tab}
                        content={content}
                        transpose={transpose}
                        easyApplied={easyOn}
                        easyCapo={easyCapo}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "0 3px 4px" }}>
                    <a
                      href="/pricing?feature=PDF"
                      className="tbtn on"
                      style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
                      title="PDF &amp; Print — ChordProof+"
                    >
                      PDF &amp; Print <span className="tplus">+</span>
                    </a>
                  </div>
                )}
                <div style={{ height: 1, background: "var(--c-hairline)", margin: "5px 8px" }} />
                <div style={{ fontSize: 9.5, letterSpacing: ".09em", textTransform: "uppercase", color: "var(--c-text-tertiary)", fontWeight: 800, padding: "7px 8px 3px" }}>
                  Appearance
                </div>
                <div style={{ padding: "0 1px 4px" }}>
                  <ThemePicker current={themeKey} onChange={onThemeChange} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* faixa do Easy Mode: linha própria, não empurra mais nenhum controle */}
        <EasyModeNotice
          content={easyContent}
          transpose={transpose}
          dismissed={easyDismissed}
          onDismiss={onEasyDismiss}
          capoNotice={easyOn ? easyCapo : null}
          onTry={onEasyTry}
        />
      </div>
    </>
  );
}
