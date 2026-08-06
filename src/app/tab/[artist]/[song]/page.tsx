"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TransposeControls from "@/components/TransposeControls";
import { BadgeCheck, Bookmark, Share2, Play, ChevronDown, MousePointer2, Youtube, Music } from "lucide-react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Padrão que reconhece acordes simples e complexos: C, Em7, D4, A7(4), C9, G/B, etc.
const CHORD_PATTERN =
  "[A-G](?:#|b)?(?:[0-9]|M|m|7|9|11|13|4|6|add|sus|dim|aug|\([0-9]+\)|\/[A-G](?:#|b)?)*";

function transposeChord(chord: string, semitones: number) {
  const match = chord.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return chord;
  const root = match[1];
  const acc = match[2];
  const rest = match[3];
  let idx = NOTES.indexOf(root);
  if (acc === "#") idx = (idx + 1) % 12;
  if (acc === "b") idx = (idx + 11) % 12;
  const newRoot = NOTES[((idx + semitones) % 12 + 12) % 12];
  return newRoot + rest;
}

function transposeContent(content: string, semitones: number) {
  if (semitones === 0) return content;
  const re = new RegExp(`\b${CHORD_PATTERN}\b`, "g");
  return content.replace(re, (chord) => {
    try {
      return transposeChord(chord, semitones);
    } catch {
      return chord;
    }
  });
}

function extractChords(content: string) {
  const re = new RegExp(`\b${CHORD_PATTERN}\b`, "g");
  const matches = content.match(re) || [];
  return Array.from(new Set(matches));
}

// ===== Diagramas de acordes (braço do instrumento) =====
// Formato: [corda E, A, D, G, B, e]  →  0 = corda solta, -1 = corda muda, número = casa
const CHORD_SHAPES: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  D: [-1, -1, 0, 2, 3, 2],
  E: [0, 2, 2, 1, 0, 0],
  G: [3, 2, 0, 0, 0, 3],
  A: [-1, 0, 2, 2, 2, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  Em: [0, 2, 2, 0, 0, 0],
  Dm: [-1, -1, 0, 2, 3, 1],
  F: [1, 3, 3, 2, 1, 1],
  Bm: [-1, 2, 4, 4, 3, 2],
  C9: [-1, 3, 2, 3, 3, 3],
  D4: [-1, -1, 0, 2, 3, 3],
  A7: [-1, 0, 2, 0, 2, 0],
  E7: [0, 2, 0, 1, 0, 0],
  G7: [3, 2, 0, 0, 0, 1],
  B7: [-1, 2, 1, 2, 0, 2],
  C7: [-1, 3, 2, 3, 1, 0],
  Am7: [-1, 0, 2, 0, 1, 0],
  Dm7: [-1, -1, 0, 2, 1, 1],
  Em7: [0, 2, 2, 0, 3, 0],
  G6: [3, 2, 0, 0, 0, 0],
  F#m: [2, 4, 4, 2, 2, 2],
  C#m: [-1, 4, 6, 6, 5, 4],
  G#m: [4, 6, 6, 4, 4, 4],
  A#m: [-1, 1, 3, 3, 2, 1],
  D#m: [-1, 6, 8, 8, 7, 6],
};

