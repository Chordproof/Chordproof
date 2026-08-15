// src/lib/seo.ts
export const SITE_URL = "https://chordproof.vercel.app"; // troque pelo domínio final
export const SITE_NAME = "ChordProof";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildTabMetadata({ song, artist, keySig, difficulty }) {
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
