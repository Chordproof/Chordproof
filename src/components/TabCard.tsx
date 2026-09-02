import Link from "next/link";
import { BadgeCheck } from "lucide-react";

type TabCardProps = {
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  difficulty: string;
  is_verified: boolean;
  key_sig: string;
};

const difficultyColor: Record<string, string> = {
  Beginner: "text-green-400 bg-green-400/10",
  Intermediate: "text-yellow-400 bg-yellow-400/10",
  Advanced: "text-red-400 bg-red-400/10",
};

export default function TabCard({ song, artist, slug_artist, slug_song, difficulty, is_verified, key_sig }: TabCardProps) {
  return (
    <div className="group bg-brand-card rounded-xl p-6 border border-white/5 hover:border-brand-gold/40 hover:-translate-y-1 transition-all block">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <Link href={`/tab/${slug_artist}/${slug_song}`} className="block">
            <h3 className="text-lg font-bold truncate group-hover:text-brand-gold transition-colors">{song}</h3>
          </Link>
          <Link href={`/artist/${slug_artist}`} className="block">
            <p className="text-sm text-brand-muted truncate hover:text-brand-gold hover:underline transition-colors">{artist}</p>
          </Link>
        </div>
        {is_verified && (
          <span className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
            <BadgeCheck size={11} /> VERIFIED
          </span>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <span className="text-xs bg-white/5 px-2 py-1 rounded">Key: <strong>{key_sig}</strong></span>
        <span className={`text-xs px-2 py-1 rounded font-semibold ${difficultyColor[difficulty] || "bg-white/5 text-white/70"}`}>
          {difficulty}
        </span>
      </div>
    </div>
  );
}
