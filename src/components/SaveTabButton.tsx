"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { recordAction } from "@/lib/gamification";

/**
 * Botão de salvar cifra. Grava no banco por usuário (user_bookmarks)
 * e registra SAVE_TAB nas estatísticas da conta.
 * Sem login: leva para /auth/signin em vez de falhar em silêncio.
 */
export default function SaveTabButton({
  artist,
  song,
  size = 20,
}: {
  artist: string;
  song: string;
  size?: number;
}) {
  const { status } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    // deslogado não pergunta: /api/bookmarks devolveria 401 e sujaria o console
    if (status !== "authenticated") return;
    let alive = true;
    fetch(`/api/bookmarks?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.saved) setSaved(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [artist, song, status]);

  async function toggle() {
    if (status === "unauthenticated") {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ artist, song }),
      });
      const d = await r.json();
      if (r.status === 401 && d?.needsAuth) {
        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (d?.error) {
        setHint(d.error);
        setTimeout(() => setHint(null), 2500);
        return;
      }
      setSaved(!!d.saved);
      if (d.saved) recordAction("SAVE_TAB");
      setHint(d.saved ? "Saved to My Tabs" : "Removed");
      setTimeout(() => setHint(null), 2000);
    } catch {
      setHint("Could not save");
      setTimeout(() => setHint(null), 2500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        className="p-3 bg-[var(--c-overlay-soft)] rounded-full hover:bg-[var(--c-overlay)] transition disabled:opacity-60"
        title={saved ? "In My Tabs — click to remove" : "Save to My Tabs"}
        aria-pressed={saved}
      >
        {loading ? (
          <Loader2 size={size} className="animate-spin" />
        ) : saved ? (
          <BookmarkCheck size={size} className="text-brand-gold" />
        ) : (
          <Bookmark size={size} />
        )}
      </button>
      {hint && (
        <div
          role="status"
          style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1a2e", border: "1px solid #333", color: "var(--c-text)", padding: "10px 18px", borderRadius: 999, fontSize: 13, zIndex: 80 }}
        >
          {hint}
        </div>
      )}
    </>
  );
}
