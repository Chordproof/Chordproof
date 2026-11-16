import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ChordProof",
  description:
    "How ChordProof collects, uses and protects your data. We never sell your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-brand-muted text-sm">Last updated: November 16, 2026</p>
      </div>

      <section className="bg-brand-card rounded-3xl p-8 border border-[var(--c-hairline)] space-y-4 text-sm leading-relaxed">
        <p className="text-brand-muted">
          This Privacy Policy explains what information ChordProof (&quot;we&quot;, &quot;us&quot;)
          collects when you use <strong className="text-[var(--c-text)]">chordproof.com</strong>,
          why we collect it, and the choices you have. We keep this short and in plain language.
        </p>

        <h2 className="font-bold text-base pt-2">1. Information we collect</h2>
        <p className="text-brand-muted">
          <strong className="text-[var(--c-text)]">Account data.</strong> When you sign in with
          Google or GitHub, we receive your email address, your display name and a provider account
          identifier. We never receive your password.
        </p>
        <p className="text-brand-muted">
          <strong className="text-[var(--c-text)]">Usage data.</strong> Pages you visit, tabs you
          open, features you use and basic device information (browser type, screen size, referring
          page). This is aggregated to understand what works.
        </p>
        <p className="text-brand-muted">
          <strong className="text-[var(--c-text)]">Payment data.</strong> Subscriptions are processed
          by Stripe. We receive a customer identifier and the status of your subscription — never your
          card number, which stays with Stripe.
        </p>
        <p className="text-brand-muted">
          <strong className="text-[var(--c-text)]">Local storage.</strong> Your theme choice, preferred
          instrument, saved setlists and offline cache are stored in your browser. This data does not
          leave your device.
        </p>

        <h2 className="font-bold text-base pt-2">2. Why we use it</h2>
        <p className="text-brand-muted">
          To create and secure your account, to serve the tabs and tools you ask for, to process your
          subscription, to measure which features are useful, and to answer you when you write to us.
          We do not use your data for automated decision-making with legal effect.
        </p>

        <h2 className="font-bold text-base pt-2">3. Cookies</h2>
        <p className="text-brand-muted">
          We set a session cookie when you sign in, which is required for the site to work — this one
          cannot be turned off. Any optional analytics cookies can be blocked in your browser settings
          without losing access to the content.
        </p>

        <h2 className="font-bold text-base pt-2">4. Sharing</h2>
        <p className="text-brand-muted">
          We do not sell your personal data, and we do not share it for advertising. We use a small
          number of service providers who process data on our behalf: Supabase (database), Vercel
          (hosting), Stripe (payments) and Google Analytics (aggregated traffic). Each is bound to use
          the data only to provide that service.
        </p>
        <p className="text-brand-muted">
          We may disclose information if required by law or to protect the rights and safety of our
          users.
        </p>

        <h2 className="font-bold text-base pt-2">5. Retention</h2>
        <p className="text-brand-muted">
          We keep account data while your account exists. If you delete your account, we remove your
          personal data, except records we must keep for tax and accounting purposes.
        </p>

        <h2 className="font-bold text-base pt-2">6. Your rights</h2>
        <p className="text-brand-muted">
          You may request access to, correction of, or deletion of your personal data at any time.
          Write to <span className="text-brand-gold">contact@chordproof.com</span> and we will respond
          within 30 days. If you are in the EEA or the UK you also have the right to lodge a complaint
          with your local data protection authority.
        </p>

        <h2 className="font-bold text-base pt-2">7. Children</h2>
        <p className="text-brand-muted">
          ChordProof is not directed at children under 13 and we do not knowingly collect their data.
        </p>

        <h2 className="font-bold text-base pt-2">8. Changes</h2>
        <p className="text-brand-muted">
          If we change this policy we will update the date at the top and, for material changes, notify
          account holders by email.
        </p>

        <h2 className="font-bold text-base pt-2">9. Contact</h2>
        <p className="text-brand-muted">
          Questions about privacy:{" "}
          <span className="text-brand-gold">contact@chordproof.com</span>
        </p>
      </section>

      <div className="flex gap-4 text-sm">
        <Link href="/terms" className="text-brand-gold hover:underline">
          Terms of Service
        </Link>
        <Link href="/" className="text-brand-muted hover:underline">
          Back to ChordProof
        </Link>
      </div>
    </div>
  );
}
