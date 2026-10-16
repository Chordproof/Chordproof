"use client";

import { useState, useEffect } from "react";
import { ListMusic, Plus, X, Loader2, Link2, Check } from "lucide-react";
import { useSession } from "next-auth/react";

// AddToSetlist — botão na cifra para adicionar a uma setlist do usuário (ChordProof+ feat 5).
// Cria setlist inline se não houver nenhuma.
export default function AddToSetlist({
  tabId,
  song,
  artist,
}: {
  tabId: string;
  song: string;
  artist: string;
}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [setlists, setSetlists] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [added, setAdded] = useState<string | null>(null);

  async function load() {
    if (!session?.user?.email) return;
    setLoading(true);
    const res = await fetch(`/api/setlists?email=${encodeURIComponent(session.user.email)}`);
    const data = await res.json();
    setSetlists(data.setlists ?? []);
    setLoading(false);
  }

  function openModal() {
    if (!session?.user) {
      window.location.href = "/auth/signin";
      return;
    }
    setOpen(true);
    load();
  }

  async function createAndAdd() {
    if (!newTitle.trim() || !session?.user?.email) return;
    setLoading(true);
    const res = await fetch("/api/setlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), email: session.user.email, tabId }),
    });
    const data = await res.json();
    if (data.share_slug) {
      setAdded(data.share_slug);
    }
    setLoading(false);
  }

  async function addTo(setlistId: string) {
    setLoading(true);
    const res = await fetch("/api/setlists/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setlistId, tabId }),
    });
    if (res.ok) {
      setAdded("added");
    }
    setLoading(false);
  }

  if (added) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-500/10 text-green-400">
        <Check size={16} /> {added === "added" ? "Added!" : "Setlist created!"}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        title="Add to setlist"
        className="p-3 bg-[var(--c-overlay-soft)] rounded-full hover:bg-[var(--c-overlay)] transition"
      >
        <ListMusic size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-hairline)] p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Add "{song}" to setlist</h3>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            {loading && <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>}
            {!loading && setlists !== null && (
              <>
                {setlists.length > 0 && (
                  <div className="space-y-2">
                    {setlists.map((sl) => (
                      <button
                        key={sl.id}
                        onClick={() => addTo(sl.id)}
                        className="w-full text-left px-4 py-3 bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] rounded-xl transition flex justify-between items-center"
                      >
                        <span className="font-semibold">{sl.title}</span>
                        <span className="text-xs text-brand-muted">{sl.item_count ?? 0} songs</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-[var(--c-hairline)]">
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={`New setlist (e.g. "${artist} gig")`}
                    className="flex-1 bg-[var(--c-overlay-soft)] border border-[var(--c-hairline)] rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-gold"
                  />
                  <button onClick={createAndAdd} className="px-4 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] rounded-xl font-bold hover:brightness-110 transition">
                    <Plus size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
