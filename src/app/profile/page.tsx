"use client";
import { useState } from "react";
import { User, Settings, CreditCard, Music, Clock, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import PlayerStats from "@/components/PlayerStats";

export default function Profile() {
  const [tab, setTab] = useState<"overview" | "tabs" | "settings">("overview");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/[0.06]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-accent to-emerald-600 flex items-center justify-center text-4xl font-black shrink-0">
            U
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <h1 className="text-3xl font-bold">Username</h1>
            <p className="text-brand-muted">user@example.com</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <span className="bg-brand-accent/10 text-brand-accent px-4 py-1.5 rounded-full text-sm font-bold">
                FREE Plan
              </span>
              <span className="bg-white/[0.06] px-4 py-1.5 rounded-full text-sm">
                Joined Jul 2026
              </span>
            </div>
          </div>
          <Link
            href="/pricing"
            className="bg-brand-accent text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 transition shrink-0"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1">
        {[
          { id: "overview" as const, label: "Overview", icon: User },
          { id: "tabs" as const, label: "My Tabs", icon: Music },
          { id: "settings" as const, label: "Settings", icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
              tab === t.id ? "bg-brand-accent text-black" : "hover:bg-white/10"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-8">
          <PlayerStats />
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            {[
              { action: "Completed", song: "Wonderwall — Oasis", time: "2 hours ago", icon: Music },
              { action: "Viewed", song: "Hotel California — Eagles", time: "1 day ago", icon: Music },
              { action: "Saved", song: "Creep — Radiohead", time: "3 days ago", icon: Music },
            ].map((item, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-brand-accent" />
                  <div>
                    <p className="font-bold text-sm">{item.action}</p>
                    <p className="text-brand-muted text-sm">{item.song}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-muted">{item.time}</span>
                  <ChevronRight size={16} className="text-brand-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Tabs */}
      {tab === "tabs" && (
        <div className="text-center py-12 text-brand-muted space-y-3">
          <Music size={40} className="mx-auto opacity-50" />
          <p className="text-lg">No saved tabs yet</p>
          <p className="text-sm">Start browsing and save your favorite tabs!</p>
          <Link
            href="/browse"
            className="inline-block mt-4 bg-brand-accent text-black px-6 py-3 rounded-full font-bold hover:brightness-110 transition"
          >
            Browse Tabs
          </Link>
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Account Settings</h2>
          <div className="bg-[#1A1A1A] rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
            {[
              { icon: User, label: "Edit Profile" },
              { icon: CreditCard, label: "Payment Methods" },
              { icon: Settings, label: "Preferences" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.04] cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="text-brand-muted" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-brand-muted" />
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition mt-6">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
