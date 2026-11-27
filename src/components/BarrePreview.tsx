"use client";

import { THEMES, MiniFretboard } from "@/lib/fretboard";

/**
 * BarrePreview — os dois diagramas do bloco "sua primeira pestana" em /learn.
 *
 * POR QUE É UM COMPONENTE À PARTE: /learn é Server Component (é o que dá HTML
 * indexável com as músicas de cada nível). O diagrama é desenhado no navegador
 * pelo solver, então fica isolado aqui — mesmo padrão de BigChordDiagram.
 *
 * A ORDEM É DE PROPÓSITO: Bm7 primeiro, F depois. O Bm7 barra CINCO cordas e
 * fica no 2º traste, onde a corda cede mais; o F barra SEIS cordas no 1º
 * traste, o lugar mais duro do braço. Começar pelo F é o motivo mais comum de
 * gente largar o violão na primeira semana — e o catálogo confirma: a cifra
 * mais fácil que ainda pede pestana é "Just The Way You Are" (D, Bm7, G).
 */
export default function BarrePreview() {
  const pares = [
    {
      chord: "Bm7",
      legenda: "Barre on 5 strings, 2nd fret",
      porque: "the softest barre to start on",
    },
    {
      chord: "F",
      legenda: "Barre on 6 strings, 1st fret",
      porque: "the hardest one — it can wait a week",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 mt-5">
      {pares.map((p) => (
        <div
          key={p.chord}
          className="rounded-xl p-4 flex flex-col items-center gap-1 border border-[var(--c-hairline)]"
          style={{ background: "var(--c-card)" }}
        >
          <MiniFretboard chord={p.chord} theme={THEMES.amber} locale="en" />
          <p className="text-[11px] text-[var(--c-text-secondary)] text-center mt-1">{p.legenda}</p>
          <p className="text-[11px] text-brand-muted text-center">{p.porque}</p>
        </div>
      ))}
    </div>
  );
}
