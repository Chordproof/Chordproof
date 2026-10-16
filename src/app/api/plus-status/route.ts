import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/plus-status
 * Estado Plus do usuário logado (assinatura ativa OU trial de 15 dias).
 * Usa RPC SECURITY DEFINER (get_plus_status) porque users/subscriptions têm RLS
 * sem políticas e a anon key não passa — a função valida internamente.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ hasAccess: false, inTrial: false, trialEnd: null }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("get_plus_status", {
    p_email: session.user.email,
  });

  if (error) {
    console.error("plus-status GET error:", error.message);
    return NextResponse.json({ hasAccess: false, inTrial: false, trialEnd: null }, { status: 500 });
  }

  // A RPC retorna json_build_object direto (não array)
  const status = typeof data === "string" ? JSON.parse(data) : data;
  return NextResponse.json({
    hasAccess: !!status?.hasAccess,
    inTrial: !!status?.inTrial,
    trialEnd: status?.trialEnd ?? null,
  });
}

/**
 * POST /api/plus-status
 * Ativa o trial de 15 dias para o usuário logado (1x por usuário, idempotente).
 * Sem cartão — só cadastro. Usa RPC start_plus_trial.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("start_plus_trial", {
    p_email: session.user.email,
  });

  if (error) {
    console.error("plus-status POST error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = typeof data === "string" ? JSON.parse(data) : data;
  if (!result?.ok) {
    return NextResponse.json({ error: result?.error || "trial_failed" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    already: !!result.already,
    hasAccess: !!result.hasAccess,
    inTrial: true,
    trialEnd: result.trialEnd ?? null,
  });
}
