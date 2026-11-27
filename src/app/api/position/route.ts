import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * GET  /api/position -> onde a conta parou (última cifra + posição no player)
 * POST /api/position -> grava o ponto de retorno
 *
 * "CONTINUAR DE ONDE PAREI": quem estuda uma música abre a mesma cifra várias
 * vezes por dia. Voltar sempre ao topo é atrito puro — e o usuário desiste
 * antes de chegar no refrão que queria.
 *
 * PRIVACIDADE: o e-mail vem SEMPRE da sessão, nunca do corpo do pedido. Essa
 * foi a falha corrigida em /api/setlists em 24/11 (aceitava ?email= e qualquer
 * um lia os dados alheios) — aqui já nasce certo.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ signedIn: false }, { status: 401 });

  const { data, error } = await supabase.rpc("get_position", { p_email: email });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pos = typeof data === "string" ? JSON.parse(data) : data;
  return NextResponse.json({ signedIn: true, position: pos?.none ? null : pos });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ signedIn: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slugArtist = String(body?.slugArtist || "").slice(0, 120);
  const slugSong = String(body?.slugSong || "").slice(0, 120);
  if (!slugArtist || !slugSong) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("save_position", {
    p_email: email,
    p_slug_artist: slugArtist,
    p_slug_song: slugSong,
    p_song_title: String(body?.songTitle || "").slice(0, 200),
    p_artist_name: String(body?.artistName || "").slice(0, 200),
    p_chord_index: Math.max(0, Math.min(2000, Number(body?.chordIndex) || 0)),
    p_scroll_pct: Math.max(0, Math.min(1, Number(body?.scrollPct) || 0)),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, position: typeof data === "string" ? JSON.parse(data) : data });
}
