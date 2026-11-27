"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { X, Check } from "lucide-react";

/**
 * SaveProgressPrompt — o convite que aparece DEPOIS que a pessoa tocou.
 *
 * POR QUE AQUI E NÃO NO TOPO
 * O botão "Sign In" da barra está lá desde o começo e ninguém clica: no momento
 * em que a pessoa abre uma cifra, criar conta é um obstáculo entre ela e a
 * música. Já depois de tocar a progressão inteira aconteceu algo que ela QUER
 * guardar — e aí "salvar seu progresso" tem peso real.
 *
 * REGRA DE HONESTIDADE: o convite promete guardar onde a pessoa parou e os
 * acordes que passou. Não promete "aulas", não promete "plano de estudo" e não
 * usa urgência falsa. Se o site não faz, o texto não diz.
 *
 * Só aparece para quem NÃO está logado, uma vez por sessão de navegador (pelo
 * sessionStorage) e nunca de novo se a pessoa já fechou. Pedir de novo a cada
 * música transforma convite em assédio.
 */

const CHAVE = "chordproof-progress-prompt";

export default function SaveProgressPrompt({
  songName,
  onScreen,
}: {
  /** aparece só quando o player concluiu a execução */
  onScreen: boolean;
  songName: string;
}) {
  const { status } = useSession();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!onScreen) return;
    if (status !== "unauthenticated") return;
    // já viu nesta aba? não insiste
    try {
      if (sessionStorage.getItem(CHAVE) === "seen") return;
    } catch {
      /* modo privado sem sessionStorage: segue e mostra */
    }
    // espera 1,2s: o convite não deve pular na cara no mesmo instante em que
    // o último acorde soa — a pessoa ainda está com as mãos no instrumento.
    const t = setTimeout(() => setAberto(true), 1200);
    return () => clearTimeout(t);
  }, [onScreen, status]);

  const fechar = () => {
    setAberto(false);
    try {
      sessionStorage.setItem(CHAVE, "seen");
    } catch {
      /* ignora */
    }
  };

  if (!aberto) return null;

  const callback = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <div
      role="dialog"
      aria-label="Save your progress"
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        width: "min(92vw, 460px)",
        background: "var(--c-bg-elevated)",
        border: "1px solid var(--c-hairline)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--c-gold-soft)",
            color: "var(--c-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={17} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            You played all of {songName}
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--c-text-secondary)", marginBottom: 12 }}>
            Sign in to keep your place in this tab and see the chords you have played
            pile up. It is the same free account you use to save tabs.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`}
              style={{
                background: "var(--c-cta-bg)",
                color: "var(--c-cta-text)",
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Save my progress
            </Link>
            <button
              onClick={fechar}
              style={{
                background: "transparent",
                border: "1px solid var(--c-hairline)",
                color: "var(--c-text-tertiary)",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={fechar}
          aria-label="Close"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--c-text-tertiary)",
            padding: 2,
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
