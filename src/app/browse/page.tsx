import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Eye, Music, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q || "").trim().toLowerCase();

  // Todas as músicas ordenadas por views (ranking)
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, is_verified, views, artist_image_url")
    .order("views", { ascending: false });

  const allTabs = tabs || [];

  // Filtro de busca (música, artista ou slug)
  const filtered = query
    ? allTabs.filter(
        (t) =>
          (t.song || "").toLowerCase().includes(query) ||
          (t.artist || "").toLowerCase().includes(query) ||
          (t.slug_song || "").toLowerCase().includes(query) ||
          (t.slug_artist || "").toLowerCase().includes(query)
      )
    : allTabs;

  // Artistas mais vistos (top 10 por soma de views)
  const artistMap = new Map<string, { name: string; slug: string; views: number; image: string | null }>();
  (allTabs || []).forEach((t) => {
    if (!artistMap.has(t.slug_artist)) {
      artistMap.set(t.slug_artist, { name: t.artist, slug: t.slug_artist, views: 0, image: t.artist_image_url ?? null });
    }
    artistMap.get(t.slug_artist)!.views += t.views || 0;
  });
  const topArtists = Array.from(artistMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const formatViews = (v: number | null) => {
    if (!v) return "0";
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(".0", "") + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
    return String(v);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold">Browse Tabs</h1>
        <p className="text-brand-muted mt-2">
          {query
            ? `${filtered.length} resultado(s) para "${searchParams.q}"`
            : `${allTabs.length} cifras disponíveis`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Coluna principal: ranking em 3 colunas */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <p className="text-brand-muted text-center py-16">
              Nenhuma cifra encontrada para "{searchParams.q}". Tente outro artista ou música.
            </p>
          ) : (
            <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
              {filtered.map((tab, idx) => (
                <Link
                  key={`${tab.slug_artist}-${tab.slug_song}`}
                  href={`/tab/${tab.slug_artist}/${tab.slug_song}`}
                  className="break-inside-avoid flex items-center gap-3 px-4 py-3 mb-3 bg-brand-card rounded-xl border border-white/5 hover:border-brand-gold/30 hover:bg-white/5 transition group"
                >
                  <span className={`text-xl font-bold w-8 text-center flex-shrink-0 ${idx < 3 ? "text-brand-gold" : "text-brand-muted"}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold truncate group-hover:text-brand-gold transition">{tab.song}</span>
                      {tab.is_verified && <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-brand-muted truncate">{tab.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Artistas mais vistos */}
        <aside className="lg:col-span-1">
          <div className="bg-brand-card rounded-2xl border border-white/5 p-5 lg:sticky lg:top-4">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Eye size={18} className="text-brand-gold" />
              Artistas mais vistos
            </h2>
            <div className="space-y-3">
              {topArtists.map((artist, idx) => (
                <Link
                  key={artist.slug}
                  href={`/artist/${artist.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <span className={`text-sm font-bold w-5 text-center flex-shrink-0 ${idx < 3 ? "text-brand-gold" : "text-brand-muted"}`}>
                    {idx + 1}
                  </span>
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Music size={16} className="text-brand-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-brand-gold transition">{artist.name}</p>
                    <p className="text-xs text-brand-muted">{formatViews(artist.views)} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
