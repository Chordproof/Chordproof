/**
 * songBpm.ts — ANDAMENTO (BPM) da gravação, por música.
 *
 * POR QUE EXISTE: a /api/bpm lê o campo `bpm` do Deezer, mas na prática ele vem
 * NULO em quase toda faixa (medido: 10 de 10 nas mais visitadas). O fallback era
 * o "BPM típico" do padrão de batida — genérico, e o dono notou.
 *
 * COMO OS NÚMEROS FORAM OBTIDOS
 *  1. Referência: o andamento conhecido da gravação (46 das 50 mais visitadas).
 *  2. Detector por áudio (scripts/bpm_from_preview.py): baixa a prévia de 30s
 *     do Deezer, envelope de onset por bandas, autocorrelação com prior
 *     log-normal e beat tracking por programação dinâmica (Ellis 2007).
 *     Medido contra 20 BPMs conhecidos: 17/20 exatos; os 3 restantes caíram em
 *     dobro/metade, que é o MESMO tempo musical.
 *
 * LIMITE HONESTO: um BPM errado por oitava não muda a música — dobro/metade é
 * a mesma batida contada diferente. O PADRÃO de palhetada NÃO sai do áudio
 * (master mixado; ver lib/rhythmCuration.ts). Aqui é só o andamento.
 */

export const SONG_BPM: Record<string, number> = {
  "ac-dc/back-in-black": 94,
  "adele/someone-like-you": 67,
  "aerosmith/dream-on": 76,
  "ben-e-king/stand-by-me": 118,
  "bon-jovi/livin-on-prayer": 123,
  "bruno-mars/just-the-way-you-are": 109,
  "bruno-mars/when-i-was-your-man": 72,
  "christina-perri/a-thousand-years": 139,
  "coldplay/fix-you": 138,
  "coldplay/yellow": 87,
  "david-bowie/a-space-oddity": 136,
  "elvis-presley/cant-help-falling-in-love": 67,
  "foo-fighters/everlong": 157,
  "frank-sinatra/fly-me-to-the-moon": 119,
  "goo-goo-dolls/iris": 78,
  "green-day/boulevard-of-broken-dreams": 84,
  "grover-washington-jr/just-the-two-of-us": 107,
  "imagine-dragons/believer": 125,
  "john-denver/take-me-home-country-roads": 82,
  "journey/dont-stop-believin": 119,
  "justin-bieber/love-yourself": 100,
  "lady-gaga/shallow": 96,
  "linkin-park/in-the-end": 105,
  "metallica/enter-sandman": 123,
  "metallica/nothing-else-matters": 71,
  "michael-jackson/billie-jean": 117,
  "nirvana/come-as-you-are": 120,
  "nirvana/smells-like-teen-spirit": 117,
  "noah-kahan/stick-season": 117,
  "olivia-rodrigo/the-cure": 100,
  "passenger/let-her-go": 76,
  "pearl-jam/alive": 76,
  "pink-floyd/wish-you-were-here": 120,
  "poison/every-rose-has-its-thorn": 140,
  "prince/purple-rain": 113,
  "reo-speedwagon/keep-on-loving-you": 82,
  "red-hot-chili-peppers/californication": 97,
  "red-hot-chili-peppers/under-the-bridge": 84,
  "rem/losing-my-religion": 126,
  "styx/come-sail-away": 81,
  "swar/arko-janma-ma": 92,
  "the-cranberries/zombie": 84,
  "the-doors/light-my-fire": 126,
  "the-eagles/hotel-california": 75,
  "the-rolling-stones/paint-it-black": 157,
  "the-who/baba-oriley": 133,
  "vance-joy/riptide": 102,
  "van-halen/jump": 130,
  "whitesnake/here-go-again": 90,
  "zach-bryan/something-in-the-orange": 110,
};

/** BPM da gravação, ou null quando a música não está na tabela. */
export function bpmForSong(slugArtist: string, slugSong: string): number | null {
  const key = `${slugArtist}/${slugSong}`;
  if (SONG_BPM[key]) return SONG_BPM[key];
  const norm = (s: string) => s.toLowerCase().replace(/['’]/g, "");
  const alvo = norm(key);
  for (const k of Object.keys(SONG_BPM)) {
    if (norm(k) === alvo) return SONG_BPM[k];
  }
  return null;
}

export function bpmCount(): number {
  return Object.keys(SONG_BPM).length;
}
