import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import RegisterSW from "@/components/RegisterSW";
import FluidBackground from "@/components/FluidBackground";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ChordProof - Verified Guitar Tabs",
  description: "The world's first verified guitar tab platform. No paywalls on community content. Accurate chords for real musicians.",
  alternates: { canonical: SITE_URL },
  // robots explicito: sem <meta name="robots"> o Google assume index, mas
  // declarar evita que qualquer override futuro bloqueie o site inteiro.
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChordProof",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "ChordProof - Verified Guitar Tabs",
    description: "The world's first verified guitar tab platform. No paywalls on community content. Accurate chords for real musicians.",
    type: "website",
    url: SITE_URL,
    siteName: "ChordProof",
  },
};

// themeColor acompanha o tema PADRÃO (papel). Antes anunciava #1d1d1f para
// quem prefere escuro, o que pintava a barra do navegador de preto num site
// claro.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Anti-flash: aplica o tema salvo ANTES do primeiro paint.
            PADRÃO = claro (papel). Só quem escolheu "dark" explicitamente
            fica sem a classe `light`. Sem isso o primeiro paint saía escuro
            e o site "piscava" antes de virar papel. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('chordproof-theme-mode');if(t!=='dark'){document.documentElement.classList.add('light')}}catch(e){}})()` }} />
        {/* Google tag (gtag.js) — GA4 do ChordProof */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-96HFNQPLEB" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-96HFNQPLEB');`,
          }}
        />
      </head>
      <body className={inter.className}>
        <RegisterSW />
        <Providers>
          <div className="relative isolate flex flex-col min-h-screen">
            {/* Fundo fluido GLOBAL: cobre a pagina toda, atras de todo o
                conteudo. Em mobile e com prefers-reduced-motion ele desenha
                um frame ESTATICO (mesma paleta, sem animar em GPU de celular);
                sem WebGL2 nao monta e a cor de reserva do body assume. */}
            <FluidBackground fixed />
            <Navbar />
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ChordProof",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/browse?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </body>
    </html>
  );
}
