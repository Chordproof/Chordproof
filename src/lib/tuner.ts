/**
 * Afinador — detecção de altura (pitch) no NAVEGADOR.
 *
 * PRINCÍPIO QUE MANDA EM TUDO AQUI: o áudio do microfone NUNCA sai do
 * dispositivo. Não há fetch, não há WebSocket, não há upload. O sinal do
 * microfone entra num AnalyserNode, é processado em JS na mesma aba e é
 * descartado. Fechar a página apaga tudo; nada é gravado.
 *
 * POR QUE AFINADOR E NÃO DETECTOR DE ACORDE: reconhecer UMA nota é um problema
 * resolvido. Reconhecer ACORDE não é — os números medidos dão F1 de 0,35 (FFT
 * simples) a 0,78 (modelo treinado). Um detector de acorde erra em ~1 de cada
 * 4 tentativas, e o erro mais comum é justamente o que mais importa ensinar
 * (corda abafada que ninguém ouve). Afinador pode ser honesto; detector de
 * acorde com FFT simples seria mentira com cara de recurso.
 *
 * ALGORITMO: YIN (de Cheveigné & Kawahara, 2002) por diferença acumulada
 * normalizada — não por FFT. Motivo: a fundamental de um violão é FRACA. O
 * mi grave (82 Hz) tem mais energia no 2º e 3º harmônicos que na fundamental,
 * e um analisador de espectro puro reporta 164 Hz (uma oitava acima). O YIN
 * compara o sinal com ele mesmo deslocado no tempo e acha o período REAL,
 * então acerta corda grave e violão desafinado.
 *
 * JANELA: ~93 ms (fftSize 8192 a 44,1 kHz). Janela maior daria mais precisão,
 * mas a leitura chegaria atrasada — e um afinador que responde devagar é pior
 * que nenhum, porque a pessoa continua girando a tarraxa no escuro.
 */

/** Nomes com sustenido — o violão é afinado assim (F#), nunca em bemol. */
export const NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export type Nota = {
  freq: number;
  midi: number;
  nome: string;
  /** desvio em cents: negativo = abaixo, positivo = acima do alvo */
  cents: number;
  /** 0..1 — quão limpa foi a detecção. Abaixo de ~0,35 é ruído, não nota. */
  clareza: number;
};

/** Frequência de uma nota MIDI (A4 = 69 = 440 Hz). */
export function midiParaFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Desvio em cents entre uma frequência e o alvo.
 * 100 cents = 1 semitom. É a unidade que o músico usa ("20 cents baixo").
 */
export function centsEntre(freq: number, alvo: number): number {
  return 1200 * Math.log2(freq / alvo);
}

/**
 * YIN — passo 1: diferença acumulada quadrática média normalizada.
 *
 * d(tau) = soma de (x[j] - x[j+tau])^2
 * Depois normaliza-se para que os vales fiquem em 0 e os "não-períodos" em 1.
 */
function diferenca(y: Float32Array, maxTau: number): Float32Array {
  const n = y.length;
  const d = new Float32Array(maxTau);
  for (let tau = 1; tau < maxTau; tau++) {
    let soma = 0;
    // só o trecho que cabe: comparar com o que existe evita inventar zeros
    const limite = n - tau;
    for (let j = 0; j < limite; j++) {
      const delta = y[j] - y[j + tau];
      soma += delta * delta;
    }
    d[tau] = soma;
  }

  // normalização acumulada (YIN eq. 7): sem ela, d(tau) cresce com tau e o
  // primeiro vale sempre parece o melhor — clássico erro de uma oitava abaixo
  const cmnd = new Float32Array(maxTau);
  cmnd[0] = 1;
  let acumulado = 0;
  for (let tau = 1; tau < maxTau; tau++) {
    acumulado += d[tau];
    cmnd[tau] = acumulado === 0 ? 1 : (d[tau] * tau) / acumulado;
  }
  return cmnd;
}

/**
 * YIN — passo 2: escolhe o primeiro vale abaixo do limiar e refina por
 * interpolação parabólica (sem isso a leitura fica em degraus de 1 Hz).
 */
const LIMIAR_COERENCIA = 0.15;

