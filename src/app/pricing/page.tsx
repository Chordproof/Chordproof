import { Check, X, WifiOff, FileText, Wand2, Zap, Drum, Sparkles } from "lucide-react";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import TrialButton from "@/components/TrialButton";

export const metadata = {
  title: "ChordProof+ — Support the community, get pro features",
  description: "Community tabs are free forever. ChordProof+ adds offline mode, print-ready PDFs, Smart Key, a chord trainer and a drum machine — $3.99/mo or $29/year.",
};

// Cada item aqui é uma feature BLOQUEADA de verdade para quem não tem Plus.
// Supporter Badge e Early Access saíram: nunca existiram no código.
// Setlists saiu: hoje é grátis (não há página para o usuário ver a própria setlist,
// então vendê-la seria cobrar por algo inacessível).
const PLUS_FEATURES = [
  { icon: WifiOff, title: "Offline Mode (PWA)", desc: "Save tabs to your device and practice anywhere — rehearsal rooms, cabins, planes. Syncs when you're back online." },
  { icon: FileText, title: "Print-ready PDF", desc: "Clean PDF export with smart page breaks — a chord and lyric pair never splits across two pages. Perfect for lessons and gigs." },
  { icon: Wand2, title: "Smart Key", desc: "One click suggests easier chord shapes and the best capo position for any key." },
  { icon: Zap, title: "Chord Trainer", desc: "Practice chord changes against a timer and watch your transitions get faster." },
  { icon: Drum, title: "Drum Machine", desc: "A groove for any genre at the song's own BPM, so you can play in time from day one." },
];

export default function Pricing() {
  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Tabs are free. Forever.</h1>
        <p className="text-[var(--c-text-secondary)] max-w-2xl mx-auto">
          Every community tab stays free — no paywalls, no popups, no tricks.
          ChordProof+ is for musicians who want pro tools <em className="text-[var(--c-text)]">and</em> want to keep this place running.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="inline-flex items-center gap-2 bg-[var(--c-gold-soft)] text-[var(--c-gold)] px-4 py-1.5 rounded-full text-sm font-bold">
            <Sparkles size={14} /> 15 DAYS FREE — NO CARD REQUIRED
          </div>
          <div className="inline-block bg-[var(--c-overlay-soft)] text-[var(--c-text-secondary)] px-4 py-1.5 rounded-full text-sm font-bold">
            CANCEL ANYTIME IN 2 CLICKS
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Free Tier */}
        <div className="bg-[var(--c-bg-elevated)] border border-gray-800 rounded-3xl p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="text-4xl font-bold">$0<span className="text-lg text-[var(--c-text-secondary)]">/forever</span></p>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-green-400" /> <span><strong>Every community tab</strong> — read, transpose, auto-scroll</span></li>
            <li className="flex gap-3"><Check className="text-green-400" /> Chord diagrams & hover tooltips</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Dark mode & reading themes</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Request songs</li>
            <li className="flex gap-3"><Check className="text-green-400" /> Setlists for your band, church or gig</li>
            <li className="flex gap-3 text-[var(--c-text-tertiary)]"><X className="text-red-400" /> Offline mode</li>
            <li className="flex gap-3 text-[var(--c-text-tertiary)]"><X className="text-red-400" /> Print-ready PDFs</li>
          </ul>
          <Link
            href="/browse"
            className="text-sm text-[var(--c-text-secondary)] hover:text-[var(--c-text)] transition text-center block pt-2"
          >
            Start using ChordProof free — every tab, no account needed
          </Link>
        </div>

        {/* Plus Tier */}
        <div className="bg-[var(--c-bg-elevated)] border-2 border-amber-400 rounded-3xl p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-400 text-black px-6 py-1 font-bold text-sm transform rotate-45 translate-x-6 translate-y-4">
            PLUS
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">ChordProof+</h2>
            <p className="text-4xl font-bold">$3.99<span className="text-lg text-[var(--c-text-secondary)]">/mo</span></p>
            <p className="text-sm text-amber-400 font-semibold">or $29/year — save 39%</p>
          </div>
          <ul className="space-y-3">
            {PLUS_FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <f.icon className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <span><strong>{f.title}</strong> — <span className="text-[var(--c-text-secondary)]">{f.desc}</span></span>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            {/* O trial era um botao discreto na coluna Free. E a alavanca de
                conversao mais barata (sem cartao), entao vira o CTA principal do
                Plus; o checkout passa a ser a acao secundaria. */}
            <TrialButton className="!bg-amber-400 !text-black !border-amber-400 shadow-lg shadow-amber-400/20 hover:scale-105 !py-4" />
            <p className="text-xs text-center text-[var(--c-text-tertiary)]">
              No card required. Full access for 15 days.
            </p>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--c-hairline)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--c-bg-elevated)] px-3 text-[var(--c-text-tertiary)]">
                  or subscribe now
                </span>
              </div>
            </div>
            <CheckoutButton
              plan="monthly"
              label="Get ChordProof+ — $3.99/mo"
              className="w-full py-3 rounded-xl border border-amber-400/40 text-amber-400 font-bold hover:bg-amber-400/10 transition"
            />
            <CheckoutButton
              plan="annual"
              label="Or $29/year (2.4 months free)"
              className="w-full py-3 rounded-xl border border-amber-400/40 text-amber-400 font-bold hover:bg-amber-400/10 transition"
            />
            <p className="text-xs text-[var(--c-text-tertiary)] text-center">
              Payments by Stripe. We never see your card. Cancel in 2 clicks — no retention calls, no hidden fees.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Questions</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-[var(--c-bg-elevated)] border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold">Are tabs really free?</h3>
            <p className="text-[var(--c-text-secondary)] text-sm mt-1">Yes — every community tab, forever. The free tier is the whole catalog. ChordProof+ adds tools around the tabs, never in front of them.</p>
          </div>
          <div className="bg-[var(--c-bg-elevated)] border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold">Why charge for extras?</h3>
            <p className="text-[var(--c-text-secondary)] text-sm mt-1">Servers, verification and development cost money. Plus members cover them so the community stays free and ad-free.</p>
          </div>
          <div className="bg-[var(--c-bg-elevated)] border border-gray-800 rounded-2xl p-5">
            <h3 className="font-bold">Can I cancel?</h3>
            <p className="text-[var(--c-text-secondary)] text-sm mt-1">In 2 clicks, from your profile. Your access continues until the end of the period. No retention calls.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
