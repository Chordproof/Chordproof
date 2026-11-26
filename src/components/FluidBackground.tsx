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
 *  - Renderiza em ESCALA REDUZIDA e o CSS estica. Um fundo desfocado não
 *    precisa de 1 pixel por pixel de tela.
 *  - Loop para quando a aba está oculta e quando o canvas sai da viewport.
 *  - MOBILE: antes não montava (max-width: 767px desligava). Agora monta,
 *    mas desenha UM frame parado — o mobile ganha a mesma paleta harmonizada
 *    sem o custo de animar em GPU de celular.
 *  - prefers-reduced-motion: mesma regra do mobile, frame único.
 *
 * TEMA: o ThemeToggle NÃO adiciona a classe `dark`; ele só controla `light`.
 * Logo, tema claro = `html` tem a classe `light`. O shader recebe uMode 0
 * (papel) ou 1 (espresso) e escuta a troca em tempo real (MutationObserver)
 * — sem isso o fundo ficaria com a paleta errada até um F5.
 *
 * ACESSIBILIDADE: o canvas é aria-hidden e pointer-events: none.
 */

export default function FluidBackground({
  className = "",
  fixed = false,
  masked = false,
}: {
  className?: string;
  /** fixed: fundo global de página inteira. false: preenche o elemento pai. */
  fixed?: boolean;
  /** masked: desvanece no rodapé (só faz sentido dentro de um bloco). */
  masked?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Só a ausência de WebGL2 desliga de vez. Mobile e reduced-motion
    // continuam montando (frame único).
    const ok = !!document.createElement("canvas").getContext("webgl2");
    setEnabled(ok);
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

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
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
    const uMode = gl.getUniformLocation(prog, "uMode");

    const isSmall = window.matchMedia("(max-width: 767px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const RENDER_SCALE = isSmall ? 0.4 : 0.55;
    const STATIC_ONLY = isSmall || reduce.matches;

    let themeLight = document.documentElement.classList.contains("light");

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

    const mouse = { x: 0.5, y: 0.5 };
    const mouseTarget = { x: 0.5, y: 0.5 };
    let scrollVel = 0;

    const draw = (seconds: number) => {
      resize();
      gl.uniform1f(uTime, seconds);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scrollVel);
      gl.uniform1f(uAudio, 0);
      gl.uniform1f(uMode, themeLight ? 0 : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Primeiro paint imediato: sem ele o canvas aparece preto por um frame.
    draw(0);

    const cleanup = () => {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };

    if (STATIC_ONLY) {
      const onTheme = () => {
        themeLight = document.documentElement.classList.contains("light");
        draw(0);
      };
      const mo = new MutationObserver(onTheme);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      const onResize = () => draw(0);
      window.addEventListener("resize", onResize);
      return () => {
        mo.disconnect();
        window.removeEventListener("resize", onResize);
        cleanup();
      };
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mouseTarget.x = (e.clientX - r.left) / r.width;
      mouseTarget.y = 1 - (e.clientY - r.top) / r.height;
    };

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

    const start = performance.now();
    const onThemeChange = () => {
      themeLight = document.documentElement.classList.contains("light");
      draw((performance.now() - start) / 1000);
    };
    const mo = new MutationObserver(onThemeChange);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    let raf = 0;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      mouse.x += (mouseTarget.x - mouse.x) * 0.06;
      mouse.y += (mouseTarget.y - mouse.y) * 0.06;
      scrollVel *= 0.92;
      draw((t - start) / 1000);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cleanup();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // -z-10 é obrigatório: sem ele, um elemento posicionado pinta ACIMA do
      // texto estático e o fundo cobriria o conteúdo.
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 -z-10 h-full w-full ${className}`}
      style={
        {
          ...(masked
            ? {
                WebkitMaskImage:
                  "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.85) 55%, transparent 100%)",
                maskImage:
                  "linear-gradient(180deg, rgba(0,0,0,.95) 0%, rgba(0,0,0,.85) 55%, transparent 100%)",
              }
            : {}),
          // Opacidade total: o shader já entrega a cor final do papel. Antes
          // ele era um véu a 55% sobre o grafite do body, e o cinza-azulado
          // do body vazava por baixo — parte do porquê parecia "de outro site".
          opacity: 1,
        } as React.CSSProperties
      }
    />
  );
}
