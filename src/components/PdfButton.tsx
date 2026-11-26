"use client";
import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { generateTabPdf } from "@/lib/pdfExport";

/**
 * PdfButton — baixa o PDF da cifra (ChordProof+).
 *
 * RÓTULO: era "PDF", igual ao botão de imprimir ao lado — no menu apareciam
 * dois "PDF" e não dava para saber qual baixava arquivo. Agora "Download PDF".
 * Desenho: item de menu (largura cheia, alinhado à esquerda), não pastilha.
 */
export default function PdfButton({
  song,
  artist,
  content,
  transpose,
  capo,
  easyCapo,
  keySig,
}: {
  song: string;
  artist: string;
  content: string;
  transpose: number;
  capo?: string | null;
  easyCapo?: number | null;
  keySig?: string | null;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      await generateTabPdf({ song, artist, content, transpose, capo, easyCapo, keySig });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      title="Download print-ready PDF (ChordProof+)"
      className="tbtn"
      style={{ width: "100%", justifyContent: "flex-start" }}
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
      Download PDF
    </button>
  );
}
