import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/stripe/diagnose — diagnóstico SOMENTE para o dono.
 *
 * Lê da conta Stripe o que decide se um cartão consegue pagar: país, moeda de
 * liquidação, se cobranças estão liberadas e a moeda de cada preço. Também abre
 * uma sessão de checkout real para informar em que MOEDA ela seria cobrada, e a
 * expira em seguida.
 *
 * Autorização: sessão do dono OU ?email= (validado contra o allowlist), porque
 * a sessão pode estar ausente numa aba sem login. A saída não contém chaves nem
 * dados de clientes.
 */
const OWNER_EMAILS = [
  "direitohenrique@hotmail.com",
  "hcbarroba1985@gmail.com",
  "contact@chordproof.com",
];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null;

  const qEmail = (new URL(req.url).searchParams.get("email") || "").toLowerCase() || null;
  const email = sessionEmail || qEmail;

  if (!email || !OWNER_EMAILS.includes(email)) {
    return NextResponse.json(
      { error: "not allowed", signedInAs: sessionEmail, tried: qEmail },
      { status: 403 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY ausente" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const out: Record<string, unknown> = {
    signedInAs: email,
    key_mode: process.env.STRIPE_SECRET_KEY.startsWith("sk_live") ? "LIVE" : "TEST",
  };

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

  // ?product=prod_xxx -> lista os preços desse produto (para achar os IDs em BRL)
  const prod = new URL(req.url).searchParams.get("product");
  if (prod && prod.startsWith("prod_")) {
    try {
      const list = await stripe.prices.list({ product: prod, limit: 20 });
      out.product_prices = list.data.map((p) => ({
        id: p.id,
        currency: p.currency,
        unit_amount: p.unit_amount,
        recurring: p.recurring ? `${p.recurring.interval}` : null,
        active: p.active,
        livemode: p.livemode,
      }));
    } catch (e: any) {
      out.product_prices = { error: e?.message };
    }
  }

  return NextResponse.json(out);
}
