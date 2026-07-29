import { BadgeCheck } from "lucide-react";
import Link from "next/link";

interface TabCardProps {
  song: string;
  artist: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean;
  key_sig: string;
}

export default function TabCard({ song, artist, difficulty, isVerified, key_sig }: TabCardProps) {
  const difficultyColor =
    difficulty === "Beginner" ? "text-green-400" :
    difficulty === "Intermediate" ? "text-yellow-400" : "text-red-400";

  return (
    <Link
      href={`/tab/${artist.toLowerCase().replace(/\s+/g, "-")}/${song.toLowerCase().replace(/\s+/g, "-")}`}
      className="block bg-brand-card rounded-2xl p-6 border border-white/5 hover:border-brand-gold/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold group-hover:text-brand-gold transition">{song}</h3>
          <p className="text-brand-muted text-sm">{artist}</p>
        </div>
        {isVerified && (
          <BadgeCheck size={20} className="text-brand-gold gold-seal-anim" />
        )}
      </div>
      <div className="flex gap-2 text-xs">
        <span className="bg-white/5 px-2 py-1 rounded">{key_sig}</span>
        <span className={`bg-white/5 px-2 py-1 rounded ${difficultyColor}`}>{difficulty}</span>
      </div>
    </Link>
  );
}
