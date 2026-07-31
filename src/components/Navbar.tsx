import Link from "next/link";
import { Music } from "lucide-react";
import GamificationBadge from "./GamificationBadge";

export default function Navbar() {
  return (
    <nav className="border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 text-lg font-display font-bold tracking-tight">
            <Music className="text-brand-accent" size={24} />
            <span>ChordProof</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-6 text-sm">
            <GamificationBadge />
            <Link href="/browse" className="text-brand-muted hover:text-white transition-colors duration-200 hidden sm:inline">
              Browse
            </Link>
            <Link href="/request" className="text-brand-muted hover:text-white transition-colors duration-200 hidden sm:inline">
              Request
            </Link>
            <Link href="/about" className="text-brand-muted hover:text-white transition-colors duration-200 hidden sm:inline">
              About
            </Link>
            <Link
              href="/auth/signin"
              className="bg-brand-accent text-black px-4 md:px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
