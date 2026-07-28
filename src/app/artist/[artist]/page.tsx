import TabCard from "@/components/TabCard";
import { Music, Users, BadgeCheck, Globe } from "lucide-react";
import Link from "next/link";

export default function ArtistPage({ params }: { params: { artist: string } }) {
  const artistName = params.artist.replace(/-/g, " ");

  return (
    <div className="space-y-10">
      {/* Artist Header */}
      <div className="bg-brand-card rounded-3xl p-8 md:p-12 border border-white/5">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-gold to-amber-600 flex items-center justify-center text-5xl font-black shrink-0">
            {artistName.charAt(0).toUpperCase()}
          </div>

          <div className="text-center md:text-left space-y-4 flex-1">
            <h1 className="text-4xl md:text-5xl font-bold capitalize">{artistName}</h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                <Music size={16} className="text-brand-gold" />
                <strong>24</strong> tabs
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                <BadgeCheck size={16} className="text-brand-gold" />
                <strong>22</strong> verified
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                <Users size={16} className="text-brand-gold" />
                <strong>12.4k</strong> monthly listeners
              </span>
            </div>

            <p className="text-brand-muted max-w-2xl">
              Browse all verified guitar tabs, chords, and sheet music for {artistName}.
              All tabs are hand-checked by professional musicians.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">Rock</span>
              <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">Alternative</span>
              <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">Britpop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Tabs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TabCard song="Wonderwall" artist={artistName} difficulty="Beginner" isVerified={true} key_sig="F#m" />
          <TabCard song="Don't Look Back in Anger" artist={artistName} difficulty="Intermediate" isVerified={true} key_sig="C" />
          <TabCard song="Champagne Supernova" artist={artistName} difficulty="Advanced" isVerified={true} key_sig="A" />
          <TabCard song="Live Forever" artist={artistName} difficulty="Intermediate" isVerified={true} key_sig="G" />
          <TabCard song="Slide Away" artist={artistName} difficulty="Intermediate" isVerified={true} key_sig="D" />
          <TabCard song="Supersonic" artist={artistName} difficulty="Beginner" isVerified={true} key_sig="E" />
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/browse" className="text-brand-gold hover:underline text-sm">
          ← Back to Browse
        </Link>
      </div>
    </div>
  );
}
