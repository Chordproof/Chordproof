"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

/**
 * Botão que abre o portal de cobrança do Stripe (cancelar, trocar cartão,
 * faturas). Sem assinatura, o servidor responde 404 e mandamos para /pricing.
 */
export default function ManageBillingButton({
  className,
  label = "Manage billing",
}: {
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/stripe/portal", { method: "POST" });
      const d = await r.json();

      if (d?.url) {
        window.location.href = d.url;
        return;
      }
      if (r.status === 404 && d?.noSubscription) {
        window.location.href = "/pricing";
        return;
      }
      setMsg(d?.error || "Could not open billing.");
    } catch {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={open}
        disabled={loading}
        className={
          className ??
          "flex items-center gap-2 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-5 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition disabled:opacity-60"
        }
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
        {loading ? "Opening..." : label}
      </button>
      {msg && <p className="text-red-400 text-xs">{msg}</p>}
    </div>
  );
}
