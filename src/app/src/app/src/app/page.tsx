import { CheckCircle, Users, Music, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Play it <span className="text-amber-400">Right.</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Access thousands of verified guitar tabs. No paywalls, no popups, just music.
        </p>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search any song..."
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-5 px-6 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-800">
        <div className="flex items-center justify-center gap-4">
          <CheckCircle className="text-amber-400 w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">12,400+</p>
            <p className="text-gray-400 text-sm uppercase tracking-widest">Verified Tabs</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Users className="text-amber-400 w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">85,000</p>
            <p className="text-gray-400 text-sm uppercase tracking-widest">Active Musicians</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Music className="text-amber-400 w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">450,000</p>
            <p className="text-gray-400 text-sm uppercase tracking-widest">Total Songs</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gray-900 rounded-3xl p-12 text-center space-y-6 border border-gray-800">
        <h2 className="text-3xl font-bold">Can't find what you're looking for?</h2>
        <p className="text-gray-400">Our community and pro verifiers are ready to help.</p>
        <Link href="/request" className="inline-block bg-amber-400 text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
          Request a Tab
        </Link>
      </section>
    </div>
  );
}
