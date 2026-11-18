import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * GET  /api/bookmarks?artist=&song=  -> estado da cifra + lista
 * POST /api/bookmarks                -> alterna (salva/remove)
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ signedIn: false, saved: false, bookmarks: [] });

  const { searchParams } = new URL(req.url);
  const artist = searchParams.get("artist");
  const song = searchParams.get("song");

  const { data, error } = await supabase.rpc("list_bookmarks", { p_email: email });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = typeof data === "string" ? JSON.parse(data) : (data ?? []);
  const saved = artist && song
    ? (list as any[]).some((b) => b.slug_artist === artist && b.slug_song === song)
    : false;

  return NextResponse.json({ signedIn: true, saved, bookmarks: list });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "Sign in to save this tab.", needsAuth: true },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const artist = body?.artist;
  const song = body?.song;
  if (!artist || !song) return NextResponse.json({ error: "missing artist/song" }, { status: 400 });

  const { data, error } = await supabase.rpc("toggle_bookmark", {
    p_email: email,
    p_artist: artist,
    p_song: song,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = typeof data === "string" ? JSON.parse(data) : data;
  if (result?.error) return NextResponse.json(result, { status: 404 });

  return NextResponse.json({ ok: true, saved: !!result?.saved });
}
