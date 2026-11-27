"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, AlertTriangle, Check, Volume2, Lock } from "lucide-react";
import { audioEngine } from "@/lib/audio";
import {
  AFINACOES,
  CORDA_PADRAO,
  TOLERANCIA_CENTS,
  analisar,
  classificarCents,
  cordaMaisProxima,
  detectarPitch,
  midiParaFreq,
  nomeComOitava,
  type AfinacaoKey,
  type Nota,
} from "@/lib/tuner";

/**
 * Tuner — o afinador.
 *
 * DECISÃO DE PRIVACIDADE (pedido do dono): o áudio do microfone NUNCA sai do
 * dispositivo. Não existe fetch, WebSocket ou upload neste componente; o
 * getUserMedia entrega o sinal a um AnalyserNode, o JS lê as amostras e o
 * buffer morre. Não há gravação, não há histórico, não há log de áudio.
 *
 * POR QUE A AGULHA E NÃO UM NÚMERO: quem afina está com as duas mãos
 * ocupadas — uma na tarraxa, outra na corda. Ler "12 cents" exige interpretar;
 * ver a agulha fora do centro, não. Por isso o mostrador é a informação
 * principal e o número é detalhe.
 *
 * POR QUE A CORDA É IDENTIFICADA: um mostrador de nota diz "A" e a pessoa não
 * sabe se é a corda 5 solta ou um lá na 6ª casa. O afinador diz "String 5".
 */

const HISTORICO = 8; // leituras para a mediana — o suficiente para firmar sem atrasar

