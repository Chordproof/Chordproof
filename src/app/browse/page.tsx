"use client";
import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import ArtistAvatar from "@/components/ArtistAvatar";
import { SlidersHorizontal, Music, Users, ChevronRight, Loader2 } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import Link from "next/link";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const keys = ["All", "C", "D", "E", "F", "G", "A", "B", "Am", "Em", "F#m", "Bm", "Bb"];
const ARTISTS_PAGE_SIZE = 50;

interface Tab {
  id: string;
  song: string;
  artist: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean;
  key_sig: string;
}

interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string;
  image_url: string | null;
  tab_count: number;
  monthly_listeners: number;
}

export default function Browse() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [key, setKey] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const [view, setView] = useState<"tabs" | "artists">("tabs");
  const [initialQuery, setInitialQuery] = useState("");

  // Ler parâmetros da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const v = params.get("view");
    setInitialQuery(q);
    if (q) setSearch(q);
    if (v === "artists") setView("artists");
  }, []);

  // Carregar todas as tabs (uma vez)
  useEffect(() => {
    async function loadTabs() {
      const supabase = createClientSupabaseClient();
      const { data } = await supabase
        .from("tabs")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setTabs(
          data.map((t) => ({
            id: t.id,
            song: t.song,
            artist: t.artist,
            difficulty: t.difficulty,
            isVerified: t.is_verified,
            key_sig: t.key_sig,
          }))
        );
      }
      setLoading(false);
    }
    loadTabs();
  }, []);

  // Carregar primeira página de artistas
  useEffect(() => {
    async function loadFirstPage() {
      setLoadingArtists(true);
      const supabase = createClientSupabaseClient();
      const { data } = await supabase
        .from("artists")
        .select("*")
        .order("monthly_listeners", { ascending: false })
        .range(0, ARTISTS_PAGE_SIZE - 1);

      if (data) {
        setArtists(data as Artist[]);
        setHasMoreArtists(data.length === ARTISTS_PAGE_SIZE);
      }
      setLoadingArtists(false);
      setLoading(false);
    }
    loadFirstPage();
  }, []);

  // Load More: busca a próxima página de artistas
  const loadMoreArtists = async () => {
    if (loadingArtists) return;
    setLoadingArtists(true);
    const supabase = createClientSupabaseClient();
    const start = artists.length;
    const { data } = await supabase
      .from("artists")
      .select("*")
      .order("monthly_listeners", { ascending: false })
      .range(start, start + ARTISTS_PAGE_SIZE - 1);

    if (data) {
      setArtists((prev) => [...prev, ...(data as Artist[])]);
      setHasMoreArtists(data.length === ARTISTS_PAGE_SIZE);
    }
    setLoadingArtists(false);
  };

  const filteredTabs = tabs.filter((tab) => {
    const matchSearch =
      tab.song.toLowerCase().includes(search.toLowerCase()) ||
      tab.artist.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "All" || tab.difficulty === difficulty;
    const matchKey = key === "All" || tab.key_sig === key;
    return matchSearch && matchDifficulty && matchKey;
  });

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.genre.toLowerCase().includes(search.toLowerCase())
  );

  const formatListeners = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Browse</h1>
        <p className="text-brand-muted">Search through our collection of verified guitar tabs and artists.</p>
      </div>

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <SearchBar onSearch={setSearch} initialValue={initialQuery} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl transition-colors ${
            showFilters ? "bg-brand-accent text-black" : "bg-white/[0.06] text-brand-muted hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1 max-w-xs">
        <button
          onClick={() => setView("tabs")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
            view === "tabs" ? "bg-brand-accent text-black" : "hover:bg-white/10"
          }`}
        >
          Tabs
        </button>
        <button
          onClick={() => setView("artists")}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
            view === "artists" ? "bg-brand-accent text-black" : "hover:bg-white/10"
          }`}
        >
          Artists
        </button>
      </div>

      {showFilters && view === "tabs" && (
        <div className="bg-[#1A1A1A] rounded-xl p-5 border border-white/[0.06] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Filters</h3>
            <button
              onClick={() => { setDifficulty("All"); setKey("All"); }}
              className="text-xs text-brand-accent hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-brand-muted uppercase tracking-wider">Difficulty</label>
              <div className="flex gap-2 flex-wrap">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      difficulty === d
                        ? "bg-brand-accent text-black"
                        : "bg-white/[0.06] text-brand-muted hover:bg-white/10"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-brand-muted uppercase tracking-wider">Key</label>
              <div className="flex gap-2 flex-wrap">
                {keys.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKey(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      key === k
                        ? "bg-brand-accent text-black"
                        : "bg-white/[0.06] text-brand-muted hover:bg-white/10"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-brand-muted">
          <p>Loading...</p>
        </div>
      ) : view === "tabs" ? (
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            {filteredTabs.length} {filteredTabs.length === 1 ? "result" : "results"} found
          </p>
          {filteredTabs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTabs.map((tab) => (
                <TabCard key={tab.id} {...tab} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-brand-muted space-y-3">
              <p className="text-lg">No tabs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-brand-muted">
            {filteredArtists.length} {filteredArtists.length === 1 ? "artist" : "artists"} found
          </p>
          {filteredArtists.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArtists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.slug}`}
                    className="block bg-[#1A1A1A] rounded-2xl p-5 border border-white/[0.06] hover:bg-[#242424] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <ArtistAvatar name={artist.name} slug={artist.slug} imageUrl={artist.image_url} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold group-hover:text-brand-accent transition-colors truncate">
                          {artist.name}
                        </h3>
                        <p className="text-xs text-brand-muted">{artist.genre}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-brand-muted">
                          <span className="flex items-center gap-1">
                            <Music size={12} /> {artist.tab_count} tabs
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {formatListeners(artist.monthly_listeners)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-brand-muted group-hover:text-brand-accent transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More */}
              {hasMoreArtists && !search.trim() && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMoreArtists}
                    disabled={loadingArtists}
                    className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/10 text-white font-bold px-8 py-3 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loadingArtists && <Loader2 size={16} className="animate-spin" />}
                    Load more artists
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-brand-muted space-y-3">
              <p className="text-lg">No artists found</p>
              <p className="text-sm">Try adjusting your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
