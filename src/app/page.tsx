import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { TrendingUp, ArrowRight, Music, Search, Flame, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

const GENRES = [
  "Rock", "Pop", "Indie", "Country", "Folk", "Metal", "Blues", "Jazz", "R&B", "Classical"
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-green-400",
  Intermediate: "text-yellow-400",
  Advanced: "text-red-400",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Trending: top 10 tabs por views
  const { data: trendingTabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, difficulty, key_sig, views")
    .order("views", { ascending: false })
    .limit(10);

  // Artistas populares: agrupa por artista, soma views e conta tabs
  const { data: allTabs } = await supabase
    .from("tabs")
    .select("artist, slug_artist, artist_image_url, views");

  const artistMap = new Map<string, { name: string; slug: string; tabs: number; views: number; image: string | null }>();
  (allTabs || []).forEach((t) => {
    if (!artistMap.has(t.slug_artist)) {
      artistMap.set(t.slug_artist, { name: t.artist, slug: t.slug_artist, tabs: 0, views: 0, image: t.artist_image_url });
    }
    const entry = artistMap.get(t.slug_artist)!;
    entry.tabs += 1;
    entry.views += t.views || 0;
  });
  const popularArtists = Array.from(artistMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  const formatViews = (v: number | null) => {
    if (!v) return "0";
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(".0", "") + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
    return String(v);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Play it <span className="text-brand-gold">Right.</span>
        </h1>
        <p className="text-brand-muted text-lg mb-8 max-w-xl mx-auto">
          Thousands of verified guitar tabs. No paywalls, no popups, just music.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar large />
        </div>
        <p className="text-sm text-brand-muted/60 mt-4">
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
              className="px-4 py-2 bg-brand-card rounded-full border border-white/5 hover:border-brand-gold/30 hover:bg-white/5 transition text-sm"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending This Week */}
      <section className="space-y-6 mt-12">
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
          {(trendingTabs || []).map((tab, idx) => (
            <Link
              key={`${tab.slug_artist}-${tab.slug_song}`}
              href={`/tab/${tab.slug_artist}/${tab.slug_song}`}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition group ${idx !== (trendingTabs?.length ?? 0) - 1 ? "border-b border-white/5" : ""}`}
            >
              <span className={`text-2xl font-bold w-10 text-center ${idx < 3 ? "text-brand-gold" : "text-brand-muted"}`}>
                {idx + 1}
              </span>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg group-hover:text-brand-gold transition truncate">{tab.song}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[tab.difficulty]}`}>{tab.difficulty}</span>
                </div>
                <p className="text-brand-muted text-sm capitalize">{tab.artist}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <span className="text-xs text-brand-muted">Key: <strong className="text-white">{tab.key_sig}</strong></span>
                <span className="text-xs text-brand-muted flex items-center gap-1">
                  <TrendingUp size={12} /> {formatViews(tab.views)}
                </span>
              </div>
              <ArrowRight size={18} className="text-brand-muted group-hover:text-brand-gold transition flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Artists — círculos grandes com foto e nome embaixo */}
      <section className="space-y-8 mt-12">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-brand-gold" />
          <div>
            <h2 className="text-3xl font-bold">Artistas Populares</h2>
            <p className="text-brand-muted text-sm">Os artistas mais vistos do site</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {popularArtists.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artist/${artist.slug}`}
              className="flex flex-col items-center gap-3 text-center group"
            >
              {artist.image ? (
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-brand-gold/50 group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-card border border-white/10 flex items-center justify-center group-hover:border-brand-gold/30 transition">
                  <Music size={32} className="text-brand-muted group-hover:text-brand-gold transition" />
                </div>
              )}
              <span className="font-semibold group-hover:text-brand-gold transition text-sm leading-tight">{artist.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Value proposition */}
      <section className="border-t border-white/10 pt-12 mt-12">
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
