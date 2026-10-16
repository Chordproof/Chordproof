"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListMusic, Loader2, Printer, Share2 } from "lucide-react";

// Página pública de setlist compartilhada — /setlist/[slug]
// Qualquer pessoa com o link vê a lista; a banda inteira no celular, sem conta.
export default function SetlistShare({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/setlists/share?slug=${params.slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  function share() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex items-center justify-center py-32 text-brand-muted"><Loader2 className="animate-spin mr-3" /> Loading setlist...</div>;
  if (notFound || !data) return (
    <div className="text-center py-32 space-y-4">
      <h1 className="text-4xl font-bold">Setlist not found</h1>
      <p className="text-brand-muted">This link may have been removed.</p>
      <Link href="/browse" className="inline-block bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-6 py-3 rounded-full font-bold hover:scale-105 transition">Browse tabs</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-sm uppercase tracking-wide">
            <ListMusic size={16} /> Setlist
          </div>
          <h1 className="text-4xl font-bold">{data.title}</h1>
          <p className="text-brand-muted">{data.songs?.length ?? 0} songs</p>
        </div>
        <div className="flex gap-2">
          <button onClick={share} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] transition">
            <Share2 size={16} /> {copied ? "Link copied!" : "Share"}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[var(--c-overlay-soft)] hover:bg-[var(--c-overlay)] transition">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {(data.songs ?? []).map((s: any, i: number) => (
          <Link
            key={s?.id ?? i}
            href={`/tab/${s?.slug_artist}/${s?.slug_song}`}
            className="flex items-center gap-4 bg-[var(--c-card)] rounded-xl p-4 border border-[var(--c-hairline)] hover:bg-[var(--c-overlay-soft)] transition"
          >
            <span className="w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{s?.song}</p>
              <p className="text-brand-muted text-sm truncate">{s?.artist}</p>
            </div>
            <div className="flex gap-2 text-xs text-brand-muted shrink-0">
              {s?.key_sig && <span className="bg-[var(--c-overlay-soft)] px-2 py-1 rounded">Key: {s.key_sig}</span>}
              {s?.capo && <span className="bg-[var(--c-overlay-soft)] px-2 py-1 rounded">Capo: {s.capo}</span>}
            </div>
          </Link>
        ))}
        {(data.songs ?? []).length === 0 && (
          <p className="text-center text-brand-muted py-12">This setlist is empty.</p>
        )}
      </div>

      <p className="text-center text-xs text-brand-muted">Shared via <strong>chordproof.com</strong> — verified guitar tabs, free forever.</p>
    </div>
  );
}
