"use client";
import { useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { getPlayer, levelFromXp, getAchievements, type PlayerState } from "@/lib/gamification";

export default function PlayerStats() {
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

  const { level, title, nextXp, progress } = levelFromXp(player.xp);
  const achievements = getAchievements(player);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Level + XP + Streak */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.06] space-y-4">
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
          <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
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
            className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/[0.06] text-center"
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/[0.06] space-y-4">
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
                  : "bg-white/[0.03] border-white/[0.06] opacity-50"
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
