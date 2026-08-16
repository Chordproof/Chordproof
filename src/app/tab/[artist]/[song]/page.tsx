import { supabase } from "@/lib/supabase";
import { buildTabMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import TabDetail from "./TabDetail";

export async function generateMetadata({ params }: { params: { artist: string; song: string } }) {
  const { data } = await supabase
    .from("tabs")
    .select("song, artist, key_sig, difficulty")
    .eq("slug_artist", params.artist)
    .eq("slug_song", params.song)
    .single();

  return buildTabMetadata({
    song: data?.song || params.song,
    artist: data?.artist || params.artist,
    keySig: data?.key_sig,
    difficulty: data?.difficulty,
  });
}

export default function Page({ params }: { params: { artist: string; song: string } }) {
  return (
    
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
      <TabDetail params={params} />
    


  );
}
