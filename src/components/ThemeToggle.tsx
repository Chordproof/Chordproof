"use client";
import { useEffect, useState } from "react";

/**
 * ThemeToggle — alternância Dark/Light (estilo Apple).
 * Persiste em localStorage; aplica a classe `light` no <html>.
 * Default: dark (identidade da marca). Sem flash: aplica antes do paint.
 */
export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-theme-mode");
    const light = saved === "light";
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
