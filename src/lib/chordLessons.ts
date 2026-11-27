/**
 * chordLessons.ts — a lição que aparece no PONTO DE NECESSIDADE.
 *
 * POR QUE AQUI E NÃO NUMA PÁGINA DE CURSO
 * Um curso de violão genérico ("aula 3: o acorde de Dó") ensina fora de
 * contexto: a pessoa não está tocando nada. Aqui a pessoa ABRIU a cifra de uma
 * música que quer tocar e clicou no acorde que não sabe fazer — é o único
 * momento em que a explicação tem peso, porque ela pode testar na hora.
 *
 * O QUE ESTA LIÇÃO DIZ (e o que não diz)
 *   - a DIGITAÇÃO em palavras, para quem não consegue ler o diagrama ainda;
 *   - o ERRO que mais acontece NAQUELE shape específico (não "dedilhe devagar");
 *   - uma dica FÍSICA do que faz soar;
 *   - o que vem depois.
 * Não promete prazo, não vende método e não substitui professor.
 */

export interface ChordLesson {
  /** Digitação em palavras, corda por corda. */
  shape: string;
  /** O ajuste físico que faz a corda soar. */
  tip: string;
  /** O erro mais comum NESTE shape. */
  mistake: string;
  /** O que abrir depois. */
  next?: string;
}

/**
 * Lições por acorde. As digitações batem com src/lib/chordData.ts —
 * CHORD_SHAPES[acorde], ordem E A D G B e.
 *
 * VERIFICADO por script: todo traste citado no texto é comparado com
 * CHORD_SHAPES e precisa bater. Foi assim que achei SEIS dedilhados errados
 * que eu mesmo tinha escrito de memória (Dm, A7, D7, B7, Cadd9, Bm
 * incompleto) — escrever de cabeça falha, e aqui falhar ensina errado.
 *
 * Os acordes escritos como "barra + dedos" (Bm, Bm7, F, F#, Bb) e os que
 * partem de outro shape ("D with the little finger added") não repetem as
 * cordas sob a barra de propósito: repetir tudo vira ruído para quem lê.
 */
