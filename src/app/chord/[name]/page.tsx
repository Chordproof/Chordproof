import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Guitar, Music2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { scoreDifficulty } from "@/lib/difficulty";
import BigDiagram from "@/components/BigChordDiagram";

export const dynamic = "force-dynamic";

/**
 * /chord/[name] — a página de um acorde.
 *
 * POR QUE ESTA PÁGINA É A MAIOR LACUNA DO SITE
 * Medido no catálogo: G aparece em 878 músicas, D em 765, A em 764. Quem
 * procura "como tocar G no violão" chega ao Cifra Club e não ao ChordProof —
 * não existia destino para a dúvida mais elementar de quem está aprendendo.
 *
 * O QUE ESTA PÁGINA ENTREGA (e nenhuma outra do site entregava)
 *   1. o DESENHO do acorde em ponto grande, com pestana e dedilhado;
 *   2. se ele pede pestana ou pode ser aberto, e o erro comum de cada caso;
 *   3. as músicas do catálogo que o usam, da MAIS FÁCIL para a mais difícil —
 *      é o caminho natural de quem quer praticar aquele shape;
 *   4. acordes vizinhos para seguir aprendendo.
 *
 * A ORDEM DAS MÚSICAS usa a nota calculada (difficulty_score), não o campo
 * `difficulty` antigo, que medi e não serve (Beginner 7,3 acordes × Advanced
 * 9,1).
 */

/**
 * O BANCO GUARDA AS DUAS GRAFIAS — e isso muda a consulta.
 * Medido: "Bb" aparece em 218 músicas e "Ab" em 116, convivendo com "A#" e
 * "G#" escritos por outros autores. Se eu normalizasse enarmonia (Bb -> A#),
 * a página do Bb apareceria VAZIA mesmo com 218 músicas usando Bb.
 *
 * Solução: consultar a grafia pedida E a equivalente, somando os resultados.
 */
const ENARMONICO: Record<string, string[]> = {
  "A#": ["Bb"], Bb: ["A#"],
  "C#": ["Db"], Db: ["C#"],
  "D#": ["Eb"], Eb: ["D#"],
  "F#": ["Gb"], Gb: ["F#"],
  "G#": ["Ab"], Ab: ["G#"],
};

/**
 * Normaliza o acorde da URL para o formato do banco: MANTÉM a grafia
 * (bemol continua bemol) e só acerta a caixa.
 *
 * ARMADILHA: `.contains("chords_used", [chord])` do PostgREST é sensível a
 * caixa — "d/f#" não acha "D/F#".
 *
 * ORDEM DAS SUBSTITUIÇÕES IMPORTA — cada passo já me custou um acorde errado:
 *  1. o sufixo ESCRITO com hífen vem primeiro ("a-sharp" -> "a#"); sem isso,
 *     o passo 2 leria "a-" como sustenido e produzia "A##", que não existe;
 *  2. só então o hífen na raiz é o slug do sustenido ("d-f" -> "D#");
 *  3. por último a palavra sem hífen ("csharp" -> "C#").
 */
