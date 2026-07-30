import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import { CheckCircle, Users, Music, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-8 md:pt-16 pb-4 space-y-8">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-tight">
          Play it{" "}
          <span className="text-brand-accent">Right.</span>
        </h1>
        <p className="text-brand-muted text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Access thousands of verified guitar tabs. No paywalls, no popups, just music.
        </p>
        <div className="max-w-xl mx-auto pt-4">
          <SearchBar large />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
        <div className="text-center space-y-3">
          <p className="text-4xl md:text-5xl font-bold text-white">12,400+</p>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-brand-accent" />
            <p className="text-brand-muted text-sm uppercase tracking-widest">Verified Tabs</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-4xl md:text-5xl font-bold text-white">85,000</p>
          <div className="flex items-center justify-center gap-2">
            <Users size={16} className="text-brand-accent" />
            <p className="text-brand-muted text-sm uppercase tracking-widest">Active Musicians</p>
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-4xl md:text-5xl font-bold text-white">450,000</p>
          <div className="flex items-center justify-center gap-2">
            <Music size={16} className="text-brand-accent" />
            <p className="text-brand-muted text-sm uppercase tracking-widest">Total Songs</p>
          </div>
        </div>
      </section>

      {/* Verified Tabs Section */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Verified Tabs of the Day
            </h2>
            <p className="text-brand-muted">
              Hand-checked by our pro musicians for 100% accuracy.
            </p>
          </div>
          <Link
            href="/browse"
            className="flex items-center gap-2 text-brand-accent hover:text-white transition-colors duration-200 text-sm font-bold"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <TabCard song="Wonderwall" artist="Oasis" difficulty="Beginner" isVerified={true} key_sig="F#m" />
          <TabCard song="Hotel California" artist="Eagles" difficulty="Advanced" isVerified={true} key_sig="Bm" />
          <TabCard song="Perfect" artist="Ed Sheeran" difficulty="Beginner" isVerified={true} key_sig="Ab" />
          <TabCard song="Hallelujah" artist="Jeff Buckley" difficulty="Intermediate" isVerified={true} key_sig="C" />
          <TabCard song="Creep" artist="Radiohead" difficulty="Beginner" isVerified={true} key_sig="G" />
          <TabCard song="Stairway to Heaven" artist="Led Zeppelin" difficulty="Advanced" isVerified={true} key_sig="Am" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 pb-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          Can't find what you're looking for?
        </h2>
        <p className="text-brand-muted text-lg max-w-md mx-auto">
          Our community and pro verifiers are ready to help.
        </p>
        <Link
          href="/request"
          className="inline-block bg-brand-accent text-black px-8 py-4 rounded-full font-bold hover:brightness-110 transition-all duration-200"
        >
          Request a Tab
        </Link>
      </section>
    </div>
  );
}
