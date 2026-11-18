"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { useSession } from "next-auth/react";
import { levelFromXp, type PlayerState } from "@/lib/gamification";

// Widget de streak na navbar: fogo + dias consecutivos + nível.
// Lê de /api/stats (por conta), não de localStorage.
export default function GamificationBadge() {
  const { status } = useSession();
  const [player, setPlayer] = useState<PlayerState | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && setPlayer(d?.stats ?? null))
        .catch(() => alive && setPlayer(null));

    if (status === "authenticated") load();
    else if (status === "unauthenticated") setPlayer(null);

    const refresh = () => status === "authenticated" && load();
    window.addEventListener("chordproof:gamification", refresh);
    return () => {
      alive = false;
      window.removeEventListener("chordproof:gamification", refresh);
    };
  }, [status]);

  // Sem login não há streak para mostrar
  if (status !== "authenticated" || !player) return null;

  const streak = player.streak || 0;
  const level = levelFromXp(player.xp || 0).level;
  const days = streak === 1 ? "day" : "days";

  return (
    <Link
      href="/profile"
      title={streak > 0 ? `${streak} ${days} in a row — keep it going!` : "Start your practice streak today!"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] transition-colors shrink-0"
    >
      <Flame
        size={15}
        className={streak > 0 ? "text-orange-400" : "text-[var(--c-text)]/30"}
        style={streak >= 3 ? { filter: "drop-shadow(0 0 4px rgba(251,146,60,0.6))" } : undefined}
      />
      <span className={"font-bold text-sm " + (streak > 0 ? "text-[var(--c-text)]" : "text-[var(--c-text)]/50")}>{streak}</span>
      <span className="text-xs text-brand-muted hidden sm:inline">Lv {level}</span>
    </Link>
  );
}
