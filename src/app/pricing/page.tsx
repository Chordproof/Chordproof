import { Check, X, WifiOff, FileText, ListMusic, Wand2, Heart, ShieldCheck } from "lucide-react";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata = {
  title: "ChordProof+ — Support the community, get pro features",
  description: "Community tabs are free forever. ChordProof+ adds offline mode, clean PDFs, setlists and smart transposition — $3.99/mo or $29/year.",
};

const PLUS_FEATURES = [
  { icon: WifiOff, title: "Offline Mode (PWA)", desc: "Save tabs to your device and practice anywhere — rehearsal rooms, cabins, planes. Syncs when you're back online." },
  { icon: FileText, title: "Beautiful PDF & Print", desc: "Print-ready sheets with proper page breaks, chord diagrams and your font preferences. Perfect for lessons and gigs." },
  { icon: ListMusic, title: "Unlimited Setlists", desc: "Organize songs into setlists for your band, church or open mic — synced across all your devices." },
  { icon: Wand2, title: "Smart Transposition", desc: "One click suggests easy chord shapes and the best capo position for any key." },
  { icon: Heart, title: "Supporter Badge", desc: "A badge on your profile and requests. You keep the community running." },
  { icon: ShieldCheck, title: "Early Access", desc: "New features land for Plus members first." },
];

export default function Pricing() {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Tabs are free. Forever.</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Every community tab stays free — no paywalls, no popups, no tricks.
          ChordProof+ is for musicians who want pro tools <em className="text-white">and</em> want to keep this place running.
        </p>
        <div className="inline-block bg-amber-400/10 text-amber-400 px-4 py-1 rounded-full text-sm font-bold">
          CANCEL ANYTIME IN 2 CLICKS
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Free Tier */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="text-4xl font-bold">$0<span className="text-lg text-gray-400">/forever</span></p>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-green-400" /> <span><strong>Every community tab</strong> — read, transpose, auto-scroll</span></li>
            <li className="flex gap-3"><Check className="text-green-400" /> Chord diagrams & hover tooltips</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Dark mode & reading themes</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Request songs</li>
            <li className="flex gap-3 text-gray-500"><X className="text-red-400" /> Offline mode</li>
            <li className="flex gap-3 text-gray-500"><X className="text-red-400" /> Print-ready PDFs</li>
            <li className="flex gap-3 text-gray-500"><X className="text-red-400" /> Setlists</li>
          </ul>
          <Link
            href="/browse"
            className="w-full py-4 rounded-xl border border-gray-700 font-bold hover:bg-gray-800 transition flex items-center justify-center"
          >
            Start Browsing — It&apos;s Free
          </Link>
        </div>

        {/* Plus Tier */}
        <div className="bg-gray-900 border-2 border-amber-400 rounded-3xl p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-black px-6 py-1 font-bold text-sm transform rotate-45 translate-x-6 translate-y-4">
            PLUS
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">ChordProof+</h2>
            <p className="text-4xl font-bold">$3.99<span className="text-lg text-gray-400">/mo</span></p>
            <p className="text-sm text-amber-400 font-semibold">or $29/year — save 39%</p>
          </div>
          <ul className="space-y-3">
            {PLUS_FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <f.icon className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <span><strong>{f.title}</strong> — <span className="text-gray-400">{f.desc}</span></span>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            <CheckoutButton
              plan="monthly"
              label="Get ChordProof+ — $3.99/mo"
              className="w-full py-4 rounded-xl bg-amber-400 text-black font-bold hover:scale-105 transition shadow-lg shadow-amber-400/20"
            />
            <CheckoutButton
              plan="annual"
              label="Or $29/year (2.4 months free)"
              className="w-full py-3 rounded-xl border border-amber-400/40 text-amber-400 font-bold hover:bg-amber-400/10 transition"
            />
            <p className="text-xs text-gray-500 text-center">
              Payments by Stripe. We never see your card. Cancel in 2 clicks — no retention calls, no hidden fees.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold">Are tabs really free?</h3>
            <p className="text-gray-400 text-sm mt-1">Yes — every community tab, forever. The free tier is the whole catalog. ChordProof+ adds tools around the tabs, never in front of them.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold">Why charge for extras?</h3>
            <p className="text-gray-400 text-sm mt-1">Servers, verification and development cost money. Plus members cover them so the community stays free and ad-free.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold">Can I cancel?</h3>
            <p className="text-gray-400 text-sm mt-1">In 2 clicks, from your profile. Your access continues until the end of the period. No retention calls.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
