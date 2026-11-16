// src/lib/seo.ts
// Domínio canônico: variável de ambiente com fallback para o domínio de produção.
// Usar env evita ter de mexer no código quando o domínio mudar (preview/deploy branch).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://chordproof.com";
export const SITE_NAME = "ChordProof";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface TabMetadataArgs {
  song: string;
  artist: string;
  keySig?: string | null;
  difficulty?: string | null;
}

export function buildTabMetadata({ song, artist, keySig, difficulty }: TabMetadataArgs) {
  const title = `${song} - ${artist} | Guitar Tab | ChordProof`;
  const description = `Verified guitar tab for ${song} by ${artist}. Key: ${keySig}, Difficulty: ${difficulty}. Accurate chords and tablature, no paywalls.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "music.song",
      siteName: SITE_NAME,
    },
    alternates: { canonical: `/tab/${slugify(artist)}/${slugify(song)}` },
  };
}
