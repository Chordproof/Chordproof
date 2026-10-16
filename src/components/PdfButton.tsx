"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { generateTabPdf } from "@/lib/pdfExport";

// Botão "PDF" — gera e baixa a cifra em PDF print-ready (ChordProof+).
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

  function download() {
    setBusy(true);
    try {
      const doc = generateTabPdf({ song, artist, content, transpose, capo, easyCapo, keySig });
      const safe = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      doc.save(`chordproof-${safe(artist)}-${safe(song)}.pdf`);
    } catch (e) {
      console.error("pdf export failed", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      title="Download print-ready PDF (ChordProof+)"
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] transition"
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} PDF
    </button>
  );
}