export function detectarPitch(
  amostras: Float32Array,
  taxaAmostragem: number
): { freq: number; clareza: number } | null {
  const n = amostras.length;
  // menor período possível: ~1200 Hz; maior: ~55 Hz (bem abaixo do mi grave)
  const maxTau = Math.min(Math.floor(n / 2), Math.floor(taxaAmostragem / 55));
  const minTau = Math.floor(taxaAmostragem / 1200);

  if (maxTau <= minTau + 2) return null;

  const cmnd = diferenca(amostras, maxTau);

  // primeiro vale que cruza o limiar
  let tau = -1;
  for (let t = minTau; t < maxTau; t++) {
    if (cmnd[t] < LIMIAR_COERENCIA) {
      // anda até o fundo deste vale
      while (t + 1 < maxTau && cmnd[t + 1] < cmnd[t]) t++;
      tau = t;
      break;
    }
  }

  // nenhum vale confiável: pode ser ruído, pode ser nota muito fraca.
  // Antes de desistir, tenta o menor valor global — mas exige clareza decente,
  // senão o afinador inventa nota a partir de conversa na sala.
  if (tau === -1) {
    let melhor = -1;
    let valor = Infinity;
    for (let t = minTau; t < maxTau; t++) {
      if (cmnd[t] < valor) {
        valor = cmnd[t];
        melhor = t;
      }
    }
    if (melhor === -1 || valor > 0.55) return null;
    tau = melhor;
  }

  /**
   * BORDA DA JANELA = "período mais longo do que eu consigo medir".
   * Sem esta checagem o detector devolve um valor INVENTADO: com maxTau em
   * 55 Hz, um zumbido de rede de 50 Hz era lido como "55,1 Hz" — número
   * plausível e falso, que faria a interface apontar uma corda inexistente.
   * Período na borda é ausência de resposta, não uma resposta ruim.
   */
  if (tau >= maxTau - 3) return null;

  // interpolação parabólica em volta do vale
  let tauFinal = tau;
  if (tau > 0 && tau < maxTau - 1) {
    const s0 = cmnd[tau - 1];
    const s1 = cmnd[tau];
    const s2 = cmnd[tau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (Math.abs(denom) > 1e-9) tauFinal = tau + (s2 - s0) / denom;
  }

  const freq = taxaAmostragem / tauFinal;
  if (!Number.isFinite(freq) || freq < 50 || freq > 1300) return null;

  return { freq, clareza: Math.max(0, Math.min(1, 1 - cmnd[tau])) };
}

/**
 * Transforma frequência em nota + desvio. Sem suavização: quem suaviza é a
 * interface, porque ela precisa saber se o valor oscila (corda) ou está firme.
 */
export function analisar(freq: number, clareza: number): Nota {
  const midiExato = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(midiExato);
  const alvo = midiParaFreq(midi);
  return {
    freq,
    midi,
    nome: NOTAS[((midi % 12) + 12) % 12],
    cents: Math.round(centsEntre(freq, alvo)),
    clareza,
  };
}

/** Como escrever a nota com oitava: A4, E2, D#3. */
export function nomeComOitava(midi: number): string {
  return NOTAS[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

/**
 * Cordas soltas em afinação padrão, do grave ao agudo.
 * `midi` é a altura real esperada: E2 = 40, A2 = 45, D3 = 50, G3 = 55,
 * B3 = 59, E4 = 64. É por essa lista que o afinador sabe DIZER qual corda a
 * pessoa está girando — informação que um mostrador de nota não dá.
 */
export const CORDA_PADRAO = [
  { corda: 6, midi: 40, nome: "E2" },
  { corda: 5, midi: 45, nome: "A2" },
  { corda: 4, midi: 50, nome: "D3" },
  { corda: 3, midi: 55, nome: "G3" },
  { corda: 2, midi: 59, nome: "B3" },
  { corda: 1, midi: 64, nome: "E4" },
] as const;

/** Afinações alternativas úteis — vêm de graça, já que a régua é a mesma. */
export const AFINACOES = {
  standard: { nome: "Standard", midis: [40, 45, 50, 55, 59, 64] },
  dropD: { nome: "Drop D", midis: [38, 45, 50, 55, 59, 64] },
  halfDown: { nome: "Half step down", midis: [39, 44, 49, 54, 58, 63] },
  openG: { nome: "Open G", midis: [38, 43, 48, 50, 55, 62] },
  ukulele: { nome: "Ukulele", midis: [55, 60, 64, 69] },
} as const;

export type AfinacaoKey = keyof typeof AFINACOES;

/**
 * Qual corda da afinação escolhida está mais perto desta nota. Só devolve algo
 * dentro de 1 semitom e meio — mais que isso não é a corda, é outra nota, e
 * dizer "corda 5" para quem tocou um dó seria pior que não dizer nada.
 */
export function cordaMaisProxima(
  midi: number,
  afinacao: AfinacaoKey
): { index: number; corda: number; desvioSemitons: number } | null {
  const midis = AFINACOES[afinacao].midis;
  let melhor = -1;
  let distancia = Infinity;
  midis.forEach((m, i) => {
    const d = Math.abs(m - midi);
    if (d < distancia) {
      distancia = d;
      melhor = i;
    }
  });
  if (melhor === -1 || distancia > 1.6) return null;
  // numeração tradicional: 1 = aguda. Ukulele não numera assim, mas manter a
  // mesma lógica evita um caso especial só para ele.
  return { index: melhor, corda: midis.length - melhor, desvioSemitons: midi - midis[melhor] };
}

/**
 * QUANTOS cents está "afinado". Ninguém consegue deixar uma corda a 0 cent —
 * pedir isso é frustração garantida. ±5 cents é o que o ouvido humano distingue
 * e o que qualquer afinador de mercado considera dentro.
 */
export const TOLERANCIA_CENTS = 5;

export function classificarCents(cents: number): "afinado" | "perto" | "baixo" | "alto" {
  const a = Math.abs(cents);
  if (a <= TOLERANCIA_CENTS) return "afinado";
  if (a <= 15) return "perto";
  return cents < 0 ? "baixo" : "alto";
}
