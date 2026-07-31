"use client";
import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import { SlidersHorizontal } from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const keys = ["All", "C", "D", "E", "F", "G", "A", "B", "Am", "Em", "F#m", "Bm", "Bb"];

interface Tab {
  id: string;
  song: string;
  artist: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean;
  key_sig: string;
}

export default function Browse() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [key, setKey] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTabs() {
      const supabase = createClientSupabaseClient();
      const { data, error } = await supabase
        .from("tabs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tabs:", error);
        setLoading(false);
        return;
      }

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

  const filtered = tabs.filter((tab) => {
    const matchSearch =
      tab.song.toLowerCase().includes(search.toLowerCase()) ||
      tab.artist.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "All" || tab.difficulty === difficulty;
    const matchKey = key === "All" || tab.key_sig === key;
    return matchSearch && matchDifficulty && matchKey;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Browse Tabs</h1>
        <p className="text-brand-muted">Search through our collection of verified guitar tabs.</p>
      </div>

      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <SearchBar />
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

      {showFilters && (
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

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-brand-muted">
            <p>Loading tabs...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-brand-muted">
              {filtered.length} {filtered.length === 1 ? "result" : "results"} found
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((tab) => (
                  <TabCard key={tab.id} {...tab} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-brand-muted space-y-3">
                <p className="text-lg">No tabs found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
