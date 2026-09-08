import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  // Músicas que contêm o termo
  const { data: songs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song")
    .ilike("song", `%${q}%`)
    .order("views", { ascending: false })
    .limit(6);

  // Artistas que contêm o termo
  const { data: artists } = await supabase
    .from("tabs")
    .select("artist, slug_artist")
    .ilike("artist", `%${q}%`)
    .order("views", { ascending: false })
    .limit(4);

  // Remove artistas duplicados
  const seen = new Set<string>();
  const uniqueArtists = (artists || []).filter((a) => {
    if (seen.has(a.slug_artist)) return false;
    seen.add(a.slug_artist);
    return true;
  });

  const results = [
    ...uniqueArtists.map((a) => ({
      type: "artist",
      label: a.artist,
      href: `/artist/${a.slug_artist}`,
    })),
    ...(songs || []).map((s) => ({
      type: "song" as const,
      label: `${s.song} — ${s.artist}`,
      href: `/tab/${s.slug_artist}/${s.slug_song}`,
    })),
  ].slice(0, 8);

  return NextResponse.json({ results });
}
