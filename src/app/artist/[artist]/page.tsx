// src/app/artist/[artist]/page.tsx
import { supabase } from "@/lib/supabase";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import TabCard from "@/components/TabCard";

export async function generateMetadata({ params }: { params: { artist: string } }) {
  const name = params.artist.replace(/-/g, " ");
  return {
    title: `${name} | Guitar Tabs | ChordProof`,
    description: `Verified guitar tabs and chords for ${name}. Accurate, hand-checked tablature. No paywalls.`,
    openGraph: {
      title: `${name} | Guitar Tabs | ChordProof`,
      description: `Verified guitar tabs and chords for ${name}.`,
      type: "profile",
      siteName: SITE_NAME,
    },
    alternates: { canonical: `/artist/${params.artist}` },
  };
}

export default async function ArtistPage({ params }: { params: { artist: string } }) {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, difficulty, is_verified, key_sig, slug_artist, slug_song")
    .eq("slug_artist", params.artist);

  const name = params.artist.replace(/-/g, " ");

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

      <div className="space-y-2">
        <h1 className="text-4xl font-bold capitalize">{name}</h1>
        <p className="text-brand-muted">Verified guitar tabs and chords.</p>
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
          />
        ))}
      </div>
    </div>
  );
}
