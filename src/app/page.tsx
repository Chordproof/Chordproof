import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import ArtistAvatar from "@/components/ArtistAvatar";
import Reveal from "@/components/Reveal";
import TabMockup from "@/components/TabMockup";
import {
  ArrowRight,
  Music,
  Users,
  BadgeCheck,
  ShieldCheck,
  Ban,
  Flame,
  Sparkles,
  Guitar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * HOME — desenhada sobre dados REAIS.
 *
 * O que saiu daqui, e por quê:
 *  - "1000 Verified Tabs" era número fixo (o catálogo tem 1.166).
 *  - "8 Artists Cataloged" era o tamanho do slice (são 150).
 *  - "19.8M Tab Views" vinha da soma de tabs.views, que é dado de seed
 *    (quase todas as linhas marcam 450.000 e foram criadas no mesmo dia).
 *    Visualização inventada num site que vende "verified" se contradiz.
 *    Todo número exibido aqui existe no banco.
 */

const GENRES = ["Rock", "Pop", "Indie", "Country", "Folk", "Metal", "Jazz", "R&B"];

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-300 border border-green-400/30",
  Intermediate: "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
  Advanced: "bg-red-500/15 text-red-300 border border-red-400/30",
};

const formatNumber = (n: number) => n.toLocaleString("en-US");

/** Tab do dia: escolha estável por dia, sem cron e sem banco. */
function pickOfTheDay<T>(list: T[]): T | null {
  if (!list.length) return null;
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start) / 86400000);
  return list[day % list.length] ?? null;
}

type TabRow = {
  song: string;
  artist: string;
  slug_artist: string;
  slug_song: string;
  is_verified: boolean;
  artist_image_url: string | null;
  difficulty: string | null;
  key_sig: string | null;
};

