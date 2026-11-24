"use client";

import { useEffect, useState } from "react";
import { WifiOff, Check, Loader2 } from "lucide-react";
import { saveTabOffline, removeTabOffline, getOfflineTab } from "@/lib/offlineLibrary";
import { recordAction } from "@/lib/gamification";
import { usePlusAccess } from "@/components/PlusGate";

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
  const plus = usePlusAccess();

  useEffect(() => {
    getOfflineTab(slugArtist, slugSong).then((t) => setSaved(!!t)).catch(() => {});
  }, [slugArtist, slugSong]);

  async function toggle() {
    // Offline é recurso ChordProof+: sem acesso, leva ao pricing com o contexto da feature.
    if (!plus.hasAccess) {
      window.location.href = "/pricing?feature=Offline";
      return;
    }
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
        recordAction("SAVE_TAB");
      }
    } catch (e) {
      console.error("offline save failed", e);
    } finally {
      setBusy(false);
    }
  }

  // Quem já tinha a cifra salva continua podendo removê-la, mesmo sem Plus ativo.
  const locked = !plus.hasAccess && !saved;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={
        saved
          ? "Saved for offline use — click to remove"
          : plus.hasAccess
          ? "Save for offline use"
          : "Save for offline use — ChordProof+"
      }
      className={"relative p-3 rounded-full transition " + (saved ? "bg-brand-gold/20 text-brand-gold" : "bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)]")}
    >
      {busy ? (
        <Loader2 size={20} className="animate-spin" />
      ) : saved ? (
        <Check size={20} />
      ) : (
        <WifiOff size={20} />
      )}
      {locked && !plus.loading && (
        <span
          style={{ position: "absolute", top: -2, right: -2 }}
          className="text-[10px] font-bold leading-none px-1 py-0.5 rounded-full bg-[var(--c-gold-soft)] text-[var(--c-gold)]"
        >
          +
        </span>
      )}
    </button>
  );
}
