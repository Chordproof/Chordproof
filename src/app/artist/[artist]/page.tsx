import { supabase } from "@/lib/supabase";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import TabCard from "@/components/TabCard";
import ArtistAvatar from "@/components/ArtistAvatar";

export async function generateMetadata({ params }: { params: { artist: string } }) {
  const name = params.artist.replace(/-/g, " ");
  return {
    title: `${name} | Guitar Tabs | ChordProof`,
    description: `Verified guitar tabs and chords for ${name}. Accurate, hand-checked tablature. No paywalls.`,
    openGraph: {
      title: `${name} | Guitar Tabs | ChordProof`,
      description: `Verified guitar tabs and chords for ${name}.`,
      url: `${SITE_URL}/artist/${params.artist}`,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export default async function ArtistPage({ params }: { params: { artist: string } }) {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, difficulty, is_verified, key_sig, slug_artist, slug_song, artist_image_url")
    .eq("slug_artist", params.artist);
  const name = params.artist.replace(/-/g, " ");
  const imageUrl = tabs?.[0]?.artist_image_url ?? null;

  return (
    <div className="space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          name,
          url: `${SITE_URL}/artist/${params.artist}`,
        }}
      />

      {/* Foto à esquerda do nome */}
      <div className="flex items-center gap-5">
        <ArtistAvatar name={name} slug={params.artist} imageUrl={imageUrl} size="md" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold capitalize">{name}</h1>
          <p className="text-brand-muted">Verified guitar tabs and chords.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(tabs || []).map((t) => (
          <TabCard
            key={`${t.slug_artist}-${t.slug_song}`}
            song={t.song}
            artist={t.artist}
            difficulty={t.difficulty}
            is_verified={t.is_verified}
            key_sig={t.key_sig}
            slug_artist={t.slug_artist}
            slug_song={t.slug_song}
            artistImageUrl={t.artist_image_url}
          />
        ))}
      </div>
    </div>
  );
}
