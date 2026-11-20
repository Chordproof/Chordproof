import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/portal
 * Abre o portal de cobrança do Stripe para o usuário logado:
 * cancelar/reativar assinatura, atualizar cartão, ver faturas.
 *
 * O customer_id vem de subscriptions (via RPC SECURITY DEFINER, porque a tabela
 * tem RLS sem políticas). Se o usuário nunca assinou, devolve 404 para a UI
 * mandar para /pricing em vez de abrir um portal vazio.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("get_subscription", { p_email: email });
  if (error) {
    console.error("portal: get_subscription error:", error.message);
    return NextResponse.json({ error: "Could not read subscription." }, { status: 500 });
  }

  const sub = typeof data === "string" ? JSON.parse(data) : data;
  const customerId: string | null = sub?.customer_id ?? null;

  if (!customerId) {
    return NextResponse.json(
      { error: "No subscription found.", noSubscription: true },
      { status: 404 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin =
    req.headers.get("origin") || process.env.NEXTAUTH_URL || "https://chordproof.com";

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile?tab=settings`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    // O portal exige ativação no Dashboard (Settings > Billing > Customer portal).
    console.error("portal error:", err?.type, err?.code, err?.message);
    const needsSetup = err?.code === "portal_configuration_missing" ||
      /configuration/i.test(err?.message ?? "");
    return NextResponse.json(
      {
        error: needsSetup
          ? "Billing portal not activated yet."
          : "Could not open the billing portal.",
        code: err?.code ?? null,
      },
      { status: 500 }
    );
  }
}
