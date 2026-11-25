"use client";

import { useEffect, useRef, useState } from "react";
import { FLUID_VERT, FLUID_FRAG } from "@/shaders/fluid";

/**
 * FluidBackground — fundo fluido em WebGL2, sem three.js.
 *
 * POR QUE SEM THREE
 * O efeito é UM quad de tela cheia com um fragment shader. Para isso o three
 * custa ~127 KB gzip; escrevendo o WebGL direto, são ~4 KB. Menos bytes, menos
 * superfície para quebrar, nenhuma dependência nova no package.json.
 *
 * PERFORMANCE (as regras que importam):
 *  - Renderiza em ESCALA REDUZIDA (55% dos pixels CSS) e o CSS estica. Um
 *    gradiente suave não precisa de 1 pixel por pixel — corta ~4x o fill-rate
 *    sem diferença perceptível. DPR não entra na conta: não acrescenta nada.
 *  - Loop para quando a aba está oculta (document.hidden) e quando o canvas
 *    sai da viewport (IntersectionObserver).
 *  - Não monta de jeito nenhum em: telas < 768px, prefers-reduced-motion, ou
 *    sem WebGL2 — nesses casos a página fica exatamente como estava.
 *
 * ACESSIBILIDADE: o canvas é aria-hidden e pointer-events: none.
 */

export default function FluidBackground({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Decide antes de criar qualquer contexto GL.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");

    const decide = () => {
      let hasGL = false;
      try {
        hasGL = !!document.createElement("canvas").getContext("webgl2");
      } catch {
        hasGL = false;
      }
      setEnabled(!reduce.matches && !small.matches && hasGL);
    };

    decide();
    reduce.addEventListener("change", decide);
    small.addEventListener("change", decide);
    return () => {
      reduce.removeEventListener("change", decide);
      small.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // ---------------------------------------------------------------- shader
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        // não estoura a página: só desiste do fundo
        console.warn("[fluid] shader", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, FLUID_VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FLUID_FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[fluid] link", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // ------------------------------------------------------- quad fullscreen
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScrollVelocity");
    const uAudio = gl.getUniformLocation(prog, "uAudioFrequency");
    const uRes = gl.getUniformLocation(prog, "uResolution");

    // ------------------------------------------------------------- estado
    const RENDER_SCALE = 0.55;

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };

    // mouse suavizado (lerp): ondulação sem solavanco
    const mouse = { x: 0.5, y: 0.5 };
    const mouseTarget = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mouseTarget.x = (e.clientX - r.left) / r.width;
      mouseTarget.y = 1 - (e.clientY - r.top) / r.height;
    };

    // rolagem: velocidade normalizada, com decaimento
    let scrollVel = 0;
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const now = window.scrollY;
      const delta = now - lastScroll;
      lastScroll = now;
      scrollVel = Math.max(-1, Math.min(1, scrollVel + delta / 120));
    };

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    let raf = 0;
    const start = performance.now();

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      // pausa real: fora da viewport ou aba oculta, não desenha
      if (!visible || document.hidden) return;

      resize();

      mouse.x += (mouseTarget.x - mouse.x) * 0.06;
      mouse.y += (mouseTarget.y - mouse.y) * 0.06;
      scrollVel *= 0.92;

      gl.uniform1f(uTime, (t - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scrollVel);
      gl.uniform1f(uAudio, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{
        // desvanece no rodapé do hero: o fundo encontra o conteúdo sem linha dura
        WebkitMaskImage:
          "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.85) 55%, transparent 100%)",
        maskImage:
          "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.85) 55%, transparent 100%)",
      }}
    />
  );
}
