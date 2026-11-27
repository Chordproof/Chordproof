"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Flame, ArrowRight } from "lucide-react";

/**
 * ContinueBar — "Continuar de onde parei" + o streak da conta.
 *
 * POR QUE ISTO RETER: quem estuda uma música abre a mesma cifra várias vezes
 * por dia. Voltar sempre ao topo é atrito; o streak visível é o que transforma
 * "abri de novo" em "não quero perder a sequência".
 *
 * HONESTIDADE: sem sessão, não há o que mostrar — nada de inventar progresso.
 * A barra simplesmente não aparece para visitante deslogado.
 *
 * O streak vem de /api/stats (tabela user_stats, por CONTA — nunca
 * localStorage, que é do navegador e já misturou contas).
 */

export interface Position {
  slug_artist: string;
  slug_song: string;
  song_title?: string | null;
  artist_name?: string | null;
  chord_index?: number;
  scroll_pct?: number;
  updated_at?: string;
}

export default function ContinueBar({
  currentSlugArtist,
  currentSlugSong,
}: {
  /** a cifra aberta agora: se for a mesma do "continue", a barra muda o texto */
  currentSlugArtist?: string;
  currentSlugSong?: string;
} = {}) {
  const [position, setPosition] = useState<Position | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [posRes, stRes] = await Promise.all([
          fetch("/api/position", { cache: "no-store" }),
          fetch("/api/stats", { cache: "no-store" }),
        ]);
        if (!active) return;
        if (posRes.ok) {
          const d = await posRes.json();
          if (d?.position) setPosition(d.position);
        }
        if (stRes.ok) {
          const d = await stRes.json();
          const n = Number(d?.stats?.streak);
          if (Number.isFinite(n) && n > 0) setStreak(n);
        }
      } catch {
        /* sem sessão ou rede: a barra não aparece */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return null;
  if (!position && !streak) return null;

  const mesmaMusica =
    position &&
    currentSlugArtist === position.slug_artist &&
    currentSlugSong === position.slug_song;

  const titulo = position
    ? [position.song_title || position.slug_song.replace(/-/g, " "), position.artist_name]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div
      className="glass-card rounded-2xl p-3 flex items-center gap-3 flex-wrap"
      style={{ marginBottom: "16px" }}
    >
      {position && !mesmaMusica && (
        <Link
          href={`/tab/${position.slug_artist}/${position.slug_song}`}
          className="inline-flex items-center gap-2 min-w-0 flex-1"
          style={{ textDecoration: "none", color: "inherit" }}
          title="Back to where you stopped"
        >
          <span
            className="shrink-0 inline-flex items-center justify-center rounded-full"
            style={{ width: 28, height: 28, background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
          >
            <Play size={13} />
          </span>
          <span className="min-w-0">
            <span
              className="block text-[9px] font-bold uppercase tracking-wider"
              style={{ color: "var(--c-text-tertiary)" }}
            >
              Continue where you left off
            </span>
            <span className="block text-xs font-bold truncate capitalize">{titulo}</span>
          </span>
          <ArrowRight size={13} className="shrink-0" style={{ color: "var(--c-gold)" }} />
        </Link>
      )}

      {position && mesmaMusica && (
        <span className="text-[11px] min-w-0 flex-1" style={{ color: "var(--c-text-tertiary)" }}>
          You were at chord <strong style={{ color: "var(--c-gold)" }}>{(position.chord_index ?? 0) + 1}</strong> here.
        </span>
      )}

      {streak !== null && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2 py-1 shrink-0"
          style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
          title={`${streak} day${streak === 1 ? "" : "s"} in a row`}
        >
          <Flame size={11} /> {streak}
          <span className="font-normal opacity-80">{streak === 1 ? "day" : "days"}</span>
        </span>
      )}
    </div>
  );
}
