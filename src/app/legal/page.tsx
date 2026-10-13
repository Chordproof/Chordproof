import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Legal</h1>
        <p className="text-brand-muted">Terms of Service & Privacy Policy</p>
      </div>

      {/* ToS */}
      <section className="bg-brand-card rounded-3xl p-8 border border-white/5 space-y-6">
        <h2 className="text-2xl font-bold">Terms of Service</h2>
        <p className="text-brand-muted text-sm">Last updated: October 13, 2026</p>

        <div className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-bold text-base">1. Acceptance of Terms</h3>
          <p className="text-brand-muted">
            By accessing or using ChordProof ("the Platform"), you agree to be bound by these Terms of Service. 
            If you do not agree, do not use the Platform.
          </p>

          <h3 className="font-bold text-base">2. Community Content</h3>
          <p className="text-brand-muted">
            Users may submit, upload, and share guitar tabs and related content. You retain ownership of your 
            submissions but grant ChordProof a license to display and distribute them on the Platform.
          </p>
          <p className="text-brand-muted">
            All community tabs are reviewed by our verification team. We reserve the right to remove content 
            that violates copyright or community guidelines.
          </p>

          <h3 className="font-bold text-base">3. Free Access & Support</h3>
          <p className="text-brand-muted">
            ChordProof is free for everyone. Community content has no paywalls and never will. 
            If we introduce optional support features in the future, they will be clearly labeled 
            and community tabs will remain free.
          </p>
          <p className="text-brand-muted">
            <strong className="text-white">Our Promise:</strong> No paywalls on community content. No popups. No hidden fees.
          </p>

          <h3 className="font-bold text-base">4. Acceptable Use</h3>
          <p className="text-brand-muted">
            You agree not to: (a) scrape or crawl the Platform without authorization, (b) upload copyrighted 
            material you do not own, (c) use the Platform for any illegal purpose, (d) interfere with the 
            Platform's operation.
          </p>

          <h3 className="font-bold text-base">5. Copyright & Takedown</h3>
          <p className="text-brand-muted">
            ChordProof respects intellectual property rights. Tabs are original transcriptions created by our 
            community for educational and personal use. If you believe content on the Platform infringes your 
            copyright, contact us with details of the work and the allegedly infringing material, and we will 
            review and remove it if appropriate.
          </p>

          <h3 className="font-bold text-base">6. Limitation of Liability</h3>
          <p className="text-brand-muted">
            ChordProof is provided "as is" without warranties. We are not liable for damages arising from 
            your use of the Platform. Tabs are for educational and personal use only.
          </p>

          <h3 className="font-bold text-base">7. Changes</h3>
          <p className="text-brand-muted">
            We may update these terms at any time. Continued use after changes constitutes acceptance.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-brand-card rounded-3xl p-8 border border-white/5 space-y-6">
        <h2 className="text-2xl font-bold">Privacy Policy</h2>
        <p className="text-brand-muted text-sm">Last updated: October 13, 2026</p>

        <div className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-bold text-base">1. Data We Collect</h3>
          <p className="text-brand-muted">
            When you sign in via Google or GitHub, we collect your email address and profile name. 
            We also collect usage data (pages viewed, tabs saved) to improve the Platform.
          </p>

          <h3 className="font-bold text-base">2. How We Use Your Data</h3>
          <p className="text-brand-muted">
            Your data is used to: provide and maintain the Platform, send occasional 
            product updates (opt-out anytime), and improve our services.
          </p>

          <h3 className="font-bold text-base">3. Data Sharing</h3>
          <p className="text-brand-muted">
            We do not sell your personal data. We may share anonymized analytics with partners.
          </p>

          <h3 className="font-bold text-base">4. Your Rights</h3>
          <p className="text-brand-muted">
            You may request access, correction, or deletion of your data at any time by contacting us. 
            You can export your data from your Profile settings.
          </p>

          <h3 className="font-bold text-base">5. Cookies</h3>
          <p className="text-brand-muted">
            We use essential cookies for authentication and optional analytics cookies. 
            You can disable non-essential cookies in your browser settings.
          </p>
        </div>
      </section>

      <div className="text-center text-sm text-brand-muted">
        Questions? Contact us at <span className="text-brand-gold">legal@chordproof.com</span>
      </div>
    </div>
  );
}
