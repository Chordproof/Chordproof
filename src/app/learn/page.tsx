import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Guitar, Music2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BarrePreview from "@/components/BarrePreview";

export const dynamic = "force-dynamic";

/**
 * /learn — a TRILHA de quem está começando.
 *
 * O PROBLEMA QUE ISTO RESOLVE: o site tinha ferramenta de sobra (player,
 * loop, velocidade, trainer, metrônomo) e nenhum COMEÇO. Um iniciante não
 * tinha onde entrar: a home mostra as mais tocadas, que incluem Billie Jean
 * (pestana) e Jump (pestana em posição aberta). Escolher por "most played" é
 * o critério de quem JÁ sabe tocar.
 *
 * COMO OS NÍVEIS SÃO MONTADOS: pela nota CALCULADA (difficulty_score), nunca
 * pelo campo `difficulty` antigo. Medi os 1.166: o rótulo original dizia
 * "Beginner" para cifras com média de 7,3 acordes e "Advanced" para 9,1 —
 * praticamente o mesmo. Mandar iniciante para pestana destrói a confiança.
 *
 * REGRA DE HONESTIDADE: os níveis descrevem o que a CIFRA exige, não o que a
 * pessoa sabe. Nada aqui promete "em 30 dias você toca" — isso seria venda,
 * não ensino.
 */

export const metadata: Metadata = {
  title: "Learn guitar chords — a path from open chords to barre chords",
  description:
    "A starting path for guitar: open chords first, then barre chords, then picking. Each step lists real songs you can play with what you just learned.",
  alternates: { canonical: "/learn" },
  robots: { index: true, follow: true },
};

type TabRow = {
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  difficulty_score: number | null;
  difficulty_auto: string | null;
  difficulty_reasons: string[] | null;
  chords_used: string[] | null;
  key_sig: string | null;
  capo: string | null;
};

const NIVEIS = [
  {
    n: 1,
    titulo: "Open chords",
    faixa: "score under 8",
    o_que:
      "Four to six open chords, no barre, comfortable tempo. This is where the hand learns to change shape without looking.",
    criterio: "No barre chord. If an F shows up, the tab does not belong here.",
    meta: "Change between two chords without stopping the song.",
  },
  {
    n: 2,
    titulo: "First barre",
    faixa: "score 8 to 13",
    o_que: "One barre appears — usually F or Bm — and the changes get faster.",
    criterio: "Up to two barre chords, few different chords.",
    meta: "Make the barre ring clean and change out of it without stalling.",
  },
  {
    n: 3,
    titulo: "Barre in context",
    faixa: "score 13 to 19",
    o_que:
      "The barre stops being an event and becomes part of the song, with more chords and a quicker tempo.",
    criterio: "Three or more barre chords, or many different chords.",
    meta: "Play the whole song without stopping in the middle of a chord.",
  },
  {
    n: 4,
    titulo: "Picking and detail",
    faixa: "score 19 and up",
    o_que:
      "The right hand stops being a strum: fingerpicking, riffs and tablature. This is what separates accompaniment from arrangement.",
    criterio: "Barre chords combined with tablature, or dense harmony (Jazz, R&B).",
    meta: "Follow the tablature without losing the beat.",
  },
] as const;

