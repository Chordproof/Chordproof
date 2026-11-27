/**
 * Conferência de acorde no trainer — a versão HONESTA de "o site escuta você".
 *
 * O QUE ESTA LIB FAZ E O QUE ELA NÃO FAZ — a diferença decide o produto:
 *
 *   FAZ: o trainer JÁ SABE qual acorde a pessoa deve tocar. Então a pergunta
 *   não é "que acorde é esse?" (o problema difícil, F1 medido de 0,35 a 0,78),
 *   e sim "as notas que estão soando pertencem ao acorde que eu pedi?". Essa é
 *   uma pergunta de SIM/NÃO sobre um alvo conhecido, e é confiável.
 *
 *   NÃO FAZ: adivinhar acorde a partir do som. Se o site tentasse isso, erraria
 *   em ~1 de cada 4 tentativas e puniria quem acertou — o pior defeito possível
 *   num app que ensina.
 *
 * POR QUE CROMA (12 classes de nota) E NÃO "as 6 frequências das cordas":
 *   - o microfone do celular raramente separa as 6 cordas; ele entrega a soma;
 *   - a pestana produz várias cordas na MESMA nota, e contar por corda exigiria
 *     separação de fonte que não é viável no navegador;
 *   - a pergunta que importa ("as notas do acorde estão soando?") é exatamente
 *     a que a croma responde.
 *
 * A ARMADILHA QUE ESTA LIB RESOLVE: em C maior (C E G) a corda mais grave
 * tocada é o DÓ, terça MAIOR. Em C menor (C Eb G) a mais grave é o DÓ com o
 * MI BEMOL. Se a pessoa errar um dedo e fizer Cm achando que fez C, as notas
 * {C, Eb, G} contêm as duas do C (C e G) e faltaria só o E — um teste de
 * "quantos graus acertei" daria 2 de 3 e a chamaria de "quase". Comparar o
 * CONJUNTO inteiro rejeita: há uma nota estranha tocando. É por isso que a
 * decisão é por conjunto, e não por contagem parcial.
 */

import { parseChordName } from "./chordTheory";
import { midiParaFreq } from "./tuner";

/** 12 classes de nota, em [0..1] na escala de energia. */
export type Croma = Float32Array;

/**
 * QUAL JANELA DE ANÁLISE USAR PARA ESTE ACORDE.
 *
 * O PROBLEMA, MEDIDO: com a janela de 4096 amostras (93 ms) a resolução em
 * frequência é de ~10,8 Hz. Isso basta acima de ~200 Hz, mas NÃO basta no
 * registro grave: a corda de Mi grave está em 82 Hz e o ré de um Sol em 98 Hz,
 * onde um semitom é ~5,6 Hz — menor que a resolução. O resultado medido:
 * tocando um Sol perfeito, o Dó (nota errada mais próxima) aparecia em 0,47 e
 * o próprio Sol em 0,92, e a leitura oscilava entre certo e errado.
 *
 * Por isso, quando o acorde tem fundamental abaixo de ~160 Hz, a janela dobra
 * para 8192 (186 ms). O custo é 93 ms a mais para a leitura firmar — nada para
 * quem está segurando um acorde — e a alternativa era errar acordes com
 * pestana grave, que são metade do cancioneiro.
 */
export function janelaRecomendada(nome: string): number {
  const alvo = classesDoAcorde(nome);
  if (!alvo) return 4096;
  return alvo.temGrave ? 8192 : 4096;
}

const N_CLASSES = 12;

/** Frequência da nota mais grave considerada: E2 (mi grave do violão), ~82 Hz. */
const F_GRAVE = 70; // um pouco abaixo para não cortar corda levemente frouxa
/** Frequência da nota mais aguda considerada: E5, acima do E4 solto. */
const F_AGUDO = 700;

/**
 * Quais classes de nota o acorde EXIGE.
 *
 * Usa `parseChordName` — a mesma função que desenha o acorde no site, então a
 * régua da conferência e a régua do desenho nunca divergem. É de lá que vêm
 * "b5", "m7b5", "9-", "add9" e companhia.
 *
 * O BAIXO DO ACORDE INVERTIDO (C/G) não entra como exigência: exigir o sol na
 * voz mais grave faria o aluno perder por inversão, que é refinamento e não
 * acerto de acorde.
 */
