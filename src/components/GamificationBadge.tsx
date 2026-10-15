"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { getPlayer, type PlayerState } from "@/lib/gamification";

// Widget de streak na navbar: fogo + dias consecutivos + nível.
// Clique leva ao perfil com o progresso completo (XP, conquistas).
export default function GamificationBadge() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPlayer(getPlayer());
    const refresh = () => setPlayer(getPlayer());
    window.addEventListener("chordproof:gamification", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("chordproof:gamification", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!mounted || !player) return null;

  const streak = player.streak || 0;
  const level = player.level || 1;
  const days = streak === 1 ? "day" : "days";

  return (
    <Link
      href="/profile"
      title={streak > 0 ? `${streak} ${days} in a row — keep it going!` : "Start your practice streak today!"}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors shrink-0"
    >
      <Flame
        size={15}
        className={streak > 0 ? "text-orange-400" : "text-white/30"}
        style={streak >= 3 ? { filter: "drop-shadow(0 0 4px rgba(251,146,60,0.6))" } : undefined}
      />
      <span className={"font-bold text-sm " + (streak > 0 ? "text-white" : "text-white/50")}>{streak}</span>
      <span className="text-xs text-brand-muted hidden sm:inline">Lv {level}</span>
    </Link>
  );
}