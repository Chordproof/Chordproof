import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Itens de setlist — recurso gratuito por enquanto (o gate Plus entra quando
 * a página /setlists existir). Ainda assim exige sessão e checa que a setlist
 * pertence a quem está pedindo: antes qualquer um inseria ou removia cifra
 * na setlist de outra pessoa sabendo o id.
 */

async function sessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

/** Confirma que a setlist existe e é do usuário da sessão. */
async function ownsSetlist(setlistId: string, email: string | null) {
  if (!email) return false;
  const { data } = await supabase
    .from("setlists")
    .select("id, owner_email")
    .eq("id", setlistId)
    .maybeSingle();
  return !!data && data.owner_email === email;
}

// POST /api/setlists/items — adiciona uma cifra a uma setlist (na última posição)
export async function POST(req: NextRequest) {
  const email = await sessionEmail();
  if (!email) {
    return NextResponse.json({ error: "signin_required" }, { status: 401 });
  }

  const { setlistId, tabId } = await req.json();
  if (!setlistId || !tabId) {
    return NextResponse.json({ error: "setlistId and tabId required" }, { status: 400 });
  }

  if (!(await ownsSetlist(setlistId, email))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Próxima posição
  const { data: last } = await supabase
    .from("setlist_items")
    .select("position")
    .eq("setlist_id", setlistId)
    .order("position", { ascending: false })
    .limit(1);

  const position = (last?.[0]?.position ?? -1) + 1;

  const { error } = await supabase
    .from("setlist_items")
    .upsert({ setlist_id: setlistId, tab_id: tabId, position }, { onConflict: "setlist_id,tab_id" });

  if (error) {
    console.error("setlist item failed", error.message);
    return NextResponse.json({ error: "could not add" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/setlists/items?setlistId=...&tabId=... — remove cifra da setlist
export async function DELETE(req: NextRequest) {
  const email = await sessionEmail();
  if (!email) {
    return NextResponse.json({ error: "signin_required" }, { status: 401 });
  }

  const setlistId = req.nextUrl.searchParams.get("setlistId");
  const tabId = req.nextUrl.searchParams.get("tabId");
  if (!setlistId || !tabId) {
    return NextResponse.json({ error: "params required" }, { status: 400 });
  }

  if (!(await ownsSetlist(setlistId, email))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("setlist_items")
    .delete()
    .eq("setlist_id", setlistId)
    .eq("tab_id", tabId);
  if (error) return NextResponse.json({ error: "could not remove" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
