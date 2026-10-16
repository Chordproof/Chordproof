"use client";
import { X } from "lucide-react";

interface GenreBadgeProps {
  genre: string;
  onClear: () => void;
  size?: "sm" | "md";
}

export default function GenreBadge({ genre, onClear, size = "md" }: GenreBadgeProps) {
  const base =
    "inline-flex items-center gap-1.5 font-bold text-brand-muted bg-[var(--c-overlay-soft)] rounded-full border border-[var(--c-hairline)] hover:bg-brand-accent/10 hover:text-brand-accent transition-colors";
  const sizing = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs";

  return (
    <button onClick={onClear} title="Clear genre filter" className={`${base} ${sizing}`}>
      {genre}
      <X size={size === "sm" ? 10 : 12} />
    </button>
  );
}
