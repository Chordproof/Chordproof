import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPlusStatus } from "@/lib/plusAccess";

export const dynamic = "force-dynamic";

/**
 * /api/setlists/[id] — uma setlist do usuário logado, com as cifras na ordem.
 *
 * GET     lê a setlist (só o dono)
 * PATCH   renomeia / muda a descrição (só o dono)
 * DELETE  apaga a setlist e seus itens (só o dono)
 *
 * O dono vem SEMPRE da sessão. O id chega na URL, mas é checado contra o
 * owner_email antes de qualquer coisa — saber o id não dá acesso.
 */

/** Resposta padrão de acesso negado: 401 sem sessão, 403 sem Plus. */
async function gate() {
  const plus = await getPlusStatus();
  if (!plus.signedIn) return { error: NextResponse.json({ error: "signin_required" }, { status: 401 }) };
  if (!plus.hasAccess) return { error: NextResponse.json({ error: "plus_required" }, { status: 403 }) };
  return { email: plus.email! };
}

/** Carrega a setlist só se ela for do usuário. Devolve null em qualquer outro caso. */
async function ownedSetlist(id: string, email: string | null) {
  if (!email) return null;
  const { data } = await supabase
    .from("setlists")
    .select("id, title, description, share_slug, created_at, updated_at, owner_email")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.owner_email !== email) return null;
  return data;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const g = await gate();
  if ("error" in g) return g.error;
  const email = g.email;

  const setlist = await ownedSetlist(params.id, email);
  if (!setlist) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: items, error } = await supabase
    .from("setlist_items")
    .select("id, position, tabs(id, song, artist, slug_artist, slug_song, key_sig, capo, difficulty)")
    .eq("setlist_id", setlist.id)
    .order("position", { ascending: true });

  if (error) {
    console.error("setlist detail failed", error.message);
    return NextResponse.json({ error: "could not load" }, { status: 500 });
  }

  return NextResponse.json({
    setlist: {
      id: setlist.id,
      title: setlist.title,
      description: setlist.description,
      share_slug: setlist.share_slug,
      created_at: setlist.created_at,
    },
    songs: (items ?? []).map((it: any) => ({ item_id: it.id, position: it.position, ...it.tabs })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await gate();
  if ("error" in g) return g.error;
  const email = g.email;

  const setlist = await ownedSetlist(params.id, email);
  if (!setlist) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
    patch.title = title.slice(0, 120);
  }
  if (typeof body.description === "string") {
    patch.description = body.description.trim().slice(0, 500) || null;
  }

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("setlists")
    .update(patch)
    .eq("id", setlist.id)
    .select("id, title, description, share_slug")
    .single();

  if (error || !data) {
    console.error("setlist update failed", error?.message);
    return NextResponse.json({ error: "could not update" }, { status: 500 });
  }

  return NextResponse.json({ setlist: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const g = await gate();
  if ("error" in g) return g.error;
  const email = g.email;

  const setlist = await ownedSetlist(params.id, email);
  if (!setlist) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Itens primeiro: se a FK não tiver cascade, a setlist ficaria órfã com filhos.
  await supabase.from("setlist_items").delete().eq("setlist_id", setlist.id);
  const { error } = await supabase.from("setlists").delete().eq("id", setlist.id);

  if (error) {
    console.error("setlist delete failed", error.message);
    return NextResponse.json({ error: "could not delete" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
