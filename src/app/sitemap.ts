import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap() {
  const { data: tabs } = await supabase
    .from("tabs")
    .select("slug_artist, slug_song, updated_at");

  const tabUrls = (tabs || []).map((t) => ({
    url: `${SITE_URL}/tab/${t.slug_artist}/${t.slug_song}`,
    lastModified: t.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily" as const, priority: 0.9 },
    ...tabUrls,
  ];
}
