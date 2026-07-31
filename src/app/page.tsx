"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import { CheckCircle, Users, Music, ArrowRight, Search, Loader2 } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import Link from "next/link";

interface SearchResult {
  type: "tab" | "artist";
  label: string;
  subtitle: string;
  href: string;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Busca ao vivo
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
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

      const combined: SearchResult[] = [];

      if (artistsResult.data) {
        artistsResult.data.forEach((a) => {
          combined.push({
            type: "artist",
            label: a.name,
            subtitle: "Artist",
            href: `/artist/${a.slug}`,
          });
        });
      }

      if (tabsResult.data) {
        tabsResult.data.forEach((t) => {
          combined.push({
            type: "tab",
            label: t.song,
            subtitle: t.artist,
            href: `/tab/${slugify(t.artist)}/${slugify(t.song)}`,
          });
        });
      }

      setResults(combined.slice(0, 8));
      setShowDropdown(combined.length > 0);
      setSearching(false);
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q: string) => {
    setShowDropdown(false);
    router.push(`/browse?q=${encodeURIComponent(q)}`);
  };

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
        <div className="max-w-3xl mx-auto relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={24} />
            <input
              type="text"
              placeholder="Search songs, artists, or chords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(query);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-4 text-lg text-white placeholder-brand-muted focus:outline-none focus:border-brand-gold transition"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted animate-spin" size={20} />
            )}
          </div>

          {/* Dropdown de resultados ao vivo */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50">
              {results.map((r, i) => (
                <Link
                  key={`${r.type}-${i}`}
                  href={r.href}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.06] transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    r.type === "artist"
                      ? "bg-gradient-to-br from-brand-gold to-yellow-700 text-black"
                      : "bg-white/[0.08] text-brand-muted"
                  }`}>
                    {r.type === "artist" ? (
                      <Users size={16} />
                    ) : (
                      <Music size={16} />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-bold text-sm group-hover:text-brand-gold transition-colors truncate">
                      {r.label}
                    </p>
                    <p className="text-xs text-brand-muted">{r.subtitle}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted bg-white/[0.04] px-2 py-1 rounded">
                    {r.type}
                  </span>
                </Link>
              ))}
              <Link
                href={`/browse?q=${encodeURIComponent(query)}`}
                onClick={() => setShowDropdown(false)}
                className="block text-center py-3 text-sm text-brand-gold hover:bg-white/[0.04] transition-colors border-t border-white/[0.06] font-bold"
              >
                View all results
              </Link>
            </div>
          )}
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

      {/* Verified Tabs Section */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Verified Tabs of the Day</h2>
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

      {/* CTA Section */}
      <section className="bg-[#1A1A1A] rounded-3xl p-12 text-center space-y-6 border border-white/5">
        <h2 className="text-3xl font-bold">Can't find what you're looking for?</h2>
        <p className="text-brand-muted">Our community and pro verifiers are ready to help.</p>
        <Link href="/request" className="inline-block bg-brand-gold text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
          Request a Tab
        </Link>
      </section>
    </div>
  );
}
