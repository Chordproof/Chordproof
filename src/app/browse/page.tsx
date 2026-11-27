import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Eye, Music, CheckCircle2 } from "lucide-react";
import ArtistAvatar from "@/components/ArtistAvatar";

export const dynamic = "force-dynamic";

const formatViews = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; level?: string; chord?: string };
}) {
  const query = (searchParams.q || "").trim().toLowerCase();
  /**
   * FILTROS USADOS PELA TRILHA (/learn) E PELAS PÁGINAS DE ACORDE (/chord).
   * `level` vem da nota calculada (difficulty_auto) e `chord` do array
   * chords_used — nenhum dos dois usa o campo `difficulty` antigo, que medi
   * e não discrimina (Beginner 7,3 acordes × Advanced 9,1).
   */
  const levelParam = (searchParams.level || "").trim();
  const chordParam = (searchParams.chord || "").trim();
  const nivelPorNumero: Record<string, string> = {
    "1": "Beginner",
    "2": "Easy",
    "3": "Intermediate",
    "4": "Advanced",
  };
  const nivelAlvo = nivelPorNumero[levelParam] ?? "";

  // ---------------------------------------------------------------------
  // LEITURA PAGINADA E COM ORDEM DETERMINÍSTICA.
  //
  // BUG QUE ISTO CORRIGE (reportado pelo dono em 26/11: "não achei Chasing
  // Pavements" na busca): a leitura era uma só, `order("views")`. Duas coisas
  // quebravam, e juntas escondiam 166 músicas de 1.166:
  //   1. o PostgREST devolve no máximo 1.000 linhas por requisição, em
  //      silêncio — sem `.range()` a 1.001ª em diante nunca chegava;
  //   2. `views` está empatadíssimo (1.007 músicas com 0 e só 88 valores
  //      distintos no total). Ordenar por uma coluna sem desempate faz o
  //      banco devolver um subconjunto ARBITRÁRIO dentro do empate.
  // Correção: paginar com `.range()` e desempatar por `id`, que é único.
  // ---------------------------------------------------------------------
  const PAGE = 1000;
  const allTabs: {
    song: string;
    artist: string;
    slug_artist: string;
    slug_song: string;
    is_verified: boolean;
    views: number | null;
    artist_image_url: string | null;
    difficulty_auto: string | null;
    chords_used: string[] | null;
  }[] = [];

  for (let from = 0; from < 20000; from += PAGE) {
    const { data, error } = await supabase
      .from("tabs")
      .select("song, artist, slug_artist, slug_song, is_verified, views, artist_image_url, difficulty_auto, chords_used")
      .order("views", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) break;
    const page = data || [];
    allTabs.push(...page);
    if (page.length < PAGE) break; // última página
  }

  // filtros da trilha e das páginas de acorde, antes da busca textual
  let base = allTabs;
  if (nivelAlvo) base = base.filter((t) => t.difficulty_auto === nivelAlvo);
  if (chordParam) base = base.filter((t) => (t.chords_used ?? []).includes(chordParam));

  // Filtro de busca (música, artista ou slug)
  const filtered = query
    ? base.filter(
        (t) =>
          (t.song || "").toLowerCase().includes(query) ||
          (t.artist || "").toLowerCase().includes(query) ||
          (t.slug_song || "").toLowerCase().includes(query) ||
          (t.slug_artist || "").toLowerCase().includes(query)
      )
    : base;

  // Artistas mais vistos (top 10 por soma de views)
  const artistMap = new Map<string, { name: string; slug: string; views: number; image: string | null }>();
  (allTabs || []).forEach((t) => {
    if (!artistMap.has(t.slug_artist)) {
      artistMap.set(t.slug_artist, { name: t.artist, slug: t.slug_artist, views: 0, image: t.artist_image_url ?? null });
    }
    const entry = artistMap.get(t.slug_artist)!;
    entry.views += t.views || 0;
  });
  const topArtists = Array.from(artistMap.values()).sort((a, b) => b.views - a.views).slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold">Browse Tabs</h1>
        <p className="text-brand-muted mt-2">
          {query
            ? `${filtered.length} resultado(s) para "${searchParams.q}"`
            : nivelAlvo
            ? `${filtered.length} tabs at the ${nivelAlvo} level`
            : chordParam
            ? `${filtered.length} tabs that use ${chordParam}`
            : `${allTabs.length} cifras disponíveis`}
        </p>
        {(nivelAlvo || chordParam) && (
          <Link
            href="/browse"
            className="inline-block mt-3 text-sm font-semibold"
            style={{ color: "var(--c-gold)" }}
          >
            limpar filtro
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Coluna principal: ranking em 3 colunas */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <p className="text-brand-muted text-center py-16">
              Nenhuma cifra encontrada. Tente outro artista ou música.
            </p>
          ) : (
            <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
              {filtered.map((tab, idx) => (
                <div
                  key={`${tab.slug_artist}-${tab.slug_song}`}
                  className="break-inside-avoid flex items-center gap-3 px-4 py-3 mb-3 bg-brand-card rounded-xl border border-[var(--c-hairline)] hover:border-brand-gold/30 hover:bg-[var(--c-overlay-soft)] transition group"
                >
                  <span className={`text-xl font-bold w-8 text-center flex-shrink-0 ${idx < 3 ? "text-brand-gold" : "text-brand-muted"}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-shrink-0">
                    <ArtistAvatar name={tab.artist} imageUrl={tab.artist_image_url} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/tab/${tab.slug_artist}/${tab.slug_song}`} className="block">
                      <h3 className="font-bold truncate group-hover:text-brand-gold transition-colors">
                        {tab.song}
                      </h3>
                    </Link>
                    <Link href={`/artist/${tab.slug_artist}`} className="block">
                      <p className="text-sm text-brand-muted truncate hover:text-brand-gold transition-colors">
                        {tab.artist}
                      </p>
                    </Link>
                  </div>
                  {tab.difficulty_auto && (
                    <span
                      className="hidden sm:inline-block shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded"
                      style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
                    >
                      {tab.difficulty_auto}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: artistas */}
        <aside className="lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted mb-3">
            Artistas populares
          </h2>
          <ul className="space-y-2">
            {topArtists.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/artist/${a.slug}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--c-overlay-soft)] transition-colors"
                >
                  <ArtistAvatar name={a.name} imageUrl={a.image} size="xs" />
                  <span className="text-sm truncate">{a.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
