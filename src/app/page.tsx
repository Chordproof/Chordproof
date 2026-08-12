import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import {
  CheckCircle, Users, Music, ArrowRight,
  Timer, BookOpen, TrendingUp, ChevronRight,
} from "lucide-react";
import Link from "next/link";

const trendingTabs = [
  { position: 1, song: "Wonderwall", artist: "Oasis", slugArtist: "oasis", slugSong: "wonderwall" },
  { position: 2, song: "Hotel California", artist: "Eagles", slugArtist: "eagles", slugSong: "hotel-california" },
  { position: 3, song: "Perfect", artist: "Ed Sheeran", slugArtist: "ed-sheeran", slugSong: "perfect" },
  { position: 4, song: "Hallelujah", artist: "Jeff Buckley", slugArtist: "jeff-buckley", slugSong: "hallelujah" },
  { position: 5, song: "Creep", artist: "Radiohead", slugArtist: "radiohead", slugSong: "creep" },
  { position: 6, song: "Stairway to Heaven", artist: "Led Zeppelin", slugArtist: "led-zeppelin", slugSong: "stairway-to-heaven" },
  { position: 7, song: "Nothing Else Matters", artist: "Metallica", slugArtist: "metallica", slugSong: "nothing-else-matters" },
  { position: 8, song: "Enter Sandman", artist: "Metallica", slugArtist: "metallica", slugSong: "enter-sandman" },
  { position: 9, song: "Bohemian Rhapsody", artist: "Queen", slugArtist: "queen", slugSong: "bohemian-rhapsody" },
  { position: 10, song: "Sweet Child O' Mine", artist: "Guns N' Roses", slugArtist: "guns-n-roses", slugSong: "sweet-child-o-mine" },
];

const popularArtists = [
  { name: "Led Zeppelin", slug: "led-zeppelin" },
  { name: "Queen", slug: "queen" },
  { name: "Metallica", slug: "metallica" },
  { name: "Oasis", slug: "oasis" },
  { name: "Radiohead", slug: "radiohead" },
  { name: "Eagles", slug: "eagles" },
  { name: "Ed Sheeran", slug: "ed-sheeran" },
  { name: "Guns N' Roses", slug: "guns-n-roses" },
];

const tools = [
  { icon: Music, name: "Tuner", desc: "Tune your guitar quickly and accurately" },
  { icon: Timer, name: "Metronome", desc: "Keep perfect time while you practice" },
  { icon: BookOpen, name: "Chord Dictionary", desc: "Look up any chord shape in seconds" },
];

const readAlso = [
  { title: "How to read chord charts: a complete guide", href: "#" },
  { title: "5 songs with only 2 chords for beginners", href: "#" },
  { title: "Chord melody: playing harmony and melody together", href: "#" },
  { title: "The 20 most iconic rock basslines of all time", href: "#" },
];

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

      {/* Top Tabs - ranking numerado estilo Cifra Club */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="text-brand-gold" /> Top Tabs
            </h2>
            <p className="text-brand-muted">The most searched songs this week.</p>
          </div>
          <Link href="/browse" className="text-brand-gold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
          {trendingTabs.map((t) => (
            <Link
              key={t.position}
              href={`/tab/${t.slugArtist}/${t.slugSong}`}
              className="flex items-center gap-6 px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
            >
              <span className="w-8 text-2xl font-bold text-brand-muted/50">
                {String(t.position).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="font-semibold">{t.song}</p>
                <p className="text-sm text-brand-muted">{t.artist}</p>
              </div>
              <ChevronRight className="text-brand-muted/50" size={18} />
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Popular Artists</h2>
            <p className="text-brand-muted">Most requested artists in our catalog.</p>
          </div>
          <Link href="/browse" className="text-brand-gold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {popularArtists.map((a) => (
            <Link
              key={a.slug}
              href={`/artist/${a.slug}`}
              className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-gold/50 hover:text-brand-gold transition-all capitalize"
            >
              {a.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Verified Tabs */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Latest Verified Tabs</h2>
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

      {/* Tools */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href="#"
              className="bg-brand-card rounded-2xl p-6 border border-white/5 hover:border-brand-gold/40 transition-all group"
            >
              <tool.icon className="text-brand-gold w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold group-hover:text-brand-gold transition-colors">{tool.name}</h3>
              <p className="text-brand-muted text-sm mt-1">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Read Also */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Read Also</h2>
        <ul className="bg-brand-card rounded-2xl border border-white/5 divide-y divide-white/5">
          {readAlso.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-colors text-brand-muted hover:text-brand-gold"
              >
                <ChevronRight size={16} className="text-brand-gold/60" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
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
