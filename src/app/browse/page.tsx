"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import ArtistAvatar from "@/components/ArtistAvatar";
import { SlidersHorizontal, Music, Users, ChevronRight, Loader2, ChevronDown } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import Link from "next/link";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const keys = ["All", "C", "D", "E", "F", "G", "A", "B", "Am", "Em", "F#m", "Bm", "Bb"];
const ARTISTS_PAGE_SIZE = 50;
const ALL = "All";

// Gêneros fixos — mesma barra da home
const MAIN_GENRES = ["Rock", "Pop", "Sertanejo", "MPB", "Gospel"];
const EXTRA_GENRES = ["Jazz", "Blues", "Funk", "Soul", "Reggae", "Eletrônica", "Hip-Hop", "Country", "Metal", "Indie"];

interface Tab {
  id: string;
  song: string;
  artist: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean;
  key_sig: string;
  genre?: string;
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
  const [searchedArtists, setSearchedArtists] = useState<Artist[] | null>(null);
  const [searchingArtists, setSearchingArtists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const [view, setView] = useState<"tabs" | "artists">("tabs");
  const [initialQuery, setInitialQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Barra de estilos
  const [selectedGenre, setSelectedGenre] = useState<string>(ALL);
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const moreGenresRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Ler parâmetros da URL (q, view e genre compartilhado)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const v = params.get("view");
    const g = params.get("genre");
    setInitialQuery(q);
    if (q) setSearch(q);
    if (v === "artists") setView("artists");
    if (g) setSelectedGenre(g);
  }, []);

  // Clicar num gênero: filtra e persiste ?genre= na URL (compartilhável)
  const selectGenre = (g: string) => {
    setShowMoreGenres(false);
    setSelectedGenre(g);
    if (g === ALL) {
      router.replace("/browse", { scroll: false });
    } else {
      router.replace(`/browse?genre=${encodeURIComponent(g)}`, { scroll: false });
    }
  };

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
            genre: t.genre,
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

  // Busca de artistas DIRETO NO BANCO
  useEffect(() => {
    if (view !== "artists" || !search.trim()) {
      setSearchedArtists(null);
      setSearchingArtists(false);
      return;
    }

    const q = search.trim();
    setSearchingArtists(true);

    const timer = setTimeout(async () => {
      const supabase = createClientSupabaseClient();
      const { data } = await supabase
        .from("artists")
        .select("*")
        .or(`name.ilike.%${q}%,genre.ilike.%${q}%`)
        .order("monthly_listeners", { ascending: false })
        .limit(100);

      if (data) setSearchedArtists(data as Artist[]);
      setSearchingArtists(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [view, search]);

  // Carregar a próxima página de artistas (scroll infinito)
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

  // Scroll infinito automático (desativado durante busca ou filtro de gênero)
  useEffect(() => {
    if (!hasMoreArtists || search.trim() || selectedGenre !== ALL) return;
    const el = sentinelRef.current;
    if (!el) return;

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
  }, [hasMoreArtists, search, loadingArtists, artists.length, selectedGenre]);

  // Fechar dropdown "More" ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreGenresRef.current && !moreGenresRef.current.contains(e.target as Node)) {
        setShowMoreGenres(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredTabs = tabs.filter((tab) => {
    const matchSearch =
      tab.song.toLowerCase().includes(search.toLowerCase()) ||
      tab.artist.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "All" || tab.difficulty === difficulty;
    const matchKey = key === "All" || tab.key_sig === key;
    const matchGenre = selectedGenre === ALL || tab.genre === selectedGenre;
    return matchSearch && matchDifficulty && matchKey && matchGenre;
  });

  // Lista exibida: resultados do banco quando buscando, senão os carregados
  const baseArtists = searchedArtists !== null ? searchedArtists : artists;
  const filteredArtists = baseArtists.filter((a) =>
    selectedGenre === ALL || a.genre === selectedGenre
  );

  const formatListeners = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const genrePillClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
      active
        ? "bg-brand-accent text-black"
        : "bg-white/[0.06] text-brand-muted hover:bg-white/10 hover:text-white"
    }`;

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

      {/* Barra de estilos musicais — filtro persistido na URL */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => selectGenre(ALL)}
          className={genrePillClass(selectedGenre === ALL)}
        >
          All
        </button>

        {MAIN_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => selectGenre(g)}
            className={genrePillClass(selectedGenre === g)}
          >
            {g}
          </button>
        ))}

        <div className="relative" ref={moreGenresRef}>
          <button
            onClick={() => setShowMoreGenres(!showMoreGenres)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              showMoreGenres || (selectedGenre !== ALL && !MAIN_GENRES.includes(selectedGenre))
                ? "bg-brand-accent text-black"
                : "bg-white/[0.06] text-brand-muted hover:bg-white/10 hover:text-white"
            }`}
          >
            More <ChevronDown size={14} className={`transition-transform ${showMoreGenres ? "rotate-180" : ""}`} />
          </button>

          {showMoreGenres && (
            <div className="absolute left-0 top-full mt-2 bg-[#1A1A1A] border border-white/[0.06] rounded-2xl shadow-2xl p-3 z-50 min-w-[220px]">
              <div className="grid grid-cols-2 gap-2">
                {EXTRA_GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => selectGenre(g)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-left whitespace-nowrap transition-colors ${
                      selectedGenre === g
                        ? "bg-brand-accent text-black"
                        : "text-brand-muted hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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
          <div className="flex items-center gap-3">
            <p className="text-sm text-brand-muted">
              {searchingArtists ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Searching artists...
                </span>
              ) : (
                <>
                  {filteredArtists.length} {filteredArtists.length === 1 ? "artist" : "artists"} found
                </>
              )}
            </p>
          </div>
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

              {!search.trim() && selectedGenre === ALL && hasMoreArtists && (
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

              {!search.trim() && selectedGenre === ALL && !hasMoreArtists && (
                <p className="text-center text-xs text-brand-muted/60 py-4">
                  You've reached the end of the artist list.
                </p>
              )}
            </>
          ) : (
            !searchingArtists && (
              <div className="text-center py-16 text-brand-muted space-y-3">
                <p className="text-lg">No artists found</p>
                <p className="text-sm">Try adjusting your search</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
