import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/setlists/share?slug=... — dados públicos de uma setlist compartilhada (sem auth)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { data: setlist, error } = await supabase
    .from("setlists")
    .select("id, title, description, owner_email, created_at")
    .eq("share_slug", slug)
    .single();

  if (error || !setlist) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("setlist_items")
    .select("position, tabs(id, song, artist, slug_artist, slug_song, key_sig, capo, difficulty)")
    .eq("setlist_id", setlist.id)
    .order("position", { ascending: true });

  return NextResponse.json({
    title: setlist.title,
    description: setlist.description,
    created_at: setlist.created_at,
    songs: (items ?? []).map((it: any) => it.tabs),
  });
}