function ChordDiagram({ chord }: { chord: string }) {
  const shape = CHORD_SHAPES[chord];

  if (!shape) {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <span className="text-2xl font-bold text-brand-gold">{chord}</span>
        <span className="text-xs text-brand-muted">Diagrama não disponível</span>
      </div>
    );
  }

  const positions = shape.slice(0, 6);
  const frets = positions.filter((p) => p > 0);
  const baseFret = frets.length ? Math.min(...frets) : 1;
  const stringXs = [18, 30, 42, 54, 66, 78];
  const topY = 30;
  const fretGap = 22;

  return (
    <svg width="96" height="128" viewBox="0 0 96 128" className="mx-auto">
      {/* Cordas */}
      {stringXs.map((x, i) => (
        <line key={i} x1={x} y1={topY} x2={x} y2={topY + fretGap * 4} stroke="#9E9E9E" strokeWidth={i === 5 ? 2 : 1.5} />
      ))}
      {/* Trastes */}
      {[0, 1, 2, 3, 4].map((f) => (
        <line
          key={f}
          x1={stringXs[0] - 3}
          y1={topY + fretGap * f}
          x2={stringXs[5] + 3}
          y2={topY + fretGap * f}
          stroke={f === 0 ? "#f0b429" : "#9E9E9E"}
          strokeWidth={f === 0 ? 4 : 1.5}
        />
      ))}
      {/* Número do traste (quando começa além da casa 1) */}
      {baseFret > 1 && (
        <text x={4} y={topY + fretGap / 2 + 4} fontSize="10" fill="#9E9E9E">
          {baseFret}
        </text>
      )}
      {/* Dedilhados */}
      {positions.map((pos, i) => {
        const x = stringXs[i];
        if (pos === 0) {
          return (
            <text key={i} x={x} y={topY - 8} fontSize="12" textAnchor="middle" fill="#9E9E9E">
              ○
            </text>
          );
        }
        if (pos < 0) {
          return (
            <text key={i} x={x} y={topY - 8} fontSize="12" textAnchor="middle" fill="#9E9E9E">
              ×
            </text>
          );
        }
        const y = topY + (pos - baseFret) * fretGap + fretGap / 2;
        return <circle key={i} cx={x} cy={y} r="6.5" fill="#f0b429" />;
      })}
      {/* Nome do acorde */}
      <text x="48" y="122" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#f0b429">
        {chord}
      </text>
    </svg>
  );
}

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transpose, setTranspose] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("1.0");
  const [hoveredChord, setHoveredChord] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTab() {
      const { data } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .eq("slug_song", params.song)
        .single();
      setTab(data);
      setLoading(false);
    }
    fetchTab();
  }, [params.artist, params.song]);

  // Auto-scroll suave (rola a página inteira)
  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      window.scrollBy({ top: scrollSpeed * 2, behavior: "smooth" });
    }, 300);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  if (loading) return <p className="text-center py-20 text-brand-muted">Carregando cifra...</p>;
  if (!tab) return <p className="text-center py-20 text-brand-muted">Cifra não encontrada.</p>;

  const transposedContent = transposeContent(tab.content, transpose);
  const chords = extractChords(transposedContent);

  // Renderiza cada linha; acordes viram elementos clicáveis, linhas de tablatura ganham destaque
  const renderContent = (text: string) => {
    const splitRe = new RegExp(`(\b${CHORD_PATTERN}\b)`, "g");
    const testRe = new RegExp(`^\b${CHORD_PATTERN}\b$`);
    return text.split("\n").map((line, lineIdx) => {
      const isTabLine = /^\s*[eEBGDA]{1,2}\|/.test(line.trim());
      const parts = line.split(splitRe);
      return (
        <div key={lineIdx} className={isTabLine ? "bg-white/5 rounded px-2 my-1" : ""}>
          {parts.map((part, i) => {
            if (testRe.test(part)) {
              return (
                <span
                  key={i}
                  className="chord"
                  onMouseEnter={() => setHoveredChord(part)}
                  onMouseLeave={() => setHoveredChord(null)}
                >
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-white">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/browse" className="hover:text-white">Browse</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/artist/${tab.slug_artist}`} className="hover:text-white capitalize">
              {tab.artist}
            </Link>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold capitalize">{tab.song}</h1>
            {tab.is_verified && (
              <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim">
                <BadgeCheck size={14} /> VERIFIED
              </div>
            )}
          </div>
          {/* Artista clicável */}
          <Link
            href={`/artist/${tab.slug_artist}`}
            className="text-xl text-brand-muted capitalize hover:text-brand-gold transition-colors"
          >
            {tab.artist}
          </Link>
          <div className="flex gap-4 pt-2">
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Key: <strong>{transpose !== 0 ? transposeChord(tab.key_sig || "C", transpose) : tab.key_sig}</strong>
            </span>
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Difficulty: <strong className="text-green-400">{tab.difficulty}</strong>
            </span>
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Version: <strong>{version}</strong>
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" aria-label="Bookmark">
            <Bookmark size={20} />
          </button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10" aria-label="Share">
            <Share2 size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition">
            <Play size={18} /> Play
          </button>
        </div>
      </div>

      {/* Controles: transposição + auto-scroll */}
      <div className="flex flex-wrap items-center gap-4 bg-brand-card rounded-xl p-4 border border-white/5">
        <TransposeControls transpose={transpose} onTranspose={setTranspose} />
        <div className="h-6 w-px bg-white/10" />
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            autoScroll ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
          }`}
        >
          <MousePointer2 size={16} /> Auto-scroll {autoScroll ? "ON" : "OFF"}
        </button>
        {autoScroll && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-muted">Velocidade</span>
            <input
              type="range" min={1} max={10} value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-28 accent-brand-gold"
            />
            <span className="text-brand-gold">{scrollSpeed}</span>
          </div>
        )}
      </div>

      {/* Conteúdo + vídeo lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Cifra completa (sem corte, sem caixa de rolagem) */}
          <div className="cifra-content bg-brand-card rounded-2xl p-8 border border-white/5">
            {renderContent(transposedContent)}
          </div>

          {/* Diagramas dos acordes no final */}
          <div className="bg-brand-card rounded-2xl p-8 border border-white/5">
            <h3 className="text-xl font-bold mb-2">Acordes usados nesta cifra</h3>
            <p className="text-sm text-brand-muted mb-6">
              Passe o mouse sobre um acorde no texto para ver o diagrama. Confira abaixo todos os acordes:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {chords.map((chord) => (
                <div
                  key={chord}
                  className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-brand-gold/40 transition"
                  onMouseEnter={() => setHoveredChord(chord)}
                  onMouseLeave={() => setHoveredChord(null)}
                >
                  <ChordDiagram chord={chord} />
                </div>
              ))}
            </div>
          </div>

          {/* Versões */}
          <details className="bg-brand-card rounded-xl p-4 border border-white/5">
            <summary className="flex items-center gap-2 cursor-pointer font-semibold">
              <ChevronDown size={16} /> Outras versões
            </summary>
            <p className="text-sm text-brand-muted mt-3">Versão 1.0 (principal)</p>
          </details>
        </div>

        {/* Vídeo lateral para ouvir a música */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-brand-card rounded-2xl p-4 border border-white/5">
            <h3 className="flex items-center gap-2 font-bold mb-3">
              <Youtube size={18} className="text-brand-gold" /> Ouça a música
            </h3>
            <iframe
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                `${tab.song} ${tab.artist}`
              )}`}
              title={`${tab.song} - ${tab.artist}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video rounded-xl border border-white/5"
            />
          </div>
        </aside>
      </div>

      {/* Tooltip com o diagrama do acorde (hover) */}
      {hoveredChord && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-card border border-brand-gold/40 rounded-2xl p-3 shadow-2xl w-44">
          <ChordDiagram chord={hoveredChord} />
        </div>
      )}
    </div>
  );
}
