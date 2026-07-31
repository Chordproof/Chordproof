"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { getPlayer, type PlayerState } from "@/lib/gamification";

export default function GamificationBadge() {
  const [player, setPlayer] = useState<PlayerState>(getPlayer());

  useEffect(() => {
    const refresh = () => setPlayer(getPlayer());
    window.addEventListener("chordproof:gamification", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("chordproof:gamification", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link
      href="/profile"
      title="Your progress"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 transition-colors"
    >
      <Flame size={14} className="text-orange-400" />
      <span className="font-bold text-sm">{player.streak}</span>
      <span className="text-xs text-brand-muted">Lv {player.level}</span>
    </Link>
  );
}
