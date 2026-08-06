import { NextResponse } from "next/server";

// Busca no YouTube e retorna o PRIMEIRO vídeo que permite incorporação
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ videoId: null });

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    const html = await fetch(url, {
      headers: { "Accept-Language": "en" },
    }).then((r) => r.text());

    // Extrai TODOS os videoIds da página de busca
    const matches = Array.from(html.matchAll(/"videoId":"([^"]{11})"/g)).map((m) => m[1]);
    const unique = Array.from(new Set(matches)).slice(0, 10);

    // Testa cada vídeo até achar um que permita incorporação
    // (o endpoint oEmbed do YouTube responde 200 se incorporável e 401 se bloqueado)
    for (const id of unique) {
      try {
        const oembed = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            `https://www.youtube.com/watch?v=${id}`
          )}&format=json`
        );
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