export const CHORD_LESSONS: Record<string, ChordLesson> = {
  // ---------------------------------------------------------------- maiores
  C: {
    shape:
      "Index finger, 1st fret, B string. Middle finger, 2nd fret, D string. Ring finger, 3rd fret, A string. The G, B and high E ring open.",
    tip:
      "Let the ring finger lean in and touch the low E string — that string is not part of C, and muting it by accident is what gives the chord its clean, bright sound.",
    mistake:
      "The D string buzzes. It happens when the middle finger sits in the middle of the fret instead of just behind it — move it toward the fret wire.",
    next: "G and Am. C, G and Am in that order is one of the most common progressions in pop.",
  },
  D: {
    shape:
      "Index finger, 2nd fret, G string. Ring finger, 3rd fret, B string. Middle finger, 2nd fret, high E.",
    tip:
      "D only needs four strings: strum from the D string down. Hitting the low E and A turns it into a muddy chord — that is why the shape marks them X.",
    mistake:
      "The high E is muted by the ring finger leaning over. Arch that finger so the string passes clearly under it.",
    next: "A and G. D to A is the two-chord move most first songs are built on.",
  },
  E: {
    shape:
      "Index finger, 1st fret, G string. Middle finger, 2nd fret, A string. Ring finger, 2nd fret, D string. All six strings ring.",
    tip:
      "E is the fullest-sounding open chord because nothing is muted. Use it to check your hand: if all six ring, your fingers are standing properly.",
    mistake:
      "Pressing far from the fret and pushing hard to compensate — the note bends sharp and your hand cramps.",
  },
  G: {
    shape:
      "Middle finger, 3rd fret, low E. Index finger, 2nd fret, A string. Ring finger, 3rd fret, high E. The D, G and B ring open.",
    tip:
      "Drop the wrist so the palm does not touch the B string. G looks easy and then the B goes silent — that is almost always the palm, not the fingers.",
    mistake:
      "The B string dies under the hand. Raise the knuckles and check the string rings before you strum.",
    next:
      "C and D. G, C and D is the most common three-chord progression in rock and country.",
  },
  A: {
    shape:
      "Index finger, 2nd fret, D string. Middle finger, 2nd fret, G string. Ring finger, 2nd fret, B string.",
    tip:
      "Three fingers on the same fret look crowded, and that is fine — squeeze them together at an angle. Many players lay the index finger flat across the three strings instead, which is cleaner for some hands.",
    mistake:
      "The high E is muted because the ring finger leans into it. Curl the tip so it stays clear.",
    next: "D and E. A to D to E is the classic three-chord turnaround.",
  },

  // ----------------------------------------------------------------- menores
  Am: {
    shape:
      "Index finger, 1st fret, B string. Middle finger, 2nd fret, D string. Ring finger, 2nd fret, G string. High E rings open.",
    tip:
      "Am is C with one finger moved. If you can play C, you already know half of this one — learn them together.",
    mistake: "The high E goes silent from the ring finger leaning over.",
    next: "C and G. Am, C and G is the same progression as C, G and Am — just starting elsewhere.",
  },
  Em: {
    shape:
      "Middle finger, 2nd fret, A string. Ring finger, 2nd fret, D string. Everything else rings open.",
    tip:
      "Two fingers, six strings ringing. This is the easiest chord on the guitar and the right place to start if you are still learning to press a string.",
    mistake: "Pressing too hard. Em needs almost no force — squeeze and the notes go sharp.",
  },
  Dm: {
    shape:
      "Middle finger, 2nd fret, G string. Ring finger, 3rd fret, B string. Index finger, 1st fret, high E.",
    tip:
      "It is the D shape with one finger moved: the middle finger slides from the high E up to the G string, and the index takes the 1st fret of the high E. Learn D and the step is tiny.",
    mistake:
      "The high E lands on the 1st fret, one fret below D — if the index stays where it was for D, the chord sounds like D with an odd note on top.",
  },
  Bm: {
    shape:
      "Barre the A to high E strings at the 2nd fret. Ring and little finger on the 4th fret of the D and G strings, middle finger on the 3rd fret of the B string.",
    tip:
      "The barre covers FIVE strings, not six — the low E is muted. Trying to barre all six is what makes Bm feel impossible. This is the Am shape moved up two frets.",
    mistake:
      "The B string dies right under the joint of the index finger. Rotate the finger slightly so the string sits on the flat bone, not in the crease.",
  },

  Bm7: {
    shape:
      "Barre the A to high E strings at the 2nd fret. Ring finger on the 4th fret of the D string, middle finger on the 2nd fret of the G string, and the B string rings free.",
    tip:
      "This is the easiest barre on the site, and the reason the Learn path starts here: five strings at the 2nd fret, and one note (the B string) rings open instead of being pressed. If F feels impossible, Bm7 is the gentler way in — the hand learns the shape before it meets the 1st fret.",
    mistake:
      "Pressing all six strings. The low E is muted and the B string is left open — barring them makes the chord sound wrong, not just harder.",
    next: "Bm, which adds the 3rd fret of the B string under the same barre.",
  },

  // ----------------------------------------------------------------- pestana
  F: {
    shape:
      "Index finger barres all six strings at the 1st fret. Middle finger, 2nd fret, G string. Ring finger, 3rd fret, A string. Little finger, 3rd fret, D string.",
    tip:
      "Press with the SIDE of the index, not the flat, and keep it close to the fret wire. The thumb behind the neck is a lever, not a clamp — pulling the neck back with the thumb does most of the work.",
    mistake:
      "The B string dies in the crease of the finger, and the hand squeezes harder to fix it — which makes it worse. Rotate the index, do not crush it.",
    next:
      "F# and G. F's shape is the same moving up the neck: every fret you move it is one semitone. Learn this shape and you own twelve chords.",
  },
  "F#": {
    shape:
      "The same shape as F, moved up two frets: barre at the 2nd fret, with the ring, little and middle fingers on the 4th and 3rd frets.",
    tip:
      "If F works, F# works — it is the identical shape two frets higher. This is the point of barre chords: one shape, any key.",
    mistake:
      "Squeezing harder than at F. Higher up the neck the strings need LESS pressure, not more.",
  },
  Bb: {
    shape:
      "An A-shape barre at the 1st fret: index across the A to high E strings, ring finger across the 3rd fret of D, G and B.",
    tip:
      "This is the other barre family — the A shape moved up. F is the E shape, Bb is the A shape: two shapes cover every major chord on the neck.",
    mistake:
      "The high E is muted because the index does not reach it. Push the knuckle of the index slightly past the neck edge.",
  },

  // -------------------------------------------------------------- com sétima
  G7: {
    shape:
      "G with the little finger added on the 1st fret of the high E. Index on 2nd fret A, middle on 3rd fret low E.",
    tip:
      "G7 wants to go to C. Play G7 and stop — you will hear the chord leaning forward. That is what a seventh does: it pulls.",
    mistake: "The little finger mutes the B string by collapsing onto it.",
  },
  A7: {
    shape:
      "Index finger, 2nd fret, D string. Ring finger, 2nd fret, B string. The A, G and high E strings ring open.",
    tip:
      "Only two fingers, and it still sounds full — A7 is often easier than A for a beginner. Use it wherever you would reach for A but want a bit of grit.",
    mistake:
      "Adding the middle finger out of habit. A has three fingers; A7 has two, and the open G string is what makes it sound like a seventh.",
  },
  D7: {
    shape:
      "Index finger, 2nd fret, G string. Middle finger, 1st fret, B string. Ring finger, 2nd fret, high E.",
    tip:
      "D7 pulls toward G, the way G7 pulls toward C. Try D7 to G and hear it lean.",
    mistake:
      "The middle finger always wants to go back to the 2nd fret, where it sits for D. D7 puts it on the 1st — that is the note that makes it a seventh.",
  },
  B7: {
    shape:
      "Index finger, 1st fret, D string. Middle finger, 2nd fret, A string. Ring finger, 2nd fret, G string. Little finger, 2nd fret, high E. The B string rings open.",
    tip:
      "B7 is the friendly way into the key of E. It is an open shape — no barre — and many players reach for it instead of B.",
    mistake:
      "The four fingers crowd the 2nd fret and one ends up on top of another string. Check the B string: it must ring free between the ring and little fingers.",
  },
  Em7: {
    shape:
      "One finger: middle finger on the 2nd fret of the A string. Everything else rings open.",
    tip:
      "The single easiest chord shape there is. Em7 is a good first chord if pressing a note feels hard.",
    mistake: "Pressing so hard that the six open strings go sharp.",
  },
  Am7: {
    shape:
      "Am with the ring finger lifted: index on 1st fret B, middle on 2nd fret D. G string rings open.",
    tip: "Am7 is Am minus a finger — softer, and it does not demand a resolution.",
    mistake: "The G string buzzes when the middle finger is too far from the fret.",
  },

  // ------------------------------------------------------------------- sus
  Cadd9: {
    shape:
      "Middle finger, 2nd fret, D string. Ring finger, 3rd fret, A string. Little finger, 3rd fret, B string. The G and high E ring open — there is no 1st fret in this shape.",
    tip:
      "Cadd9 and G share three fingers in the same places, so changing between them costs almost nothing. That is why the pair shows up everywhere in acoustic music.",
    mistake:
      "The little finger lands on the G string instead of the B — the open G is what gives Cadd9 its shimmer, and pressing it kills the chord.",
  },
  Dsus4: {
    shape: "D with the little finger added on the 3rd fret of the high E.",
    tip:
      "Add and remove the little finger over D and you get a shimmer that many songs use as a hook. Try it: D, Dsus4, D.",
    mistake: "The high E gets a dead sound because the little finger lands on the fret, not behind it.",
  },
  Dsus2: {
    shape: "D with the middle finger lifted from the high E, so it rings open.",
    tip: "Dsus2 is D without the third — neither happy nor sad. It floats.",
    mistake: "Strumming the low E and A, which are not part of the chord.",
  },
};