export default async function LearnPage() {
  /**
   * Uma leitura paginada de `tabs`. O PostgREST corta em 1.000 linhas em
   * silêncio — a lição de 25/11, quando a home anunciou "1,000 tabs" com o
   * banco em 1.166.
   */
  const PAGE = 1000;
  const rows: TabRow[] = [];
  for (let from = 0; from < 5000; from += PAGE) {
    const { data } = await supabase
      .from("tabs")
      .select("song, artist, slug_artist, slug_song, difficulty_score, difficulty_auto, difficulty_reasons, chords_used, key_sig, capo")
      .not("difficulty_score", "is", null)
      .order("difficulty_score", { ascending: true })
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    rows.push(...(data as TabRow[]));
    if (data.length < PAGE) break;
  }

  const porNivel = (n: number) => {
    const lo = n === 1 ? 0 : n === 2 ? 8 : n === 3 ? 13 : 19;
    const hi = n === 1 ? 8 : n === 2 ? 13 : n === 3 ? 19 : 1000;
    return rows.filter((r) => {
      const s = r.difficulty_score ?? 0;
      return s >= lo && s < hi;
    });
  };

  /** Escolhe 8 músicas por nível, espalhadas pela faixa (não só o extremo). */
  const amostra = (n: number) => {
    const lista = porNivel(n);
    if (lista.length <= 8) return lista;
    const passo = Math.floor(lista.length / 8);
    return Array.from({ length: 8 }, (_, i) => lista[i * passo]).filter(Boolean);
  };

  /**
   * O EXPERIMENTO: músicas de verdade no nível 1, sem pestana. É o que faltava
   * no site — hoje a home entrega Billie Jean (5 pestanas) como "onde todo
   * mundo começa".
   */
  const inicio = rows
    .filter((r) => (r.difficulty_score ?? 99) < 8 && (r.chords_used?.length ?? 0) <= 5)
    .slice(0, 3);
  const total = rows.length;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <nav className="text-sm text-brand-muted" style={{ marginBottom: "20px" }}>
        <ol className="flex gap-2">
          <li><Link href="/" className="hover:text-[var(--c-text)]">Home</Link></li>
          <li>/</li>
          <li className="text-[var(--c-text)]">Learn</li>
        </ol>
      </nav>

      <header style={{ marginBottom: "28px" }}>
        <h1 className="text-4xl md:text-5xl font-bold">Learn to play</h1>
        <p className="text-lg text-[var(--c-text-secondary)] mt-3 max-w-2xl leading-relaxed">
          The site had every tool to practise and no place to start. This is the start: four
          steps, ordered by what the tab actually asks of your hands — not by how popular the
          song is.
        </p>
        <p className="text-sm text-brand-muted mt-3">
          {total.toLocaleString("en-US")} tabs classified by real difficulty
          (chord count, barre chords, tempo, picking).
        </p>
      </header>

      {/* Comece por aqui: músicas de verdade do nível 1 */}
      {inicio.length > 0 && (
        <section
          className="rounded-2xl p-6"
          style={{
            marginBottom: "28px",
            background: "var(--c-gold-soft)",
            border: "1px solid var(--c-hairline)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Guitar size={18} style={{ color: "var(--c-gold)" }} />
            <h2 className="text-xl font-bold">Start here</h2>
          </div>
          <p className="text-sm text-[var(--c-text-secondary)] mb-4">
            Few chords, no barre, slow enough to follow. Open one, press{" "}
            <strong>Play the whole tab</strong> and put your hands on the strings.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {inicio.map((t) => (
              <Link
                key={t.slug_song}
                href={`/tab/${t.slug_artist}/${t.slug_song}`}
                className="rounded-xl p-4 border border-[var(--c-hairline)] hover:border-brand-gold/60 transition-colors"
                style={{ background: "var(--c-card)" }}
              >
                <span className="block font-bold truncate">{t.song}</span>
                <span className="block text-sm text-[var(--c-text-secondary)] truncate">
                  {t.artist}
                </span>
                <span className="block text-[11px] text-brand-muted mt-1">
                  {t.chords_used?.length ?? 0} chords
                  {t.chords_used?.length ? ` · ${t.chords_used.join(" ")}` : ""}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Os quatro níveis */}
      <div className="space-y-5">
        {NIVEIS.map((niv) => {
          const musicas = amostra(niv.n);
          const quantidade = porNivel(niv.n).length;
          return (
            <section key={niv.n} className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4 flex-wrap">
                <span
                  className="shrink-0 inline-flex items-center justify-center rounded-full font-bold"
                  style={{
                    width: 36,
                    height: 36,
                    background: "var(--c-gold-soft)",
                    color: "var(--c-gold)",
                  }}
                >
                  {niv.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">{niv.titulo}</h2>
                  <p className="text-[11px] uppercase tracking-wider text-brand-muted">
                    {niv.faixa} · {quantidade} tabs
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--c-text-secondary)] mt-3 leading-relaxed">
                {niv.o_que}
              </p>

              {/**
               * O BLOCO DA PRIMEIRA PESTANA fica só no nível 2, porque é onde a
               * pessoa encontra o primeiro acorde fechado e onde ela desiste.
               *
               * A ORDEM É MEDIDA, não achismo: a cifra mais fácil do catálogo
               * que ainda pede pestana é "Just The Way You Are" (D, Bm7, G).
               * Ou seja, o Bm7 chega ANTES de qualquer F — e é por isso que o
               * bloco começa por ele. O Bm7 barra cinco cordas no 2º traste; o
               * F barra seis no 1º, o lugar mais duro do braço.
               */}
              {niv.n === 2 && (
                <div className="mt-4 rounded-xl p-4" style={{ background: "var(--c-overlay-soft)" }}>
                  <p className="text-sm font-bold mb-1">Your first barre — start with Bm7, not F</p>
                  <p className="text-xs text-[var(--c-text-secondary)] leading-relaxed">
                    Bm7 barres <strong>five</strong> strings at the 2nd fret, where the string
                    gives more. F barres <strong>six</strong> strings at the 1st fret — the
                    hardest spot on the neck. Press with the <strong>side</strong> of the index
                    finger, right behind the fret wire, and let the thumb pull back on the neck
                    instead of crushing with the hand.
                  </p>
                  <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                    If a string dies, check <em>where</em> it dies: in the crease of the finger,
                    rotate the hand. Under the palm, drop the wrist. Squeezing harder fixes
                    neither.
                  </p>
                  <BarrePreview />
                </div>
              )}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="text-xs text-brand-muted">
                  <strong className="text-[var(--c-text-secondary)]">What puts a tab here:</strong>{" "}
                  {niv.criterio}
                </p>
                <p className="text-xs text-brand-muted">
                  <strong className="text-[var(--c-text-secondary)]">Ready to move on when:</strong>{" "}
                  {niv.meta}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {musicas.map((t) => (
                  <Link
                    key={t.slug_song}
                    href={`/tab/${t.slug_artist}/${t.slug_song}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-[var(--c-hairline)] hover:border-brand-gold/60 transition-colors"
                  >
                    <Music2 size={11} style={{ color: "var(--c-gold)" }} />
                    <span className="truncate max-w-[200px]">{t.song}</span>
                  </Link>
                ))}
              </div>

              <Link
                href={`/browse?level=${niv.n}`}
                className="inline-flex items-center gap-1 mt-4 text-sm font-semibold"
                style={{ color: "var(--c-gold)" }}
              >
                All {quantidade} tabs at this level <ArrowRight size={13} />
              </Link>
            </section>
          );
        })}
      </div>

      {/* Como a dificuldade é medida — transparência, não caixa-preta */}
      <section className="glass-card rounded-2xl p-6 mt-6">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Check size={16} style={{ color: "var(--c-gold)" }} /> How these levels are measured
        </h2>
        <p className="text-sm text-[var(--c-text-secondary)] leading-relaxed">
          Each tab is scored from its own content: how many different chords it uses, how many
          of them are barre chords, the tempo of the recording, whether there is a picked part
          written in tablature, and whether it needs a capo. Barre chords weigh the most —
          they are the real dividing line.
        </p>
        <p className="text-sm text-brand-muted mt-2 leading-relaxed">
          We do not use the old hand-typed difficulty label. We measured it: it called
          &ldquo;Beginner&rdquo; tabs with an average of 7.3 different chords and
          &ldquo;Advanced&rdquo; tabs with 9.1 — practically the same thing.
        </p>
      </section>
    </div>
  );
}
