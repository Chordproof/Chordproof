import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import { CheckCircle, Users, Music, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Play it <span className="text-brand-gold">Right.</span>
        </h1>
        <p className="text-brand-muted text-xl max-w-2xl mx-auto">
          Access thousands of verified guitar tabs. No paywalls, no popups, just music.
        </p>
        <div className="max-w-3xl mx-auto">
          <SearchBar large />
        </div>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-white/10">
        <div className="flex items-center justify-center gap-4">
          <CheckCircle className="text-brand-gold w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">12,400+</p>
            <p className="text-brand-muted text-sm uppercase tracking-widest">Verified Tabs</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Users className="text-brand-gold w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">85,000</p>
            <p className="text-brand-muted text-sm uppercase tracking-widest">Active Musicians</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Music className="text-brand-gold w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">450,000</p>
            <p className="text-brand-muted text-sm uppercase tracking-widest">Total Songs</p>
          </div>
        </div>
      </div>

      {/* Verified Tabs Section */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Verified Tabs of the Day</h2>
            <p className="text-brand-muted">Hand-checked by our pro musicians for 100% accuracy.</p>
          </div>
          <Link href="/browse" className="text-brand-gold flex items-center gap-2 hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TabCard song="Wonderwall" artist="Oasis" difficulty="Beginner" isVerified={true} key_sig="F#m" />
          <TabCard song="Hotel California" artist="Eagles" difficulty="Advanced" isVerified={true} key_sig="Bm" />
          <TabCard song="Perfect" artist="Ed Sheeran" difficulty="Beginner" isVerified={true} key_sig="Ab" />
          <TabCard song="Hallelujah" artist="Jeff Buckley" difficulty="Intermediate" isVerified={true} key_sig="C" />
          <TabCard song="Creep" artist="Radiohead" difficulty="Beginner" isVerified={true} key_sig="G" />
          <TabCard song="Stairway to Heaven" artist="Led Zeppelin" difficulty="Advanced" isVerified={true} key_sig="Am" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-card rounded-3xl p-12 text-center space-y-6 border border-white/5">
        <h2 className="text-3xl font-bold">Can't find what you're looking for?</h2>
        <p className="text-brand-muted">Our community and pro verifiers are ready to help.</p>
        <Link href="/request" className="inline-block bg-brand-gold text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
          Request a Tab
        </Link>
      </section>
    </div>
  );
}
