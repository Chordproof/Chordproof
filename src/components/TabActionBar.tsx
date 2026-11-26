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
 * DESENHO: uma linha, com hierarquia. Transpose ancora à esquerda, os
 * controles de leitura no meio, instrumento e menu "More" à direita. O aviso
 * do Easy Mode ganha faixa própria embaixo, em vez de empurrar controles.
 *
 * CELULAR (≤767px): os nove controles continuam TODOS visíveis, em ícone
 * (medido: 375px de conteúdo em 386px úteis). O rótulo escrito fica no
 * `title`/`aria-label`, então continua acessível e com tooltip.
 *
 * Nota de cor: só `Tablature ON` e `Easy ON` recebem dourado, porque são os
 * únicos com estado. O resto é neutro.
 *
 * O CSS está em `src/app/bar.css` (importado pelo layout), NÃO aqui:
 * na primeira versão usava <style jsx global>, que o styled-jsx injeta por
 * JavaScript em runtime. Se o chunk atrasa, a barra renderiza sem estilo.
 * Arquivo CSS importado no layout vem no <head>, antes do primeiro paint.
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

  // fecha o menu com Esc ou clique fora
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
                /* superfície do TEMA (antes era #1a1a2e fixo) */
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
  );
}
