import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/setlists/items — adiciona uma cifra a uma setlist (na última posição)
export async function POST(req: NextRequest) {
  const { setlistId, tabId } = await req.json();
  if (!setlistId || !tabId) {
    return NextResponse.json({ error: "setlistId and tabId required" }, { status: 400 });
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

  return NextResponse.json({ ok: true });
}

// DELETE /api/setlists/items?setlistId=...&tabId=... — remove cifra da setlist
export async function DELETE(req: NextRequest) {
  const setlistId = req.nextUrl.searchParams.get("setlistId");
  const tabId = req.nextUrl.searchParams.get("tabId");
  if (!setlistId || !tabId) {
    return NextResponse.json({ error: "params required" }, { status: 400 });
  }
  const { error } = await supabase
    .from("setlist_items")
    .delete()
    .eq("setlist_id", setlistId)
    .eq("tab_id", tabId);
  if (error) return NextResponse.json({ error: "could not remove" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
