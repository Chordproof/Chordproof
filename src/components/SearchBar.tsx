"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  large?: boolean;
  onSearch?: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({ large, onSearch, initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  // Busca ao vivo: a cada tecla digitada, dispara o filtro
  const handleChange = (value: string) => {
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  // Enter: navega para /browse?q= (usado na home, onde não há onSearch)
  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    if (!onSearch) {
      router.push(`/browse?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className={`relative ${large ? "w-full" : "w-full max-w-md"}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={large ? 24 : 20} />
      <input
        type="text"
        placeholder="Search songs, artists, or chords..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        className={`w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 text-white placeholder-brand-muted focus:outline-none focus:border-brand-accent transition ${
          large ? "py-4 text-lg" : "py-3 text-sm"
        }`}
      />
    </div>
  );
}
