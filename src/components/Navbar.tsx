"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music } from "lucide-react";
import SearchBar from "@/components/SearchBar";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Music className="text-brand-gold w-7 h-7" />
            <span className="text-xl font-bold">ChordProof</span>
          </Link>

          {/* Search Bar - desktop (oculta na home, que já tem a grande no hero) */}
          {!isHome && (
            <div className="flex-1 max-w-xl hidden sm:block">
              <SearchBar />
            </div>
          )}

          {/* Nav Links */}
          <nav className="flex items-center gap-4 shrink-0">
            <Link href="/browse" className="hover:text-brand-gold transition-colors">Browse</Link>
            <Link href="/request" className="hover:text-brand-gold transition-colors">Request</Link>
            <Link href="/about" className="hover:text-brand-gold transition-colors">About</Link>
            <Link href="/signin" className="bg-brand-gold text-black px-4 py-2 rounded-full font-bold hover:scale-105 transition">
              Sign In
            </Link>
          </nav>
        </div>

        {/* Search Bar - mobile (abaixo, em telas pequenas) */}
        {!isHome && (
          <div className="sm:hidden mt-3">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