export function classesDoAcorde(
  nome: string
): { classes: number[]; obrigatorias: number[]; temGrave: boolean } | null {
  const spec = parseChordName(nome);
  if (!spec) return null;
  const classes = Array.from(new Set(spec.intervals.map((i) => (spec.root + i) % 12))).sort(
    (a, b) => a - b
  );
  /**
   * OBRIGATÓRIAS = fundamental e terça.
   *
   * Motivo medido em campo: uma palhetada descuidada come a quinta ou a sétima
   * e a pessoa tocou o acorde certo. Já faltar a TERÇA significa que ela não
   * sabe se está fazendo maior ou menor — e faltar a FUNDAMENTAL significa que
   * ela está tocando outra coisa. Só essas duas reprovam.
   */
  const obrigatorias = [0, spec.intervals.includes(3) ? 3 : spec.intervals.includes(4) ? 4 : 0]
    .map((i) => (spec.root + i) % 12)
    .filter((v, i, a) => a.indexOf(v) === i);

  /**
   * TEM NOTA GRAVE? Um acorde é tocado com a fundamental na região grave do
   * violão (oitava 2). O ré de um Sol está em 98 Hz; o dó de um Dó, em 131 Hz.
   * Abaixo de ~160 Hz a janela curta não separa semitons.
   */
  const freqGrave = 440 * Math.pow(2, (spec.root - 33) / 12);
  return { classes, obrigatorias, temGrave: freqGrave < 160 };
}

/**
 * Croma a partir do espectro de magnitudes de um AnalyserNode.
 *
 * Cada bin da FFT é mapeado para uma classe de nota e a energia é somada,
 * com um peso por oitava: a fundamental de um violão é fraca, e sem esse peso
 * a croma seria dominada pelos harmônicos agudos.
 *
 * HARMÔNICOS — o que é feito e o que NÃO é: somar "de volta" uma fração do
 * harmônico para a fundamental foi considerado e DESCARTADO. Somar inflava a
 * fundamental de notas que a corda não tocou, criando acerto falso no acorde
 * errado. Quem trata o vazamento é a régua de `avaliarAcorde`.
 *
 * IMPORTANTE — a escala de entrada: `magnitudes` deve vir em AMPLITUDE
 * (0..1), não em decibel. `AnalyserNode.getFloatFrequencyData` devolve dB e
 * precisa ser convertido com `Math.pow(10, db / 20)` ANTES de entrar aqui —
 * ver o comentário no laço de `ChordTransitionTrainer`. Passar dB direto faz
 * tudo virar negativo ou zero e nada é reconhecido.
 */
export function cromaDoEspectro(
  magnitudes: Float32Array | Uint8Array,
  taxaAmostragem: number,
  fftSize: number
): Croma {
  const croma = new Float32Array(N_CLASSES);
  const binHz = taxaAmostragem / fftSize;
  const n = magnitudes.length;
  const maxBin = Math.min(n - 1, Math.floor(F_AGUDO / binHz));

  for (let i = 1; i <= maxBin; i++) {
    const freq = i * binHz;
    if (freq < F_GRAVE) continue; // descarta o "rumble" e o próprio DC
    const v = magnitudes[i];
    if (!(v > 0)) continue;

    const midiExato = 69 + 12 * Math.log2(freq / 440);
    const pc = ((Math.round(midiExato) % 12) + 12) % 12;
    const peso = 1 / Math.sqrt(Math.max(1, freq / 200));
    croma[pc] += v * peso;
  }

  // normaliza para [0..1]: o volume da palhetada não deve mudar o resultado
  let max = 0;
  for (let i = 0; i < N_CLASSES; i++) if (croma[i] > max) max = croma[i];
  if (max > 0) for (let i = 0; i < N_CLASSES; i++) croma[i] /= max;
  return croma;
}

/**
 * A DECISÃO. Recebe a croma medida e as classes do acorde esperado e responde:
 * acertou, faltou nota, ou tocou nota que não é do acorde.
 */
export const LIMIAR_PRESENTE = 0.22;

