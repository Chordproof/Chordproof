import Link from "next/link";
import { Music } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Music className="text-brand-gold" size={28} />
          <span>ChordProof</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/browse" className="text-brand-muted hover:text-white transition">Browse</Link>
          <Link href="/request" className="text-brand-muted hover:text-white transition">Request</Link>
          <Link href="/about" className="text-brand-muted hover:text-white transition">About</Link>
          <Link
            href="/auth/signin"
            className="bg-brand-gold text-black px-5 py-2 rounded-full font-bold hover:scale-105 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
