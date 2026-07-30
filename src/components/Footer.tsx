import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-white font-display font-bold tracking-tight">ChordProof</p>
            <p className="text-brand-muted text-xs">
              © 2024 ChordProof. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-brand-muted">
            <Link href="/about" className="hover:text-white transition-colors duration-200">About</Link>
            <Link href="/legal" className="hover:text-white transition-colors duration-200">Legal</Link>
            <Link href="/browse" className="hover:text-white transition-colors duration-200">Browse</Link>
            <Link href="/request" className="hover:text-white transition-colors duration-200">Request</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