/**
 * LIMIAR DE NOTA ESTRANHA — relativizado à média do próprio acorde.
 *
 * O PROBLEMA QUE ISTO RESOLVE, MEDIDO: um C menor tocado no lugar de C maior
 * tem o MI BEMOL em 0,29 de energia enquanto o DÓ está em 1,00. Se o limiar
 * fosse um valor fixo, ele tinha de ficar acima de 0,29 para não acusar o
 * vazamento natural de um C certo (ré em 0,28, si em 0,26 — harmônicos da
 * quinta e da terça). Com o limiar entre 0,29 e 0,32 a margem era de 3
 * centésimos: qualquer microfone de celular derrubaria a decisão.
 *
 * A régua relativizada compara o que NÃO pertence com o que PERTENCE: no Cm o
 * D# (0,29) é relevante frente à média das notas do acorde C (C 1,00, E 0,23,
 * G 0,51 → média 0,58). A diferença aparece no FATOR.
 *
 * FATOR = 0,55 e PISO = 0,22: abaixo disso nunca acusa, para não reprovar por
 * ruído de fundo.
 */
export const FATOR_ESTRANHA = 0.55;
export const PISO_ESTRANHA = 0.22;

export type Veredito = {
  /** o acorde pedido está soando? só true quando não falta nada obrigatório */
  certo: boolean;
  /** graus do acorde que estão audíveis */
  presentes: number[];
  /** graus obrigatórios que não apareceram */
  faltando: number[];
  /** notas fora do acorde que estão fortes */
  estranhas: number[];
  /** confiança 0..1: combina cobertura do acorde com ausência de estranhas */
  confianca: number;
};

export function avaliarAcorde(croma: Croma, nome: string): Veredito | null {
  const alvo = classesDoAcorde(nome);
  if (!alvo) return null;

  const presentes: number[] = [];
  for (const pc of alvo.classes) if (croma[pc] >= LIMIAR_PRESENTE) presentes.push(pc);

  const faltando = alvo.obrigatorias.filter((pc) => croma[pc] < LIMIAR_PRESENTE);

  const media =
    alvo.classes.reduce((soma, pc) => soma + croma[pc], 0) / Math.max(1, alvo.classes.length);
  const limiteEstranha = Math.max(PISO_ESTRANHA, media * FATOR_ESTRANHA);

  /**
   * PROTEÇÃO CONTRA FUGA DE BAIXA RESOLUÇÃO.
   *
   * Para acordes COM nota grave, a energia vaza para a classe vizinha mesmo
   * com a janela longa: num Sol medido, o Dó aparecia em 0,47 enquanto o Sol
   * tinha 0,92. Isso é limitação da análise, não erro de quem tocou.
   *
   * Regra: com nota grave, só reprova uma nota de fora se ela for MAIS FORTE
   * que todas as notas do próprio acorde — sinal de acorde errado de verdade.
   */
  const estranhas: number[] = [];
  const maisForteDoAcorde = alvo.classes.reduce((m, pc) => Math.max(m, croma[pc]), 0);
  for (let pc = 0; pc < 12; pc++) {
    if (alvo.classes.includes(pc)) continue;
    const limite = alvo.temGrave
      ? Math.max(limiteEstranha, maisForteDoAcorde * 0.85)
      : limiteEstranha;
    if (croma[pc] >= limite) estranhas.push(pc);
  }

  const cobertura = alvo.classes.length ? presentes.length / alvo.classes.length : 0;
  // nota estranha custa mais que nota faltando: errar o acorde é o erro grave
  const penalidade = Math.min(0.6, estranhas.length * 0.3);
  const confianca = Math.max(0, Math.min(1, cobertura - penalidade));

  return {
    certo: faltando.length === 0 && estranhas.length === 0,
    presentes,
    faltando,
    estranhas,
    confianca,
  };
}

/**
 * Quantos milissegundos o veredito precisa se MANTER antes de contar.
 *
 * POR QUE NÃO PONTUAR NA PRIMEIRA LEITURA: uma palhetada é um transiente — nos
 * primeiros 50 ms o espectro tem tudo (inclusive o "clique" da palheta), e a
 * corda ainda está assentando. Pontuar na chegada daria acerto a quem passou
 * de raspão e erro a acorde bom. Meio segundo exige que a pessoa SEGURE o
 * acorde, que é exatamente o que se quer ensinar.
 */
