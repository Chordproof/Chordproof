import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { TrendingUp, ArrowRight, Music, Search, Flame } from "lucide-react";

const GENRES = [
  "Rock", "Pop", "Indie", "Country", "Folk", "Metal", "Blues", "Jazz", "R&B", "Classical"
];

const TRENDING = [
  { rank: 1, song: "Stairway to Heaven", artist: "led-zeppelin", key: "Am", difficulty: "Advanced", views: "2.4M" },
  { rank: 2, song: "Wonderwall", artist: "oasis", key: "F#m", difficulty: "Beginner", views: "1.8M" },
  { rank: 3, song: "Hotel California", artist: "eagles", key: "Bm", difficulty: "Advanced", views: "1.6M" },
  { rank: 4, song: "Blackbird", artist: "the-beatles", key: "G", difficulty: "Intermediate", views: "1.2M" },
  { rank: 5, song: "Dust in the Wind", artist: "kansas", key: "C", difficulty: "Intermediate", views: "980K" },
  { rank: 6, song: "Tears in Heaven", artist: "eric-clapton", key: "A", difficulty: "Intermediate", views: "870K" },
  { rank: 7, song: "Nothing Else Matters", artist: "metallica", key: "Em", difficulty: "Beginner", views: "820K" },
  { rank: 8, song: "Wish You Were Here", artist: "pink-floyd", key: "G", difficulty: "Beginner", views: "760K" },
  { rank: 9, song: "Hey There Delilah", artist: "plain-white-ts", key: "D", difficulty: "Beginner", views: "690K" },
  { rank: 10, song: "Fast Car", artist: "tracy-chapman", key: "C", difficulty: "Beginner", views: "640K" },
];

const POPULAR_ARTISTS = [
  { name: "The Beatles", slug: "the-beatles", tabs: 318 },
  { name: "Ed Sheeran", slug: "ed-sheeran", tabs: 142 },
  { name: "Taylor Swift", slug: "taylor-swift", tabs: 128 },
  { name: "John Mayer", slug: "john-mayer", tabs: 96 },
  { name: "Led Zeppelin", slug: "led-zeppelin", tabs: 87 },
  { name: "Metallica", slug: "metallica", tabs: 84 },
  { name: "Pink Floyd", slug: "pink-floyd", tabs: 72 },
  { name: "Acoustic Folk Collection", slug: "acoustic-folk", tabs: 64 },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-green-400",
  Intermediate: "text-yellow-400",
  Advanced: "text-red-400",
};

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero — streamlined */}
      <section className="text-center py-16 space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Play it <span className="text-brand-gold">Right.</span>
        </h1>
        <p className="text-brand-muted text-xl max-w-2xl mx-auto">
          Thousands of verified guitar tabs. No paywalls, no popups, just music.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar large />
        </div>
        <p className="text-sm text-brand-muted/60">
          No sign-up required. No ads. No paywalls on community content.
        </p>
      </section>

      {/* Genre filters */}
      <section className="border-y border-white/10 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Search size={18} className="text-brand-gold" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-muted">Browse by Genre</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {GENRES.map((genre) => (
            <Link
              key={genre}
              href={`/browse?genre=${genre.toLowerCase()}`}
              className="px-5 py-2 bg-white/5 hover:bg-brand-gold/10 hover:text-brand-gold rounded-full text-sm font-semibold transition border border-white/5 hover:border-brand-gold/30"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending This Week */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <Flame size={24} className="text-brand-gold" />
            <div>
              <h2 className="text-3xl font-bold">Trending This Week</h2>
              <p className="text-brand-muted text-sm">Most played tabs in the last 7 days</p>
            </div>
          </div>
          <Link href="/browse?sort=trending" className="text-brand-gold flex items-center gap-2 hover:underline text-sm">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
          {TRENDING.map((tab, idx) => (
            <Link
              key={tab.rank}
              href={`/tab/${tab.artist}/${tab.song.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition group ${idx !== TRENDING.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <span className={`text-2xl font-bold w-10 text-center ${tab.rank <= 3 ? "text-brand-gold" : "text-brand-muted"}`}>
                {tab.rank}
              </span>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg group-hover:text-brand-gold transition truncate">{tab.song}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[tab.difficulty]}`}>{tab.difficulty}</span>
                </div>
                <p className="text-brand-muted text-sm capitalize">{tab.artist.replace(/-/g, " ")}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <span className="text-xs text-brand-muted">Key: <strong className="text-white">{tab.key}</strong></span>
                <span className="text-xs text-brand-muted flex items-center gap-1">
                  <TrendingUp size={12} /> {tab.views}
                </span>
              </div>
              <ArrowRight size={18} className="text-brand-muted group-hover:text-brand-gold transition flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA banner — between sections */}
      <section className="bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">Can't find what you're looking for?</h2>
          <p className="text-brand-muted mt-1">Request a tab and our community will transcribe it for you.</p>
        </div>
        <Link
          href="/request"
          className="flex items-center gap-2 bg-brand-gold text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform whitespace-nowrap"
        >
          Request a Tab <ArrowRight size={18} />
        </Link>
      </section>

      {/* Popular Artists */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-brand-gold" />
          <div>
            <h2 className="text-3xl font-bold">Popular Artists</h2>
            <p className="text-brand-muted text-sm">Most searched artists this month</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {POPULAR_ARTISTS.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artist/${artist.slug}`}
              className="flex items-center justify-between px-5 py-4 bg-brand-card rounded-xl border border-white/5 hover:border-brand-gold/30 hover:bg-white/5 transition group"
            >
              <div className="flex items-center gap-3">
                <Music size={18} className="text-brand-muted group-hover:text-brand-gold transition" />
                <span className="font-semibold group-hover:text-brand-gold transition">{artist.name}</span>
              </div>
              <span className="text-xs text-brand-muted">{artist.tabs} tabs</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Value proposition — replaces stats bar */}
      <section className="border-t border-white/10 pt-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Why ChordProof?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
            <div className="space-y-2">
              <div className="text-brand-gold text-lg font-bold">No Paywalls</div>
              <p className="text-brand-muted text-sm">Community content is and always will be free. No Pro plan needed to read tabs.</p>
            </div>
            <div className="space-y-2">
              <div className="text-brand-gold text-lg font-bold">No Popups</div>
              <p className="text-brand-muted text-sm">Clean reading experience. No intrusive ads, no newsletter popups, no upsells.</p>
            </div>
            <div className="space-y-2">
              <div className="text-brand-gold text-lg font-bold">Verified Accuracy</div>
              <p className="text-brand-muted text-sm">Every tab is checked by real musicians. If it's wrong, we fix it — not you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
