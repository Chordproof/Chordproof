"use client";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface SearchBarProps {
  large?: boolean;
}

export default function SearchBar({ large }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search any song..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => setIsOpen(query.length > 0)}
          className={`w-full bg-gray-900 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition ${
            large ? "py-5 px-12 text-xl" : "py-3 px-10 text-base"
          }`}
        />
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl">
          {query ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Type to search songs, artists, and more...
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Start typing to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
