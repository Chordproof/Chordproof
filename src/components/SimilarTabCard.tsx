"use client";
import Link from "next/link";
import ArtistAvatar from "@/components/ArtistAvatar";
import { Eye } from "lucide-react";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

interface SimilarTabCardProps {
  song: string;
  artist: string;
  artistSlug: string;
  slugSong?: string;
  difficulty?: string;
  keySig?: string;
  views?: number;
  genre?: string;
}

export default function SimilarTabCard({
  song,
  artist,
  artistSlug,
  slugSong,
  difficulty,
  keySig,
  views = 0,
  genre,
}: SimilarTabCardProps) {
  const tabHref = `/tab/${artistSlug}/${slugSong || slugify(song)}`;
  const artistHref = `/artist/${artistSlug}${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`;

  return (
    <div className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg p-3 transition-colors group">
      {/* Foto do artista → página do artista */}
      <Link href={artistHref} className="shrink-0">
        <ArtistAvatar name={artist} slug={artistSlug} size="xs" />
      </Link>

      <div className="flex-1 min-w-0">
        {/* Título → página da cifra */}
        <Link
          href={tabHref}
          className="font-bold text-sm truncate block group-hover:text-brand-accent transition-colors"
        >
          {song}
        </Link>
        {/* Artista → página do artista */}
        <Link
          href={artistHref}
          className="text-xs text-brand-muted truncate block hover:text-brand-accent hover:underline transition-colors"
        >
          {artist}
        </Link>
        {(difficulty || keySig) && (
          <p className="text-[10px] text-brand-muted truncate">
            {difficulty} {keySig ? `· Key ${keySig}` : ""}
          </p>
        )}
      </div>

      <span className="flex items-center gap-1 text-[10px] text-brand-muted shrink-0">
        <Eye size={10} /> {views.toLocaleString()}
      </span>
    </div>
  );
}
