/**
 * Shaders do fundo fluido (WebGL2 / GLSL ES 3.00).
 *
 * POR QUE ESTÃO AQUI E NÃO EM .glsl
 * O Next 14 não importa arquivo .glsl sem loader no webpack, e mexer no
 * next.config para isso é risco de build (já quebrei deploy por config antes).
 * Manter as strings num .ts evita duplicação e drift: um arquivo só é a fonte.
 *
 * ---------------------------------------------------------------------------
 * A PALETA — a decisão de design que mudou tudo
 * ---------------------------------------------------------------------------
 * A v1 usava grafite -> ÍNDIGO (azul) com um traço de âmbar. O azul é a cor
 * COMPLEMENTAR do dourado da marca: lado a lado eles brigam, e o resultado é
 * um fundo que parece de outro site. Era exatamente o "não está harmônico".
 *
 * A v2 (esta) usa MONOCROMIA QUENTE: papel -> creme -> areia -> âmbar.
 * Tudo sai do mesmo matiz (laranja/amarelo, ~35-45°), variando só em
 * luminosidade e saturação. É como luz atravessando papel — e é o que faz o
 * fundo pertencer ao site em vez de competir com ele.
 *
 * DOIS MODOS num shader só (uniform uMode):
 *   uMode = 0  -> PAPEL (tema claro): fundo luminoso, texto escuro por cima
 *   uMode = 1  -> ESPRESSO (tema escuro): fundo quente profundo
 * O escuro também deixou de ser azulado: agora é café/âmbar, casando com o
 * dourado da marca.
 *
 * POR QUE O CONTRASTE DO FUNDO É LIMITADO DE PROPÓSITO
 * O fundo fica ATRÁS de cifra monoespaçada. Medido: no pior pixel do modo
 * claro a luminância não desce de ~0.87, o que mantém o texto em #17150f
 * em ~16:1 — muito além do AAA. Um fundo "bonito" que reduz contraste
 * de leitura é um bug, não um recurso.
 */

export const FLUID_VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  // aPos vai de -1..1; vUv de 0..1
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FLUID_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform vec2  uMouse;
uniform float uScrollVelocity;
uniform float uAudioFrequency;
uniform vec2  uResolution;
uniform float uMode;   // 0 = papel (claro), 1 = espresso (escuro)

/* ---------- simplex noise 3D (Ashima Arts / Stefan Gustavson) ---------- */
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 2; i++) {
    v += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

/* (o grão foi REMOVIDO: era calculado no backing store reduzido a 55% e o
   upscale o transformava num padrão quadriculado visível. Para ter grão de
   verdade seria preciso um overlay CSS em resolução cheia — não vale o custo
   por um efeito que ninguém nota, e que pode parecer sujeira na tela.) */

/* ---- PAPEL: monocromia quente, tudo no mesmo matiz (~40°) ---- */
vec3 palettePaper(float t) {
  vec3 c0 = vec3(0.988, 0.980, 0.965); // papel #fcfaf6
  vec3 c1 = vec3(0.976, 0.961, 0.933); // creme #f9f5ee
  vec3 c2 = vec3(0.961, 0.933, 0.882); // areia #f5eee1
  vec3 c3 = vec3(0.945, 0.898, 0.812); // âmbar claro #f1e5cf
  vec3 c4 = vec3(0.922, 0.845, 0.714); // mel #ebd8b6

  vec3 c = mix(c0, c1, smoothstep(0.00, 0.35, t));
  c = mix(c, c2, smoothstep(0.35, 0.65, t));
  c = mix(c, c3, smoothstep(0.65, 0.88, t));
  // o mel fica no traço: nunca vira mancha
  c = mix(c, c4, smoothstep(0.88, 1.00, t) * 0.7);
  return c;
}

/* ---- ESPRESSO: café quente, sem azul. Substitui o grafite-índigo. ---- */
vec3 paletteEspresso(float t) {
  vec3 c0 = vec3(0.090, 0.082, 0.063); // #17150f
  vec3 c1 = vec3(0.110, 0.098, 0.075); // #1c1913
  vec3 c2 = vec3(0.141, 0.122, 0.086); // #241f16
  vec3 c3 = vec3(0.180, 0.149, 0.098); // #2e2619
  vec3 c4 = vec3(0.290, 0.227, 0.110); // #4a3a1c âmbar profundo

  vec3 c = mix(c0, c1, smoothstep(0.00, 0.35, t));
  c = mix(c, c2, smoothstep(0.35, 0.68, t));
  c = mix(c, c3, smoothstep(0.68, 0.90, t));
  c = mix(c, c4, smoothstep(0.90, 1.00, t) * 0.65);
  return c;
}

void main() {
  float light = 1.0 - step(0.5, uMode); // 1 = claro, 0 = escuro

  float ar = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * ar, vUv.y) * 2.2;

  float t = uTime * 0.030; // lento: o olho não deve seguir o fundo

  /* domain warping em dois níveis — é o que dá o aspecto líquido */
  vec2 q = vec2(
    fbm(vec3(p, t)),
    fbm(vec3(p + vec2(5.2, 1.3), t + 2.1))
  );
  vec2 r = vec2(
    fbm(vec3(p + 3.0 * q + vec2(1.7, 9.2), t + 1.7)),
    fbm(vec3(p + 3.0 * q + vec2(8.3, 2.8), t + 4.3))
  );
  float f = fbm(vec3(p + 2.0 * r, t + 0.7));

  /* ondulação do mouse: empurra o campo em anéis suaves */
  vec2 m = uMouse * vec2(ar, 1.0) * 2.2;
  float d = length(p - m);
  float ripple = exp(-d * 2.4) * sin(d * 6.0 - uTime * 1.2);

  /* velocidade de rolagem inclina o campo */
  f += uScrollVelocity * 0.10 * sin(p.y * 1.4 + uTime * 0.9);

  /* áudio: preparado, hoje sempre 0 */
  f += uAudioFrequency * 0.15 * sin(p.x * 3.0 + uTime * 2.0);

  f = f * 0.5 + 0.5;

  /* AMPLITUDE DIFERENTE POR TEMA:
     - claro: 0.28. O fundo precisa ficar QUASE liso para o texto escuro
       manter contraste altíssimo. Só um sopro de creme.
     - escuro: 0.55. Pode aparecer mais porque o texto é claro e o contraste
       é folgado. */
  float amp = mix(0.55, 0.28, light);
  f = clamp((f - 0.5) * amp + 0.5, 0.0, 1.0);

  /* o ripple entra DEPOIS do clamp, fraco, para não estourar a faixa */
  f = clamp(f + ripple * mix(0.10, 0.05, light), 0.0, 1.0);

  vec3 col = mix(paletteEspresso(f), palettePaper(f), light);

  /* LUZ: um brilho quente onde o mouse está.
     No claro é "luz atravessando papel" (clareia); no escuro é uma lâmpada
     âmbar distante (também clareia, mas pouco). Nunca escurece o centro. */
  float glow = exp(-d * 1.6);
  col += vec3(1.0, 0.86, 0.62) * glow * mix(0.030, 0.022, light);

  /* VINHETA:
     - claro: aquece e ASSENTA as bordas no creme (não escurece — escurecer
       no papel parece sujeira).
     - escuro: escurece, como antes.
  */
  vec2 v = vUv - 0.5;
  float vig = clamp(length(v) - 0.28, 0.0, 1.0) * 1.4;
  col = mix(col, vec3(0.980, 0.969, 0.945), vig * 0.55 * light);
  col *= mix(1.0 - 0.55 * vig, 1.0, light);

  outColor = vec4(col, 1.0);
}
`;
