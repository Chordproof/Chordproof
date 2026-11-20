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

/**
 * Data do fim do período pago.
 *
 * Na API nova do Stripe esse campo saiu do topo da Subscription e passou a viver
 * em cada item (subscription.items.data[].current_period_end). Ler só
 * `sub.current_period_end` devolvia undefined e a coluna ficava nula — foi por
 * isso que as assinaturas do banco estavam sem data de renovação.
 */
function periodEndOf(sub: Stripe.Subscription): number | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof top === "number" && top > 0) return top;

  const itemEnds = (sub.items?.data ?? [])
    .map((i) => (i as unknown as { current_period_end?: number }).current_period_end)
    .filter((n): n is number => typeof n === "number" && n > 0);

  if (itemEnds.length === 0) return null;
  // O período da assinatura termina no maior fim de período entre os itens.
  return Math.max(...itemEnds);
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  // SEGURANÇA: sem o segredo configurado o endpoint NÃO pode aceitar eventos —
  // antes ele caía num JSON.parse sem verificação e qualquer um podia forjar um
  // "checkout.session.completed" e ganhar assinatura. Melhor recusar tudo (500)
  // e deixar o erro visível do que abrir a porta.
  if (!secret) {
    console.error("webhook: STRIPE_WEBHOOK_SECRET ausente — eventos recusados");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error("webhook signature error:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;
    const email = cs.customer_email || cs.metadata?.user_email;
    const customerId = typeof cs.customer === "string" ? cs.customer : cs.customer?.id ?? null;
    const subId = typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id ?? null;

    // Busca a assinatura para gravar a data de renovação já na primeira cobrança
    // (antes gravava null e a data só aparecia num "updated" posterior).
    let periodEnd: number | null = null;
    let status = "active";
    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        periodEnd = periodEndOf(sub);
        status = sub.status || "active";
      } catch (e: any) {
        console.error("webhook: retrieve subscription error:", e?.message);
      }
    }

    await upsertSubscription(email, customerId, subId, "plus", status, periodEnd);
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
        periodEndOf(sub)
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
