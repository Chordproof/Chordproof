import { Check, X } from "lucide-react";

export default function Pricing() {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-gray-400">Support the community and get pro features.</p>
        <div className="inline-block bg-amber-400/10 text-amber-400 px-4 py-1 rounded-full text-sm font-bold">
          CANCEL ANYTIME IN 2 CLICKS
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Tier */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="text-4xl font-bold">$0<span className="text-lg text-gray-400">/mo</span></p>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-green-400" /> Unlimited Community Tabs</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Transpose & Auto-scroll</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Dark Mode</li>
            <li className="flex gap-3 text-gray-500"><X className="text-red-400" /> Verified Pro Tabs</li>
            <li className="flex gap-3 text-gray-500"><X className="text-red-400" /> Backing Tracks</li>
            <li className="flex gap-3 text-gray-500"><X className="text-red-400" /> Ad-free Experience</li>
          </ul>
          <button className="w-full py-4 rounded-xl border border-gray-700 font-bold hover:bg-gray-800 transition">
            Current Plan
          </button>
        </div>

        {/* Premium Tier */}
        <div className="bg-gray-900 border-2 border-amber-400 rounded-3xl p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-black px-6 py-1 font-bold text-sm transform rotate-45 translate-x-6 translate-y-4">
            POPULAR
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Premium</h2>
            <p className="text-4xl font-bold">$4.99<span className="text-lg text-gray-400">/mo</span></p>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-amber-400" /> <strong>All Verified Pro Tabs</strong></li>
            <li className="flex gap-3"><Check className="text-amber-400" /> High-Quality Backing Tracks</li>
            <li className="flex gap-3"><Check className="text-amber-400" /> Guitar Pro & PDF Downloads</li>
            <li className="flex gap-3"><Check className="text-amber-400" /> 100% Ad-Free</li>
            <li className="flex gap-3"><Check className="text-amber-400" /> Priority Tab Requests</li>
          </ul>
          <button className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold hover:scale-105 transition shadow-lg shadow-amber-400/20">
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
