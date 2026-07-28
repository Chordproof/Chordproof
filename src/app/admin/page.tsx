"use client";
import { useState } from "react";
import { Users, Music, TrendingUp, DollarSign, Eye, BarChart3, Download, Shield, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const statCards = [
    { label: "Total Users", value: "85,420", change: "+12.5%", icon: Users, color: "text-blue-400" },
    { label: "Total Tabs", value: "12,847", change: "+8.2%", icon: Music, color: "text-brand-gold" },
    { label: "Page Views", value: "2.4M", change: "+23.1%", icon: Eye, color: "text-green-400" },
    { label: "Premium Subs", value: "4,291", change: "+15.3%", icon: DollarSign, color: "text-purple-400" },
  ];

  const recentActivity = [
    { action: "New tab verified", item: "Bohemian Rhapsody — Queen", user: "Pro Verifier #12", time: "12 min ago" },
    { action: "Premium subscription", item: "Annual plan", user: "user@email.com", time: "34 min ago" },
    { action: "Tab reported", item: "Sweet Child O' Mine — GnR", user: "3 reports", time: "1h ago", alert: true },
    { action: "New user", item: "Joined with Google", user: "joao.silva@gmail.com", time: "2h ago" },
    { action: "Payment received", item: "$4.99 — Monthly Premium", user: "Stripe", time: "3h ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-brand-muted">Full control over your ChordProof platform.</p>
        </div>
        <div className="flex gap-2 bg-white/5 rounded-xl p-1">
          {[
            { key: "7d" as const, label: "7 days" },
            { key: "30d" as const, label: "30 days" },
            { key: "90d" as const, label: "90 days" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                period === p.key ? "bg-brand-gold text-black" : "hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <card.icon className={card.color} size={24} />
              <span className="text-green-400 text-sm font-bold">{card.change}</span>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-brand-muted text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><BarChart3 size={18} /> Daily Active Users</h2>
            <Download size={16} className="text-brand-muted cursor-pointer hover:text-white" />
          </div>
          <div className="h-48 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92, 78].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand-gold/20 rounded-t-lg hover:bg-brand-gold/40 transition"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-brand-muted">
            <span>Jul 14</span>
            <span>Jul 21</span>
            <span>Jul 28</span>
          </div>
        </div>

        <div className="bg-brand-card rounded-2xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2"><TrendingUp size={18} /> Top Artists</h2>
          </div>
          <div className="space-y-3">
            {[
              { rank: 1, name: "Oasis", tabs: 124, growth: "+24%" },
              { rank: 2, name: "Radiohead", tabs: 98, growth: "+18%" },
              { rank: 3, name: "Led Zeppelin", tabs: 87, growth: "+12%" },
              { rank: 4, name: "The Beatles", tabs: 76, growth: "+9%" },
              { rank: 5, name: "Ed Sheeran", tabs: 65, growth: "+5%" },
            ].map((artist) => (
              <div key={artist.rank} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-brand-muted text-sm w-5">{artist.rank}</span>
                  <span className="font-bold">{artist.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-brand-muted">{artist.tabs} tabs</span>
                  <span className="text-green-400">{artist.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-bold flex items-center gap-2"><Shield size={18} /> Platform Activity</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentActivity.map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
              <div className="flex items-center gap-3">
                {item.alert && <AlertTriangle size={16} className="text-red-400" />}
                <div>
                  <p className="text-sm font-bold">{item.action}</p>
                  <p className="text-xs text-brand-muted">{item.item}</p>
                </div>
              </div>
              <div className="text-right text-xs text-brand-muted">
                <p>{item.user}</p>
                <p>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
