"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, User as UserIcon, LogOut, Bookmark, Settings, ListMusic } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import SearchBar from "@/components/SearchBar";
import GamificationBadge from "@/components/GamificationBadge";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const user = session?.user;
  const initial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

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
                e o site tinha ferramenta de sobra e nenhum ponto de entrada. */}
            <Link href="/learn" className="hover:text-brand-gold transition-colors">Learn</Link>
            {/* Tuner logo depois de Learn: afinar é a primeira coisa que se faz,
                antes de aprender acorde, e "guitar tuner" é busca própria de quem
                ainda não lê cifra nenhuma. */}
            <Link href="/tuner" className="hover:text-brand-gold transition-colors">Tuner</Link>
            <Link href="/browse" className="hover:text-brand-gold transition-colors">Browse</Link>
            <Link href="/request" className="hover:text-brand-gold transition-colors">Request</Link>
            <Link href="/about" className="hover:text-brand-gold transition-colors">About</Link>
            <GamificationBadge />
            <ThemeToggle />

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
                    initial
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--c-bg-elevated)] border border-[var(--c-hairline)] shadow-[var(--c-shadow)] overflow-hidden py-1" role="menu">
                    <div className="px-3 py-2 border-b border-[var(--c-hairline)]">
                      <p className="text-sm font-bold truncate">{user.name || "Account"}</p>
                      <p className="text-xs text-[var(--c-text-tertiary)] truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">
                      <UserIcon size={14} /> Overview
                    </Link>
                    <Link href="/profile?tab=tabs" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">
                      <Bookmark size={14} /> My Tabs
                    </Link>
                    <Link href="/setlists" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">
                      <ListMusic size={14} /> Setlists
                    </Link>
                    <Link href="/profile?tab=settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)]" role="menuitem">
                      <Settings size={14} /> Settings
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-[var(--c-overlay-soft)] border-t border-[var(--c-hairline)]" role="menuitem">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" className="px-4 py-2 rounded-full bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] text-sm font-bold hover:scale-105 transition">Sign In</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
