"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ListMusic, Plus, Loader2, Trash2, Share2, Pencil, Check, X,
  ExternalLink, ArrowUp, ArrowDown, Music2,
} from "lucide-react";

/**
 * /setlists — as setlists do usuário logado.
 *
 * A lista, a criação e a edição passam por /api/setlists, que identifica o
 * dono pela sessão. Nada aqui manda email no corpo ou na URL.
 *
 * Setlists é recurso ChordProof+: 403 da API vira o convite ao trial, não
 * uma mensagem de erro.
 */

type Setlist = {
  id: string;
  title: string;
  description: string | null;
  share_slug: string;
  created_at: string;
  item_count: number;
};

type Song = {
  item_id: string;
  id: string;
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  key_sig: string | null;
  capo: string | null;
  difficulty: string | null;
};

export default function SetlistsPage() {
  const { status } = useSession();

  const [setlists, setSetlists] = useState<Setlist[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsPlus, setNeedsPlus] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [songsLoading, setSongsLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/setlists");
      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }
      if (res.status === 403) {
        // Setlists é recurso ChordProof+: mostra o convite, não um erro.
        setNeedsPlus(true);
        setSetlists([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      setSetlists(data.setlists ?? []);
    } catch {
      setError("Could not load your setlists. Please try again.");
      setSetlists([]);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  async function openSetlist(id: string) {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    setSongs(null);
    setSongsLoading(true);
    try {
      const res = await fetch(`/api/setlists/${id}`);
      const data = await res.json();
      setSongs(data.songs ?? []);
    } catch {
      setSongs([]);
    } finally {
      setSongsLoading(false);
    }
  }

  async function create() {
    const title = newTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const res = await fetch("/api/setlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setNewTitle("");
        setCreating(false);
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  async function rename(id: string) {
    const title = editTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/setlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setEditingId(null);
        setSetlists((prev) =>
          (prev ?? []).map((s) => (s.id === id ? { ...s, title } : s))
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this setlist? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/setlists/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSetlists((prev) => (prev ?? []).filter((s) => s.id !== id));
        if (openId === id) setOpenId(null);
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeSong(setlistId: string, itemId: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/setlists/items?itemId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSongs((prev) => (prev ?? []).filter((s) => s.item_id !== itemId));
        setSetlists((prev) =>
          (prev ?? []).map((s) =>
            s.id === setlistId ? { ...s, item_count: Math.max(0, s.item_count - 1) } : s
          )
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function move(setlistId: string, index: number, dir: -1 | 1) {
    if (!songs) return;
    const target = index + dir;
    if (target < 0 || target >= songs.length) return;
    const next = [...songs];
    [next[index], next[target]] = [next[target], next[index]];
    setSongs(next);
    await fetch("/api/setlists/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setlistId, order: next.map((s) => s.id) }),
    });
  }

  function share(slug: string, id: string) {
    navigator.clipboard?.writeText(`${window.location.origin}/setlist/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ---- estados de sessão ----
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-32 text-brand-muted">
        <Loader2 className="animate-spin mr-3" /> Loading…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-5">
        <ListMusic size={40} className="mx-auto text-brand-gold" />
        <h1 className="text-3xl font-bold">Your setlists</h1>
        <p className="text-brand-muted">
          Sign in to build setlists for your band, church or gig.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-6 py-3 rounded-full font-bold hover:scale-105 transition"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (needsPlus) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-5">
        <ListMusic size={40} className="mx-auto text-brand-gold" />
        <h1 className="text-3xl font-bold">Setlists is a ChordProof+ feature</h1>
        <p className="text-brand-muted">
          Build setlists for your band, church or gig and share one link the whole
          band can open — no account needed on their side.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link
            href="/pricing?feature=Setlists"
            className="bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-6 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            Try 15 days free
          </Link>
          <Link
            href="/pricing"
            className="border border-[var(--c-hairline)] px-6 py-3 rounded-full font-bold hover:bg-[var(--c-overlay-soft)] transition"
          >
            See plans
          </Link>
        </div>
        <p className="text-xs text-brand-muted">No card required for the trial.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-sm uppercase tracking-wide">
            <ListMusic size={16} /> Setlists
          </div>
          <h1 className="text-4xl font-bold">Your setlists</h1>
          <p className="text-brand-muted text-sm">
            Build a list, share one link — the whole band opens it on their phone, no account needed.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-2 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-5 py-3 rounded-full font-bold hover:scale-105 transition"
        >
          <Plus size={18} /> New setlist
        </button>
      </div>

      {creating && (
        <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-hairline)] p-4 flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="Setlist name (e.g. Saturday gig)"
            autoFocus
            className="flex-1 bg-[var(--c-overlay-soft)] border border-[var(--c-hairline)] rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-gold"
          />
          <button
            onClick={create}
            disabled={busy || !newTitle.trim()}
            className="px-5 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] rounded-xl font-bold disabled:opacity-50"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : "Create"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>
      )}

      {setlists === null && (
        <div className="flex items-center justify-center py-16 text-brand-muted">
          <Loader2 className="animate-spin mr-3" /> Loading…
        </div>
      )}

      {setlists !== null && setlists.length === 0 && (
        <div className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-hairline)] p-12 text-center space-y-3">
          <Music2 size={32} className="mx-auto text-brand-muted" />
          <p className="font-bold">No setlists yet</p>
          <p className="text-sm text-brand-muted">
            Open any tab and click the setlist icon to start one.
          </p>
          <Link href="/browse" className="inline-block text-brand-gold font-bold text-sm hover:underline">
            Browse tabs →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {(setlists ?? []).map((sl) => (
          <div key={sl.id} className="bg-[var(--c-card)] rounded-2xl border border-[var(--c-hairline)] overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() => openSetlist(sl.id)}
                className="flex-1 text-left min-w-0"
                aria-expanded={openId === sl.id}
              >
                {editingId === sl.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") rename(sl.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-[var(--c-overlay-soft)] border border-[var(--c-hairline)] rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-gold"
                    />
                    <button onClick={() => rename(sl.id)} className="text-green-400 p-1"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="text-brand-muted p-1"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <p className="font-bold truncate">{sl.title}</p>
                    <p className="text-xs text-brand-muted">
                      {sl.item_count} {sl.item_count === 1 ? "song" : "songs"}
                    </p>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/setlist/${sl.share_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open the shared page"
                  className="p-2 rounded-full hover:bg-[var(--c-overlay)] text-brand-muted"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => share(sl.share_slug, sl.id)}
                  title="Copy share link"
                  className="p-2 rounded-full hover:bg-[var(--c-overlay)] text-brand-muted"
                >
                  {copiedId === sl.id ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
                </button>
                <button
                  onClick={() => {
                    setEditingId(sl.id);
                    setEditTitle(sl.title);
                  }}
                  title="Rename"
                  className="p-2 rounded-full hover:bg-[var(--c-overlay)] text-brand-muted"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(sl.id)}
                  title="Delete setlist"
                  className="p-2 rounded-full hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {openId === sl.id && (
              <div className="border-t border-[var(--c-hairline)] p-4 space-y-2">
                {songsLoading && (
                  <div className="flex items-center text-brand-muted text-sm py-4">
                    <Loader2 className="animate-spin mr-2" size={16} /> Loading songs…
                  </div>
                )}
                {!songsLoading && (songs ?? []).length === 0 && (
                  <p className="text-sm text-brand-muted py-2">
                    Empty. Add songs from any tab with the setlist icon.
                  </p>
                )}
                {!songsLoading &&
                  (songs ?? []).map((s, i) => (
                    <div
                      key={s.item_id}
                      className="flex items-center gap-3 bg-[var(--c-overlay-soft)] rounded-xl p-3"
                    >
                      <span className="w-6 text-center text-xs font-bold text-brand-muted">{i + 1}</span>
                      <Link href={`/tab/${s.slug_artist}/${s.slug_song}`} className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{s.song}</p>
                        <p className="text-xs text-brand-muted truncate">{s.artist}</p>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => move(sl.id, i, -1)}
                          disabled={i === 0}
                          title="Move up"
                          className="p-1.5 rounded hover:bg-[var(--c-overlay)] disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => move(sl.id, i, 1)}
                          disabled={i === (songs ?? []).length - 1}
                          title="Move down"
                          className="p-1.5 rounded hover:bg-[var(--c-overlay)] disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => removeSong(sl.id, s.item_id)}
                          title="Remove from setlist"
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
