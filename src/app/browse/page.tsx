import { supabase } from "@/lib/supabase";
import TabCard from "@/components/TabCard";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, difficulty, is_verified, key_sig")
    .order("artist", { ascending: true })
    .order("song", { ascending: true });

  const grouped = (tabs || []).reduce<Record<string, typeof tabs>>((acc, tab) => {
    (acc[tab.artist] ||= []).push(tab);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold">Browse Tabs</h1>
        <p className="text-brand-muted mt-2">{tabs?.length || 0} cifras disponíveis</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-brand-muted text-center py-16">
          Nenhuma cifra cadastrada. Insira as cifras no Supabase primeiro.
        </p>
      ) : (
        Object.entries(grouped).map(([artist, artistTabs]) => (
          <section key={artist} className="space-y-4">
            <h2 className="text-2xl font-bold capitalize flex items-center gap-3">
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