function normalizeChord(raw: string): string {
  const dec = decodeURIComponent(raw).trim();
  const fix = dec
    .replace(/-sharp\b/gi, "#")
    .replace(/-flat\b/gi, "b")
    .replace(/^([A-Ga-g])-/, "$1#")
    .replace(/sharp/gi, "#")
    .replace(/flat/gi, "b");

  const r = fix.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!r) return fix;
  const root = r[1].charAt(0).toUpperCase() + r[1].slice(1);
  const quality = r[2].replace(/\/([A-Ga-g])([#b]?)/, (_m, n, a) => "/" + n.toUpperCase() + a);
  return root + quality;
}

/** A grafia pedida e a equivalente enarmônica, para consultar as duas. */
function spellingsOf(chord: string): string[] {
  const r = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!r) return [chord];
  const outras = ENARMONICO[r[1]] ?? [];
  return [chord, ...outras.map((o) => o + r[2])];
}

/** Rótulo humano do acorde: "F#m" -> "F sharp minor". */
function friendlyName(chord: string): string {
  const m = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return chord;
  const rootName: Record<string, string> = {
    C: "C", "C#": "C sharp", Db: "D flat", D: "D", "D#": "D sharp", Eb: "E flat",
    E: "E", F: "F", "F#": "F sharp", Gb: "G flat", G: "G", "G#": "G sharp",
    Ab: "A flat", A: "A", "A#": "A sharp", Bb: "B flat", B: "B",
  };
  const q: Record<string, string> = {
    "": "major", m: "minor", "7": "dominant seventh", maj7: "major seventh",
    m7: "minor seventh", sus2: "suspended second", sus4: "suspended fourth",
    add9: "added ninth", dim: "diminished", aug: "augmented", "5": "power chord",
    "6": "sixth", "9": "ninth", m9: "minor ninth", "11": "eleventh", "13": "thirteenth",
  };
  const slash = m[2].match(/\/([A-G][#b]?)$/);
  const semSlash = slash ? m[2].slice(0, m[2].length - slash[0].length) : m[2];
  const base = q[semSlash] ?? "";
  let out = `${rootName[m[1]] ?? m[1]}${base ? " " + base : ""}`;
  if (slash) out += ` over ${rootName[slash[1]] ?? slash[1]}`;
  return out;
}

const BARRE_ROOTS = new Set(["F", "F#", "Gb", "C#", "Db", "G#", "Ab", "D#", "Eb", "A#", "Bb", "B"]);

/** Slug da URL a partir do acorde, na mesma regra usada nos links. */
function slugOf(chord: string): string {
  return encodeURIComponent(chord.toLowerCase().replace(/#/g, "-"));
}

type TabRow = {
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  difficulty_score: number | null;
  difficulty_auto: string | null;
  key_sig: string | null;
  capo: string | null;
  content: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}): Promise<Metadata> {
  const chord = normalizeChord(params.name);
  const nice = friendlyName(chord);
  const title = `${chord} chord on guitar — how to play it and the songs that use it`;
  const description = `How to play ${chord} (${nice}) on guitar: fingering, barre and open positions, and the ChordProof tabs that use this chord, ordered from easiest.`;
  return {
    title,
    description,
    alternates: { canonical: `/chord/${slugOf(chord)}` },
    openGraph: { title, description },
    robots: { index: true, follow: true },
  };
}

export default async function ChordPage({ params }: { params: { name: string } }) {
  const chord = normalizeChord(params.name);
  if (!/^[A-G][#b]?/.test(chord)) notFound();

  /**
   * Músicas que usam este acorde. A leitura é PAGINADA porque o PostgREST
   * corta em 1.000 linhas em silêncio (foi o bug que escondeu 166 músicas da
   * busca em 26/11).
   */
  const PAGE = 1000;
  const grafias = spellingsOf(chord);
  const vistos = new Set<string>();
  const comAcorde: TabRow[] = [];

  // uma consulta por grafia (Bb e A# são valores diferentes no banco)
  for (const grafia of grafias) {
    for (let from = 0; from < 5000; from += PAGE) {
      const { data } = await supabase
        .from("tabs")
        .select("song, artist, slug_artist, slug_song, difficulty_score, difficulty_auto, key_sig, capo, content")
        .contains("chords_used", [grafia])
        .order("difficulty_score", { ascending: true })
        .range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      for (const row of data as TabRow[]) {
        const k = `${row.slug_artist}/${row.slug_song}`;
        if (vistos.has(k)) continue; // a música pode usar as duas grafias
        vistos.add(k);
        comAcorde.push(row);
      }
      if (data.length < PAGE) break;
    }
  }
  comAcorde.sort((a, b) => (a.difficulty_score ?? 99) - (b.difficulty_score ?? 99));

  if (comAcorde.length === 0) notFound();

  /**
   * Total do catálogo: CONTADO, não chutado. Um número fixo no código vira
   * mentira no dia seguinte — e esta página já ensina uma estatística.
   */
  const { count: totalCatalogo } = await supabase
    .from("tabs")
    .select("id", { count: "exact", head: true });

  /**
   * MÚSICAS DE EXEMPLO — as 12 mais fáceis que usam o acorde. Quem está
   * aprendendo G precisa de música com G, não de teoria.
   */
  const exemplos = comAcorde
    .slice(0, 12)
    .map((t) => {
      const calc = t.difficulty_score
        ? null
        : scoreDifficulty({ content: t.content, capo: t.capo, bpm: 100 });
      return {
        ...t,
        score: t.difficulty_score ?? calc?.score ?? 99,
        label: t.difficulty_auto ?? calc?.label ?? "Intermediate",
      };
    })
    .sort((a, b) => a.score - b.score);

  const root = chord.match(/^([A-G][#b]?)/)?.[1] ?? "C";
  const needsBarre = BARRE_ROOTS.has(root) && !/^5$/.test(chord.slice(root.length));
  const maisDificeis = [...exemplos].sort((a, b) => b.score - a.score).slice(0, 3);

  // acordes vizinhos: mesma raiz em outros formatos + acordes abertos comuns
  const mesmaRaiz = ["", "m", "7", "m7", "maj7", "sus4", "sus2", "add9"]
    .map((q) => root + q)
    .filter((c) => c !== chord)
    .slice(0, 6);
  const comuns = ["C", "G", "D", "A", "E", "Em", "Am", "Dm"].filter((c) => c !== chord).slice(0, 6);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <nav className="text-sm text-brand-muted" style={{ marginBottom: "20px" }}>
        <ol className="flex gap-2 flex-wrap">
          <li><Link href="/" className="hover:text-[var(--c-text)]">Home</Link></li>
          <li>/</li>
          <li><Link href="/browse" className="hover:text-[var(--c-text)]">Browse</Link></li>
          <li>/</li>
          <li className="text-[var(--c-text)]">{chord} chord</li>
        </ol>
      </nav>

      <header style={{ marginBottom: "24px" }}>
        <h1 className="text-4xl md:text-5xl font-bold">{chord} chord</h1>
        <p className="text-lg text-[var(--c-text-secondary)] mt-2">
          {friendlyName(chord)} — fingering, positions and the songs that use it.
        </p>
        <p className="text-sm text-brand-muted mt-3">
          Used in <strong className="text-[var(--c-gold)]">{comAcorde.length}</strong> of the{" "}
          {(totalCatalogo ?? comAcorde.length).toLocaleString("en-US")} tabs on ChordProof.
        </p>
      </header>

      {/* O desenho em ponto grande: o motivo principal de a pessoa ter caído aqui */}
      <section className="glass-card rounded-2xl p-6" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-2 mb-4">
          <Guitar size={16} style={{ color: "var(--c-gold)" }} />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--c-text-secondary)]">
            How to play it
          </h2>
        </div>
        <p className="text-sm text-[var(--c-text-secondary)] leading-relaxed">
          {needsBarre ? (
            <>
              <strong>{chord}</strong> needs a <strong>barre</strong>: one finger presses several
              strings at the same fret while the others shape the chord. It is the shape that
              separates the open-chord stage from the next one — expect a few days before it
              rings clean. Press close to the fret, not in the middle of it, and keep the thumb
              behind the neck.
            </>
          ) : (
            <>
              <strong>{chord}</strong> can be played with <strong>open strings</strong> — the
              easiest kind of shape. Let every string ring and check them one by one: a muted
              string in the middle is the most common mistake.
            </>
          )}
        </p>

        {/* diagrama grande: client component isolado, para a página seguir
            sendo Server Component e entregar HTML com conteúdo ao Google */}
        <div className="mt-5">
          <BigDiagram chord={chord} />
        </div>
      </section>

      {/* Músicas que usam o acorde, da mais fácil */}
      <section className="glass-card rounded-2xl p-6" style={{ marginBottom: "24px" }}>
        <div className="flex items-center gap-2 mb-1">
          <Music2 size={16} style={{ color: "var(--c-gold)" }} />
          <h2 className="text-xl font-bold">Songs that use {chord}</h2>
        </div>
        <p className="text-sm text-brand-muted mb-4">
          Easiest first — practise the shape on something you can actually play.
        </p>

        <ul className="space-y-2">
          {exemplos.map((t) => (
            <li key={`${t.slug_artist}-${t.slug_song}`}>
              <Link
                href={`/tab/${t.slug_artist}/${t.slug_song}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-[var(--c-hairline)] hover:border-brand-gold/50 transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold truncate">{t.song}</span>
                  <span className="block text-sm text-[var(--c-text-secondary)] truncate">
                    {t.artist}
                  </span>
                </span>
                <span
                  className="shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded"
                  style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
                >
                  {t.label}
                </span>
                <ArrowRight size={14} className="shrink-0" style={{ color: "var(--c-gold)" }} />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={`/browse?chord=${encodeURIComponent(chord)}`}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold"
          style={{ color: "var(--c-gold)" }}
        >
          See all {comAcorde.length} songs with {chord} <ArrowRight size={14} />
        </Link>
      </section>

      {/* Para quem já toca: onde ele aparece de forma difícil */}
      {maisDificeis.length > 0 && (
        <section className="glass-card rounded-2xl p-6" style={{ marginBottom: "24px" }}>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} style={{ color: "var(--c-gold)" }} />
            <h2 className="text-xl font-bold">When it gets harder</h2>
          </div>
          <p className="text-sm text-brand-muted mb-3">
            Same chord, tougher context — faster tempo, more changes or a picked part.
          </p>
          <ul className="space-y-1.5 text-sm">
            {maisDificeis.map((t) => (
              <li key={`hard-${t.slug_artist}-${t.slug_song}`}>
                <Link href={`/tab/${t.slug_artist}/${t.slug_song}`} className="hover:underline">
                  {t.song} <span className="text-brand-muted">— {t.artist}</span>
                </Link>
                <span className="text-brand-muted"> · {t.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Próximos acordes */}
      <section style={{ marginBottom: "24px" }}>
        <h2 className="text-lg font-bold mb-3">Keep going</h2>
        <div className="flex flex-wrap gap-2">
          {[...mesmaRaiz, ...comuns].map((c) => (
            <Link
              key={c}
              href={`/chord/${slugOf(c)}`}
              className="px-3 py-1.5 rounded-full text-sm border border-[var(--c-hairline)] hover:border-brand-gold/50 transition-colors"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
