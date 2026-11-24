/**
 * TabMockup — a cifra renderizada que aparece no hero.
 *
 * Conteúdo REAL: o riff de baixo de "Billie Jean" transcrito para guitarra,
 * que é o que está gravado na tab do site (slug michael-jackson/billie-jean).
 * Só tablatura e acordes — nenhuma letra, de propósito.
 *
 * Componente de servidor (sem estado): o movimento é 100% CSS
 * (.chord-in em globals.css), o que evita hidratação e custa quase nada.
 */

const RIFF = [
  { s: "e", v: "|" },
  { s: "B", v: "|" },
  { s: "G", v: "|" },
  { s: "D", v: "|--------2-------2-----------------------2-------2" },
  { s: "A", v: "|----4---------------4---2---4-------4---------------4---2" },
  { s: "E", v: "|2-----------2-------------------2-----------2" },
];

const CHORDS = ["F#m", "G#m", "D", "A"];

export default function TabMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="hero-glow absolute -inset-10 rounded-[3rem] pointer-events-none"
      />

      <div
        className="gold-ring relative rounded-2xl border border-[var(--c-hairline)] bg-[var(--c-card)] overflow-hidden"
        style={{ boxShadow: "var(--c-shadow)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--c-hairline)]">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--c-overlay)" }} aria-hidden />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--c-overlay)" }} aria-hidden />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--c-overlay)" }} aria-hidden />
          <span className="ml-3 text-xs text-[var(--c-text-tertiary)] truncate">
            michael-jackson / billie-jean
          </span>
          <span
            className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full"
            style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
          >
            Verified
          </span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-bold">Billie Jean</h3>
            <span className="text-sm text-[var(--c-text-tertiary)]">Michael Jackson</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {[
              ["Key", "F#m"],
              ["Capo", "0"],
              ["Level", "Intermediate"],
            ].map(([k, v], i) => (
              <span
                key={k}
                className="chord-in text-[11px] px-2 py-1 rounded border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)]"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="text-[var(--c-text-tertiary)]">{k}: </span>
                <span className="font-bold">{v}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-5">
            {CHORDS.map((c, i) => (
              <span
                key={c}
                className="chord-in text-sm font-bold"
                style={{ "--i": i + 3, color: "var(--c-gold)" } as React.CSSProperties}
              >
                {c}
              </span>
            ))}
          </div>

          <pre
            className="mt-3 overflow-x-auto text-[10.5px] leading-[1.75] font-mono whitespace-pre"
            style={{ color: "var(--c-text-secondary)" }}
          >
            {RIFF.map((row, i) => (
              <div
                key={row.s}
                className="chord-in"
                style={{ "--i": i + 7 } as React.CSSProperties}
              >
                <span style={{ color: "var(--c-gold)" }}>{row.s}</span>
                {row.v}
              </div>
            ))}
          </pre>

          <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--c-hairline)]">
            <span className="text-[11px] text-[var(--c-text-tertiary)]">
              Bass riff transcribed for guitar
            </span>
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "var(--c-overlay-soft)", color: "var(--c-text-secondary)" }}
            >
              Auto-scroll · Transpose · Smart Key
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
