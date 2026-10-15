import { EXTRA_SHAPES } from "./chordShapesGenerated";

// chordData.ts — Complete chord library for ChordProof
export const SHARP = "#";
export const FLAT = "b";

// Chord shapes: [E, A, D, G, B, e] — -1 = mute, 0 = open, n = fret
export const CHORD_SHAPES: Record<string, number[]> = {};

// Merge com os shapes gerados automaticamente (cobertura total das cifras)
Object.assign(CHORD_SHAPES, EXTRA_SHAPES);
