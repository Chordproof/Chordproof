import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Registra a assinatura na tabela `subscriptions` via RPC SECURITY DEFINER
// (upsert_subscription_by_email): users/subscriptions têm RLS sem políticas e a
// anon key não passa — a função resolve email → user_id internamente com privilégio do dono.
async function upsertSubscription(
  email: string | null | undefined,
  customerId: string | null | undefined,
  subscriptionId: string | null | undefined,
  plan: string,
  status: string,
  periodEnd: number | null
) {
  if (!email) return;
  const { error } = await supabase.rpc("upsert_subscription_by_email", {
    p_email: email,
    p_customer_id: customerId ?? null,
    p_subscription_id: subscriptionId ?? null,
    p_plan: plan,
    p_status: status,
    p_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  });
  if (error) {
    console.error("webhook: upsert_subscription_by_email error:", error.message);
  }
}

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
      event = JSON.parse(body) as Stripe.Event; // setup inicial sem verificação
    }
  } catch (err: any) {
    console.error("webhook signature error:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;
    const email = cs.customer_email || cs.metadata?.user_email;
    const subId = typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id ?? null;
    await upsertSubscription(
      email,
      typeof cs.customer === "string" ? cs.customer : cs.customer?.id ?? null,
      subId,
      "plus",
      "active",
      null
    );
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const active = sub.status === "active" || sub.status === "trialing";
    const email = sub.metadata?.user_email;
    if (email) {
      await upsertSubscription(
        email,
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        sub.id,
        active ? "plus" : "free",
        sub.status,
        sub.current_period_end ?? null
      );
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const email = sub.metadata?.user_email;
    if (email) {
      await upsertSubscription(
        email,
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        sub.id,
        "free",
        "canceled",
        null
      );
    }
  }

  return NextResponse.json({ received: true });
}
