import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-muted">
        <p>© 2024 ChordProof. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/legal" className="hover:text-white transition">Legal</Link>
          <Link href="/browse" className="hover:text-white transition">Browse</Link>
        </div>
      </div>
    </footer>
  );
}
