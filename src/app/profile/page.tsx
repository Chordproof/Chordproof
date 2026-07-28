"use client";
import { useState } from "react";
import { User, Settings, CreditCard, Music, Clock, Bookmark, ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";

export default function Profile() {
  const [tab, setTab] = useState<"overview" | "tabs" | "settings">("overview");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-brand-card rounded-3xl p-8 border border-white/5">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-gold to-amber-600 flex items-center justify-center text-4xl font-black shrink-0">
            U
          </div>
          <div className="text-center md:text-left flex-1 space-y-2">
            <h1 className="text-3xl font-bold">Username</h1>
            <p className="text-brand-muted">user@example.com</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <span className="bg-brand-gold/10 text-brand-gold px-4 py-1.5 rounded-full text-sm font-bold">
                FREE Plan
              </span>
              <span className="bg-white/5 px-4 py-1.5 rounded-full text-sm">
                Joined Jul 2026
              </span>
            </div>
          </div>
          <Link
            href="/pricing"
            className="bg-brand-gold text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition shrink-0"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-brand-card rounded-2xl p-5 border border-white/5 text-center space-y-1">
          <Music className="text-brand-gold mx-auto" size={24} />
          <p className="text-2xl font-bold">12</p>
          <p className="text-brand-muted text-sm">Tabs Saved</p>
        </div>
        <div className="bg-brand-card rounded-2xl p-5 border border-white/5 text-center space-y-1">
          <Bookmark className="text-brand-gold mx-auto" size={24} />
          <p className="text-2xl font-bold">8</p>
          <p className="text-brand-muted text-sm">Bookmarks</p>
        </div>
        <div className="bg-brand-card rounded-2xl p-5 border border-white/5 text-center space-y-1">
          <Clock className="text-brand-gold mx-auto" size={24} />
          <p className="text-2xl font-bold">3</p>
          <p className="text-brand-muted text-sm">Requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {[
          { id: "overview" as const, label: "Overview", icon: User },
          { id: "tabs" as const, label: "My Tabs", icon: Music },
          { id: "settings" as const, label: "Settings", icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
              tab === t.id ? "bg-brand-gold text-black" : "hover:bg-white/10"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          {[
            { action: "Viewed", song: "Wonderwall — Oasis", time: "2 hours ago" },
            { action: "Saved", song: "Hotel California — Eagles", time: "1 day ago" },
            { action: "Requested", song: "Bohemian Rhapsody — Queen", time: "3 days ago" },
          ].map((item, i) => (
            <div key={i} className="bg-brand-card rounded-xl p-4 border border-white/5 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{item.action}</p>
                <p className="text-brand-muted text-sm">{item.song}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-brand-muted">{item.time}</span>
                <ChevronRight size={16} className="text-brand-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "tabs" && (
        <div className="text-center py-12 text-brand-muted space-y-3">
          <Music size={40}
