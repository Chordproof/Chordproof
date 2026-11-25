"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { audioEngine } from "@/lib/audio";

/**
 * SoundToggle — liga/desliga o som do site.
 *
 * Começa LIGADO, mas nada toca sozinho: só soa quando a pessoa clica num
 * acorde ou pede a progressão. A preferência fica em localStorage (é do
 * navegador, não da conta).
 */
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(audioEngine.restorePreference());
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <button
      onClick={() => {
        const next = !on;
        setOn(next);
        audioEngine.setEnabled(next);
        if (next) audioEngine.unlock();
      }}
      aria-pressed={on}
      title={on ? "Sound on — click a chord to hear it" : "Sound off"}
      className="p-3 bg-[var(--c-overlay-soft)] rounded-full hover:bg-[var(--c-overlay)] transition-colors"
    >
      {on ? (
        <Volume2 size={20} className="text-brand-gold" />
      ) : (
        <VolumeX size={20} className="text-[var(--c-text-tertiary)]" />
      )}
    </button>
  );
}
