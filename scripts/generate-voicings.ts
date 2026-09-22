/**
 * generate-voicings.ts
 * Gera voicings (diagramas) automaticos para todos os acordes do catalogo
 * que ainda nao tem variacao, e corrige quality/display_name.
 *
 * Rode no Codespaces:  npx tsx scripts/generate-voicings.ts
 * Requer .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

/* ---------- Carrega .env.local manualmente (npx tsx nao carrega por padrao) ---------- */
try {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const raw of readFileSync(envPath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  console.error("Arquivo .env.local nao encontrado. Crie-o na raiz do projeto.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ---------- Mapa de notas ---------- */
const NOTE: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};
const PITCH = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/* ---------- Qualidade: regras na ordem (mais especifica primeiro) ---------- */
const RULES: { re: RegExp; id: string }[] = [
  { re: /(maj7|M7|7M)/, id: "maj7" },        // A7M, Bb7M, F#maj7
  { re: /(m7b5|m7\(5-)/, id: "halfdim7" },   // Bm7(5-)
  { re: /min7|m7/, id: "minor7" },
  { re: /maj/, id: "major" },
  { re: /(^|[^A-Z])m(\d|\(|$)/, id: "minor" }, // Bm, Am9, Bm11, Cm, G#m
  { re: /sus2/, id: "sus2" },
  { re: /sus4|sus|4\+?$/, id: "sus4" },      // D4, A4, C4+ → sus4
  { re: /2$/, id: "sus2" },                   // A2, Bb2 (aprox. comum)
  { re: /dim7/, id: "dim7" },
  { re: /dim/, id: "dim" },
  { re: /aug|\+/, id: "aug" },
  { re: /7/, id: "dom7" },
  { re: /5/, id: "power" },                   // E5, D5, A5, C(5+)
  { re: /13/, id: "dom13" },
  { re: /11/, id: "dom11" },
  { re: /9/, id: "dom9" },
  { re: /6/, id: "major6" },
];

const DISPLAY: Record<string, string> = {
  major: "major", minor: "minor", dom7: "7", minor7: "m7", maj7: "maj7",
  sus2: "sus2", sus4: "sus4", power: "power", dim: "dim", dim7: "dim7",
  aug: "aug", major6: "6", dom9: "9", dom11: "11", dom13: "13",
  halfdim7: "m7b5", minor6: "m6",
};

function parseChord(raw: string): { root: number; quality: string } | null {
  const m = raw.match(/^([A-G])(#|b)?/);
  if (!m) return null;
  const root = NOTE[m[1] + (m[2] ?? "")];
  if (root === undefined) return null;
  const suffix = raw.slice(m[0].length);
  if (suffix === "") return { root, quality: "major" };
  for (const r of RULES) {
    if (r.re.test(suffix)) return { root, quality: r.id };
  }
  return { root, quality: "major" };
}

/* ---------- Shapes E e A (transponiveis) ---------- */
type Shape = { strings: (number | null)[]; fingers: (number | null)[] };
const SHAPES: Record<string, { e: Shape; a: Shape }> = {
  major: {
    e: { strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
    a: { strings: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
  },
  minor: {
    e: { strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] },
    a: { strings: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
  },
  dom7: {
    e: { strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null] },
    a: { strings: [null, 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null] },
  },
  minor7: {
    e: { strings: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null] },
    a: { strings: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null] },
  },
  maj7: {
    e: { strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null] },
    a: { strings: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null] },
  },
  sus4: {
    e: { strings: [0, 2, 2, 2, 0, 0], fingers: [null, 1, 2, 3, null, null] },
    a: { strings: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null] },
  },
  sus2: {
    e: { strings: [0, 2, 2, 2, 0, 0], fingers: [null, 1, 2, 3, null, null] },
    a: { strings: [null, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null] },
  },
  power: {
    e: { strings: [0, 2, 2, null, null, null], fingers: [null, 1, 2, null, null, null] },
    a: { strings: [null, 0, 2, 2, null, null], fingers: [null, null, 1, 2, null, null] },
  },
};

// Fallback de familia para qualidades sem shape proprio
const FALLBACK: Record<string, string> = {
  halfdim7: "minor7", minor6: "minor", major6: "major",
  dim7: "minor", dim: "minor", aug: "major",
  dom9: "dom7", dom11: "dom7", dom13: "dom7",
};

function fretFor(root: number, onString: 6 | 5): number {
  const open = onString === 6 ? 4 : 9; // corda E = nota 4, corda A = nota 9
  return (root - open + 12) % 12;
}

function buildVoicing(root: number, quality: string) {
  const base = SHAPES[quality] ? quality : FALLBACK[quality];
  if (!base || !SHAPES[base]) return null;
  const approved = quality === base;

  const on6 = fretFor(root, 6);
  const on5 = fretFor(root, 5);
  const use6 = on6 <= on5;
  const fret = use6 ? on6 : on5;
  if (fret > 14) return null; // posicao extrema (comum em acordes raros)

  const shape = SHAPES[base][use6 ? "e" : "a"];
  const strings = shape.strings.map((s) => (s === null ? null : s + fret));
  const fingers = [...shape.fingers] as (number | null)[];
  const isPower = base === "power";
  const barre = !isPower && fret > 0 ? fret : null;

  if (barre !== null) {
    for (let i = 0; i < 6; i++) if (strings[i] === barre) fingers[i] = 1;
    let next = 2;
    for (let i = 0; i < 6; i++) {
      if (strings[i] !== null && strings[i] !== barre && strings[i] !== 0 && fingers[i] !== null) {
        fingers[i] = next > 4 ? 4 : next;
        next++;
      }
    }
    for (let i = 0; i < 6; i++) if (strings[i] === null || strings[i] === 0) fingers[i] = null;
  }

  return { base_fret: fret, strings, barre, fingers, approved };
}

/* ---------- Execucao ---------- */
async function main() {
  const { data: chords, error } = await supabase
    .from("chords")
    .select("id, name, root, quality, display_name, chord_variants(id)");
  if (error) throw error;

  const total = chords?.length ?? 0;
  let generated = 0, approx = 0, corrected = 0, skipped = 0, stillEmpty = 0, insertErrors = 0;
  const stillEmptyNames: string[] = [];

  for (const c of chords ?? []) {
    const parsed = parseChord(c.name);
    if (!parsed) { skipped++; continue; }

    const hasVariants = (c.chord_variants ?? []).length > 0;
    if (!hasVariants) {
      const v = buildVoicing(parsed.root, parsed.quality);
      if (v) {
        const { error: errIns } = await supabase.from("chord_variants").insert({
          chord_id: c.id, position: 1,
          base_fret: v.base_fret, strings: v.strings,
          barre: v.barre, fingers: v.fingers,
        });
        if (errIns) { insertErrors++; continue; }
        generated++;
        if (!v.approved) approx++;
      } else {
        stillEmpty++;
        stillEmptyNames.push(c.name);
      }
    }

    const desiredName = `${PITCH[parsed.root]} ${DISPLAY[parsed.quality] ?? parsed.quality}`;
    if (c.quality !== parsed.quality || c.display_name !== desiredName) {
      const { error: errUpd } = await supabase
        .from("chords")
        .update({ quality: parsed.quality, display_name: desiredName })
        .eq("id", c.id);
      if (!errUpd) corrected++;
    }
  }

  console.log("\n===== RESUMO =====");
  console.log(`Acordes lidos: ${total}`);
  console.log(`Voicings gerados: ${generated}  (${approx} com aproximacao de familia)`);
  console.log(`quality/display corrigidos: ${corrected}`);
  console.log(`Erros de insert: ${insertErrors}`);
  console.log(`Pulados (parse falhou): ${skipped}`);
  console.log(`Sem variacao ainda (posicao > 14 casa): ${stillEmpty}`);
  if (stillEmptyNames.length) console.log(`  --> ${stillEmptyNames.join(", ")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
