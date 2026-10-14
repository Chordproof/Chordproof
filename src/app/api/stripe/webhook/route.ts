import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Marca o usuário como Plus no Supabase quando o pagamento é confirmado.
// Requer STRIPE_WEBHOOK_SECRET (configurado após criar o webhook no dashboard).
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (secret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } else {
      event = JSON.parse(body) as Stripe.Event; // modo sem verificação (setup inicial)
    }
  } catch (err: any) {
    console.error("webhook signature error:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;
    const email = cs.customer_email || cs.metadata?.user_email;
    if (email) {
      await supabase
        .from("profiles")
        .update({ plan: "plus" })
        .eq("email", email);
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.paused"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const email = sub.metadata?.user_email;
    if (email) {
      await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("email", email);
    }
  }

  return NextResponse.json({ received: true });
}
