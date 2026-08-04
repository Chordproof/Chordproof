"use client";
import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
}

export default function VerifiedBadge({ size = "md" }: VerifiedBadgeProps) {
  const base =
    "inline-flex items-center gap-1 bg-brand-accent/10 text-brand-accent rounded-full font-bold";
  const sizing = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <div className={`${base} ${sizing}`}>
      <BadgeCheck size={size === "sm" ? 12 : 14} />
      VERIFIED
    </div>
  );
}
