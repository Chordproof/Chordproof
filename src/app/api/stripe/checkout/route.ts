import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // authOptions era omitido aqui (única rota do projeto sem ele), então a
    // sessão nunca era lida e o checkout devolvia 401 para usuário logado.
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Sign in first to subscribe to ChordProof+." },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("stripe checkout: STRIPE_SECRET_KEY ausente");
      return NextResponse.json({ error: "Billing not configured." }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const plan = body?.plan;
    const priceId =
      plan === "annual"
        ? process.env.STRIPE_PRICE_ANNUAL
        : plan === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : null;

    if (!priceId) {
      return NextResponse.json(
        { error: "Billing plan not configured yet." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "https://chordproof.com";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: session.user.email,
      success_url: `${origin}/profile?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_email: session.user.email },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    // Loga o tipo do erro do Stripe para diagnóstico (sem expor a chave).
    console.error("stripe checkout error:", err?.type, err?.code, err?.message);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
