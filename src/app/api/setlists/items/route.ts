import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPlusStatus } from "@/lib/plusAccess";

export const dynamic = "force-dynamic";

/**
 * Itens de setlist — recurso ChordProof+. Exige sessão, confere o acesso Plus
 * e confere que a setlist é do usuário: saber o id não dá acesso a ela.
 */

/** Resposta padrão de acesso negado: 401 sem sessão, 403 sem Plus. */
async function gate() {
  const plus = await getPlusStatus();
  if (!plus.signedIn) return { error: NextResponse.json({ error: "signin_required" }, { status: 401 }) };
  if (!plus.hasAccess) return { error: NextResponse.json({ error: "plus_required" }, { status: 403 }) };
  return { email: plus.email! };
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
  const g = await gate();
  if ("error" in g) return g.error;
  const email = g.email;

  const { setlistId, tabId } = await req.json();
  if (!setlistId || !tabId) {
    return NextResponse.json({ error: "setlistId and tabId required" }, { status: 400 });
  }

  if (!(await ownsSetlist(setlistId, email))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

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

  await supabase
    .from("setlists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", setlistId);

  return NextResponse.json({ ok: true });
}

// DELETE /api/setlists/items?itemId=... — remove uma cifra da setlist pelo id DO ITEM
export async function DELETE(req: NextRequest) {
  const g = await gate();
  if ("error" in g) return g.error;
  const email = g.email;

  const itemId = req.nextUrl.searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  // Descobre a setlist do item para conferir o dono antes de apagar.
  const { data: item } = await supabase
    .from("setlist_items")
    .select("id, setlist_id")
    .eq("id", itemId)
    .maybeSingle();

  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!(await ownsSetlist(item.setlist_id, email))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { error } = await supabase.from("setlist_items").delete().eq("id", itemId);
  if (error) {
    console.error("setlist item delete failed", error.message);
    return NextResponse.json({ error: "could not remove" }, { status: 500 });
  }

  await supabase
    .from("setlists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", item.setlist_id);

  return NextResponse.json({ ok: true });
}

// PUT /api/setlists/items — reordena: body { setlistId, order: [tabId, tabId, ...] }
export async function PUT(req: NextRequest) {
  const g = await gate();
  if ("error" in g) return g.error;
  const email = g.email;

  const { setlistId, order } = await req.json();
  if (!setlistId || !Array.isArray(order)) {
    return NextResponse.json({ error: "setlistId and order required" }, { status: 400 });
  }

  if (!(await ownsSetlist(setlistId, email))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Um update por cifra; setlists são curtas (dezenas de itens), custo irrelevante.
  let i = 0;
  for (const tabId of order) {
    await supabase
      .from("setlist_items")
      .update({ position: i })
      .eq("setlist_id", setlistId)
      .eq("tab_id", tabId);
    i += 1;
  }

  await supabase
    .from("setlists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", setlistId);

  return NextResponse.json({ ok: true });
}
