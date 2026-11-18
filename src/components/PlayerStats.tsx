"use client";
import { useEffect, useState } from "react";
import { Flame, Trophy, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { levelFromXp, getAchievements, type PlayerState } from "@/lib/gamification";

const EMPTY: PlayerState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActivity: null,
  tabsViewed: 0,
  tabsCompleted: 0,
  transpositions: 0,
  savedTabs: 0,
};

export default function PlayerStats() {
  const { status } = useSession();
  const [player, setPlayer] = useState<PlayerState | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!alive) return;
          setPlayer(d?.stats ? { ...EMPTY, ...d.stats } : EMPTY);
        })
        .catch(() => alive && setPlayer(EMPTY));

    if (status === "authenticated") load();
    else if (status === "unauthenticated") setPlayer(EMPTY);

    const refresh = () => status === "authenticated" && load();
    window.addEventListener("chordproof:gamification", refresh);
    return () => {
      alive = false;
      window.removeEventListener("chordproof:gamification", refresh);
    };
  }, [status]);

  if (player === null) {
    return (
      <div className="bg-[var(--c-card)] rounded-2xl p-10 border border-[var(--c-hairline)] flex justify-center">
        <Loader2 className="animate-spin text-brand-gold" />
      </div>
    );
  }

  const { level, title, nextXp, progress } = levelFromXp(player.xp);
  const achievements = getAchievements(player);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const isEmpty = player.xp === 0 && player.tabsViewed === 0;

  return (
    <div className="space-y-6">
      {/* Level + XP + Streak */}
      <div className="bg-[var(--c-card)] rounded-2xl p-6 border border-[var(--c-hairline)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-muted uppercase tracking-widest">Level {level}</p>
            <p className="text-2xl font-display font-bold">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            <span className="text-2xl font-bold">{player.streak}</span>
            <span className="text-xs text-brand-muted">day streak</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-brand-muted">
            <span>{player.xp} XP</span>
            {nextXp ? (
              <span>{nextXp - player.xp} XP to level {level + 1}</span>
            ) : (
              <span>Max level</span>
            )}
          </div>
          <div className="h-2 bg-[var(--c-overlay)] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {isEmpty && (
          <p className="text-xs text-brand-muted pt-1">
            Open a tab to start earning XP. Progress is saved to your account.{" "}
            <Link href="/browse" className="text-brand-gold hover:underline">Browse tabs</Link>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tabs Viewed", value: player.tabsViewed },
          { label: "Completed", value: player.tabsCompleted },
          { label: "Transpositions", value: player.transpositions },
          { label: "Saved", value: player.savedTabs },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--c-card)] rounded-2xl p-4 border border-[var(--c-hairline)] text-center"
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-[var(--c-card)] rounded-2xl p-6 border border-[var(--c-hairline)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold flex items-center gap-2">
            <Trophy size={18} className="text-brand-accent" /> Achievements
          </h3>
          <span className="text-xs text-brand-muted">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((a) => (
            <div
              key={a.code}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-colors ${
                a.unlocked
                  ? "bg-brand-accent/10 border-brand-accent/20"
                  : "bg-[var(--c-overlay-soft)] border-[var(--c-hairline)] opacity-50"
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="text-xs text-brand-muted">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
