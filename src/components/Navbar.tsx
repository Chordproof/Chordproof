"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import GamificationBadge from "@/components/GamificationBadge";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header style={{ background: "var(--c-nav-bg)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }} className="sticky top-0 z-50 border-b border-[var(--c-hairline)]">
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
          <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/browse" className="hover:text-brand-gold transition-colors">Browse</Link>
            <Link href="/request" className="hover:text-brand-gold transition-colors">Request</Link>
            <Link href="/about" className="hover:text-brand-gold transition-colors">About</Link>
            <GamificationBadge />
            <ThemeToggle />
            <Link href="/signin" className="bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full font-bold hover:scale-105 transition">
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
