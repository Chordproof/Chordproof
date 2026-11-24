"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal — revela o conteúdo quando ele entra na tela.
 *
 * Por que um componente e não CSS puro: CSS não sabe se o elemento já está
 * visível na primeira pintura, e uma animação de rolagem aplicada de saída
 * deixaria o hero invisível até o usuário rolar.
 *
 * Regras que segue:
 *  - Só opacity/transform (classe .reveal em globals.css): nada de reflow.
 *  - Sem JS ou sem IntersectionObserver, o conteúdo aparece imediatamente.
 *  - prefers-reduced-motion tratado no CSS (transição desligada).
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** atraso em ms, para escalonar irmãos */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — ref genérica para tag dinâmica
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