/**
 * Lições genéricas por FAMÍLIA, para os acordes sem lição própria (o catálogo
 * tem 804 acordes usados; escrever 804 lições seria encher espaço).
 */
const FAMILY_LESSONS: { test: RegExp; lesson: ChordLesson }[] = [
  {
    test: /^[A-G][#b]?$/,
    lesson: {
      shape:
        "A major triad: root, major third and fifth. Around the neck it is played as either the E shape or the A shape, barre.",
      tip:
        "Every major chord on the guitar is one of two barre shapes moved up the neck — the E shape or the A shape. F is the E shape, Bb is the A shape.",
      mistake: "Squeezing harder instead of moving the finger closer to the fret.",
    },
  },
  {
    test: /^[A-G][#b]?m$/,
    lesson: {
      shape: "A minor triad: root, minor third and fifth.",
      tip:
        "The minor third is the note that makes it sound sad — one fret lower than the major third would be.",
      mistake: "Letting the barre mute the string under the joint of the finger.",
    },
  },
  {
    test: /sus/,
    lesson: {
      shape: "A suspended chord: the third is replaced by the second or the fourth.",
      tip:
        "A sus chord has no third, so it is neither major nor minor. It wants to fall back to the plain chord — that is why songs use it as a decoration.",
      mistake: "Treating it as a chord to resolve on, when it is a passing sound.",
    },
  },
  {
    test: /7|9|11|13/,
    lesson: {
      shape: "A chord with an added seventh on top of the triad.",
      tip:
        "The seventh adds tension. Dominant sevenths (G7, D7) pull strongly to the chord a fourth above; major sevenths just add colour.",
      mistake: "Muting the added note with a neighbouring finger — check each string one by one.",
    },
  },
];

export function lessonFor(chord: string): ChordLesson | null {
  if (CHORD_LESSONS[chord]) return CHORD_LESSONS[chord];
  // tira o baixo do slash chord: "D/F#" ensina o D
  const semBaixo = chord.split("/")[0];
  if (CHORD_LESSONS[semBaixo]) return CHORD_LESSONS[semBaixo];
  for (const f of FAMILY_LESSONS) {
    if (f.test.test(semBaixo)) return f.lesson;
  }
  return null;
}

/** Quantos acordes têm lição escrita à mão (para não mentir numa estatística). */
export const HAND_WRITTEN_LESSONS = Object.keys(CHORD_LESSONS).length;
