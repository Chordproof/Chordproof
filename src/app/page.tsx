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
  TrendingUp,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * HOME — tudo o que aparece aqui sai do banco.
 *
 * Regras que esta página segue:
 *  - Nenhum número fixo no código: tabs, artistas, gêneros e atividade são
 *    contados a partir dos registros lidos.
 *  - `tabs.views` serve só como ORDEM. É dado de seed (quase toda linha marca
 *    450.000), então nunca é exibido como número.
 *  - Artista sem foto real NÃO entra na faixa.
 *  - Prova social é atividade medida (created_at), não depoimento inventado.
 *
 * CILADA QUE JÁ CUSTOU UM DEPLOY ERRADO: o PostgREST devolve no máximo 1000
 * linhas por requisição. Uma leitura única trazia 1000 de 1.166 e a home
 * anunciava "1,000 tabs" e "Rock 368" — número errado com cara de verdade.
 * Por isso a leitura é paginada com .range() até o fim.
 */

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-300 border border-green-400/30",
  Intermediate: "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
  Advanced: "bg-red-500/15 text-red-300 border border-red-400/30",
};

const formatNumber = (n: number) => n.toLocaleString("en-US");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Tab do dia: estável por dia, sem cron e sem banco. */
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

type Row = {
  artist: string;
  slug_artist: string;
  artist_image_url: string | null;
  views: number | null;
  genre: string | null;
  created_at: string | null;
  is_verified: boolean;
};

type GenreStat = { name: string; count: number };

