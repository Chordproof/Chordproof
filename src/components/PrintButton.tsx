"use client";

import { Printer } from "lucide-react";
import { buildPrintHTML } from "@/lib/printView";

/**
 * PrintButton — abre a janela de impressão formatada (ChordProof+).
 * Respeita o tom transposto e o Easy Mode aplicado.
 *
 * RÓTULO: era "PDF", igual ao botão de baixar ao lado — no menu apareciam dois
 * "PDF" e não dava para saber qual fazia o quê. Agora "Print".
 */
export default function PrintButton({
  tab,
  content,
  transpose,
  easyApplied,
  easyCapo,
}: {
  tab: any;
  /** content JÁ com easy mode aplicado (se ativo) */
  content: string;
  transpose: number;
  easyApplied: boolean;
  easyCapo: number | null;
}) {
  function handlePrint() {
    const html = buildPrintHTML({
      song: tab.song,
      artist: tab.artist,
      content,
      tablature: tab.tablature,
      key_sig: tab.key_sig,
      capo: tab.capo,
      difficulty: tab.difficulty,
      transpose,
      easyApplied,
      easyCapo,
    });
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    // Pequeno delay para o CSS carregar antes de abrir o diálogo de impressão
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  }

  return (
    <button
      onClick={handlePrint}
      title="Print / Save as PDF — print-ready layout"
      className="tbtn"
      style={{ width: "100%", justifyContent: "flex-start" }}
    >
      <Printer size={15} />
      Print
    </button>
  );
}
