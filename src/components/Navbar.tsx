"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Music, Sun, Moon } from "lucide-react";
import SearchBar from "./SearchBar";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import GamificationBadge from "./GamificationBadge";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header style={{ background: "var(--c-nav-bg)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }} className="sticky top-0 z-50 border-b border-[var(--c-hairline)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Music className="text-brand-gold w-7 h-7" />
            <span className="text-xl font-bold">ChordProof</span>
          </Link>

          {!isHome && (
            <div className="flex-1 max-w-xl hidden sm:block">
              <SearchBar />
            </div>
          )}

          <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* "Learn" vem antes de Browse: é o começo de quem não sabe tocar,
                e o site tinha ferramenta de sobra e nenhum ponto de entrada.
                "Tuner" vem logo depois: afinar é a PRIMEIRA coisa que qualquer
                pessoa faz, antes de aprender um acorde — e "guitar tuner" é uma
                busca própria, feita por quem ainda não lê cifra nenhuma. */}
            <Link href="/learn" className="hidden md:inline hover:text-brand-gold transition-colors">Learn</Link>
            <Link href="/tuner" className="hidden md:inline hover:text-brand-gold transition-colors">Tuner</Link>
            <Link href="/browse" className="hidden md:inline hover:text-brand-gold transition-colors">Browse</Link>
            <Link href="/request" className="hidden md:inline hover:text-brand-gold transition-colors">Request</Link>
            <Link href="/about" className="hidden md:inline hover:text-brand-gold transition-colors">About</Link>
            <GamificationBadge />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-full bg-[var(--c-overlay-soft)]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {status === "loading" ? (
              <div className="w-9 h-9 rounded-full bg-[var(--c-overlay-soft)] animate-pulse" aria-hidden />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-brand-accent to-emerald-600 flex items-center justify-center text-sm font-black text-black hover:brightness-110 transition"
                  title={user.name || user.email || "Account"}
                  aria-haspopup="menu"
                  aria-expanded={open}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (user.name || user.email || "?").charAt(0).toUpperCase()
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--c-bg-elevated)] border border-[var(--c-hairline)] shadow-[var(--c-shadow)] overflow-hidden py-1" role="menu">
                    <div className="px-3 py-2 border-b border-[var(--c-hairline)]">
                      <p className="text-sm font-bold truncate">{user.name || "Account"}</p>
                      <p className="text-xs text-[var(--c-text-tertiary)] truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">Overview</Link>
                    <Link href="/profile?tab=tabs" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">My Tabs</Link>
                    <Link href="/setlists" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">Setlists</Link>
                    <Link href="/profile?tab=settings" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">Settings</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)] border-t border-[var(--c-hairline)]" role="menuitem">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" className="px-4 py-2 rounded-full bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] text-sm font-bold hover:scale-105 transition">Sign In</Link>
            )}
          </nav>
        </div>

        {mobileOpen && (
          <nav className="md:hidden mt-3 flex flex-col gap-1 border-t border-[var(--c-hairline)] pt-3">
            <Link href="/learn" className="px-2 py-2 text-sm hover:text-brand-gold">Learn</Link>
            <Link href="/tuner" className="px-2 py-2 text-sm hover:text-brand-gold">Tuner</Link>
            <Link href="/browse" className="px-2 py-2 text-sm hover:text-brand-gold">Browse</Link>
            <Link href="/request" className="px-2 py-2 text-sm hover:text-brand-gold">Request</Link>
            <Link href="/about" className="px-2 py-2 text-sm hover:text-brand-gold">About</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] transition-colors"
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
