import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/setlists?email=... — lista as setlists do usuário (com contagem de itens)
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ setlists: [] });

  const { data, error } = await supabase
    .from("setlists")
    .select("id, title, description, share_slug, created_at, setlist_items(count)")
    .eq("owner_email", email)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ setlists: [] }, { status: 500 });

  const setlists = (data ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    share_slug: s.share_slug,
    created_at: s.created_at,
    item_count: s.setlist_items?.[0]?.count ?? 0,
  }));
  return NextResponse.json({ setlists });
}

// POST /api/setlists — cria setlist e, se tabId vier, já adiciona a cifra
export async function POST(req: NextRequest) {
  const { title, email, tabId } = await req.json();
  if (!title || !email) {
    return NextResponse.json({ error: "title and email required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("setlists")
    .insert({ title, owner_email: email })
    .select("id, share_slug")
    .single();

  if (error || !data) {
    console.error("setlist create failed", error?.message);
    return NextResponse.json({ error: "could not create" }, { status: 500 });
  }

  if (tabId) {
    await supabase.from("setlist_items").insert({ setlist_id: data.id, tab_id: tabId, position: 0 });
  }

  return NextResponse.json({ id: data.id, share_slug: data.share_slug });
}
