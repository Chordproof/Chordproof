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
                  <div
                    role="menu"
                    style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: "var(--c-card)", border: "1px solid var(--c-hairline)", borderRadius: 12, padding: 6, minWidth: 210, zIndex: 60, boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
                  >
                    <div style={{ padding: "8px 12px" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{user.name || "Account"}</p>
                      <p style={{ fontSize: 11, color: "var(--c-text-tertiary)", wordBreak: "break-all" }}>{user.email}</p>
                    </div>
                    <div style={{ height: 1, background: "var(--c-hairline)", margin: "4px 0" }} />
                    <Link href="/profile" role="menuitem" className="flex items-center gap-2" style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13 }}>
                      <UserIcon size={15} /> Overview
                    </Link>
                    <Link href="/profile?tab=tabs" role="menuitem" className="flex items-center gap-2" style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13 }}>
                      <Bookmark size={15} /> My Tabs
                    </Link>
                    <Link href="/setlists" role="menuitem" className="flex items-center gap-2" style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13 }}>
                      <ListMusic size={15} /> My Setlists
                    </Link>
                    <Link href="/profile?tab=settings" role="menuitem" className="flex items-center gap-2" style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13 }}>
                      <Settings size={15} /> Settings
                    </Link>
                    <div style={{ height: 1, background: "var(--c-hairline)", margin: "4px 0" }} />
                    <button
                      role="menuitem"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 w-full text-left"
                      style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13, color: "#f87171" }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/signin" className="bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full font-bold hover:scale-105 transition">
                Sign In
              </Link>
            )}
          </nav>
        </div>

        {!isHome && (
          <div className="sm:hidden mt-3">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
