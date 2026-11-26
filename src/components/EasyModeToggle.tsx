"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, X } from "lucide-react";
import { analyzeEasyMode } from "@/lib/easyMode";

/**
 * EasyModeToggle — Easy Mode (ChordProof+): troca acordes com pestana por
 * formas fáceis + capo sugerido.
 *
 * MUDANÇA DE DESENHO (26/11): o componente devolvia o BOTÃO e a FAIXA de aviso
 * juntos, ambos soltos dentro da action bar. O botão ocupava 161px com o rótulo
 * "Easy Mode OFF" e o aviso, quando aparecia, empurrava o seletor de instrumento
 * para uma segunda linha. Agora:
 *   - `EasyModeToggle` renderiza SÓ o botão (largura controlada pela barra);
 *   - `EasyModeNotice` renderiza SÓ a faixa, que a barra põe na 2ª linha.
 * O comportamento (gerar cifra fácil, capo, dispensar) é o mesmo.
 */
export default function EasyModeToggle({
  content,
  transpose,
  onContentOverride,
  enabled,
  onToggle,
  applyRequest,
}: {
  content: string;
  transpose: number;
  onContentOverride: (easyContent: string | null, capo: number | null) => void;
  /** controlado pela barra, para o botão e a faixa compartilharem o estado */
  enabled: boolean;
  onToggle: (next: boolean) => void;
  /**
   * O botão "Try it" da faixa fica no PAI, mas quem sabe montar a cifra fácil
   * é este componente. Em vez de o pai consultar o DOM (hack), o pai pede:
   * `applyRequest` é um contador; a cada incremento o componente liga o modo.
   */
  applyRequest?: number;
}) {
  const analysis = useMemo(() => analyzeEasyMode(content, transpose), [content, transpose]);

  function buildEasyContent(): string {
    return content
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("[") || /^[eBGDAE]\|/.test(trimmed)) return line;
        let newLine = line;
        for (const [hard, easy] of Object.entries(analysis.substitutionMap)) {
          const re = new RegExp(`(?<![A-Za-z0-9#b])${hard.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9#b])`, "g");
          newLine = newLine.replace(re, easy);
        }
        return newLine;
      })
      .join("\n");
  }

  /**
   * Aplica/desaplica o modo. O estado vem do pai (`enabled`), então quem muda
   * é ele — aqui só montamos a cifra e avisamos.
   */
  function apply(next: boolean) {
    onToggle(next);
    onContentOverride(next ? buildEasyContent() : null, next ? analysis.suggestedCapo : null);
  }

  // pedido vindo da faixa ("Try it")
  useEffect(() => {
    if (!applyRequest) return;
    if (!enabled) apply(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyRequest]);

  function toggle() { apply(!enabled); }

  return (
    <button
      onClick={toggle}
      title="Easy Mode — swap barre chords for easy shapes + capo"
      aria-pressed={enabled}
      className={"tbtn" + (enabled ? " on" : "")}
    >
      <Sparkles size={15} aria-hidden />
      <span className="tlbl">Easy</span>
      <span className="tstate">{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}

/**
 * Faixa de aviso: "4 barre chords detected — Easy Mode suggests capo 1".
 * Vive na 2ª linha da barra, alinhada à esquerda, sem empurrar nada.
 */
export function EasyModeNotice({
  content,
  transpose,
  onTry,
  dismissed,
  onDismiss,
  capoNotice,
}: {
  content: string;
  transpose: number;
  onTry: () => void;
  dismissed: boolean;
  onDismiss: () => void;
  /** quando o Easy Mode está LIGADO, a barra passa o aviso do capo aqui */
  capoNotice?: number | null;
}) {
  const analysis = useMemo(() => analyzeEasyMode(content, transpose), [content, transpose]);

  if (capoNotice !== null && capoNotice !== undefined) {
    return (
      <div className="tbar-msg">
        <span className="dot" aria-hidden />
        <p className="tmsg-text">
          Place a <b>capo on fret {capoNotice}</b> — the chords below are the easy shapes.
        </p>
      </div>
    );
  }

  if (dismissed || !analysis.hasHard || analysis.suggestedCapo === null) return null;

  return (
    <div className="tbar-msg">
      <span className="dot" aria-hidden />
      <p className="tmsg-text">
        <b>{analysis.hardChords.length} barre chord{analysis.hardChords.length > 1 ? "s" : ""}</b> detected — Easy Mode suggests capo {analysis.suggestedCapo}
      </p>
      <button onClick={onTry} className="tmsg-try">Try it</button>
      <button onClick={onDismiss} className="tmsg-x" title="Dismiss" aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  );
}
