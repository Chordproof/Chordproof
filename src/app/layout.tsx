import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChordProof - Verified Guitar Tabs",
  description: "The world's first verified guitar tab platform. No paywalls on community content. Accurate chords for real musicians.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "ChordProof - Verified Guitar Tabs",
    description: "The world's first verified guitar tab platform. No paywalls on community content. Accurate chords for real musicians.",
    type: "website",
    url: SITE_URL,
    siteName: "ChordProof",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google tag (gtag.js) — troque G-XXXXXXXXXX pelo seu ID real */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX');`,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
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
