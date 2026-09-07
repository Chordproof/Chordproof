import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import ArtistAvatar from "@/components/ArtistAvatar";
import {
  TrendingUp,
  ArrowRight,
  Music,
  Users,
  BadgeCheck,
  ShieldCheck,
  Ban,
  Flame,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const GENRES = ["Rock", "Pop", "Indie", "Country", "Folk", "Metal", "Jazz", "R&B"];

const difficultyColor: Record<string, string> = {
  Beginner: "text-green-400 bg-green-400/10",
  Intermediate: "text-yellow-400 bg-yellow-400/10",
  Advanced: "text-red-400 bg-red-400/10",
};

const formatViews = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Trending: top 6 cifras por views
  const { data: trendingTabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, is_verified, views, artist_image_url, difficulty, key_sig")
    .order("views", { ascending: false })
    .limit(6);

  // Todos os tabs para agregar artistas populares
  const { data: allTabs } = await supabase
    .from("tabs")
    .select("artist, slug_artist, views, artist_image_url");

  // Artistas populares (top 8 por soma de views)
  const artistMap = new Map<string, { name: string; slug: string; views: number; image: string | null }>();
  (allTabs || []).forEach((t) => {
    if (!artistMap.has(t.slug_artist)) {
      artistMap.set(t.slug_artist, { name: t.artist, slug: t.slug_artist, views: 0, image: t.artist_image_url ?? null });
    }
    const entry = artistMap.get(t.slug_artist)!;
    entry.views += t.views || 0;
  });
  const topArtists = Array.from(artistMap.values()).sort((a, b) => b.views - a.views).slice(0, 8);

  const featured = trendingTabs?.[0] ?? null;
  const trending = (trendingTabs || []).slice(1);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="text-center py-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Play it <span className="text-brand-gold">Right.</span>
        </h1>
        <p className="text-brand-muted mt-3 text-base md:text-lg max-w-xl mx-auto">
          Verified guitar tabs, free forever. No paywalls, no popups — just accurate chords.
        </p>
        <div className="mt-6 max-w-xl mx-auto">
          <SearchBar />
        </div>

        {/* Estatísticas de confiança */}
        <div className="mt-8 flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-brand-gold" />
            <div className="text-left">
              <p className="text-lg font-bold leading-tight">12,400+</p>
              <p className="text-xs text-brand-muted">Verified Tabs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-gold" />
            <div className="text-left">
              <p className="text-lg font-bold leading-tight">85,000</p>
              <p className="text-xs text-brand-muted">Active Musicians</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Music size={16} className="text-brand-gold" />
            <div className="text-left">
              <p className="text-lg font-bold leading-tight">450,000</p>
              <p className="text-xs text-brand-muted">Total Songs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BROWSE BY GENRE ===== */}
      <section className="py-6">
        <h2 className="text-xl font-bold mb-4">Browse by Genre</h2>
        <div className="flex flex-wrap gap-2.5">
          {GENRES.map((genre) => (
            <Link
              key={genre}
              href={`/genre/${encodeURIComponent(genre)}`}
              className="px-4 py-1.5 bg-brand-card rounded-full border border-white/5 hover:border-brand-gold/30 hover:bg-white/5 transition text-sm"
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TAB OF THE DAY (destaque editorial) ===== */}
      {featured && (
        <section className="py-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 via-transparent to-transparent" />
            <div className="relative flex flex-col md:flex-row items-center gap-5 p-6 bg-brand-card/80">
              <ArtistAvatar
                name={featured.artist}
                slug={featured.slug_artist}
                imageUrl={featured.artist_image_url}
                size="md"
              />
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">
                  <Flame size={12} /> Tab of the Day
                </span>
                <h3 className="text-2xl font-bold mt-2">{featured.song}</h3>
                <p className="text-brand-muted">{featured.artist}</p>
              </div>
              <Link
                href={`/tab/${featured.slug_artist}/${featured.slug_song}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-black rounded-full font-bold hover:scale-105 transition"
              >
                View Tab <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== TRENDING THIS WEEK ===== */}
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-gold" /> Trending This Week
            </h2>
            <p className="text-sm text-brand-muted mt-0.5">Most played tabs</p>
          </div>
          <Link href="/browse" className="text-sm text-brand-gold hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((t) => (
            <div
              key={`${t.slug_artist}-${t.slug_song}`}
              className="group bg-brand-card rounded-xl p-5 border border-white/5 hover:border-brand-gold/40 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3">
                <ArtistAvatar name={t.artist} slug={t.slug_artist} imageUrl={t.artist_image_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link href={`/tab/${t.slug_artist}/${t.slug_song}`} className="block">
                    <h3 className="font-bold truncate group-hover:text-brand-gold transition-colors">{t.song}</h3>
                  </Link>
                  <Link href={`/artist/${t.slug_artist}`} className="block">
                    <p className="text-sm text-brand-muted truncate hover:text-brand-gold hover:underline transition-colors">{t.artist}</p>
                  </Link>
                </div>
                {t.is_verified && (
                  <span className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                    <BadgeCheck size={11} /> VERIFIED
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                {t.key_sig && <span className="text-xs bg-white/5 px-2 py-1 rounded">Key: <strong>{t.key_sig}</strong></span>}
                {t.difficulty && (
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${difficultyColor[t.difficulty] || "bg-white/5 text-white/70"}`}>
                    {t.difficulty}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ARTISTAS POPULARES ===== */}
      <section className="py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={18} className="text-brand-gold" /> Artistas Populares
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {topArtists.map((artist) => (
            <Link key={artist.slug} href={`/artist/${artist.slug}`} className="flex flex-col items-center gap-1.5 group">
              <ArtistAvatar name={artist.name} slug={artist.slug} imageUrl={artist.image} size="md" />
              <span className="text-sm font-semibold group-hover:text-brand-gold transition-colors">{artist.name}</span>
              <span className="text-xs text-brand-muted">{formatViews(artist.views)} views</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== WHY CHORDPROOF ===== */}
      <section className="py-6">
        <h2 className="text-xl font-bold text-center mb-6">Why ChordProof?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-card rounded-2xl p-5 border border-white/5 text-center">
            <Ban size={20} className="text-brand-gold mx-auto mb-2" />
            <h3 className="font-bold">No Paywalls</h3>
            <p className="text-sm text-brand-muted mt-1">Community content is and always will be free. No Pro plan needed to read tabs.</p>
          </div>
          <div className="bg-brand-card rounded-2xl p-5 border border-white/5 text-center">
            <ShieldCheck size={20} className="text-brand-gold mx-auto mb-2" />
            <h3 className="font-bold">No Popups</h3>
            <p className="text-sm text-brand-muted mt-1">Clean reading experience. No intrusive ads, no newsletter popups, no upsells.</p>
          </div>
          <div className="bg-brand-card rounded-2xl p-5 border border-white/5 text-center">
            <BadgeCheck size={20} className="text-brand-gold mx-auto mb-2" />
            <h3 className="font-bold">Verified Accuracy</h3>
            <p className="text-sm text-brand-muted mt-1">Every tab is checked by real musicians. If it's wrong, we fix it — not you.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
