/**
 * rhythmCuration.ts — CURADORIA MANUAL da batida das músicas mais visitadas.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * O dono apontou (26/11) que a batida não era a da música. A ordem de decisão
 * passou a ser:
 *   1. CURADORIA (este arquivo) — o padrão que a gravação realmente usa
 *   2. instrução escrita na cifra (lib/rhythmFromTab.ts)
 *   3. gênero (lib/strumPatterns.ts) — reserva genérica
 *
 * POR QUE SÓ AS 50 MAIS VISITADAS
 * As 1.166 cifras não podem ser curadas de uma vez com honestidade. Fazer as
 * 50 mais visitadas concentra o esforço onde está quase todo o tráfego.
 *
 * COMO CADA LINHA FOI DECIDIDA
 * Pelo que a GRAVAÇÃO faz, não pelo gênero: "Wish You Were Here" é dedilhado
 * clássico (arpejo), "Smells Like Teen Spirit" é power chord em colcheias
 * (downstrokes), "Someone Like You" é piano em arpejo.
 *
 * HONESTIDADE
 * Quando eu não conheço a gravação com segurança, ela fica FORA do mapa e cai
 * no gênero — melhor um genérico marcado como "genre" do que uma invenção
 * marcada como "this song". `Arko Janma Ma` está nesse caso.
 *
 * RESULTADO medido nas 50 mais visitadas: 49 curadas, 1 no gênero.
 */

export interface CuratedEntry {
  /** id do padrão em lib/strumPatterns.ts ou lib/rhythmFromTab.ts */
  pattern: string;
  mode: "strum" | "arpeggio";
  /** observação curta do que a gravação faz (aparece em "why this rhythm?") */
  note: string;
}

/**
 * Chave: `${slug_artist}/${slug_song}`, exatamente como está no banco.
 * Serve para o site inteiro e não depende do id do banco.
 */
