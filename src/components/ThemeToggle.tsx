"use client";
import { useEffect, useState } from "react";

/**
 * ThemeToggle — alternância Light/Dark (estilo Apple).
 * Persiste em localStorage; aplica a classe `light` no <html>.
 *
 * DEFAULT: LIGHT (papel). O fundo "papel" é o visual principal do site.
 * Quem já escolheu dark continua em dark (localStorage vence).
 *
 * O tema escuro é a AUSÊNCIA da classe `light` — não existe classe `dark`
 * no `<html>`. O CSS responde com `html:not(.light)`; `.dark` fica só para
 * os portais fullscreen (Stage Mode, Trainer) que a põem no próprio nó.
 */
export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-theme-mode");
    // PADRAO: claro (papel). Só quem escolheu dark explicitamente fica dark.
    const light = saved !== "dark";
    setIsLight(light);
    document.documentElement.classList.toggle("light", light);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("chordproof-theme-mode", next ? "light" : "dark");
  }

  // Evita mismatch de hidratação: renderiza placeholder no SSR
  if (!mounted) {
    return <div style={{ width: "36px", height: "36px" }} />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition"
      style={{ fontSize: "15px", lineHeight: 1 }}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
