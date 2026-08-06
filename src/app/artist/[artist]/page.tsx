import { supabase } from "@/lib/supabase";
import TabCard from "@/components/TabCard";
import { Music } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArtistPage({ params }: { params: { artist: string } }) {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, difficulty, is_verified, key_sig")
    .eq("slug_artist", params.artist)
    .order("song", { ascending: true });

  const artistName = tabs && tabs.length > 0 ? tabs[0].artist : params.artist.replace(/-/g, " ");

  return (
    <div className="space-y-10">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold capitalize">{artistName}</h1>
        <p className="text-brand-muted mt-2">{tabs?.length || 0} cifras disponíveis</p>
      </div>

      {!tabs || tabs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Music className="mx-auto text-brand-muted w-12 h-12" />
          <p className="text-brand-muted text-xl">Artist not found</p>
          <p className="text-brand-muted">Nenhuma cifra encontrada para este artista.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabs.map((tab) => (
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
      )}
    </div>
  );
}
