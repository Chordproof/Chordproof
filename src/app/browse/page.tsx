import { supabase } from "@/lib/supabase";
import TabCard from "@/components/TabCard";
export const dynamic = "force-dynamic";
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q || "").trim().toLowerCase();
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, difficulty, is_verified, key_sig, artist_image_url")
    .order("artist", { ascending: true })
    .order("song", { ascending: true });
  const allTabs = tabs || [];
  const filtered = query
    ? allTabs.filter(
        (t) =>
          (t.song || "").toLowerCase().includes(query) ||
          (t.artist || "").toLowerCase().includes(query) ||
          (t.slug_song || "").toLowerCase().includes(query) ||
          (t.slug_artist || "").toLowerCase().includes(query)
      )
    : allTabs;
  const grouped = filtered.reduce<Record<string, any[]>>((acc, tab) => {
    (acc[tab.artist] ||= []).push(tab);
    return acc;
  }, {});
  return (
    <div className="space-y-10">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold">Browse Tabs</h1>
        {query ? (
          <p className="text-brand-muted mt-2">
            {filtered.length} resultado(s) para "{searchParams.q}"
          </p>
        ) : (
          <p className="text-brand-muted mt-2">{allTabs.length} cifras disponíveis</p>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="text-brand-muted text-center py-16">
          Nenhuma cifra encontrada para "{searchParams.q}". Tente outro artista ou música.
        </p>
      ) : (
        Object.entries(grouped).map(([artist, artistTabs]) => (
          <section key={artist} className="space-y-4">
            <h2 className="text-2xl font-bold capitalize flex items-center gap-3">
              {artistTabs[0]?.artist_image_url && (
                <img
                  src={artistTabs[0].artist_image_url}
                  alt={artist}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              {artist}
              <span className="text-sm font-normal text-brand-muted">{artistTabs.length} músicas</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artistTabs.map((tab) => (
                <TabCard
                  key={`${tab.slug_artist}-${tab.slug_song}`}
                  song={tab.song}
                  artist={tab.artist}
                  slug_artist={tab.slug_artist}
                  slug_song={tab.slug_song}
                  difficulty={tab.difficulty}
                  is_verified={tab.is_verified}
                  key_sig={tab.key_sig}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
