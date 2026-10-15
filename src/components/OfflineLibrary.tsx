"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, Music, Trash2 } from "lucide-react";
import { listOfflineTabs, removeTabOffline, type OfflineTab } from "@/lib/offlineLibrary";

// Seção "Offline Library" — cifras salvas no dispositivo (recurso ChordProof+).
export default function OfflineLibrary() {
  const [tabs, setTabs] = useState<OfflineTab[] | null>(null);

  useEffect(() => {
    listOfflineTabs().then(setTabs).catch(() => setTabs([]));
  }, []);

  async function remove(t: OfflineTab) {
    await removeTabOffline(t.slug_artist, t.slug_song);
    setTabs((prev) => (prev ? prev.filter((x) => !(x.slug_artist === t.slug_artist && x.slug_song === t.slug_song)) : prev));
  }

  if (tabs === null) return null;
  if (tabs.length === 0) {
    return (
      <div className="text-center py-12 text-brand-muted space-y-3">
        <WifiOff size={40} className="mx-auto opacity-50" />
        <p className="text-lg">No offline tabs yet</p>
        <p className="text-sm">Open any tab and tap the offline icon to save it to this device.</p>
        <Link href="/browse" className="inline-block mt-4 bg-brand-accent text-black px-6 py-3 rounded-full font-bold hover:brightness-110 transition">
          Browse Tabs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Offline Library</h2>
        <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">{tabs.length} saved</span>
      </div>
      <p className="text-sm text-brand-muted">These tabs work without internet — perfect for rehearsal rooms, cabins and planes.</p>
      <div className="space-y-2">
        {tabs.map((t) => (
          <div key={t.slug_artist + "/" + t.slug_song} className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06] flex justify-between items-center">
            <Link href={`/tab/${t.slug_artist}/${t.slug_song}`} className="flex items-center gap-3 hover:opacity-80 transition">
              <Music size={16} className="text-brand-accent" />
              <div>
                <p className="font-bold text-sm">{t.song}</p>
                <p className="text-brand-muted text-sm">{t.artist}</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-brand-muted">{new Date(t.saved_at).toLocaleDateString()}</span>
              <button onClick={() => remove(t)} title="Remove from offline library" className="p-2 rounded-full hover:bg-white/10 transition">
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
