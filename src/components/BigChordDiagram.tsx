"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { THEMES, MiniFretboard, type ThemeKey } from "@/lib/fretboard";
import { audioEngine } from "@/lib/audio";

/**
 * BigChordDiagram — o desenho do acorde em ponto grande, para /chord/[name].
 *
 * POR QUE É UM COMPONENTE SEPARADO (e "use client"): o desenho do braço é
 * gerado pelo solver no navegador. A página de acorde PRECISA ser Server
 * Component — é o que faz o Google ler "G chord, how to play, 878 songs" no
 * HTML em vez de receber uma casca vazia. Foi exatamente esse o bug que
 * manteve as 1.166 cifras fora do índice até 20/11.
 *
 * O desenho reaproveita o MiniFretboard das cifras: mesma solução de acorde,
 * mesmo capotraste, mesmas variações. Nada de motor paralelo para divergir.
 */

export default function BigChordDiagram({ chord }: { chord: string }) {
  const [theme, setTheme] = useState<ThemeKey>("amber");
  const [tocado, setTocado] = useState(false);

  const tocar = async () => {
    await audioEngine.unlock();
    audioEngine.playChordFor(chord, "guitar");
    setTocado(true);
    setTimeout(() => setTocado(false), 900);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--c-overlay-soft)", border: "1px solid var(--c-hairline)" }}
      >
        <div style={{ transform: "scale(1.75)", transformOrigin: "top center", marginBottom: 70 }}>
          <MiniFretboard chord={chord} theme={THEMES[theme]} locale="en" />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={tocar}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
          style={{
            background: tocado ? "var(--c-gold)" : "var(--c-cta-bg)",
            color: tocado ? "#1d1d1f" : "var(--c-cta-text)",
          }}
        >
          <Volume2 size={15} /> Hear it
        </button>
        {([{ key: "amber", label: "Amber" }, { key: "classic", label: "Classic" }] as const).map((s) => (
          <button
            key={s.key}
            onClick={() => setTheme(s.key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: theme === s.key ? "var(--c-gold-soft)" : "var(--c-overlay-soft)",
              color: theme === s.key ? "var(--c-gold)" : "var(--c-text-tertiary)",
              border: "1px solid var(--c-hairline)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-brand-muted text-center max-w-sm">
        Dots are fingers, the bar is a barre, and the number on the side is the fret where the
        shape starts. X means don&apos;t play that string; O means let it ring open.
      </p>
    </div>
  );
}
