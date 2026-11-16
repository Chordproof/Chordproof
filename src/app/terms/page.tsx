import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ChordProof",
  description:
    "The terms that govern your use of ChordProof: tabs are free, forever, with no paywalls on community content.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="text-brand-muted text-sm">Last updated: November 16, 2026</p>
      </div>

      <section className="bg-brand-card rounded-3xl p-8 border border-[var(--c-hairline)] space-y-4 text-sm leading-relaxed">
        <p className="text-brand-muted">
          These terms govern your use of <strong className="text-[var(--c-text)]">chordproof.com</strong>.
          By using the site you agree to them. If you do not agree, please do not use the site.
        </p>

        <h2 className="font-bold text-base pt-2">1. What ChordProof is</h2>
        <p className="text-brand-muted">
          ChordProof publishes guitar, bass, ukulele and piano arrangements — chords, tablature and
          structural notes — for learning and personal practice.
        </p>

        <h2 className="font-bold text-base pt-2">2. Tabs are free, forever</h2>
        <p className="text-brand-muted">
          All tabs on ChordProof are free to read, with no paywall and no login wall. Paid features,
          when they exist, are tools around the tab — offline access, PDF export, setlists, practice
          helpers — never the tab itself. This is a commitment, not a promotion.
        </p>

        <h2 className="font-bold text-base pt-2">3. Accounts</h2>
        <p className="text-brand-muted">
          You can sign in with Google or GitHub. You are responsible for activity under your account.
          We may suspend accounts that abuse the service.
        </p>

        <h2 className="font-bold text-base pt-2">4. Intellectual property</h2>
        <p className="text-brand-muted">
          The arrangements, layout, code and design of ChordProof belong to us. Song titles, lyrics and
          compositions belong to their respective authors and publishers. Tablature published here is
          presented for educational use; rights holders who believe content infringes their rights may
          write to <span className="text-brand-gold">contact@chordproof.com</span> and we will respond
          promptly, removing material where appropriate.
        </p>

        <h2 className="font-bold text-base pt-2">5. Acceptable use</h2>
        <p className="text-brand-muted">
          Do not scrape or crawl the site at a rate that degrades it for others, do not attempt to
          bypass authentication or the paid-feature gates, do not resell the content, and do not use
          the site for anything unlawful.
        </p>

        <h2 className="font-bold text-base pt-2">6. Subscriptions</h2>
        <p className="text-brand-muted">
          Paid plans are billed through Stripe, renew automatically at the interval you chose, and can
          be cancelled at any time — access continues to the end of the paid period. Prices are shown
          before you pay, in US dollars, exclusive of applicable taxes.
        </p>

        <h2 className="font-bold text-base pt-2">7. Availability</h2>
        <p className="text-brand-muted">
          We aim to keep the site online but do not guarantee uninterrupted service. Features may
          change or be withdrawn.
        </p>

        <h2 className="font-bold text-base pt-2">8. Limitation of liability</h2>
        <p className="text-brand-muted">
          The site is provided &quot;as is&quot;. To the extent permitted by law, we are not liable for
          indirect or consequential damages arising from your use of it. Nothing here limits rights you
          have as a consumer that cannot be waived.
        </p>

        <h2 className="font-bold text-base pt-2">9. Changes</h2>
        <p className="text-brand-muted">
          We may update these terms. The date at the top shows the current version, and continued use
          after a change means you accept it.
        </p>

        <h2 className="font-bold text-base pt-2">10. Contact</h2>
        <p className="text-brand-muted">
          <span className="text-brand-gold">contact@chordproof.com</span>
        </p>
      </section>

      <div className="flex gap-4 text-sm">
        <Link href="/privacy" className="text-brand-gold hover:underline">
          Privacy Policy
        </Link>
        <Link href="/" className="text-brand-muted hover:underline">
          Back to ChordProof
        </Link>
      </div>
    </div>
  );
}
