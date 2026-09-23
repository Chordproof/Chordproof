import { supabase } from "@/lib/supabase";

export interface ChordVariant {
  position: number;
  base_fret: number;
  strings: (number | null)[];
  barre: number | null;
  fingers: (number | null)[];
}

export interface Chord {
  id: string;
  name: string;
  root: string;
  quality: string;
  display_name: string;
  variants: ChordVariant[];
}

// Cache simples em memória: o catálogo muda raramente, então buscamos 1x por sessão
let cache: Map<string, Chord> | null = null;

export async function loadChords(): Promise<Map<string, Chord>> {
  if (cache) return cache;

  const { data, error } = await supabase
    .from("chords")
    .select("id, name, root, quality, display_name, chord_variants(*)")
    .order("name");

  if (error) throw error;

  cache = new Map(
    (data || []).map((c: any) => [
      c.name,
      {
        id: c.id,
        name: c.name,
        root: c.root,
        quality: c.quality,
        display_name: c.display_name,
        variants: (c.chord_variants || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((v: any) => ({
            position: v.position,
            base_fret: v.base_fret,
            strings: v.strings ?? [],
            barre: v.barre,
            fingers: v.fingers ?? [],
          })),
      },
    ])
  );

  return cache;
}

export async function getChord(name: string): Promise<Chord | null> {
  const map = await loadChords();
  return map.get(name) ?? null;
}

// Acordes usados numa cifra (seção "Chords used in this tab")
export async function getChordsForTab(slugArtist: string, slugSong: string) {
  const { data, error } = await supabase
    .from("tab_chords")
    .select(`
      position, section,
      chords!inner (id, name, root, quality, display_name, chord_variants(*))
    `)
    .eq("tabs.slug_artist", slugArtist)
    .eq("tabs.slug_song", slugSong)
    .order("position", { ascending: true });

  if (error) throw error;
  return data || [];
}
