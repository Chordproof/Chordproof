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

const STORAGE_KEY = "chordproof_player";
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getPlayer(): PlayerState {
  if (typeof window === "undefined") return DEFAULT_PLAYER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER;
    return { ...DEFAULT_PLAYER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLAYER;
  }
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
  const before = getPlayer();
  const today = todayISO();

  let streak = before.streak;
  if (before.lastActivity === today) {
    // já registrou hoje
  } else if (before.lastActivity === yesterdayISO()) {
    streak = before.streak + 1;
  } else {
    streak = 1;
  }

  const player: PlayerState = {
    ...before,
    streak,
    lastActivity: today,
    xp: before.xp + XP_VALUES[action],
    tabsViewed: before.tabsViewed + (action === "OPEN_TAB" ? 1 : 0),
    tabsCompleted: before.tabsCompleted + (action === "COMPLETE_TAB" ? 1 : 0),
    transpositions: before.transpositions + (action === "TRANSPOSE" ? 1 : 0),
    savedTabs: before.savedTabs + (action === "SAVE_TAB" ? 1 : 0),
  };
  player.level = levelFromXp(player.xp).level;

  const beforeAch = getAchievements(before);
  const afterAch = getAchievements(player);
  const unlocked = afterAch.filter(
    (a) => a.unlocked && !beforeAch.some((b) => b.code === a.code && b.unlocked)
  );

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // storage indisponível
  }

  return { player, unlocked };
}
