// scripts/populate-artist-images.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Lê o .env.local automaticamente (funciona sem --env-file)
function loadEnv() {
  const out = { ...process.env };
  try {
    const content = readFileSync(".env.local", "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}

const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Busca todos os artistas distintos da tabela tabs
const { data: tabs, error } = await supabase
  .from("tabs")
  .select("artist, slug_artist");

if (error) {
  console.error("Erro ao buscar tabs:", error.message);
  process.exit(1);
}

const seen = new Map();
for (const t of tabs || []) {
  if (!seen.has(t.slug_artist)) seen.set(t.slug_artist, t.artist);
}

let ok = 0, fail = 0;
for (const [slug, name] of seen) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=1`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const img = json.results?.[0]?.artworkUrl100;
    if (img) {
      const big = img.replace("100x100bb", "300x300bb");
      const { error: upErr } = await supabase
        .from("tabs")
        .update({ artist_image_url: big })
        .eq("slug_artist", slug);
      if (upErr) throw upErr;
      console.log(`OK  ${name} -> ${big}`);
      ok++;
    } else {
      console.log(`FALHOU  ${name} (sem resultado no iTunes)`);
      fail++;
    }
  } catch (e) {
    console.log(`FALHOU  ${name} (erro: ${e.message})`);
    fail++;
  }
  await new Promise((r) => setTimeout(r, 300)); // pausa para não sobrecarregar a API
}
console.log(`\nConcluído: ${ok} imagens aplicadas, ${fail} sem imagem.`);
