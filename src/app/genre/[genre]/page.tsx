// src/app/genre/[genre]/page.tsx
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Music } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GenrePage({ params }: { params: { genre: string } }) {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("song, artist, slug_artist, slug_song, is_verified, views, artist_image_url")
    .eq("genre", params.genre)
    .order("views", { ascending: false });

  const allTabs = tabs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold">{params.genre} Tabs</h1>
        <p className="text-brand-muted mt-2">
          {allTabs.length} cifra(s) de {params.genre}
        </p>
      </div>

      {allTabs.length === 0 ? (
        <p className="text-brand-muted text-center py-16">
          Nenhuma cifra encontrada para o gênero &quot;{params.genre}&quot;.
        </p>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
          {allTabs.map((tab, idx) => (
           <div
  key={`${tab.slug_artist}-${tab.slug_song}`}
  className="break-inside-avoid flex items-center gap-3 px-4 py-3 mb-3 bg-brand-card rounded-xl border border-white/5 hover:border-brand-gold/30 hover:bg-white/5 transition group"
>
  <span className={`text-xl font-bold w-8 text-center flex-shrink-0 ${idx < 3 ? "text-brand-gold" : "text-brand-muted"}`}>{idx + 1}</span>
  <div className="min-w-0 flex-1">
    <Link href={`/tab/${tab.slug_artist}/${tab.slug_song}`} className="font-semibold truncate group-hover:text-brand-gold transition block">{tab.song}</Link>
    <Link href={`/artist/${tab.slug_artist}`} className="text-sm text-brand-muted truncate block hover:text-brand-gold hover:underline transition-colors">{tab.artist}</Link>
  </div>
  <Music size={16} className="text-brand-muted flex-shrink-0" />
</div>
          ))}
        </div>
      )}
    </div>
  );
}