export const CURATED_RHYTHM: Record<string, CuratedEntry> = {
  "michael-jackson/billie-jean": {
    pattern: "downstrokes",
    mode: "strum",
    note: "The record is a straight-eighth guitar/bass figure over the drum machine — no shuffle.",
  },
  "bruno-mars/just-the-way-you-are": {
    pattern: "sixteen",
    mode: "strum",
    note: "Light sixteenth-note strumming under the piano and the 'oh, her eyes' hook.",
  },
  "aerosmith/dream-on": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Clean acoustic arpeggio in the verses; the riff takes over from the chorus.",
  },
  "foo-fighters/everlong": {
    pattern: "sixteen",
    mode: "strum",
    note: "Dave Grohl's right hand is sixteenth notes throughout, even under the quiet verse.",
  },
  "david-bowie/a-space-oddity": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Fingerpicked acoustic figure over the C–Em–Am progression.",
  },
  "imagine-dragons/believer": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The guitar's hook is picked single notes, not strummed chords.",
  },
  "poison/every-rose-has-its-thorn": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Classic power ballad: clean picked arpeggio in the verses, full chords at the chorus.",
  },
  "the-rolling-stones/paint-it-black": {
    pattern: "sixteen",
    mode: "strum",
    note: "Driven sixteenths; the sitar-like line rides on the same pulse.",
  },
  "pink-floyd/wish-you-were-here": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "One of the best-known fingerpicked intros in rock — Em7–G–Em7–G arpeggio.",
  },
  "red-hot-chili-peppers/under-the-bridge": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Frusciante's picked intro/verse figure; full chords only in the chorus.",
  },
  "van-halen/jump": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The guitar sits under a synth; what it plays is picked, not strummed.",
  },
  "the-doors/light-my-fire": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The organ-guitar intro is arpeggiated; the verse vamp is sparse.",
  },
  "green-day/boulevard-of-broken-dreams": {
    pattern: "downstrokes",
    mode: "strum",
    note: "Tempo acoustic with eighth-note downstrokes — the signature of the arrangement.",
  },
  "styx/come-sail-away": {
    pattern: "ballad",
    mode: "strum",
    note: "Ballad built on piano; guitar holds slow, ringing chords.",
  },
  "prince/purple-rain": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Slow picked arpeggio under the vocal, long ringing chords at the end of each line.",
  },
  "coldplay/fix-you": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The organ and guitar both pulse in picked arpeggios for most of the song.",
  },
  "journey/dont-stop-believin": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Piano arpeggio carries the intro and verse; the guitar doubles it.",
  },
  "adele/someone-like-you": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Piano arpeggio throughout — the voice floats over it with almost no strumming.",
  },
  "linkin-park/in-the-end": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Piano arpeggio and picked guitars; the chorus opens to block chords.",
  },
  "whitesnake/here-go-again": {
    pattern: "ballad",
    mode: "strum",
    note: "Slow power-ballad chords, one per bar with room to ring.",
  },
  "ac-dc/back-in-black": {
    pattern: "downstrokes",
    mode: "strum",
    note: "Malcolm and Angus take every chord in hard downstrokes — no upstrokes in the riff.",
  },
  "reo-speedwagon/keep-on-loving-you": {
    pattern: "ballad",
    mode: "strum",
    note: "Piano-led ballad; slow blocks of chords that ring.",
  },
  "coldplay/yellow": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Picked arpeggio under the verse — the riff is single notes, not strums.",
  },
  "pearl-jam/alive": {
    pattern: "standard",
    mode: "strum",
    note: "Straight rock strumming; the riff doubles the chords.",
  },
  "bon-jovi/livin-on-prayer": {
    pattern: "standard",
    mode: "strum",
    note: "Eighth-note strumming driven by the talk-box riff.",
  },
  "the-eagles/hotel-california": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The Bm–F#–A–E intro and verses are the reference fingerpicked arpeggio.",
  },
  "the-who/baba-oriley": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The synth and guitar both run arpeggios over the D–A–G loop.",
  },
  "elvis-presley/cant-help-falling-in-love": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Hawaiian-tinged picked arpeggio, the sound the song is built on.",
  },
  "john-denver/take-me-home-country-roads": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Picked acoustic figure under the verse vocal.",
  },
  "nirvana/come-as-you-are": {
    pattern: "downstrokes",
    mode: "strum",
    note: "Wah riff on top of straight downstroke chords.",
  },
  "metallica/nothing-else-matters": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The defining fingerpicked intro (Em–D–C) — no strumming until the chorus.",
  },
  "the-cranberries/zombie": {
    pattern: "downstrokes",
    mode: "strum",
    note: "F#m–D–A–E in relentless downstrokes/quarters.",
  },
  "goo-goo-dolls/iris": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Picked arpeggio in an alternate tuning with ringing open strings.",
  },
  "nirvana/smells-like-teen-spirit": {
    pattern: "downstrokes",
    mode: "strum",
    note: "Four-chord power-chord figure in eighth notes — the whole arrangement.",
  },
  "metallica/enter-sandman": {
    pattern: "downstrokes",
    mode: "strum",
    note: "Hetfield takes the Em figure in palm-muted downstrokes.",
  },
  "vance-joy/riptide": {
    pattern: "standard",
    mode: "strum",
    note: "Written on ukulele: simple down/up strum over Am–G–C.",
  },
  "lady-gaga/shallow": {
    pattern: "ballad",
    mode: "strum",
    note: "Em–D–G–C, slow rings and one strum per change in the opening.",
  },
  "passenger/let-her-go": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Fingerpicked figure under the entire song.",
  },
  "grover-washington-jr/just-the-two-of-us": {
    pattern: "funk",
    mode: "strum",
    note: "Jazz-funk syncopation; the guitar comps off the beat.",
  },
  "noah-kahan/stick-season": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Picked arpeggio over G–D–Em–C.",
  },
  "christina-perri/a-thousand-years": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Piano arpeggio under the vocal.",
  },
  "bruno-mars/when-i-was-your-man": {
    pattern: "ballad",
    mode: "strum",
    note: "Piano-led ballad: long chords, lots of room between changes.",
  },
  "ben-e-king/stand-by-me": {
    pattern: "standard",
    mode: "strum",
    note: "The bass carries the famous figure; the guitar strums on top.",
  },
  "frank-sinatra/fly-me-to-the-moon": {
    pattern: "ballad",
    mode: "strum",
    note: "Jazz standard: chords land on the bar and hang, no strum pattern to speak of.",
  },
  "justin-bieber/love-yourself": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The guitar is a fingerpicked figure, not strummed chords.",
  },
  "zach-bryan/something-in-the-orange": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Fingerpicked acoustic throughout.",
  },
  "olivia-rodrigo/the-cure": {
    pattern: "standard",
    mode: "strum",
    note: "Pop-rock strumming with the guitar carrying the song.",
  },
  "red-hot-chili-peppers/californication": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "Frusciante's picked arpeggio in the verse; chords only at the chorus.",
  },
  "rem/losing-my-religion": {
    pattern: "arpeggio",
    mode: "arpeggio",
    note: "The mandolin-style picked figure is the song's whole identity.",
  },
};

export function curatedRhythm(slugArtist: string, slugSong: string): CuratedEntry | null {
  const key = `${slugArtist}/${slugSong}`;
  if (CURATED_RHYTHM[key]) return CURATED_RHYTHM[key];
  // tolera apóstrofo ou hífen diferente entre versões do slug
  const norm = (s: string) => s.toLowerCase().replace(/['’]/g, "");
  const alvo = norm(key);
  for (const k of Object.keys(CURATED_RHYTHM)) {
    if (norm(k) === alvo) return CURATED_RHYTHM[k];
  }
  return null;
}

export function curatedCount(): number {
  return Object.keys(CURATED_RHYTHM).length;
}
