import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * GET  /api/stats  -> estatísticas da conta logada (XP, streak, contadores)
 * POST /api/stats  -> registra uma ação { action, xp }
 *
 * Antes o XP vivia em localStorage ("chordproof_player"), que é do NAVEGADOR:
 * duas contas no mesmo navegador viam os mesmos números. Agora é por conta.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ signedIn: false }, { status: 401 });

  const { data, error } = await supabase.rpc("get_stats", { p_email: email });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    signedIn: true,
    stats: typeof data === "string" ? JSON.parse(data) : data,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ signedIn: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const action = body?.action;
  const xp = Number(body?.xp) || 0;
  const allowed = ["OPEN_TAB", "COMPLETE_TAB", "TRANSPOSE", "SAVE_TAB"];
  if (!action || !allowed.includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("record_stat", {
    p_email: email,
    p_action: action,
    p_xp: Math.min(Math.max(xp, 0), 100),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    stats: typeof data === "string" ? JSON.parse(data) : data,
  });
}
