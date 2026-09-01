// site.config.ts — Configuração central do site
// Cada domínio replica lê estas variáveis de ambiente

export type SiteMarket = "us" | "uk" | "ca" | "au" | "in" | "ph";

export const siteConfig = {
  // Nome exibido no header/logo
  name: process.env.NEXT_PUBLIC_SITE_NAME || "ChordProof",

  // Idioma da interface (UI), não do conteúdo
  lang: process.env.NEXT_PUBLIC_LANG || "en",

  // Mercado principal — filtra o banco de cifras
  market: (process.env.NEXT_PUBLIC_MARKET as SiteMarket) || "us",

  // Tema padrão (amber, classic, emerald, crimson, ocean)
  theme: process.env.NEXT_PUBLIC_DEFAULT_THEME || "amber",

  // Domínio canônico (para SEO/sitemap)
  domain: process.env.NEXT_PUBLIC_SITE_URL || "https://chordproof.com",
} as const;
