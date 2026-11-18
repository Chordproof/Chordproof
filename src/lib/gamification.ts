"use client";

export type GameAction = "OPEN_TAB" | "COMPLETE_TAB" | "TRANSPOSE" | "SAVE_TAB";

export const XP_VALUES: Record<GameAction, number> = {
  OPEN_TAB: 10,
  COMPLETE_TAB: 50,
  TRANSPOSE: 5,
  SAVE_TAB: 20,
};

export interface PlayerState {
  xp: number;
  level: number;
  streak: number;
  lastActivity: string | null;
  tabsViewed: number;
  tabsCompleted: number;
  transpositions: number;
  savedTabs: number;
}

const LEVELS = [
  { level: 1, xp: 0, title: "Beginner" },
  { level: 2, xp: 100, title: "Apprentice" },
  { level: 3, xp: 300, title: "Intermediate" },
  { level: 4, xp: 600, title: "Advanced" },
  { level: 5, xp: 1000, title: "Virtuoso" },
  { level: 6, xp: 1500, title: "Master" },
  { level: 7, xp: 2100, title: "Legend" },
  { level: 8, xp: 2800, title: "Legendary" },
];

const EVENT_NAME = "chordproof:gamification";

const DEFAULT_PLAYER: PlayerState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActivity: null,
  tabsViewed: 0,
  tabsCompleted: 0,
  transpositions: 0,
  savedTabs: 0,
};

export function getPlayer(): PlayerState {
  // Fonte da verdade é o banco (/api/stats). Não lemos mais localStorage:
  // ele é do navegador e misturava contas diferentes.
  return DEFAULT_PLAYER;
}

export function levelFromXp(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xp) current = l;
  }
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[idx + 1] ?? null;
  const progress = next
    ? Math.min(100, Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100))
    : 100;
  return {
    level: current.level,
    title: current.title,
    nextXp: next ? next.xp : null,
    progress,
  };
}

export function getAchievements(p: PlayerState) {
  return [
    { code: "first_tab", title: "First Steps", desc: "View your first tab", icon: "🎸", unlocked: p.tabsViewed >= 1 },
    { code: "tabs_10", title: "Explorer", desc: "View 10 tabs", icon: "🧭", unlocked: p.tabsViewed >= 10 },
    { code: "tabs_50", title: "Collector", desc: "View 50 tabs", icon: "📚", unlocked: p.tabsViewed >= 50 },
    { code: "streak_3", title: "On Fire", desc: "3-day streak", icon: "🔥", unlocked: p.streak >= 3 },
    { code: "streak_7", title: "Week Warrior", desc: "7-day streak", icon: "⚡", unlocked: p.streak >= 7 },
    { code: "transpose_5", title: "Key Master", desc: "Transpose 5 tabs", icon: "🔑", unlocked: p.transpositions >= 5 },
    { code: "complete_10", title: "Virtuoso", desc: "Complete 10 tabs", icon: "🎼", unlocked: p.tabsCompleted >= 10 },
  ];
}

export function recordAction(action: GameAction) {
  // Estatísticas são POR CONTA, no banco (/api/stats) — antes ficavam em
  // localStorage, que é do navegador: duas contas no mesmo navegador viam
  // os mesmos números. Sem login, a chamada simplesmente devolve 401 e
  // nada é gravado.
  if (typeof window === "undefined") return;
  const xp = XP_VALUES[action] ?? 0;
  fetch("/api/stats", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, xp }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d?.ok) window.dispatchEvent(new Event(EVENT_NAME));
    })
    .catch(() => {});
}
