"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, TrendingUp, Users, Music, ArrowRight, Loader2 } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import ArtistAvatar from "@/components/ArtistAvatar";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const ARTISTS_PAGE_SIZE = 24;

interface TabItem {
  id: string;
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  difficulty: string;
  is_verified: boolean;
  key_sig: string;
}

interface ArtistItem {
  id: string;
  name: string;
  slug: string;
  genre: string;
  image_url: string | null;
  tab_count: number;
}

export default function Home() {
  const [trendingTabs, setTrendingTabs] = useState<TabItem[]>([]);
  const [popularArtists, setPopularArtists] = useState<ArtistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Carregar tabs + primeira página de artistas
  useEffect(() => {
    async function load() {
      const supabase = createClientSupabaseClient();

      const [tabsResult, artistsResult] = await Promise.all([
        supabase.from("tabs").select("*").order("views", { ascending: false }).limit(15),
        supabase
          .from("artists")
          .select("*")
          .order("monthly_listeners", { ascending: false })
          .range(0, ARTISTS_PAGE_SIZE - 1),
      ]);

      if (tabsResult.data) setTrendingTabs(tabsResult.data as TabItem[]);
      if (artistsResult.data) {
        setPopularArtists(artistsResult.data as ArtistItem[]);
        setHasMoreArtists(artistsResult.data.length === ARTISTS_PAGE_SIZE);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Carregar próxima página de artistas
  const loadMoreArtists = async () => {
    if (loadingArtists) return;
    setLoadingArtists(true);
    const supabase = createClientSupabaseClient();
    const start = popularArtists.length;
    const { data } = await supabase
      .from("artists")
      .select("*")
      .order("monthly_listeners", { ascending: false })
      .range(start, start + ARTISTS_PAGE_SIZE - 1);

    if (data) {
      setPopularArtists((prev) => [...prev, ...(data as ArtistItem[])]);
      setHasMoreArtists(data.length === ARTISTS_PAGE_SIZE);
    }
    setLoadingArtists(false);
  };

  // Scroll infinito automático na seção Popular Artists
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMoreArtists) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingArtists) {
          loadMoreArtists();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreArtists, loadingArtists, popularArtists.length]);

  // Busca ao vivo (dropdown)
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const q = query.trim().toLowerCase();
    let active = true;
    setSearching(true);

    const timer = setTimeout(async () => {
      const supabase = createClientSupabaseClient();

      const [tabsResult, artistsResult] = await Promise.all([
        supabase.from("tabs").select("song, artist").ilike("song", `%${q}%`).limit(5),
        supabase.from("artists").select("name, slug").ilike("name", `%${q}%`).limit(5),
      ]);

      if (!active) return;

      const combined: any[] = [];
      if (artistsResult.data) {
        artistsResult.data.forEach((a) => {
          combined.push({ type: "artist", label: a.name, subtitle: "Artist", href: `/artist/${a.slug}` });
        });
      }
      if (tabsResult.data) {
        tabsResult.data.forEach((t) => {
          combined.push({ type: "tab", label: t.song, subtitle: t.artist, href: `/tab/${slugify(t.artist)}/${slugify(t.song)}` });
        });
      }

      setSearchResults(combined.slice(0, 8));
      setShowDropdown(combined.length > 0);
      setSearching(false);
    }, 300);

    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    setShowDropdown(false);
    router.push(`/browse?q=${encodeURIComponent(q)}`);
  };

  const difficultyColor = (d: string) =>
    d === "Beginner" ? "text-green-400" : d === "Intermediate" ? "text-yellow-400" : "text-red-400";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-brand-muted">
        <Loader2 className="animate-spin mr-2" size={20} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search Bar com dropdown ao vivo */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
          <input
            type="text"
            placeholder="What do you want to play?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3.5 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent transition text-lg"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted animate-spin" size={20} />
          )}
        </div>

        {showDropdown && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-2 bg-[#1A1A1A] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50">
            {searchResults.map((r, i) => (
              <Link
                key={`${r.type}-${i}`}
                href={r.href}
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.06] transition-colors group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  r.type === "artist" ? "bg-gradient-to-br from-brand-accent to-emerald-700 text-black" : "bg-white/[0.08] text-brand-muted"
                }`}>
                  {r.type === "artist" ? <Users size={16} /> : <Music size={16} />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-bold text-sm group-hover:text-brand-accent transition-colors truncate">{r.label}</p>
                  <p className="text-xs text-brand-muted">{r.subtitle}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-brand-muted bg-white/[0.04] px-2 py-1 rounded">{r.type}</span>
              </Link>
            ))}
            <Link
              href={`/browse?q=${encodeURIComponent(query)}`}
              onClick={() => setShowDropdown(false)}
              className="block text-center py-3 text-sm text-brand-accent hover:bg-white/[0.04] transition-colors border-t border-white/[0.06] font-bold"
            >
              View all results
            </Link>
          </div>
        )}
      </div>

      {/* Trending Tabs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={22} className="text-brand-accent" />
            <h2 className="text-2xl font-bold">Trending Tabs</h2>
          </div>
          <Link href="/browse" className="text-sm text-brand-accent hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trendingTabs.map((tab, index) => (
            <Link
              key={tab.id}
              href={`/tab/${tab.slug_artist}/${tab.slug_song}`}
              className="flex items-center gap-4 bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#242424] transition-all duration-200 group border border-white/[0.03]"
            >
              <span className="text-2xl font-black text-brand-muted w-8 text-right shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate group-hover:text-brand-accent transition-colors">{tab.song}</p>
                <p className="text-sm text-brand-muted truncate">{tab.artist}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {tab.is_verified && (
                  <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded font-bold">✓</span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${difficultyColor(tab.difficulty)} bg-white/[0.04]`}>
                  {tab.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Artists com scroll infinito */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={22} className="text-brand-accent" />
            <h2 className="text-2xl font-bold">Popular Artists</h2>
          </div>
          <Link href="/browse?view=artists" className="text-sm text-brand-accent hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {popularArtists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group"
            >
              <ArtistAvatar name={artist.name} slug={artist.slug} imageUrl={artist.image_url} size="md" />
              <p className="text-sm font-bold text-center truncate w-full group-hover:text-brand-accent transition-colors">
                {artist.name}
              </p>
              <p className="text-[10px] text-brand-muted">{artist.tab_count} tabs</p>
            </Link>
          ))}
        </div>

        {hasMoreArtists && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6 text-brand-muted">
            {loadingArtists ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                <span className="text-sm">Loading more artists...</span>
              </>
            ) : (
              <span className="text-xs text-brand-muted/50">Scroll for more</span>
            )}
          </div>
        )}

        {!hasMoreArtists && (
          <p className="text-center text-xs text-brand-muted/60 py-4">
            You've reached the end of the artist list.
          </p>
        )}
      </section>
    </div>
  );
}
