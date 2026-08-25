// scripts/populate-artist-images.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Busca artistas distintos da tabela tabs
const { data: tabs } = await supabase.from("tabs").select("artist, slug_artist");
const seen = new Map();
for (const t of tabs || []) {
  if (!seen.has(t.slug_artist)) seen.set(t.slug_artist, t.artist);
}

for (const [slug, name] of seen) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=1`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const img = json.results?.[0]?.artworkUrl100;
    if (img) {
      const big = img.replace("100x100bb", "200x200bb");
      await supabase.from("tabs").update({ artist_image_url: big }).eq("slug_artist", slug);
      console.log(`✓ ${name}`);
    } else {
      console.log(`✗ ${name} (sem imagem)`);
    }
  } catch (e) {
    console.log(`✗ ${name} (erro)`);
  }
}
