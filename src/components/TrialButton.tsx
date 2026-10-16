"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * TrialButton — ativa o trial de 15 dias (sem cartão, só cadastro).
 * Sem login → manda para /auth/signin.
 * Com login → POST /api/plus-status (RPC start_plus_trial, idempotente).
 */
export default function TrialButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const res = await fetch("/api/plus-status", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }
      const d = await res.json();
      if (d.ok && d.hasAccess) {
        window.location.href = "/?trial=started";
      } else {
        window.location.href = "/pricing";
      }
    } catch {
      window.location.href = "/auth/signin";
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={start}
      disabled={busy}
      className={
        "w-full py-4 rounded-xl bg-[var(--c-gold-soft)] text-[var(--c-gold)] border border-[var(--c-gold)]/30 font-bold hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-60 " +
        className
      }
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
      Start 15-day free trial
    </button>
  );
}
