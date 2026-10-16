"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sparkles, Check, Clock } from "lucide-react";

/**
 * usePlusAccess — hook que decide se o usuário tem acesso às features Plus.
 * Regras:
 *  - Sem login → sem acesso (o clique oferece cadastro)
 *  - Com login + trial ativo (is_trial=true, trial_end > now) → acesso
 *  - Com login + assinatura ativa (status active/trialing) → acesso
 *  - Caso contrário → sem acesso (oferece trial/assinatura)
 */

export type PlusAccess = {
  hasAccess: boolean;
  loading: boolean;
  inTrial: boolean;
  trialEnd: string | null;
  daysLeft: number | null;
  signedIn: boolean;
};

const CACHE_KEY = "chordproof-plus-access";
const CACHE_TTL = 10 * 60 * 1000; // 10 min

export function usePlusAccess(): PlusAccess {
  const { data: session, status } = useSession();
  const [state, setState] = useState<PlusAccess>({
    hasAccess: false,
    loading: true,
    inTrial: false,
    trialEnd: null,
    daysLeft: null,
    signedIn: false,
  });

  useEffect(() => {
    let alive = true;

    // 1. Cache local (evita request a cada render)
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && cached.expires > Date.now()) {
        setState({ ...cached.data, loading: false });
        if (cached.data.hasAccess) return;
      }
    } catch {}

    if (status === "loading") return;
    if (!session?.user?.email) {
      const next: PlusAccess = { hasAccess: false, loading: false, inTrial: false, trialEnd: null, daysLeft: null, signedIn: false };
      setState(next);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, expires: Date.now() + CACHE_TTL })); } catch {}
      return;
    }

    // 2. Consulta o estado Plus do usuário
    fetch("/api/plus-status")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { hasAccess: boolean; inTrial: boolean; trialEnd: string | null }) => {
        if (!alive) return;
        const daysLeft = d.trialEnd
          ? Math.max(0, Math.ceil((new Date(d.trialEnd).getTime() - Date.now()) / 86400000))
          : null;
        const next: PlusAccess = {
          hasAccess: !!d.hasAccess,
          loading: false,
          inTrial: !!d.inTrial,
          trialEnd: d.trialEnd,
          daysLeft,
          signedIn: true,
        };
        setState(next);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, expires: Date.now() + CACHE_TTL })); } catch {}
      })
      .catch(() => {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false, signedIn: true }));
      });

    return () => { alive = false; };
  }, [session?.user?.email, status]);

  return state;
}

/**
 * PlusGate — wrapper de feature Plus.
 * Se tem acesso → renderiza children.
 * Se não tem → renderiza o CTA do trial (15 dias grátis mediante cadastro).
 */
export function PlusGate({
  children,
  feature,
  compact = false,
}: {
  children: React.ReactNode;
  feature: string;
  compact?: boolean;
}) {
  const access = usePlusAccess();

  if (access.loading) return null;
  if (access.hasAccess) return <>{children}</>;

  if (compact) {
    return (
      <Link
        href="/pricing"
        title={`${feature} — ChordProof+`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-gold-soft)] text-[var(--c-gold)] text-xs font-bold hover:brightness-110 transition"
      >
        <Sparkles size={13} /> Plus
      </Link>
    );
  }

  return (
    <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-hairline)] p-5 space-y-3 text-center">
      <div className="flex items-center justify-center gap-2 text-[var(--c-gold)] font-bold">
        <Sparkles size={16} /> {feature} — ChordProof+
      </div>
      {access.signedIn ? (
        <>
          <p className="text-sm text-[var(--c-text-secondary)]">
            Try <strong>15 days free</strong> — no card required.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition"
          >
            <Clock size={15} /> Start free trial
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--c-text-secondary)]">
            Create a free account and get <strong>15 days of ChordProof+ free</strong> — no card required.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition"
          >
            <Check size={15} /> Sign up &amp; start trial
          </Link>
        </>
      )}
    </div>
  );
}
