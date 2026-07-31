"use client";
import { useState } from "react";

interface ArtistAvatarProps {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-14 h-14 text-xl",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 md:w-40 md:h-40 text-5xl md:text-6xl",
};

export default function ArtistAvatar({ name, slug, imageUrl, size = "sm" }: ArtistAvatarProps) {
  // Avatar gerado com as iniciais do artista (DiceBear, sem API key)
  const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const [src, setSrc] = useState<string>(imageUrl || fallbackUrl);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-accent to-emerald-700 flex items-center justify-center font-black shrink-0 overflow-hidden`}
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setSrc(fallbackUrl)}
      />
    </div>
  );
}
