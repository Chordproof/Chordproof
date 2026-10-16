"use client";
import { RotateCcw } from "lucide-react";

interface CleanAllButtonProps {
  onClick: () => void;
  label?: string;
}

export default function CleanAllButton({ onClick, label = "Clean all" }: CleanAllButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted bg-[var(--c-overlay-soft)] px-3 py-1 rounded-full border border-[var(--c-hairline)] hover:bg-brand-accent/10 hover:text-brand-accent transition-colors"
    >
      <RotateCcw size={12} />
      {label}
    </button>
  );
}
