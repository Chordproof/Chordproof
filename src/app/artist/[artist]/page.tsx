"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Music, Users, Globe, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import TabCard from "@/components/TabCard";

interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string;
  country: string;
  bio: string;
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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClientSupabaseClient();

      // Buscar artista
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

      // Buscar tabs desse artista
      const { data: tabsData } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .order("created_at", { ascending: false });

      if (active && tabsData) {
        setTabs(
          tabsData.map((t) => ({
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
        <Link href="/browse" className="inline-block mt-2 bg-brand-accent text-black px-6 py-3 rounded-full font-bold hover:brightness-110 transition-all duration-200">
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

      {/* Artist Header */}
      <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-10 border border-white/[0.06]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-brand-accent to-emerald-700 flex items-center justify-center text-5xl md:text-6xl font-black shrink-0 shadow-2xl">
            {artist.name.charAt(0)}
          </div>

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

            {/* Stats */}
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

      {/* Tabs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">
            {artist.name} Tabs
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
