import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo";

// O Supabase devolve no máximo 1000 linhas por request, e o catálogo já passou
// de 1166 cifras: paginamos até esgotar. A tabela `tabs` NÃO tem updated_at
// (a versão anterior selecionava essa coluna, a query falhava e o sitemap
// saía com apenas as 2 URLs fixas).
export const revalidate = 3600;

const PAGE = 1000;

export default async function sitemap() {
  type TabRow = { slug_artist: string; slug_song: string; created_at: string | null };
  const tabs: TabRow[] = [];

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("tabs")
      .select("slug_artist, slug_song, created_at")
      .order("slug_artist", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error || !data || data.length === 0) break;
    tabs.push(...(data as TabRow[]));
    if (data.length < PAGE) break;
  }

  const tabUrls = tabs
    .filter((t) => t.slug_artist && t.slug_song)
    .map((t) => ({
      url: `${SITE_URL}/tab/${t.slug_artist}/${t.slug_song}`,
      ...(t.created_at ? { lastModified: new Date(t.created_at) } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  /**
   * PÁGINAS DE ACORDE: 183+ destinos que respondem à dúvida mais elementar
   * ("como tocar G") e que o site não tinha. Fora do sitemap dependeriam só de
   * link interno — e o Google levou meses para descobrir as cifras quando
   * elas não estavam declaradas.
   */
  const chordSet = new Set<string>();
  for (let from = 0; from < 3000; from += PAGE) {
    const { data } = await supabase
      .from("tabs")
      .select("chords_used")
      .not("chords_used", "is", null)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    for (const r of data as { chords_used: string[] | null }[]) {
      for (const c of r.chords_used ?? []) chordSet.add(c);
    }
    if (data.length < PAGE) break;
  }
  const chordUrls = Array.from(chordSet)
    .sort()
    .map((c) => ({
      url: `${SITE_URL}/chord/${encodeURIComponent(c.toLowerCase().replace(/#/g, "-"))}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    { url: SITE_URL, changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/learn`, changeFrequency: "weekly" as const, priority: 0.9 },
    ...chordUrls,
    ...tabUrls,
  ];
}
