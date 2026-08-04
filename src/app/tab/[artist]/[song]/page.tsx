"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TransposeControls from "@/components/TransposeControls";
import ArtistAvatar from "@/components/ArtistAvatar";
import {
  BadgeCheck,
  History,
  AlertTriangle,
  Share2,
  Bookmark,
  Play,
  ChevronDown,
  MousePointer2,
  Loader2,
  Music2,
  Youtube,
  ListMusic,
  Eye,
} from "lucide-react";
import { createClientSupabaseClient } from "@/lib/supabase-client";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const difficultyColor = (d?: string) =>
  d === "Beginner" ? "text-green-400" : d === "Intermediate" ? "text-yellow-400" : "text-red-400";

export default function TabDetail({ params }: { params: { artist: string; song: string } }) {
  const [tab, setTab] = useState<any>(null);
  const [similarTabs, setSimilarTabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [version, setVersion] = useState("2.1");

  // Player: YouTube (vídeo completo) com fallback para iTunes (preview 30s)
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerSource, setPlayerSource] = useState<"youtube" | "itunes" | null>(null);

  const songName = tab?.song || params.song.replace(/-/g, " ");
  const artistName = tab?.artist || params.artist.replace(/-/g, " ");
  const artistSlug = tab?.slug_artist || params.artist;

  // Carregar a cifra + músicas similares do mesmo artista
  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClientSupabaseClient();

      const { data } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .eq("slug_song", params.song)
        .maybeSingle();

      if (active) setTab(data || null);

      // Outras músicas do mesmo artista (exclui a atual), por views
      const { data: similarData } = await supabase
        .from("tabs")
        .select("*")
        .eq("slug_artist", params.artist)
        .neq("slug_song", params.song)
        .order("views", { ascending: false })
        .limit(3);

      if (active && similarData) setSimilarTabs(similarData);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [params.artist, params.song]);

  // Registrar a visualização da cifra (incrementa o campo views)
  useEffect(() => {
    const supabase = createClientSupabaseClient();
    supabase
      .rpc("increment_tab_view", {
        p_slug_artist: params.artist,
        p_slug_song: params.song,
      })
      .then(({ error }) => {
        if (error) console.error("Erro ao registrar visualização:", error);
      });
  }, [params.artist, params.song]);

  // Buscar a música: 1º YouTube (completo), 2º iTunes (preview 30s)
  useEffect(() => {
    if (!songName || !artistName) return;
    let active = true;
    setPlayerLoading(true);
    const term = `${songName} ${artistName}`;

    fetch(`/api/youtube-search?q=${encodeURIComponent(term)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d?.videoId) {
          setYoutubeId(d.videoId);
          setPlayerSource("youtube");
          setPlayerLoading(false);
        } else {
          // Fallback: preview iTunes de 30 segundos
          return fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`
          )
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
            .then((it) => {
              if (active) {
                setPreviewUrl(it?.results?.[0]?.previewUrl || null);
                setPlayerSource(it?.results?.[0]?.previewUrl ? "itunes" : null);
                setPlayerLoading(false);
              }
            });
        }
      })
      .catch(() => {
        if (active) {
          setYoutubeId(null);
          setPreviewUrl(null);
          setPlayerSource(null);
          setPlayerLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [songName, artistName]);

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll) return;
    const id = setInterval(() => {
      window.scrollBy({ top: scrollSpeed, behavior: "smooth" });
    }, 100);
    return () => clearInterval(id);
  }, [autoScroll, scrollSpeed]);

  const keySig = tab?.key_sig || "F#m";
  const difficulty = tab?.difficulty || "Beginner";
  const isVerified = tab?.is_verified !== false;
  const content = tab?.content || tab?.chords || tab?.body || "";
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${songName} ${artistName}`)}`;

  const fallbackContent = `[Intro]
F#m  D  A  E

[Verse]
F#m                D
Today is gonna be the day
A                   E
That they're gonna throw it back to you

[Chorus]
F#m     D        A       E
And after all, you're my wonderwall`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs — navegação completa */}
      <nav className="text-sm text-brand-muted">
        <ol className="flex gap-2 items-center">
          <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
          <li>/</li>
          <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
          <li>/</li>
          <li>
            <Link href={`/artist/${artistSlug}`} className="hover:text-white capitalize">
              {artistName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-white/60 capitalize">{songName}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold capitalize">{songName}</h1>
            {isVerified && (
              <div className="flex items-center gap-1 bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full text-xs font-bold">
                <BadgeCheck size={14} /> VERIFIED
              </div>
            )}
          </div>

          {/* Foto do artista + nome clicável → página do artista */}
          <Link
            href={`/artist/${artistSlug}`}
            className="inline-flex items-center gap-3 group"
          >
            <ArtistAvatar name={artistName} slug={artistSlug} size="sm" />
            <span className="text-xl text-brand-muted capitalize group-hover:text-brand-accent group-hover:underline transition-colors">
              {artistName}
            </span>
          </Link>

          <div className="flex gap-4 pt-2">
            <span className="bg-white/5 px-3 py-1 rounded text-sm">
              Key: <strong>{keySig}</strong>
            </span>
            <span className={`bg-white/5 px-3 py-1 rounded text-sm font-bold ${difficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Bookmark size={20} />
          </button>
          <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Share2 size={20} />
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              autoScroll ? "bg-brand-accent text-black" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <Play size={18} /> Auto-scroll
          </button>
        </div>
      </div>

      {/* Player — música na íntegra via YouTube (fallback: iTunes) */}
      {playerLoading ? (
        <div className="flex items-center gap-2 text-sm text-brand-muted bg-[#1A1A1A] rounded-xl px-4 py-3 border border-white/[0.06]">
          <Loader2 size={16} className="animate-spin" />
          <span>Looking for the full song...</span>
        </div>
      ) : playerSource === "youtube" && youtubeId ? (
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Youtube size={16} className="text-brand-accent" />
              Listen — Full Song
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold bg-brand-accent text-black px-3 py-1.5 rounded-full hover:brightness-110 transition-all"
            >
              <Youtube size={14} /> Watch on YouTube
            </a>
          </div>
          <div className="relative w-full aspect-video overflow-hidden rounded-lg">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
              title={`${songName} - ${artistName}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : playerSource === "itunes" && previewUrl ? (
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Music2 size={16} className="text-brand-accent" />
              Listen — Preview
            </div>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold bg-brand-accent text-black px-3 py-1.5 rounded-full hover:brightness-110 transition-all"
            >
              <Youtube size={14} /> Watch on YouTube
            </a>
          </div>
          <audio controls src={previewUrl} className="w-full" preload="none">
            Your browser does not support the audio element.
          </audio>
          <p className="text-[10px] text-brand-muted">
            30-second preview via iTunes — full song not found on YouTube.
          </p>
        </div>
      ) : (
        /* Sugestão: músicas similares do mesmo artista (quando não há vídeo nem preview) */
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <ListMusic size={16} className="text-brand-accent" />
            More from {artistName}
          </div>
          {similarTabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {similarTabs.map((t) => (
                <Link
                  key={t.id}
                  href={`/tab/${t.slug_artist || artistSlug}/${t.slug_song || slugify(t.song)}`}
                  className="block bg-white/[0.04] hover:bg-white/[0.08] rounded-lg p-3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ArtistAvatar name={t.artist || artistName} slug={t.slug_artist || artistSlug} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-brand-accent transition-colors">
                        {t.song}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {t.difficulty} · Key {t.key_sig}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-brand-muted">
                    <Eye size={12} /> {(t.views || 0).toLocaleString()} views
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-brand-muted">
              No other tabs available for {artistName} yet.
            </p>
          )}
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-brand-accent hover:underline font-bold"
          >
            Search on YouTube
          </a>
        </div>
      )}

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransposeControls />

        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MousePointer2 size={16} className="text-brand-accent" />
              Auto-scroll
            </div>
            {autoScroll && (
              <button
                onClick={() => setAutoScroll(false)}
                className="text-xs bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-full font-bold"
              >
                Stop
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-muted">Speed</span>
            <input
              type="range"
              min={1}
              max={15}
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="flex-1 accent-brand-accent"
            />
            <span className="text-sm font-bold w-6 text-right">{scrollSpeed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-muted">Version</span>
            <button className="flex items-center gap-1 text-sm font-bold bg-white/[0.06] px-3 py-1 rounded-lg">
              {version} <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Cifra */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-brand-muted">
          <Loader2 className="animate-spin mr-2" size={20} />
          <p>Loading tab...</p>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-10 border border-white/[0.06]">
          {!tab && (
            <div className="flex items-center gap-2 text-sm text-yellow-400/80 mb-4">
              <AlertTriangle size={16} />
              Preview tab — full version not found in database.
            </div>
          )}
          <pre className="cifra-content text-brand-text">
            {content || fallbackContent}
          </pre>
        </div>
      )}

      {/* Histórico */}
      <div className="flex items-center gap-2 text-sm text-brand-muted pt-2">
        <History size={16} />
        <span>Contributors: ChordProof Community · Last verified: recently</span>
      </div>
    </div>
  );
}
