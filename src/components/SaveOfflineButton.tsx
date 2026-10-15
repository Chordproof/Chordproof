"use client";

import { useEffect, useState } from "react";
import { WifiOff, Check, Loader2 } from "lucide-react";
import { saveTabOffline, removeTabOffline, getOfflineTab } from "@/lib/offlineLibrary";

// Botão "Available Offline" — salva a cifra no IndexedDB (recurso ChordProof+).
export default function SaveOfflineButton({
  tab,
  slugArtist,
  slugSong,
}: {
  tab: any;
  slugArtist: string;
  slugSong: string;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOfflineTab(slugArtist, slugSong).then((t) => setSaved(!!t)).catch(() => {});
  }, [slugArtist, slugSong]);

  async function toggle() {
    setBusy(true);
    try {
      if (saved) {
        await removeTabOffline(slugArtist, slugSong);
        setSaved(false);
      } else {
        await saveTabOffline({
          slug_artist: slugArtist,
          slug_song: slugSong,
          song: tab.song,
          artist: tab.artist,
          content: tab.content || "",
          tablature: tab.tablature,
          key_sig: tab.key_sig,
          capo: tab.capo,
          difficulty: tab.difficulty,
        });
        setSaved(true);
      }
    } catch (e) {
      console.error("offline save failed", e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={saved ? "Saved for offline use — click to remove" : "Save for offline use (ChordProof+)"}
      className={"p-3 rounded-full transition " + (saved ? "bg-brand-gold/20 text-brand-gold" : "bg-white/5 hover:bg-white/10")}
    >
      {busy ? (
        <Loader2 size={20} className="animate-spin" />
      ) : saved ? (
        <Check size={20} />
      ) : (
        <WifiOff size={20} />
      )}
    </button>
  );
}
