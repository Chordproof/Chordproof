"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music, Users, Globe, Flame, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import TabCard from "@/components/TabCard";
import ArtistAvatar from "@/components/ArtistAvatar";
import GenreBar, { ALL, MAIN_GENRES, EXTRA_GENRES } from "@/components/GenreBar";
import GenreBadge from "@/components/GenreBadge";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string;
  country: string;
  bio: string;
  image_url: string | null;
  tab_count: number;
  monthly_listeners: number;
}

interface Tab {
  id: string;
  song: string;
  artist: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean;
  key_sig: string;
  views: number;
}

const countryNames: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  UK: "United Kingdom",
  AU: "Australia",
  PR: "Puerto Rico",
  BB: "Barbados",
  CO: "Colombia",
  ES: "Spain",
  MX: "Mexico",
  AR: "Argentina",
  PA: "Panama",
  CU: "Cuba",
};

export default function ArtistPage({ params }: { params: { artist: string } }) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Barra de estilos — navega para a Home com ?genre=
  const [selectedGenre, setSelectedGenre] = useState<string>(ALL);

  const router = useRouter();

  // Ler ?genre da URL (filtro compartilhado via link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("genre");
    if (g) setSelectedGenre(g);
  }, []);

  // Título + meta description (SEO): artista + gênero
  useEffect(() => {
    if (artist) {
      document.title = `${artist.name} | ${artist.genre} Tabs | ChordProof`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute(
          "content",
          `Browse verified ${artist.name} guitar tabs (${artist.genre}) on ChordProof. Accurate chords, no paywalls.`
        );
      }
    }
  }, [artist]);

  // Sem ?genre na URL, destaca o gênero do próprio artista
  useEffect(() => {
    if (!artist) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get("genre") && selectedGenre === ALL) {
      const g = artist.genre;
      if (g && (MAIN_GENRES.includes(g) || EXTRA_GENRES.includes(g))) setSelectedGenre(g);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist]);

  // Clicar num gênero: navega para a Home com o filtro aplicado (Browse → Home)
  const selectGenre = (g: string) => {
    if (g === ALL) {
      router.push("/");
    } else {
      router.push(`/?genre=${encodeURIComponent(g)}`);
    }
  };

  // Clean all: remove o gênero destacado e volta para a Home limpa
  const cleanAll = () => {
    setSelectedGenre(ALL);
    router.push("/", { scroll: false });
  };

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClientSupabaseClient();

      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", params.artist)
        .maybeSingle();

      if (!active) return;

      if (artistError || !artistData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArtist(artistData as Artist);

      // Tabs do artista ordenadas pelas mais vistas (campo views)
      const { data: tabsData } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .order("views", { ascending: false });

      if (active && tabsData) {
        setTabs(
          tabsData.map((t) => ({
            id: t.id,
            song: t.song,
            artist: t.artist,
            difficulty: t.difficulty,
            isVerified: t.is_verified,
            key_sig: t.key_sig,
            views: t.views || 0,
          }))
        );
      }

      // Artistas relacionados: mesmo gênero, exclui o atual, top 6 por popularidade
      const { data: relatedData } = await supabase
        .from("artists")
        .select("*")
        .eq("genre", artistData.genre)
        .neq("slug", params.artist)
        .order("monthly_listeners", { ascending: false })
        .limit(6);

      if (active && relatedData) setRelatedArtists(relatedData as Artist[]);

      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [params.artist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-brand-muted">
        <Loader2 className="animate-spin mr-2" size={20} />
        <p>Loading artist...</p>
      </div>
    );
  }

  if (notFound || !artist) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-2xl font-display font-bold">Artist not found</p>
        <p className="text-brand-muted">This artist isn't in our database yet.</p>
        <Link
          href="/browse"
          className="inline-block mt-2 bg-brand-accent text-black px-6 py-3 rounded-full font-bold hover:brightness-110 transition-all duration-200"
        >
          Browse Artists
        </Link>
      </div>
    );
  }

  const formatListeners = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const popularTabs = tabs.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2 items-center">
          <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
          <li>/</li>
          <li className="text-white/60">{artist.name}</li>
        </ol>
      </nav>

      {/* Barra de estilos + selo do gênero ativo + Clean all */}
      <div className="flex flex-wrap items-center gap-2">
        <GenreBar selectedGenre={selectedGenre} onSelect={selectGenre} />
        {selectedGenre !== ALL && (
          <>
            <GenreBadge genre={selectedGenre} onClear={cleanAll} />
            <button
              onClick={cleanAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted bg-white/[0.06] px-3 py-1 rounded-full border border-white/[0.06] hover:bg-brand-accent/10 hover:text-brand-accent transition-colors"
            >
              <RotateCcw size={12} />
              Clean all
            </button>
          </>
        )}
      </div>

      {/* Artist Header */}
      <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-10 border border-white/[0.06]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <ArtistAvatar name={artist.name} slug={artist.slug} imageUrl={artist.image_url} size="lg" />

          <div className="text-center md:text-left flex-1 space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              {artist.name}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-brand-accent/10 text-brand-accent px-4 py-1.5 rounded-full text-sm font-bold">
                {artist.genre}
              </span>
              <span className="bg-white/[0.06] px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <Globe size={14} className="text-brand-muted" />
                {countryNames[artist.country] || artist.country}
              </span>
            </div>

            {artist.bio && (
              <p className="text-brand-muted leading-relaxed max-w-2xl">
                {artist.bio}
              </p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Music size={18} className="text-brand-accent" />
                <div>
                  <p className="text-xl font-bold">{artist.tab_count}</p>
                  <p className="text-xs text-brand-muted">Tabs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-brand-accent" />
                <div>
                  <p className="text-xl font-bold">{formatListeners(artist.monthly_listeners)}</p>
                  <p className="text-xs text-brand-muted">Monthly Listeners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Tabs — 3 mais acessadas (por views) */}
      {popularTabs.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Flame size={22} className="text-brand-accent" />
            <h2 className="text-2xl font-display font-bold">Popular Tabs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {popularTabs.map((tab, index) => (
              <Link
                key={tab.id}
                href={`/tab/${artist.slug}/${slugify(tab.song)}`}
                className="flex items-center gap-4 bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#242424] transition-all duration-200 group border border-white/[0.03]"
              >
                <span className="text-2xl font-black text-brand-muted w-8 text-right shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate group-hover:text-brand-accent transition-colors">{tab.song}</p>
                  <p className="text-sm text-brand-muted truncate">
                    {tab.difficulty} · Key {tab.key_sig} · {tab.views.toLocaleString()} views
                  </p>
                </div>
                {tab.isVerified && (
                  <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded font-bold shrink-0">
                    ✓
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Tabs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">
            All {artist.name} Tabs
          </h2>
          <span className="text-sm text-brand-muted">
            {tabs.length} {tabs.length === 1 ? "tab" : "tabs"} available
          </span>
        </div>

        {tabs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabs.map((tab) => (
              <TabCard key={tab.id} {...tab} />
            ))}
          </div>
        ) : (
          <div className="bg-[#1A1A1A] rounded-2xl p-12 text-center border border-white/[0.06] space-y-3">
            <Music size={40} className="mx-auto text-brand-muted opacity-50" />
            <p className="text-lg font-bold">No tabs available yet</p>
            <p className="text-brand-muted text-sm">
              We're working on adding {artist.name} tabs to our library.
            </p>
          </div>
        )}
      </div>

      {/* Related Artists — mesmo gênero, com ?genre= no link */}
      {relatedArtists.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Users size={22} className="text-brand-accent" />
            <h2 className="text-2xl font-display font-bold">Related Artists</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {relatedArtists.map((ra) => (
              <Link
                key={ra.id}
                href={`/artist/${ra.slug}?genre=${encodeURIComponent(artist.genre)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group"
              >
                <ArtistAvatar name={ra.name} slug={ra.slug} imageUrl={ra.image_url} size="md" />
                <p className="text-sm font-bold text-center truncate w-full group-hover:text-brand-accent transition-colors">
                  {ra.name}
                </p>
                <p className="text-[10px] text-brand-muted">{ra.tab_count} tabs</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Browse */}
      <div className="text-center pt-4">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Browse
        </Link>
      </div>
    </div>
  );
}
