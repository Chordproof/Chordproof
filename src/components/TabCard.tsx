import Link from "next/link";
import ArtistAvatar from "@/components/ArtistAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";

interface TabCardProps {
  song: string;
  artist: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean;
  key_sig: string;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function TabCard({ song, artist, difficulty, isVerified, key_sig }: TabCardProps) {
  const difficultyColor =
    difficulty === "Beginner" ? "text-green-400" :
    difficulty === "Intermediate" ? "text-yellow-400" : "text-red-400";

  const artistSlug = slugify(artist);

  return (
    <div className="block bg-[#1A1A1A] rounded-2xl p-6 md:p-7 hover:bg-[#242424] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          {/* Foto do artista → página do artista */}
          <Link href={`/artist/${artistSlug}`} className="shrink-0">
            <ArtistAvatar name={artist} slug={artistSlug} size="xs" />
          </Link>

          <div className="space-y-1.5">
            {/* Título da música → página da cifra */}
            <Link
              href={`/tab/${artistSlug}/${slugify(song)}`}
              className="text-lg font-bold group-hover:text-brand-accent transition-colors duration-200 block"
            >
              {song}
            </Link>
            {/* Nome do artista → página do artista */}
            <Link
              href={`/artist/${artistSlug}`}
              className="text-brand-muted text-sm block hover:text-brand-accent hover:underline transition-colors"
            >
              {artist}
            </Link>
          </div>
        </div>
        {isVerified && <VerifiedBadge size="sm" />}
      </div>
      <div className="flex gap-2 text-xs">
        <span className="bg-white/[0.06] px-3 py-1.5 rounded-lg">{key_sig}</span>
        <span className={`bg-white/[0.06] px-3 py-1.5 rounded-lg ${difficultyColor}`}>{difficulty}</span>
      </div>
    </div>
  );
}
