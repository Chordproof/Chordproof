"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Music2, Info, ArrowRight } from "lucide-react";

/**
 * ChordProgress — "os acordes que você já tocou".
 *
 * A REGRA DE HONESTIDADE GOVERNA ESTE COMPONENTE.
 * O sistema sabe que a pessoa passou pelos acordes de uma música tocando a
 * progressão até o fim. Ele NÃO sabe se os acordes soaram. Então:
 *   · um acorde aparece como "played in N songs", nunca "you know it";
 *   · "mastered" só existe internamente a partir de 3 músicas diferentes, e
 *     mesmo assim o texto na tela é "In 3 songs", não "Dominado";
 *   · o rodapé diz, em uma frase, o que está sendo medido.
 * Num site que ensina, alegar domínio sem medir execução é o defeito mais
 * caro que existe: destrói a confiança no primeiro acorde que a pessoa erra.
 */

type ChordRow = {
  chord: string;
  songsPlayed: number;
  songsInCatalog: number;
  mastered: boolean;
  lastPlayed: string | null;
};

type Progress = {
  songsPracticed: number;
  chords: ChordRow[];
};

export default function ChordProgress() {
  const [data, setData] = useState<Progress | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "vazio" | "erro">("carregando");

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const r = await fetch("/api/progress", { cache: "no-store" });
        if (!ativo) return;
        if (r.status === 401) { setEstado("vazio"); return; }
        if (!r.ok) { setEstado("erro"); return; }
        const d = await r.json();
        setData({ songsPracticed: d.songsPracticed ?? 0, chords: d.chords ?? [] });
        setEstado((d.chords ?? []).length ? "ok" : "vazio");
      } catch {
        if (ativo) setEstado("erro");
      }
    })();
    return () => { ativo = false; };
  }, []);

  if (estado === "carregando") {
    return (
      <section className="glass-card rounded-2xl p-6">
        <div className="h-5 w-40 rounded bg-[var(--c-overlay-soft)] animate-pulse" />
      </section>
    );
  }

  // vazio: não é erro, e é o estado de quase todo mundo hoje. Explica o que fazer.
  if (estado === "vazio") {
    return (
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Music2 size={18} style={{ color: "var(--c-gold)" }} /> Chords you have played
        </h2>
        <p className="text-sm text-[var(--c-text-secondary)] leading-relaxed">
          Nothing here yet. Open a tab, press <strong>Play the whole tab</strong> and let it run
          through the progression — the chords you go through show up here.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold"
          style={{ color: "var(--c-gold)" }}
        >
          Find something to play <ArrowRight size={14} />
        </Link>
      </section>
    );
  }

  if (estado === "erro" || !data) return null;

  const dominados = data.chords.filter((c) => c.mastered).length;

  return (
    <section className="glass-card rounded-2xl p-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
        <Music2 size={18} style={{ color: "var(--c-gold)" }} /> Chords you have played
      </h2>
      <p className="text-sm text-brand-muted mb-4">
        {data.songsPracticed === 1
          ? "1 song played through"
          : `${data.songsPracticed} songs played through`}
        {dominados > 0 && ` · ${dominados} in three or more`}
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {data.chords.slice(0, 12).map((c) => (
          <li key={c.chord}>
            <Link
              href={`/chord/${encodeURIComponent(c.chord.toLowerCase().replace(/#/g, "-"))}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-[var(--c-hairline)] hover:border-brand-gold/50 transition-colors"
            >
              <span
                className="shrink-0 inline-flex items-center justify-center rounded-lg font-bold"
                style={{
                  width: 40,
                  height: 32,
                  background: "var(--c-gold-soft)",
                  color: "var(--c-gold)",
                  fontSize: 14,
                }}
              >
                {c.chord}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {c.songsPlayed === 1 ? "In 1 song" : `In ${c.songsPlayed} songs`}
                </span>
                <span className="block text-[11px] text-brand-muted">
                  appears in {c.songsInCatalog.toLocaleString("en-US")} tabs
                </span>
              </span>
              <ArrowRight size={13} className="shrink-0" style={{ color: "var(--c-gold)" }} />
            </Link>
          </li>
        ))}
      </ul>

      {/* O AVISO NÃO É RODAPÉ DECORATIVO: é o que impede alguém de achar que
          tocar de ouvido errado conta como acerto. */}
      <p className="flex items-start gap-1.5 text-[11px] text-brand-muted mt-4 leading-relaxed">
        <Info size={12} className="shrink-0 mt-0.5" />
        <span>
          This measures <strong>which chords you went through</strong>, not whether they
          sounded right — no microphone is listening. Treat it as a map of what you have
          touched, not a grade.
        </span>
      </p>
    </section>
  );
}
