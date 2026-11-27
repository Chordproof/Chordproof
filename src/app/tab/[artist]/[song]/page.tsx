import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { buildTabMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import TabDetail from "@/lib/TabDetailComponent";

/**
 * A página precisa ser dinâmica: o conteúdo vive no Supabase e muda (traduções,
 * correções de tom). Mas o HTML PRECISA sair com a cifra dentro — antes era um
 * Client Component buscando via useEffect, e o Google recebia 19 KB em branco
 * (só a homepage chegou a ser indexada, com 1.166 páginas invisíveis).
 *
 * Agora o servidor busca a cifra e a passa como `initialTab`; o componente
 * cliente continua cuidando de transposição, autoscroll e instrumentos.
 */
export const dynamic = "force-dynamic";

async function getTab(artist: string, song: string) {
  const { data } = await supabase
    .from("tabs")
    .select("*")
    .eq("slug_artist", artist)
    .eq("slug_song", song)
    .maybeSingle();
  return data;
}

/**
 * O RÓTULO DE DIFICULDADE TEM UMA FONTE SÓ: a coluna `difficulty_auto`.
 *
 * POR QUE NÃO O CAMPO `difficulty`: medi os 1.166 e ele não discrimina —
 * "Beginner" tem média de 7,3 acordes distintos e "Advanced" 9,1, ou seja,
 * praticamente o mesmo. É rótulo digitado à mão, não informação.
 *
 * POR QUE NÃO CALCULAR EM JS: o `scoreDifficulty` em JS e a função SQL
 * divergem na FRONTEIRA de faixa (arredondamento). "Just The Way You Are" dá
 * 6.9 no JS (Beginner) e 8.0 no SQL (Easy). Com a cifra no JS e a trilha
 * /learn na coluna, a MESMA música aparecia com dois rótulos — foi o que
 * aconteceu: "Difficulty: Beginner" no cabeçalho e "Easy" na trilha.
 */
function difficultyLabelOf(tab: any): string | null {
  return tab?.difficulty_auto || tab?.difficulty || null;
}

export async function generateMetadata({
  params,
}: {
  params: { artist: string; song: string };
}): Promise<Metadata> {
  const tab = await getTab(params.artist, params.song);
  const base = buildTabMetadata({
    song: tab?.song || params.song.replace(/-/g, " "),
    artist: tab?.artist || params.artist.replace(/-/g, " "),
    keySig: tab?.key_sig,
    // a meta description também: é o texto que aparece no Google, e dizia
    // "Beginner" para uma música que o site classifica como Easy.
    difficulty: difficultyLabelOf(tab),
  });

  return {
    ...base,
    // Explícito: toda cifra deve ser indexada e seguida.
    robots: { index: true, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: { artist: string; song: string };
}) {
  const tab = await getTab(params.artist, params.song);

  const songName = tab?.song || params.song.replace(/-/g, " ");
  const artistName = tab?.artist || params.artist.replace(/-/g, " ");
  const tabUrl = `${SITE_URL}/tab/${params.artist}/${params.song}`;
  const difficultyLabel = difficultyLabelOf(tab);

  /**
   * `initialTab` vai com o rótulo resolvido nas DUAS chaves. O componente
   * cliente lê `difficulty_auto`; sobrescrever também `difficulty` garante que
   * qualquer outro trecho que leia o campo antigo mostre o mesmo valor. Assim
   * não existe caminho em que a página diga Beginner e a trilha diga Easy.
   */
  const initialTab = tab
    ? { ...tab, difficulty_auto: difficultyLabel, difficulty: difficultyLabel }
    : null;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MusicComposition",
          name: songName,
          composer: { "@type": "MusicGroup", name: artistName },
          musicalKey: tab?.key_sig || undefined,
          inLanguage: "en",
          url: tabUrl,
          isAccessibleForFree: true,
        }}
      />
      {/*
        Texto para o rastreador: garante ao menos um cabeçalho e uma descrição
        legíveis. sr-only mantém o visual intacto para o usuário.
      */}
      <div className="max-w-5xl mx-auto pt-8 px-4">
        <h1 className="sr-only">
          {songName} — {artistName} guitar tab and chords
        </h1>
        <p className="sr-only">
          Free, verified guitar tab and chords for {songName} by {artistName}
          {tab?.key_sig ? `, in the key of ${tab.key_sig}` : ""}.
          Read it online, transpose it, or print it — no paywall.
        </p>
      </div>

      <TabDetail params={params} initialTab={initialTab} />
    </div>
  );
}
