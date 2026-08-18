import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ videoId: null });

  try {
    const searchUrl = "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
    const html = await fetch(searchUrl, {
      headers: { "Accept-Language": "en" },
    }).then((r) => r.text());

    const matches = Array.from(html.matchAll(/"videoId":"([^"]{11})"/g)).map((m) => m[1]);
    const unique = Array.from(new Set(matches)).slice(0, 10);

    for (const id of unique) {
      try {
        const oembedUrl = "https://www.youtube.com/oembed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id) + "&format=json";
        const oembed = await fetch(oembedUrl);
        if (oembed.ok) {
          return NextResponse.json({ videoId: id });
        }
      } catch {
        // segue para o próximo candidato
      }
    }
    return NextResponse.json({ videoId: null });
  } catch {
    return NextResponse.json({ videoId: null });
  }
}
