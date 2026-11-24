import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Setlists — recurso GRATUITO por enquanto.
 * O gate Plus entra quando a página /setlists existir: hoje o usuário não tem
 * onde ver a setlist que criou, então cobrar por ela venderia algo inacessível.
 *
 * SEGURANÇA: o email NUNCA vem do cliente. Antes o GET aceitava ?email=, então
 * qualquer pessoa lia as setlists de outra pessoa. Agora usa sempre a sessão.
 */

async function sessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

// GET /api/setlists — lista as setlists do usuário logado (com contagem de itens)
export async function GET() {
  const email = await sessionEmail();
  if (!email) {
    return NextResponse.json({ error: "signin_required", setlists: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("setlists")
    .select("id, title, description, share_slug, created_at, setlist_items(count)")
    .eq("owner_email", email)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("setlist list failed", error.message);
    return NextResponse.json({ setlists: [] }, { status: 500 });
  }

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
  const email = await sessionEmail();
  if (!email) {
    return NextResponse.json({ error: "signin_required" }, { status: 401 });
  }

  const { title, tabId } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
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
