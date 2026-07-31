"use client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";
import { Filter, SlidersHorizontal, X } from "lucide-react";

const allTabs = [
  { song: "Wonderwall", artist: "Oasis", difficulty: "Beginner" as const, isVerified: true, key_sig: "F#m" },
  { song: "Hotel California", artist: "Eagles", difficulty: "Advanced" as const, isVerified: true, key_sig: "Bm" },
  { song: "Perfect", artist: "Ed Sheeran", difficulty: "Beginner" as const, isVerified: true, key_sig: "Ab" },
  { song: "Hallelujah", artist: "Jeff Buckley", difficulty: "Intermediate" as const, isVerified: true, key_sig: "C" },
  { song: "Creep", artist: "Radiohead", difficulty: "Beginner" as const, isVerified: true, key_sig: "G" },
  { song: "Stairway to Heaven", artist: "Led Zeppelin", difficulty: "Advanced" as const, isVerified: true, key_sig: "Am" },
  { song: "Nothing Else Matters", artist: "Metallica", difficulty: "Intermediate" as const, isVerified: true, key_sig: "Em" },
  { song: "Knockin' on Heaven's Door", artist: "Bob Dylan", difficulty: "Beginner" as const, isVerified: true, key_sig: "G" },
  { song: "Sweet Child O' Mine", artist: "Guns N' Roses", difficulty: "Advanced" as const, isVerified: true, key_sig: "D" },
  { song: "Tears in Heaven", artist: "Eric Clapton", difficulty: "Intermediate" as const, isVerified: true, key_sig: "A" },
  { song: "Come as You Are", artist: "Nirvana", difficulty: "Beginner" as const, isVerified: true, key_sig: "F#m" },
  { song: "Under the Bridge", artist: "Red Hot Chili Peppers", difficulty: "Intermediate" as const, isVerified: true, key_sig: "F" },
  { song: "Smoke on the Water", artist: "Deep Purple", difficulty: "Beginner" as const, isVerified: true, key_sig: "G" },
  { song: "Back in Black", artist: "AC/DC", difficulty: "Intermediate" as const, isVerified: true, key_sig: "E" },
  { song: "Bohemian Rhapsody", artist: "Queen", difficulty: "Advanced" as const, isVerified: true, key_sig: "Bb" },
  { song: "Imagine", artist: "John Lennon", difficulty: "Beginner" as const, isVerified: true, key_sig: "C" },
  { song: "Yesterday", artist: "The Beatles", difficulty: "Beginner" as const, isVerified: true, key_sig: "F" },
  { song: "Purple Rain", artist: "Prince", difficulty: "Intermediate" as const, isVerified: true, key_sig: "A" },
  { song: "Wish You Were Here", artist: "Pink Floyd", difficulty: "Intermediate" as const, isVerified: true, key_sig: "G" },
  { song: "Californication", artist: "Red Hot Chili Peppers", difficulty: "Intermediate" as const, isVerified: true, key_sig: "Am" },
];

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const keys = ["All", "C", "D", "E", "F", "G", "A", "B", "Am", "Em", "F#m", "Bm", "Bb"];

export default function Browse() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [key, setKey] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = allTabs.filter((tab) => {
    const matchSearch =
      tab.song.toLowerCase().includes(search.toLowerCase()) ||
      tab.artist.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "All" || tab.difficulty === difficulty;
    const matchKey = key === "All" || tab.key_sig === key;
    return matchSearch && matchDifficulty && matchKey;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          Browse Tabs
        </h1>
        <p className="text-brand-muted">
          Search through our collection of verified guitar tabs.
        </p>
      </div>

      {/* Search + Filter Toggle */}
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

      {/* Filters */}
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

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm text-brand-muted">
          {filtered.length} {filtered.length === 1 ? "result" : "results"} found
        </p>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tab) => (
              <TabCard key={`${tab.artist}-${tab.song}`} {...tab} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-brand-muted space-y-3">
            <p className="text-lg">No tabs found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
