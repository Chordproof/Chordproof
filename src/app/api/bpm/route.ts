import { NextResponse } from "next/server";

/**
 * GET /api/bpm?artist=...&song=...
 * Busca o BPM da música na API pública do Deezer (gratuita, sem key).
 * Retorna { bpm: number | null } — null quando não encontrado (o cliente usa fallback).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = (searchParams.get("artist") || "").trim();
  const song = (searchParams.get("song") || "").trim();
  if (!artist || !song) return NextResponse.json({ bpm: null });

  try {
    const q = encodeURIComponent(`${artist} ${song}`);
    const searchRes = await fetch(`https://api.deezer.com/search/track?q=${q}&limit=5`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!searchRes.ok) return NextResponse.json({ bpm: null });
    const searchData = await searchRes.json();
    const tracks: any[] = searchData?.data || [];
    if (!tracks.length) return NextResponse.json({ bpm: null });

    // Ordena por relevância do Deezer (já vem ordenado) e procura o primeiro com BPM > 0
    for (const t of tracks.slice(0, 5)) {
      try {
        const trackRes = await fetch(`https://api.deezer.com/track/${t.id}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!trackRes.ok) continue;
        const track = await trackRes.json();
        const bpm = Number(track?.bpm);
        if (bpm > 40 && bpm < 220) {
          return NextResponse.json({ bpm: Math.round(bpm), source: "deezer" });
        }
      } catch {
        // próximo candidato
      }
    }
    return NextResponse.json({ bpm: null });
  } catch {
    return NextResponse.json({ bpm: null });
  }
}
