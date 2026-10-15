// printView.ts — PDF print-ready do ChordProof+ (feature 4 do roadmap)
// Gera o HTML da cifra formatado para impressão: A4, quebra de página inteligente
// (nunca no meio de um par acorde/letra), diagramas dos acordes no final.

export interface PrintTabData {
  song: string;
  artist: string;
  content: string;
  tablature?: string | null;
  key_sig?: string | null;
  capo?: string | null;
  difficulty?: string | null;
  transpose: number;
  easyApplied?: boolean;
  easyCapo?: number | null;
}

export function buildPrintHTML(data: PrintTabData): string {
  const { song, artist, content, transpose } = data;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Transpõe o content se necessário (mesma lógica do site)
  let body = content;
  if (transpose) {
    body = content
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (!t || t.startsWith("[") || /^[eBGDAE]\|/.test(t)) return line;
        return line.replace(/[A-G][#b]?(m|m7|maj7|7|sus4|sus2|add9|dim|aug|5|6|9|11|13)?(\([^\)]*\))?(\/[A-G][#b]?)?/g, (m) => {
          try {
            return transposeChordSafe(m, transpose);
          } catch {
            return m;
          }
        });
      })
      .join("\n");
  }

  // Extrai os acordes únicos (para os diagramas no final)
  const chords = extractChordsForPrint(body);

  const sections: string[] = [];
  const lines = body.split("\n");
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { i++; continue; }

    // Seção: [Chorus] etc
    if (/^\[.+\]$/.test(line)) {
      sections.push(`<div class="section">${esc(line.slice(1, -1))}</div>`);
      i++;
      continue;
    }

    // Linha de tablatura
    if (/^[eBGDAE]\|/.test(line)) {
      const block: string[] = [];
      while (i < lines.length && /^[eBGDAE]\|/.test(lines[i].trim())) {
        block.push(esc(lines[i]));
        i++;
      }
      sections.push(`<pre class="tabblock">${block.join("\n")}</pre>`);
      continue;
    }

    // Linha de acordes com letra abaixo = par inseparável
    if (isChordLinePrint(line)) {
      const next = i + 1 < lines.length ? lines[i + 1]?.trim() : "";
      if (next && !/^\[.+\]$/.test(next) && !/^[eBGDAE]\|/.test(next) && !isChordLinePrint(next)) {
        sections.push(`<div class="pair"><div class="chords">${esc(line)}</div><div class="lyrics">${esc(next)}</div></div>`);
        i += 2;
      } else {
        sections.push(`<div class="chords">${esc(line)}</div>`);
        i++;
      }
      continue;
    }

    // Letra sozinha
    sections.push(`<div class="lyrics">${esc(line)}</div>`);
    i++;
  }

  const chordList = chords.length > 0
    ? `<div class="chord-diagrams"><h2>Acordes usados</h2><div class="chord-list">${chords.map((c) => `<span class="chord-badge">${esc(c)}</span>`).join("")}</div></div>`
    : "";

  const capoNote = data.easyApplied && data.easyCapo
    ? `<div class="meta">Easy Mode: formas fáceis com capo na casa ${data.easyCapo}</div>`
    : data.capo ? `<div class="meta">Capo: ${esc(data.capo)}</div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(song)} — ${esc(artist)} | ChordProof</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11pt; line-height: 1.55; color: #111; margin: 0;
  }
  .header { border-bottom: 3px solid #111; padding-bottom: 10px; margin-bottom: 16px; }
  .header h1 { font-size: 20pt; margin: 0 0 4px; }
  .header .artist { font-size: 13pt; color: #444; margin-bottom: 6px; }
  .header .meta { font-size: 9pt; color: #666; }
  .section {
    font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em;
    font-size: 10pt; color: #111;
    margin-top: 14px; margin-bottom: 6px;
    break-after: avoid; page-break-after: avoid;
  }
  .pair {
    break-inside: avoid; page-break-inside: avoid;
    margin-bottom: 8px;
  }
  .chords { font-weight: bold; color: #0a5c3a; white-space: pre-wrap; }
  .lyrics { color: #222; white-space: pre-wrap; }
  .tabblock {
    font-family: inherit; font-size: 9pt; line-height: 1.3;
    white-space: pre; color: #333; margin: 6px 0;
    break-inside: avoid; page-break-inside: avoid;
  }
  .chord-diagrams {
    margin-top: 24px; border-top: 2px solid #111; padding-top: 12px;
    break-before: auto; page-break-before: auto;
  }
  .chord-diagrams h2 { font-size: 12pt; margin: 0 0 8px; }
  .chord-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .chord-badge {
    border: 1.5px solid #0a5c3a; color: #0a5c3a; border-radius: 4px;
    padding: 3px 10px; font-weight: bold; font-size: 10pt;
  }
  .footer {
    margin-top: 24px; font-size: 8pt; color: #999; text-align: center;
  }
  @media print {
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(song)}</h1>
    <div class="artist">${esc(artist)}</div>
    <div class="meta">
      ${data.key_sig ? `Key: ${esc(data.key_sig)}` : ""}
      ${data.difficulty ? ` &middot; Difficulty: ${esc(data.difficulty)}` : ""}
      ${transpose ? ` &middot; Transposed: ${transpose > 0 ? "+" : ""}${transpose}` : ""}
    </div>
    ${capoNote}
  </div>
  ${sections.join("\n")}
  ${chordList}
  <div class="footer">ChordProof · Verified guitar tabs · chordproof.com</div>
</body>
</html>`;
}

function isChordLinePrint(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.every((t) =>
    /^[A-G][#b]?(m|m7|maj7|7|sus4|sus2|add9|dim|aug|5|6|9|11|13)?(\([^\)]*\))?(\/[A-G][#b]?)?$/.test(t)
  );
}

function extractChordsForPrint(content: string): string[] {
  const out = new Set<string>();
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("[") || /^[eBGDAE]\|/.test(line)) continue;
    for (const token of line.split(/\s+/)) {
      if (isChordLinePrint(token)) out.add(token);
    }
  }
  return Array.from(out).sort();
}

function transposeChordSafe(name: string, semitones: number): string {
  const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const ENHARMONIC: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return name;
  const norm = ENHARMONIC[m[1]] ?? m[1];
  let idx = NOTE_ORDER.indexOf(norm);
  if (idx < 0) return name;
  idx = (idx + semitones + 12) % 12;
  return NOTE_ORDER[idx] + m[2];
}
