import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4">ChordProof</h4>
            <p className="text-sm text-gray-400">Verified tabs for every musician.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Explore</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/browse" className="hover:text-amber-400">Browse</Link>
              <Link href="/request" className="hover:text-amber-400">Request</Link>
              <Link href="/pricing" className="hover:text-amber-400">Pricing</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/about" className="hover:text-amber-400">About</Link>
              <Link href="/contact" className="hover:text-amber-400">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-amber-400">Terms</Link>
              <Link href="/privacy" className="hover:text-amber-400">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          ChordProof © 2026. Verified tabs for every musician.
        </div>
      </div>
    </footer>
  );
}
