import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/profile — dados reais do usuário logado.
 * Cria/atualiza o registro em public.users (o NextAuth não tem adapter) e
 * devolve perfil + cifras salvas + atividade recente.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { data: perfil, error: e1 } = await supabase.rpc("upsert_profile", {
    p_email: email,
    p_name: session.user?.name ?? null,
    p_image: session.user?.image ?? null,
  });
  if (e1) {
    console.error("profile upsert error:", e1.message);
    return NextResponse.json({ error: e1.message }, { status: 500 });
  }

  const [bookmarks, activity, plus] = await Promise.all([
    supabase.rpc("list_bookmarks", { p_email: email }),
    supabase.rpc("list_activity", { p_email: email, p_limit: 12 }),
    supabase.rpc("get_plus_status", { p_email: email }),
  ]);

  const p = typeof perfil === "string" ? JSON.parse(perfil) : perfil;
  const plusStatus = typeof plus.data === "string" ? JSON.parse(plus.data) : plus.data;

  return NextResponse.json({
    profile: {
      email: p?.email ?? email,
      name: p?.name ?? session.user?.name ?? null,
      displayName: p?.display_name ?? null,
      bio: p?.bio ?? null,
      image: p?.image ?? session.user?.image ?? null,
      createdAt: p?.created_at ?? null,
    },
    bookmarks: typeof bookmarks.data === "string" ? JSON.parse(bookmarks.data) : (bookmarks.data ?? []),
    activity: typeof activity.data === "string" ? JSON.parse(activity.data) : (activity.data ?? []),
    plus: {
      hasAccess: !!plusStatus?.hasAccess,
      inTrial: !!plusStatus?.inTrial,
      trialEnd: plusStatus?.trialEnd ?? null,
    },
  });
}

/** PATCH /api/profile — atualiza nome de exibição e bio. */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const displayName = typeof body.displayName === "string" ? body.displayName.slice(0, 40) : null;
  const bio = typeof body.bio === "string" ? body.bio.slice(0, 200) : null;

  const { data, error } = await supabase.rpc("update_profile", {
    p_email: email,
    p_display_name: displayName,
    p_bio: bio,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, profile: data });
}
