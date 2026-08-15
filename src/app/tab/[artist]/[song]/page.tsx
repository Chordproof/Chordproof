import { supabase } from "@/lib/supabase";
import { buildTabMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import TabView from "./TabView";

export async function generateMetadata({ params }: { params: { artist: string; song: string } }) {
  try {
    const { data } = await supabase
      .from("tabs")
      .select("song, artist, key_sig, difficulty")
      .eq("slug_artist", params.artist)
      .eq("slug_song", params.song)
      .maybeSingle();
    if (data) {
      return buildTabMetadata({
        song: data.song,
        artist: data.artist,
        keySig: data.key_sig,
        difficulty: data.difficulty,
      });
    }
  } catch {}
  return buildTabMetadata({ song: params.song, artist: params.artist });
}

export default function Page({ params }: { params: { artist: string; song: string } }) {
  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          name: params.song.replace(/-/g, " "),
          byArtist: { "@type": "MusicGroup", name: params.artist.replace(/-/g, " ") },
          inLanguage: "en",
          url: `${SITE_URL}/tab/${params.artist}/${params.song}`,
        }}
      />
      <TabView params={params} />
    </div>
  );
}