export default function Tuner() {
  const [ligado, setLigado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [nota, setNota] = useState<Nota | null>(null);
  const [nivel, setNivel] = useState(0);
  const [afinacao, setAfinacao] = useState<AfinacaoKey>("standard");
  const [modo, setModo] = useState<"auto" | "corda">("auto");
  const [cordaAlvo, setCordaAlvo] = useState(0); // índice em AFINACOES[afinacao].midis

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  // últimas frequências, para a mediana: corda vibra, leitura oscila
  const histRef = useRef<number[]>([]);

  const parar = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    bufferRef.current = null;
    histRef.current = [];
    setLigado(false);
    setNota(null);
    setNivel(0);
  }, []);

  useEffect(() => () => parar(), [parar]);

  const iniciar = useCallback(async () => {
    setErro(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErro(
          "This browser does not expose the microphone to web pages. On iPhone, open the site in Safari — some in-app browsers block it."
        );
        return;
      }
      // processamento de voz LIGADO de propósito: cancelamento de eco e
      // supressão de ruído removem zumbido de sala, que é o que mais atrapalha
      // a detecção de altura. Auto-gain desligado porque ele "bombeia" o
      // volume e o nível RMS deixa de significar o volume real da corda.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const fonte = ctx.createMediaStreamSource(stream);
      // filtro passa-alta: corta o "rumble" abaixo de 60 Hz (ventilador, ar,
      // caminhão na rua) que o YIN poderia interpretar como período longo
      const passaAlta = ctx.createBiquadFilter();
      passaAlta.type = "highpass";
      passaAlta.frequency.value = 60;
      passaAlta.Q.value = 0.7;

      const analisador = ctx.createAnalyser();
      analisador.fftSize = 8192; // ~93 ms de janela em 44,1 kHz
      analisador.smoothingTimeConstant = 0;

      fonte.connect(passaAlta);
      passaAlta.connect(analisador);
      // NÃO conectamos ao destination: nada é tocado, então não há microfonia.

      bufferRef.current = new Float32Array(analisador.fftSize);
      setLigado(true);

      const laco = () => {
        const buf = bufferRef.current;
        if (!buf) return;
        analisador.getFloatTimeDomainData(buf);

        // nível RMS: diz "toque a corda" quando está baixo demais
        let soma = 0;
        for (let i = 0; i < buf.length; i++) soma += buf[i] * buf[i];
        const rms = Math.sqrt(soma / buf.length);
        setNivel(Math.min(1, rms * 8));

        if (rms < 0.004) {
          // silêncio: não segura a última nota na tela como se fosse leitura
          histRef.current = [];
          setNota(null);
        } else {
          const d = detectarPitch(buf, ctx.sampleRate);
          if (d && d.clareza > 0.5) {
            const h = histRef.current;
            h.push(d.freq);
            if (h.length > HISTORICO) h.shift();
            // mediana: imune a um pico isolado, diferente da média
            const ord = [...h].sort((a, b) => a - b);
            const freq = ord[Math.floor(ord.length / 2)];
            setNota(analisar(freq, d.clareza));
          }
        }
        rafRef.current = requestAnimationFrame(laco);
      };
      rafRef.current = requestAnimationFrame(laco);
    } catch (e: unknown) {
      const nome = (e as { name?: string })?.name;
      if (nome === "NotAllowedError") {
        setErro(
          "Microphone permission was denied. Allow it in the browser's site settings and try again."
        );
      } else if (nome === "NotFoundError") {
        setErro("No microphone was found on this device.");
      } else {
        setErro("Could not open the microphone. Try again, or use another browser.");
      }
      parar();
    }
  }, [parar]);

  /** Toca a nota de referência — só o alvo, sem ouvir o microfone. */
  const tocarReferencia = async (midi: number) => {
    await audioEngine.unlock();
    audioEngine.playNote(midi, { volume: 0.5 });
  };

  const midis = AFINACOES[afinacao].midis;
  const alvoMidi = midis[Math.min(cordaAlvo, midis.length - 1)];
  const alvoFreq = midiParaFreq(alvoMidi);

  /**
   * O que a agulha mostra.
   * No modo "corda" ela aponta o desvio contra a corda ESCOLHIDA — é o modo de
   * quem está afinando de propósito. No modo "auto" ela aponta contra a nota
   * mais próxima da escala, que é o que serve para descobrir o que está errado.
   */
  const leitura = (() => {
    if (!nota) return null;
    if (modo === "corda") {
      const cents = Math.round(1200 * Math.log2(nota.freq / alvoFreq));
      return {
        cents: Math.max(-50, Math.min(50, cents)),
        nome: nomeComOitava(alvoMidi),
        corda: null as number | null,
      };
    }
    const c = cordaMaisProxima(nota.midi, afinacao);
    return {
      cents: Math.max(-50, Math.min(50, nota.cents)),
      nome: nomeComOitava(nota.midi),
      corda: c ? c.corda : null,
    };
  })();

  const estado = leitura ? classificarCents(leitura.cents) : null;
  const afinado = estado === "afinado";
  const corEstado = afinado
    ? "var(--c-chord)"
    : estado === "perto"
    ? "var(--c-gold)"
    : "var(--c-text-secondary)";

  // -50..50 cents -> -1..1 na agulha
  const pos = leitura ? Math.max(-1, Math.min(1, leitura.cents / 50)) : 0;

  const legenda = !ligado
    ? "Press Start and allow the microphone"
    : !nota
    ? nivel < 0.05
      ? "Pluck a string…"
      : "Listening…"
    : modo === "corda"
    ? `Tuning ${nomeComOitava(alvoMidi)}`
    : leitura && leitura.corda
    ? `String ${leitura.corda} · ${leitura.cents > 0 ? "+" : ""}${leitura.cents} cents`
    : leitura
    ? `${leitura.cents > 0 ? "+" : ""}${leitura.cents} cents`
    : "";

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      {/* cabeçalho */}
      <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mic size={18} className="text-brand-gold" /> Tuner
          </h2>
          <p className="text-[12px] mt-1" style={{ color: "var(--c-text-secondary)" }}>
            Single notes only — pluck one string at a time.
          </p>
        </div>

        <button
          onClick={ligado ? parar : iniciar}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-[1.02]"
          style={{
            background: ligado ? "var(--c-overlay)" : "var(--c-cta-bg)",
            color: ligado ? "var(--c-text)" : "var(--c-cta-text)",
          }}
        >
          {ligado ? <MicOff size={15} /> : <Mic size={15} />}
          {ligado ? "Stop" : "Start tuning"}
        </button>
      </div>

      {/* privacidade — dito antes de pedir a permissão, não depois */}
      {!ligado && !erro && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--c-overlay-soft)", color: "var(--c-text-secondary)" }}
        >
          <Lock size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Your microphone is processed <strong>only in this browser tab</strong>. Nothing is
            recorded, stored or sent to any server — close the page and it is gone.
          </span>
        </div>
      )}

      {erro && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-[12px]"
          style={{ background: "rgba(220,38,38,0.08)", color: "#b91c1c" }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{erro}</span>
        </div>
      )}

      {/* mostrador */}
      <div
        style={{
          marginTop: 18,
          borderRadius: 16,
          background: "var(--c-bg-secondary)",
          border: "1px solid var(--c-hairline)",
          padding: "20px 16px 14px",
        }}
      >
        {/* nota grande */}
        <div style={{ textAlign: "center", minHeight: 74 }}>
          <div
            style={{
              fontSize: 56,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: leitura ? corEstado : "var(--c-text-tertiary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {leitura ? leitura.nome : ligado ? "—" : "·"}
          </div>
          <div style={{ fontSize: 12, marginTop: 6, color: "var(--c-text-tertiary)" }}>
            {legenda}
          </div>
        </div>

        {/* agulha */}
        <div style={{ position: "relative", height: 46, marginTop: 8 }}>
          {/* escala: marcas a cada 10 cents, centro destacado */}
          <div
            style={{
              position: "absolute",
              inset: "22px 0 auto 0",
              height: 1,
              background: "var(--c-hairline)",
            }}
          />
          {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map((c) => {
            const x = 50 + (c / 50) * 50;
            const centro = c === 0;
            return (
              <div
                key={c}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: centro ? 12 : 17,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{
                    width: centro ? 2 : 1,
                    height: centro ? 22 : 11,
                    background: centro ? "var(--c-text-tertiary)" : "var(--c-hairline)",
                  }}
                />
                {centro && (
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: "var(--c-text-tertiary)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    0
                  </div>
                )}
              </div>
            );
          })}

          {/* ponteiro */}
          <div
            style={{
              position: "absolute",
              left: `${50 + pos * 50}%`,
              top: 2,
              transform: "translateX(-50%)",
              transition: "left 90ms linear",
            }}
          >
            <div
              style={{
                width: 4,
                height: 36,
                borderRadius: 3,
                background: leitura ? corEstado : "var(--c-hairline)",
                boxShadow: afinado ? `0 0 12px ${corEstado}` : "none",
              }}
            />
          </div>
        </div>

        {/* rótulos dos lados */}
        <div
          className="flex justify-between"
          style={{ fontSize: 9.5, fontWeight: 700, color: "var(--c-text-tertiary)", letterSpacing: "0.06em" }}
        >
          <span>♭ FLAT</span>
          <span
            style={{
              color: afinado ? "var(--c-chord)" : "transparent",
              transition: "color 150ms",
            }}
          >
            <Check size={11} style={{ display: "inline", marginRight: 2 }} />
            IN TUNE
          </span>
          <span>SHARP ♯</span>
        </div>
      </div>

      {/* escolha de corda / modo */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 16 }}>
        <div
          className="inline-flex rounded-full p-0.5"
          style={{ background: "var(--c-overlay-soft)" }}
        >
          {(["auto", "corda"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{
                background: modo === m ? "var(--c-bg-elevated)" : "transparent",
                color: modo === m ? "var(--c-text)" : "var(--c-text-tertiary)",
                border: 0,
                boxShadow: modo === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "auto" ? "Any string" : "Pick a string"}
            </button>
          ))}
        </div>

        <select
          value={afinacao}
          onChange={(e) => {
            setAfinacao(e.target.value as AfinacaoKey);
            setCordaAlvo(0);
          }}
          aria-label="Tuning"
          className="px-3 py-1.5 rounded-full text-[11px] font-bold"
          style={{
            background: "var(--c-overlay-soft)",
            border: "1px solid var(--c-hairline)",
            color: "var(--c-text)",
          }}
        >
          {Object.entries(AFINACOES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.nome}
            </option>
          ))}
        </select>
      </div>

      {/* cordas: no modo "pick" vira botão com a nota de referência */}
      <div className="flex flex-wrap gap-1.5" style={{ marginTop: 12 }}>
        {midis.map((m, i) => {
          const ativo = modo === "corda" && i === cordaAlvo;
          return (
            <button
              key={`${m}-${i}`}
              onClick={() => {
                setModo("corda");
                setCordaAlvo(i);
              }}
              onDoubleClick={() => tocarReferencia(m)}
              className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-bold inline-flex items-center gap-1"
              style={{
                background: ativo ? "var(--c-gold-soft)" : "var(--c-overlay-soft)",
                color: ativo ? "var(--c-gold)" : "var(--c-text-secondary)",
                border: ativo ? "1px solid var(--c-gold)" : "1px solid transparent",
              }}
              title={`${midis.length - i} · double-click to hear it`}
            >
              {midis.length - i} <span style={{ opacity: 0.65 }}>{nomeComOitava(m)}</span>
            </button>
          );
        })}
      </div>

      <p
        className="text-[10.5px] flex items-start gap-1.5"
        style={{ color: "var(--c-text-tertiary)", marginTop: 12, lineHeight: 1.5 }}
      >
        <Volume2 size={11} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          Double-click a string to hear its reference note. Within ±{TOLERANCIA_CENTS} cents counts
          as in tune.{" "}
          {CORDA_PADRAO.length === midis.length &&
            "Standard tuning reads E A D G B E, low to high."}
        </span>
      </p>
    </div>
  );
}