export const ESTAVEL_MS = 420;

/**
 * Estado do conferidor ao longo do round. Mantido fora do React porque roda a
 * cada quadro (~60 Hz) e provocar render a 60 Hz mataria o celular.
 */
export type EstadoConferencia = {
  /** desde quando o veredito atual está igual */
  desde: number;
  /** ALVO do veredito em vigor: trocar de alvo reinicia o cronômetro */
  alvoAtual: string | null;
  /** último acorde pontuado, para não contar duas vezes a mesma troca */
  ultimoPontuado: string | null;
  acertos: number;
  erros: number;
  /** veredito corrente, para desenhar */
  atual: Veredito | null;
};

export function estadoInicial(): EstadoConferencia {
  return { desde: 0, alvoAtual: null, ultimoPontuado: null, acertos: 0, erros: 0, atual: null };
}

/**
 * Passo de avaliação. Devolve `evento` apenas quando há algo a PONTUAR — o
 * chamador não deve incrementar nada por conta própria, senão a contagem dupla
 * volta pela porta dos fundos.
 *
 * `alvo` é o nome do acorde que a pessoa deve tocar AGORA. Quando ela muda de
 * alvo, `ultimoPontuado` deixa de casar e a mesma posição pode pontuar de novo
 * na próxima volta da progressão — que é o comportamento desejado.
 */
export function passoConferencia(
  estado: EstadoConferencia,
  croma: Croma,
  alvo: string,
  agora: number
): { estado: EstadoConferencia; evento: "acerto" | "erro" | null } {
  const v = avaliarAcorde(croma, alvo);
  if (!v) return { estado, evento: null };

  // Só considera o quadro "estável" quando há sinal suficiente: microfone
  // mudo produz croma zerada, que reprovaria todo mundo sem a pessoa tocar.
  const energia = croma.reduce((a, b) => a + b, 0);
  if (energia < 0.25) {
    return { estado: { ...estado, atual: null, desde: 0 }, evento: null };
  }

  /**
   * O CRONÔMETRO DE ESTABILIDADE PERTENCE AO ALVO, não ao "acertou ou não".
   *
   * BUG QUE ISTO CORRIGE: a comparação era só `estado.atual.certo === v.certo`.
   * Como dois acordes seguidos são ambos "certos", o cronômetro não reiniciava
   * ao trocar de alvo e o novo acorde era pontuado no mesmo instante — dava
   * para segurar um Dó e ver a sequência inteira pontuar.
   */
  const mesmoVeredito =
    estado.atual !== null && estado.atual.certo === v.certo && estado.alvoAtual === alvo;
  const desde = mesmoVeredito ? estado.desde : agora;
  const novo = { ...estado, atual: v, desde, alvoAtual: alvo };

  if (agora - desde < ESTAVEL_MS) return { estado: novo, evento: null };

  if (v.certo) {
    if (estado.ultimoPontuado === alvo) return { estado: novo, evento: null };
    return {
      estado: { ...novo, acertos: estado.acertos + 1, ultimoPontuado: alvo },
      evento: "acerto",
    };
  }

  // ERRO: só conta quando FALTA algo obrigatório. Nota estranha isolada não
  // pontua contra — pode ser harmônico de outra corda ou a voz de quem canta.
  if (v.faltando.length > 0) {
    const chave = "erro:" + alvo;
    if (estado.ultimoPontuado === chave) return { estado: novo, evento: null };
    return {
      estado: { ...estado, erros: estado.erros + 1, ultimoPontuado: chave },
      evento: "erro",
    };
  }

  return { estado: novo, evento: null };
}

/**
 * Nome legível da nota de uma classe (0..11), com sustenido.
 * Usado nas mensagens ("you are missing the G#").
 */
const NOMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export function nomeClasse(pc: number): string {
  return NOMES[((pc % 12) + 12) % 12];
}

/**
 * Frequência de referência para SUGERIR a correção: a fundamental do acorde,
 * não a da nota faltante — tocar a nota faltante sozinha não é o acorde.
 */
export function frequenciaReferencia(nome: string): number | null {
  const spec = parseChordName(nome);
  if (!spec) return null;
  const midi = 48 + spec.root;
  return midiParaFreq(midi);
}
