import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mic, Lock, Guitar } from "lucide-react";
import Tuner from "@/components/Tuner";

export const metadata: Metadata = {
  title: "Guitar tuner — tune by ear with your microphone",
  description:
    "Free online guitar, bass and ukulele tuner. Pluck a string and the needle shows if it is flat or sharp, within one cent. Your microphone is processed only in your browser — nothing is uploaded.",
  alternates: { canonical: "/tuner" },
  robots: { index: true, follow: true },
};

/**
 * /tuner — página própria, e não um bloco dentro da cifra.
 *
 * MOTIVO: "afinador de guitarra" é uma busca própria e independente. Quem
 * procura por ela não está lendo cifra nenhuma — é alguém com o instrumento no
 * colo tentando fazer a primeira corda soar. Essa é justamente a pessoa que o
 * site ainda não alcança, e uma ferramenta gratuita e imediata é a porta de
 * entrada mais natural para ela.
 *
 * HONESTIDADE: a página NÃO promete reconhecer acordes. Detectar uma nota é
 * confiável; detectar acorde não é (F1 medido entre 0,35 e 0,78), e prometer o
 * que não funciona é o caminho mais rápido para perder a confiança de quem
 * está aprendendo.
 */
export default function TunerPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <nav className="text-sm text-brand-muted" style={{ marginBottom: 20 }}>
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--c-text)]">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>Tuner</li>
        </ol>
      </nav>

      <header style={{ marginBottom: 24 }}>
        <h1 className="text-4xl font-bold flex items-center gap-3 flex-wrap">
          <Mic className="text-brand-gold" size={30} /> Guitar tuner
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--c-text-secondary)" }}>
          Pluck one string, watch the needle settle in the middle. It works for guitar, bass and
          ukulele, in standard tuning or drop D, half step down and open G.
        </p>
      </header>

      <Tuner />

      <section style={{ marginTop: 32 }} className="space-y-4">
        <h2 className="text-2xl font-bold">How to tune without breaking a string</h2>
        <ol className="space-y-3 text-[14px] leading-relaxed" style={{ color: "var(--c-text-secondary)" }}>
          <li>
            <strong>1. Always tune UP to the note.</strong> If the string is sharp, go below it and
            come back up. Tuning down leaves the string slightly loose, and it slips flat as soon as
            you play. Coming up from below keeps tension on the peg and it holds.
          </li>
          <li>
            <strong>2. Pluck, then wait.</strong> The note is sharp for the first instant after the
            attack and settles. Read the needle, not the first flash.
          </li>
          <li>
            <strong>3. Small turns only.</strong> A quarter turn of the peg moves a string by far
            more than the ten cents you are chasing. Nudge, then re-pluck.
          </li>
          <li>
            <strong>4. Tune low to high.</strong> Tightening a low string bends the neck slightly
            and pulls the others out. Tune E, then A, then D, then G, then B, then E — and check the
            first one again at the end.
          </li>
          <li>
            <strong>5. New strings do not hold.</strong> A fresh set stretches for days. Tune, play
            a few minutes, tune again. That is the strings, not your ear.
          </li>
        </ol>
      </section>

      <section style={{ marginTop: 28 }} className="space-y-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Lock size={17} className="text-brand-gold" /> Where your audio goes
        </h2>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--c-text-secondary)" }}>
          Nowhere. The microphone signal is read and analysed inside this browser tab and thrown
          away immediately. Nothing is recorded, nothing is stored, nothing is sent to a server.
          Close the tab and there is nothing left to find. You can check it yourself: open the
          browser&apos;s Network panel while tuning — no request carries your audio.
        </p>
      </section>

      <section style={{ marginTop: 28 }} className="space-y-3">
        <h2 className="text-xl font-bold">What this tuner will not do</h2>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--c-text-secondary)" }}>
          It will not recognise chords. Telling a C from a Cmaj7 out of a strummed guitar is a much
          harder problem than finding one pitch, and the honest accuracy is around three in four
          attempts — not good enough to tell you that you played it right. For chords, the{" "}
          <Link href="/learn" className="text-brand-gold hover:underline">
            learning path
          </Link>{" "}
          and the{" "}
          <Link href="/chord/g" className="text-brand-gold hover:underline">
            chord diagrams
          </Link>{" "}
          are the reliable route.
        </p>
      </section>

      <section
        style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--c-hairline)" }}
        className="space-y-3"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Guitar size={18} className="text-brand-gold" /> In tune? Play something.
        </h2>
        <p className="text-[14px]" style={{ color: "var(--c-text-secondary)" }}>
          Open chords first, then barre chords — with real songs for each step.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
          style={{ background: "var(--c-cta-bg)", color: "var(--c-cta-text)" }}
        >
          Start the learning path <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
