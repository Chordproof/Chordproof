import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ videoId: null });

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    const html = await fetch(url, {
      headers: { "Accept-Language": "en" },
    }).then((r) => r.text());

    // Extrai o primeiro videoId da busca
    const match = html.match(/"videoId":"([^"]{11})"/);
    return NextResponse.json({ videoId: match ? match[1] : null });
  } catch {
    return NextResponse.json({ videoId: null });
  }
}
