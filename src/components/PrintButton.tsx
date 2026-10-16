"use client";

import { Printer } from "lucide-react";
import { buildPrintHTML } from "@/lib/printView";

// Botão "PDF / Print" — abre uma janela formatada para impressão (ChordProof+).
// Respeita o tom transposto e o Easy Mode aplicado.
export default function PrintButton({
  tab,
  content,
  transpose,
  easyApplied,
  easyCapo,
}: {
  tab: any;
  content: string; // content JÁ com easy mode aplicado (se ativo)
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
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] transition"
    >
      <Printer size={16} /> PDF
    </button>
  );
}
