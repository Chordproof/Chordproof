"use client";

import type { ChordVariant } from "@/lib/chords";

const STRING_LABELS = ["E", "A", "D", "G", "B", "e"]; // 6ª → 1ª

export default function ChordDiagram({
  name,
  variant,
  width = 104,
  nameColor = "#34d399",
}: {
  name: string;
  variant: ChordVariant;
  width?: number;
  nameColor?: string;
}) {
  const { base_fret, strings, barre, fingers } = variant;
  const padX = 12;
  const topArea = 30; // nome + nomes das cordas
  const bottomArea = 18; // X/O na base
  const w = width;
  const stringGap = (w - padX * 2) / 5;
  const fretGap = stringGap * 0.72;
  const h = topArea + fretGap * 4 + bottomArea;
  const dotR = stringGap * 0.26;

  const xPos = (i: number) => padX + i * stringGap;
  // Casa real f → posição Y (o primeiro espaço abaixo do nut é a casa base)
  const fretY = (f: number) =>
    topArea + (base_fret > 0 ? f - base_fret : f - 1) * fretGap + fretGap / 2;
  // Linha do traste (para a barra de pestana)
  const fretLineY = (f: number) =>
    topArea + (base_fret > 0 ? f - base_fret : f - 1) * fretGap;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="select-none">
      {/* Nome do acorde — verde, igual à cifra */}
      <text x={w / 2} y={12} textAnchor="middle" fontSize={13} fontWeight="bold" fill={nameColor}>
        {name}
      </text>

      {/* Nomes das cordas — TOPO (trocados com os X/O) */}
      {STRING_LABELS.map((label, i) => (
        <text key={`n${i}`} x={xPos(i)} y={24} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#555">
          {label}
        </text>
      ))}

      {/* Rótulo da casa inicial — padrão inglês "2fr" */}
      {base_fret > 0 && (
        <text
          x={padX - 4}
          y={topArea + fretGap / 2 + 3}
          textAnchor="end"
          fontSize={8.5}
          fontWeight="bold"
          fill="#666"
        >
          {base_fret}fr
        </text>
      )}

      {/* Pestana (nut) */}
      <rect x={padX} y={topArea} width={w - padX * 2} height={2.5} fill="#333" />

      {/* Trastes (4 casas) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`t${i}`} x1={padX} y1={topArea + i * fretGap} x2={w - padX} y2={topArea + i * fretGap} stroke="#999" strokeWidth={i === 0 ? 0 : 1} />
      ))}

      {/* Cordas */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`s${i}`} x1={xPos(i)} y1={topArea} x2={xPos(i)} y2={topArea + 4 * fretGap} stroke="#bbb" strokeWidth={1} />
      ))}

      {/* Barra de pestana — conecta as cordas na mesma casa */}
      {barre != null && (
        <line x1={xPos(0)} y1={fretLineY(barre) + 1} x2={xPos(5)} y2={fretLineY(barre) + 1} stroke="#333" strokeWidth={3.5} strokeLinecap="round" />
      )}

      {/* Pontos com número de dedo */}
      {strings.map((pos, i) => {
        if (pos === null || pos === 0) return null;
        if (barre != null && pos === barre) return null; // coberto pela barra
        const cy = fretY(pos);
        const finger = fingers?.[i] ?? null;
        return (
          <g key={`d${i}`}>
            <circle cx={xPos(i)} cy={cy} r={dotR} fill="#333" />
            {finger != null && (
              <text x={xPos(i)} y={cy + 3} textAnchor="middle" fontSize={dotR * 1.3} fontWeight="bold" fill="#fff">
                {finger}
              </text>
            )}
          </g>
        );
      })}

      {/* X/O — BASE (trocados com os nomes das cordas) */}
      {strings.map((pos, i) => {
        if (pos === null)
          return (
            <text key={`x${i}`} x={xPos(i)} y={h - 5} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#d32f2f">
              ✕
            </text>
          );
        if (pos === 0)
          return (
            <text key={`o${i}`} x={xPos(i)} y={h - 5} textAnchor="middle" fontSize={8.5} fontWeight="bold" fill="#2e7d32">
              ○
            </text>
          );
        return null;
      })}
    </svg>
  );
}
