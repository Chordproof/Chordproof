import { BadgeCheck, Music } from "lucide-react";
import Link from "next/link";

interface TabCardProps {
  song: string;
  artist: string;
  difficulty: string;
  isVerified: boolean;
  key_sig: string;
}

export default function TabCard({ song, artist, difficulty, isVerified, key_sig }: TabCardProps) {
  return (
    <Link
      href={`/tab/${artist.toLowerCase().replace(/\s+/g, "-")}/${song.toLowerCase().replace(/\s+/g, "-")}`}
      className="group bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-amber-400/50 transition-all hover:shadow-xl hover:shadow-amber-400/5 block"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-gray-800 p-3 rounded-xl group-hover:bg-amber-400/10 transition">
          <Music className="text-gray-400 group-hover:text-amber-400 transition" size={24} />
        </div>
        {isVerified && (
          <BadgeCheck className="text-amber-400 gold-seal-anim" size={20} />
        )}
      </div>
      <h3 className="font-bold text-lg truncate">{song}</h3>
      <p className="text-gray-400 text-sm mb-4">{artist}</p>
      <div className="flex justify-between items-center">
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          difficulty === "Beginner" ? "bg-green-500/10 text-green-400" :
          difficulty === "Intermediate" ? "bg-yellow-500/10 text-yellow-400" :
          "bg-red-500/10 text-red-400"
        }`}>
          {difficulty}
        </span>
        <span className="text-xs text-gray-500 font-mono">{key_sig}</span>
      </div>
    </Link>
  );
}
