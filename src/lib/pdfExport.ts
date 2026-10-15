// pdfExport.ts — PDF print-ready do ChordProof+ (feature 4 do roadmap)
// Gera PDF com quebra de página inteligente: nunca quebra no meio de um par acorde/letra.
// Diagramas dos acordes usados vão na última página.

import { jsPDF } from "jspdf";

export interface PdfOptions {
  song: string;
  artist: string;
  content: string; // já transposto / easy-aplicado
  transpose: number;
  capo?: string | null;
  easyCapo?: number | null;
  keySig?: string | null;
}

interface Line {
  type: "section" | "chordpair" | "chordonly" | "lyric" | "tab" | "blank";
  chords?: string;
  lyric?: string;
  text?: string;
}

const SECTION_RE = /^\[(.+)\]$/;
const TAB_LINE_RE = /^\s*(e|B|G|D|A|E)\|/;
const CHORD_RE =
  /^[A-G](#|b)?(maj7|maj|min7|min|m7|m|M7|M|sus4|sus2|sus|add9|add|dim7|dim|aug|[0-9]+|[+\-])*(\([^)]*\))*(\/[A-G](#|b)?)?$/;
const RHYTHM_RE = /^[↓↑v^]+$/;

function isChordToken(t: string): boolean {
  if (RHYTHM_RE.test(t)) return false;
  return CHORD_RE.test(t);
}
function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every((t) => RHYTHM_RE.test(t) || isChordToken(t));
}

// Parseia o content nas mesmas regras do tabRenderer
export function parseLines(content: string): Line[] {
  const out: Line[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { out.push({ type: "blank" }); continue; }
    if (SECTION_RE.test(line)) { out.push({ type: "section", text: line.match(SECTION_RE)![1] }); continue; }
    if (TAB_LINE_RE.test(line)) { out.push({ type: "tab", text: raw }); continue; }
    if (isChordLine(line)) {
      const next = lines[i + 1]?.trim() ?? "";
      if (next && !SECTION_RE.test(next) && !TAB_LINE_RE.test(next) && !isChordLine(next)) {
        out.push({ type: "chordpair", chords: line, lyric: lines[i + 1] });
        i++;
      } else {
        out.push({ type: "chordonly", text: line });
      }
      continue;
    }
    out.push({ type: "lyric", text: raw });
  }
  return out;
}

export function generateTabPdf(opts: PdfOptions): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48; // margem
  let y = M;

  const MONO = "courier";
  const BODY = 10.5;
  const CHORD_SIZE = 11;
  const LINE_H = 15;
  const SECTION_H = 26;

  function newPage() { doc.addPage(); y = M; }
  function ensure(h: number) { if (y + h > H - M) newPage(); }

  // Cabeçalho da 1ª página
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.text(opts.song, M, y + 10);
  y += 30;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(90);
  doc.text(opts.artist, M, y);
  y += 22;

  // Metadados
  const meta: string[] = [];
  if (opts.keySig) meta.push(`Key: ${opts.keySig}`);
  if (opts.capo) meta.push(`Capo: ${opts.capo}`);
  if (opts.easyCapo) meta.push(`Easy capo: ${opts.easyCapo}`);
  if (opts.transpose) meta.push(`Transposed: ${opts.transpose > 0 ? "+" : ""}${opts.transpose} st`);
  meta.push("chordproof.com");
  doc.setFontSize(9.5);
  doc.setTextColor(130);
  doc.text(meta.join("   ·   "), M, y);
  y += 26;

  // Corpo
  const parsed = parseLines(opts.content);
  for (const l of parsed) {
    if (l.type === "blank") { y += LINE_H * 0.6; continue; }

    if (l.type === "section") {
      ensure(SECTION_H + 10);
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(180, 120, 0);
      doc.text((l.text ?? "").toUpperCase(), M, y);
      y += SECTION_H - 10;
      continue;
    }

    if (l.type === "chordpair") {
      ensure(LINE_H * 2 + 4);
      doc.setFont(MONO, "bold");
      doc.setFontSize(CHORD_SIZE);
      doc.setTextColor(20, 120, 80);
      doc.text(l.chords ?? "", M, y);
      y += LINE_H;
      doc.setFont(MONO, "normal");
      doc.setFontSize(BODY);
      doc.setTextColor(40);
      doc.text(l.lyric ?? "", M, y);
      y += LINE_H;
      continue;
    }

    if (l.type === "chordonly") {
      ensure(LINE_H);
      doc.setFont(MONO, "bold");
      doc.setFontSize(CHORD_SIZE);
      doc.setTextColor(20, 120, 80);
      doc.text(l.text ?? "", M, y);
      y += LINE_H;
      continue;
    }

    if (l.type === "lyric") {
      ensure(LINE_H);
      doc.setFont(MONO, "normal");
      doc.setFontSize(BODY);
      doc.setTextColor(40);
      doc.text(l.text ?? "", M, y);
      y += LINE_H;
      continue;
    }

    if (l.type === "tab") {
      ensure(LINE_H);
      doc.setFont(MONO, "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(110);
      doc.text(l.text ?? "", M, y);
      y += LINE_H * 0.9;
      continue;
    }
  }

  // Rodapé com página
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(150);
    doc.text(`${opts.song} — ${opts.artist}`, M, H - 20);
    doc.text(`${p}/${total}`, W - M, H - 20, { align: "right" });
  }

  return doc;
}