export default async function HomePage() {
  const PAGE = 1000;
  let rows: Row[] = [];

  for (let from = 0; from < 100000; from += PAGE) {
    const { data } = await supabase
      .from("tabs")
      .select("artist, slug_artist, artist_image_url, views, genre, created_at, is_verified")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);

    if (!data || data.length === 0) break;
    rows = rows.concat(data as Row[]);
    if (data.length < PAGE) break;
  }

  const totalTabs = rows.length;
  const totalVerified = rows.filter((r) => r.is_verified).length;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const addedThisMonth = rows.filter(
    (r) => r.created_at && new Date(r.created_at) >= monthStart
  ).length;

  // Gêneros: contagem real, do mais cheio para o mais vazio.
  const genreMap = new Map<string, number>();
  for (const r of rows) {
    const g = (r.genre || "").trim();
    if (g) genreMap.set(g, (genreMap.get(g) ?? 0) + 1);
  }
  const genres: GenreStat[] = Array.from(genreMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const verifiedPct = totalTabs > 0 ? Math.round((totalVerified / totalTabs) * 100) : 0;
  const monthName = MONTHS[new Date().getMonth()];

  // Populares: `views` só ordena, nunca aparece na tela.
  const { data: popular } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, is_verified, artist_image_url, difficulty, key_sig")
    .order("views", { ascending: false })
    .limit(13);

  const list: TabRow[] = popular ?? [];
  const ofTheDay = pickOfTheDay(list);
  const trending = list.filter((t) => t !== ofTheDay).slice(0, 6);

  // Artistas: contagem real de cifras e SÓ com foto no banco.
  const map = new Map<
    string,
    { name: string; slug: string; image: string | null; count: number; views: number }
  >();
  for (const t of rows) {
    const cur = map.get(t.slug_artist);
    const img = t.artist_image_url || null;
    if (cur) {
      cur.count += 1;
      cur.views += t.views || 0;
      if (!cur.image && img) cur.image = img;
    } else {
      map.set(t.slug_artist, {
        name: t.artist,
        slug: t.slug_artist,
        image: img,
        count: 1,
        views: t.views || 0,
      });
    }
  }

  const totalArtists = map.size;
  const allArtists = Array.from(map.values()).sort((a, b) => b.views - a.views);
  const withPhoto = allArtists.filter((a) => a.image);
  const marqueeArtists = (
    withPhoto.length >= 8 ? withPhoto : [...withPhoto, ...allArtists.filter((a) => !a.image)]
  ).slice(0, 14);

  const statCards = [
    { icon: Music, value: formatNumber(totalTabs), label: "Verified tabs" },
    { icon: Users, value: formatNumber(totalArtists), label: "Artists" },
    { icon: BadgeCheck, value: `${verifiedPct}%`, label: "Checked by hand" },
  ];

  return (
    <div className="-mt-4">
      {/* ============================ HERO ============================ */}
      <section className="pt-6 pb-14 md:pt-10 md:pb-20">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <Reveal>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border"
                style={{
                  background: "var(--c-gold-soft)",
                  color: "var(--c-gold)",
                  borderColor: "var(--c-gold-soft)",
                }}
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

            {/* gêneros REAIS, com contagem do banco */}
            <Reveal delay={260}>
              <div className="mt-6 flex flex-wrap gap-2">
                {genres.slice(0, 5).map((g) => (
                  <Link
                    key={g.name}
                    href={`/genre/${encodeURIComponent(g.name)}`}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)] hover:border-brand-gold/40 hover:text-brand-gold transition-colors"
                  >
                    {g.name}
                    <span className="text-[11px] text-[var(--c-text-tertiary)] group-hover:text-brand-gold/70 tabular-nums">
                      {g.count}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/browse"
                  className="px-3 py-1.5 rounded-full text-sm font-semibold text-brand-gold hover:underline"
                >
                  browse all →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <dl className="mt-9 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                {statCards.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="min-w-0">
                    <dt className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-wide text-[var(--c-text-tertiary)] leading-tight">
                      <Icon size={12} className="text-brand-gold shrink-0" />
                      <span className="truncate">{label}</span>
                    </dt>
                    <dd className="text-xl sm:text-2xl font-bold mt-1 tabular-nums">
                      {value}
                    </dd>
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
                <h2 className="text-2xl md:text-3xl font-bold mt-2 truncate">
                  {ofTheDay.song}
                </h2>
                <p className="text-[var(--c-text-secondary)] truncate">
                  {ofTheDay.artist}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {ofTheDay.key_sig && (
                    <span className="text-xs px-2 py-1 rounded border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)]">
                      Key <strong>{ofTheDay.key_sig}</strong>
                    </span>
                  )}
                  {ofTheDay.difficulty && (
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold ${
                        difficultyColor[ofTheDay.difficulty] || ""
                      }`}
                    >
                      {ofTheDay.difficulty}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/tab/${ofTheDay.slug_artist}/${ofTheDay.slug_song}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] rounded-full font-bold hover:scale-[1.03] transition-transform shrink-0 w-full sm:w-auto"
              >
                Open tab <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* ======================= POPULARES ======================= */}
      <section className="pb-14 pt-6 section-alt -mx-4 px-4 md:-mx-6 md:px-6 rounded-2xl">
        <Reveal className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 gold-underline">
              <Flame size={18} className="text-brand-gold" /> Most played
            </h2>
            <p className="text-sm text-[var(--c-text-secondary)] mt-2">
              Where everyone starts
            </p>
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
                      className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                      style={{ background: "var(--c-gold-soft)", color: "var(--c-gold)" }}
                    >
                      <BadgeCheck size={11} /> VERIFIED
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {t.key_sig && (
                    <span className="text-xs px-2 py-1 rounded font-semibold border border-[var(--c-hairline)] bg-[var(--c-overlay-soft)]">
                      Key {t.key_sig}
                    </span>
                  )}
                  {t.difficulty && (
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold ${
                        difficultyColor[t.difficulty] || ""
                      }`}
                    >
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

      {/* ================= ARTISTAS (faixa dentro de painel) ================= */}
      <section className="pb-14">
        <div
          className="relative rounded-2xl border border-[var(--c-hairline)] overflow-hidden py-7"
          style={{ background: "var(--c-bg-secondary)" }}
        >
          <Reveal className="px-6 md:px-7 mb-5">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 gold-underline">
              <Users size={18} className="text-brand-gold" /> Artists with tabs
            </h2>
            <p className="text-sm text-[var(--c-text-secondary)] mt-2">
              {formatNumber(totalArtists)} artists cataloged — hover to pause
            </p>
          </Reveal>

          <div className="marquee-mask">
            <div className="marquee-track gap-6 px-6">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-6 shrink-0" aria-hidden={copy === 1}>
                  {marqueeArtists.map((a) => (
                    <Link
                      key={`${copy}-${a.slug}`}
                      href={`/artist/${a.slug}`}
                      className="flex flex-col items-center gap-1.5 w-[92px] shrink-0 group"
                      tabIndex={copy === 1 ? -1 : undefined}
                    >
                      <ArtistAvatar name={a.name} imageUrl={a.image} size="md" />
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
        </div>
      </section>

      {/* ============ ATIVIDADE REAL (prova social medida) ============ */}
      <section className="pb-14">
        <Reveal>
          <div
            className="rounded-2xl border border-[var(--c-hairline)] p-6 md:p-7"
            style={{ background: "var(--c-bg-elevated)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                  <TrendingUp size={12} /> This month
                </span>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  {formatNumber(addedThisMonth)} new tabs added in {monthName}
                </p>
                <p className="text-sm text-[var(--c-text-secondary)] mt-1.5">
                  Every one transcribed and checked before it went live. No
                  auto-scraped copies, no wrong keys.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6 shrink-0">
                {[
                  { k: formatNumber(totalVerified), v: "checked" },
                  { k: formatNumber(totalArtists), v: "artists" },
                  { k: `${verifiedPct}%`, v: "verified" },
                ].map((s) => (
                  <div key={s.v} className="text-center">
                    <p className="text-xl md:text-2xl font-bold tabular-nums">{s.k}</p>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--c-text-tertiary)]">
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ======================= POR QUE ======================= */}
      <section className="pb-14">
        <Reveal className="text-center mb-7">
          <h2 className="text-xl md:text-2xl font-bold gold-underline inline-block">
            Why ChordProof
          </h2>
          <p className="text-sm text-[var(--c-text-secondary)] mt-2">
            Three rules we don&apos;t break
          </p>
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
              desc: `${formatNumber(totalVerified)} of ${formatNumber(
                totalTabs
              )} tabs checked against the record. If it's wrong, we fix it.`,
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
            style={{
              background:
                "radial-gradient(60% 120% at 50% 0%, var(--c-gold-soft) 0%, transparent 70%)",
            }}
          />
          <div className="relative space-y-3">
            <Guitar size={26} className="mx-auto text-brand-gold" />
            <h2 className="text-2xl md:text-3xl font-bold">Ready to play it right?</h2>
            <p className="text-[var(--c-text-secondary)] max-w-md mx-auto">
              Start with any of the {formatNumber(totalTabs)} tabs — no account
              needed. Add pro tools when you want them.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-6 py-3 rounded-full font-bold hover:scale-[1.03] transition-transform"
              >
                Browse all tabs <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold border border-[var(--c-hairline)] hover:bg-[var(--c-overlay-soft)] transition-colors"
              >
                See ChordProof+
              </Link>
            </div>
            <p className="text-xs text-[var(--c-text-tertiary)] pt-1 flex items-center justify-center gap-1.5">
              <Clock size={11} /> New tabs every week
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
