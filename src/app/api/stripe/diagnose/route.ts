import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/diagnose — diagnóstico SOMENTE para o dono.
 *
 * Além dos dados da conta e dos preços, ABRE uma sessão de checkout real e
 * informa em que MOEDA ela foi criada — é isso que decide se um cartão
 * brasileiro consegue pagar. A sessão é expirada em seguida.
 */
const OWNER_EMAILS = ["direitohenrique@hotmail.com"];

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !OWNER_EMAILS.includes(email)) {
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY ausente" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const out: Record<string, unknown> = {};

  try {
    const acct = await stripe.accounts.retrieve();
    out.account = {
      id: acct.id,
      country: acct.country,
      default_currency: acct.default_currency,
      business_type: acct.business_type,
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      public_business_name: (acct.settings as any)?.dashboard?.display_name ?? null,
      currently_due: acct.requirements?.currently_due ?? [],
      disabled_reason: acct.requirements?.disabled_reason ?? null,
    };
  } catch (e: any) {
    out.account = { error: e?.message };
  }

  try {
    const bal = await stripe.balance.retrieve();
    out.balance_currencies = [
      ...bal.available.map((b) => b.currency),
      ...bal.pending.map((b) => b.currency),
    ].filter((v, i, a) => a.indexOf(v) === i);
  } catch (e: any) {
    out.balance_currencies = { error: e?.message };
  }

  const prices: Record<string, unknown> = {};
  for (const [name, id] of [
    ["monthly", process.env.STRIPE_PRICE_MONTHLY],
    ["annual", process.env.STRIPE_PRICE_ANNUAL],
  ] as const) {
    if (!id) {
      prices[name] = { error: "env ausente" };
      continue;
    }
    try {
      const p = await stripe.prices.retrieve(id);
      prices[name] = {
        id: p.id,
        currency: p.currency,
        unit_amount: p.unit_amount,
        active: p.active,
        type: p.type,
        livemode: p.livemode,
      };
    } catch (e: any) {
      prices[name] = { error: e?.message, code: e?.code };
    }
  }
  out.prices = prices;

  // Sessão de teste: em que moeda a Stripe REALMENTE cobraria?
  try {
    const priceId = process.env.STRIPE_PRICE_MONTHLY!;
    const s = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://chordproof.com/profile?checkout=success",
      cancel_url: "https://chordproof.com/pricing?checkout=cancelled",
      ...({ adaptive_pricing: { enabled: true } } as any),
    });
    out.test_session = {
      currency: s.currency,
      amount: s.amount_total,
      adaptive_applied: s.currency !== "usd",
      url: s.url,
    };
    try {
      await stripe.checkout.sessions.expire(s.id);
      (out.test_session as any).expired = true;
    } catch {
      (out.test_session as any).expired = false;
    }
  } catch (e: any) {
    out.test_session = { error: e?.message, code: e?.code, type: e?.type };
  }

  out.key_mode = process.env.STRIPE_SECRET_KEY.startsWith("sk_live") ? "LIVE" : "TEST";

  return NextResponse.json(out);
}