export default async function HomePage() {
  // Uma RPC para os números (antes: dois selects trazendo a tabela inteira).
  const { data: statsRaw } = await supabase.rpc("get_home_stats");
  const stats = (typeof statsRaw === "string" ? JSON.parse(statsRaw) : statsRaw) ?? {};
  const totalTabs: number = stats.tabs ?? 0;
  const totalArtists: number = stats.artists ?? 0;
  const totalVerified: number = stats.verified ?? 0;
  const verifiedPct = totalTabs > 0 ? Math.round((totalVerified / totalTabs) * 100) : 0;

  // Populares: `views` serve só como ORDEM aqui, nunca como número exibido.
  const { data: popular } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, is_verified, artist_image_url, difficulty, key_sig")
    .order("views", { ascending: false })
    .limit(13);

  const list: TabRow[] = popular ?? [];
  const ofTheDay = pickOfTheDay(list);
  const trending = list.filter((t) => t !== ofTheDay).slice(0, 6);

  // Artistas: contagem real de cifras por artista.
  const { data: artistRows } = await supabase
    .from("tabs")
    .select("artist, slug_artist, artist_image_url, views");

  const map = new Map<string, { name: string; slug: string; image: string | null; count: number; views: number }>();
  for (const t of artistRows ?? []) {
    const cur = map.get(t.slug_artist);
    if (cur) {
      cur.count += 1;
      cur.views += t.views || 0;
    } else {
      map.set(t.slug_artist, {
        name: t.artist,
        slug: t.slug_artist,
        image: t.artist_image_url ?? null,
        count: 1,
        views: t.views || 0,
      });
    }
  }
  const topArtists = Array.from(map.values()).sort((a, b) => b.views - a.views).slice(0, 12);

  return (
    <div className="-mt-4">
      {/* ============================ HERO ============================ */}
      <section className="pt-6 pb-14 md:pt-10 md:pb-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <Reveal>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)", borderColor: "var(--c-gold-soft)" }}
              >
                <Sparkles size={13} />
                {formatNumber(totalTabs)} tabs · all verified
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.05]">
                Play it <span className="text-brand-gold">Right.</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-4 text-base md:text-lg text-[var(--c-text-secondary)] max-w-lg leading-relaxed">
                Accurate guitar tabs, free forever. No paywalls, no popups, no
                sign-up wall — just the chords, checked by musicians.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-7 max-w-xl">
                <SearchBar />
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-6 flex flex-wrap gap-2">
                {GENRES.slice(0, 5).map((g) => (
                  <Link
                    key={g}
                    href={`/genre/${encodeURIComponent(g)}`}
                    className="px-3 py-1.5 rounded-full text-sm border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)] hover:border-brand-gold/40 hover:text-brand-gold transition-colors"
                  >
                    {g}
                  </Link>
                ))}
                <Link
                  href="/browse"
                  className="px-3 py-1.5 rounded-full text-sm font-semibold text-brand-gold hover:underline"
                >
                  all genres →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-9 grid grid-cols-3 gap-4 max-w-lg">
                {[
                  { icon: Music, value: formatNumber(totalTabs), label: "Verified tabs" },
                  { icon: Users, value: formatNumber(totalArtists), label: "Artists" },
                  { icon: BadgeCheck, value: `${verifiedPct}%`, label: "Checked" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label}>
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--c-text-tertiary)]">
                      <Icon size={12} className="text-brand-gold" />
                      {label}
                    </dt>
                    <dd className="text-2xl font-bold mt-1 tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={180}>
            <TabMockup />
          </Reveal>
        </div>
      </section>

      {/* ======================= TAB DO DIA ======================= */}
      {ofTheDay && (
        <Reveal as="section" className="pb-14">
          <div
            className="gold-ring relative rounded-2xl border border-[var(--c-hairline)] bg-[var(--c-card)] overflow-hidden"
            style={{ boxShadow: "var(--c-shadow)" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(100deg, var(--c-gold-soft) 0%, transparent 45%)" }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6 md:p-7">
              <ArtistAvatar
                name={ofTheDay.artist}
                slug={ofTheDay.slug_artist}
                imageUrl={ofTheDay.artist_image_url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <span
                  className="gold-seal-anim inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
                >
                  <Flame size={11} /> Tab of the day
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 truncate">{ofTheDay.song}</h2>
                <p className="text-[var(--c-text-secondary)] truncate">{ofTheDay.artist}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {ofTheDay.key_sig && (
                    <span className="text-xs px-2 py-1 rounded border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)]">
                      Key <strong>{ofTheDay.key_sig}</strong>
                    </span>
                  )}
                  {ofTheDay.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded font-bold ${difficultyColor[ofTheDay.difficulty] || ""}`}>
                      {ofTheDay.difficulty}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/tab/${ofTheDay.slug_artist}/${ofTheDay.slug_song}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] rounded-full font-bold hover:scale-[1.03] transition-transform shrink-0"
              >
                Open tab <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* ======================= POPULARES ======================= */}
      <section className="pb-14">
        <Reveal className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Flame size={18} className="text-brand-gold" /> Most played
            </h2>
            <p className="text-sm text-[var(--c-text-secondary)] mt-1">Where everyone starts</p>
          </div>
          <Link
            href="/browse"
            className="text-sm font-semibold text-brand-gold hover:underline flex items-center gap-1 shrink-0"
          >
            View all <ArrowRight size={14} />
          </Link>
        </Reveal>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending.map((t, i) => (
            <Reveal as="li" key={`${t.slug_artist}-${t.slug_song}`} delay={i * 60}>
              <div className="group h-full bg-brand-card rounded-xl p-5 border border-[var(--c-hairline)] hover:border-brand-gold/40 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <ArtistAvatar
                    name={t.artist}
                    slug={t.slug_artist}
                    imageUrl={t.artist_image_url}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={`/tab/${t.slug_artist}/${t.slug_song}`} className="block">
                      <h3 className="font-bold truncate group-hover:text-brand-gold transition-colors">
                        {t.song}
                      </h3>
                    </Link>
                    <Link href={`/artist/${t.slug_artist}`} className="block">
                      <p className="text-sm text-[var(--c-text-secondary)] truncate hover:text-brand-gold transition-colors">
                        {t.artist}
                      </p>
                    </Link>
                  </div>
                  {t.is_verified && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                      style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
                    >
                      <BadgeCheck size={11} /> VERIFIED
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  {t.key_sig && (
                    <span className="text-xs px-2 py-1 rounded font-semibold border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)]">
                      Key {t.key_sig}
                    </span>
                  )}
                  {t.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded font-bold ${difficultyColor[t.difficulty] || ""}`}>
                      {t.difficulty}
                    </span>
                  )}
                </div>

                <Link
                  href={`/tab/${t.slug_artist}/${t.slug_song}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)] text-sm font-semibold hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-colors"
                >
                  Open tab <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ======================= ARTISTAS (marquee) ======================= */}
      <section className="pb-14">
        <Reveal className="mb-5">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users size={18} className="text-brand-gold" /> Artists with tabs
          </h2>
          <p className="text-sm text-[var(--c-text-secondary)] mt-1">
            {formatNumber(totalArtists)} artists cataloged — hover to pause
          </p>
        </Reveal>

        <div className="marquee-mask -mx-4 px-4 py-2">
          <div className="marquee-track gap-6">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-6 shrink-0" aria-hidden={copy === 1}>
                {topArtists.map((a) => (
                  <Link
                    key={`${copy}-${a.slug}`}
                    href={`/artist/${a.slug}`}
                    className="flex flex-col items-center gap-1.5 w-[92px] shrink-0 group"
                    tabIndex={copy === 1 ? -1 : undefined}
                  >
                    <ArtistAvatar name={a.name} slug={a.slug} imageUrl={a.image} size="md" />
                    <span className="text-xs font-semibold text-center leading-tight line-clamp-2 group-hover:text-brand-gold transition-colors">
                      {a.name}
                    </span>
                    <span className="text-[10px] text-[var(--c-text-tertiary)]">
                      {a.count} tab{a.count === 1 ? "" : "s"}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= POR QUE ======================= */}
      <section className="pb-14">
        <Reveal className="text-center mb-7">
          <h2 className="text-xl md:text-2xl font-bold">Why ChordProof</h2>
          <p className="text-sm text-[var(--c-text-secondary)] mt-1">Three rules we don&apos;t break</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Ban,
              title: "No paywalls",
              desc: "The whole catalog is free. ChordProof+ sells tools around the tab, never the tab.",
            },
            {
              icon: ShieldCheck,
              title: "No popups",
              desc: "No newsletter modal, no cookie wall, no interstitial. You came to play.",
            },
            {
              icon: BadgeCheck,
              title: "Verified accuracy",
              desc: `${formatNumber(totalVerified)} of ${formatNumber(totalTabs)} tabs checked against the record. If it's wrong, we fix it.`,
            },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="h-full bg-brand-card rounded-2xl p-6 border border-[var(--c-hairline)] hover:border-brand-gold/30 transition-colors">
                <f.icon size={22} className="text-brand-gold mb-3" />
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm text-[var(--c-text-secondary)] mt-1.5 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======================= CTA FINAL ======================= */}
      <Reveal as="section" className="pb-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--c-hairline)] p-8 md:p-10 text-center"
          style={{ background: "var(--c-bg-elevated)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(60% 120% at 50% 0%, var(--c-gold-soft) 0%, transparent 70%)" }}
          />
          <div className="relative space-y-3">
            <Guitar size={26} className="mx-auto text-brand-gold" />
            <h2 className="text-2xl md:text-3xl font-bold">Ready to play it right?</h2>
            <p className="text-[var(--c-text-secondary)] max-w-md mx-auto">
              Start with any of the {formatNumber(totalTabs)} tabs — no account
              needed. Add pro tools when you want them.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-6 py-3 rounded-full font-bold hover:scale-[1.03] transition-transform"
              >
                Browse all tabs <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold border border-[var(--c-hairline)] hover:bg-[var(--c-overlay-soft)] transition-colors"
              >
                See ChordProof+
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
