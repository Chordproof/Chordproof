import { BadgeCheck, Shield, Users, Music, Globe, Heart } from "lucide-react";
import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      {/* Hero */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">About ChordProof</h1>
        <p className="text-xl text-brand-muted max-w-2xl mx-auto">
          The world's first verified guitar tab platform — built by musicians, for musicians.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-brand-card rounded-3xl p-10 border border-white/5 text-center space-y-4">
        <Music size={40} className="text-brand-gold mx-auto" />
        <h2 className="text-3xl font-bold">Our Mission</h2>
        <p className="text-brand-muted max-w-2xl mx-auto leading-relaxed">
          Every musician knows the frustration of finding tabs that are wrong, incomplete, or behind a paywall. 
          ChordProof exists to change that. We combine community knowledge with professional verification 
          to deliver the most accurate guitar tabs on the planet — free for everyone.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: "12,400+", label: "Verified Tabs", icon: BadgeCheck },
          { value: "85K+", label: "Active Users", icon: Users },
          { value: "450K+", label: "Songs Covered", icon: Music },
          { value: "150+", label: "Countries", icon: Globe },
        ].map((s) => (
          <div key={s.label} className="bg-brand-card rounded-2xl p-6 border border-white/5 text-center space-y-2">
            <s.icon className="text-brand-gold mx-auto" size={28} />
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Community Submits",
              desc: "Musicians from around the world submit tabs for every song imaginable. Our community grows by thousands of tabs every month.",
            },
            {
              step: "02",
              title: "Pro Verifiers Check",
              desc: "Every tab is reviewed by our team of professional musicians. They play through each arrangement and correct any errors before approval.",
            },
            {
              step: "03",
              title: "You Play & Enjoy",
              desc: "Once verified, tabs are published with a Verified seal. Access them instantly — no signup required for community content.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
              <span className="text-brand-gold text-5xl font-black opacity-30">{item.step}</span>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-brand-card rounded-3xl p-10 border border-white/5 space-y-8">
        <h2 className="text-3xl font-bold text-center">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: BadgeCheck, title: "Accuracy First", desc: "Every tab is hand-checked. If it's not right, it doesn't get the seal." },
            { icon: Heart, title: "Community Driven", desc: "We're built by and for musicians. Your feedback shapes the platform." },
            { icon: Shield, title: "No Paywalls", desc: "Community tabs are always free. Premium is optional — for those who want more." },
            { icon: Globe, title: "Global Access", desc: "Tabs in every genre, every language, every skill level. Music has no borders." },
          ].map((v) => (
            <div key={v.title} className="flex gap-4">
              <v.icon className="text-brand-gold shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold">{v.title}</h3>
                <p className="text-brand-muted text-sm">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team / CTA */}
      <div className="text-center space-y-6 pb-8">
        <h2 className="text-3xl font-bold">Join 85,000+ Musicians</h2>
        <p className="text-brand-muted">
          Start playing the right chords today.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/browse" className="bg-brand-gold text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition">
            Browse Tabs
          </Link>
          <Link href="/request" className="bg-white/5 border border-white/10 px-8 py-4 rounded-full font-bold hover:bg-white/10 transition">
            Request a Song
          </Link>
        </div>
      </div>
    </div>
  );
}
