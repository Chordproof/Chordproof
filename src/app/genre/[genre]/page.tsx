// src/app/genre/[genre]/page.tsx
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function GenrePage({ params }: { params: { genre: string } }) {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("*")
    .eq("genre", params.genre)
    .order("song");

  return (
    <main>
      <h1>{params.genre} Tabs</h1>
      <p>{tabs?.length ?? 0} tabs</p>
      <div className="grid">
        {tabs?.map((tab) => (
          <Link key={tab.id} href={`/tab/${tab.slug_artist}/${tab.slug_song}`}>
            <h3>{tab.song}</h3>
            <p>{tab.artist}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
