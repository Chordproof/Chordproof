const SHARP = "\x23";
const CHROMATIC = ["C","C"+SHARP,"D","D"+SHARP,"E","F","F"+SHARP,"G","G"+SHARP,"A","A"+SHARP,"B"];
const FLAT_TO_SHARP: Record<string,string> = {};
FLAT_TO_SHARP["Db"]="C"+SHARP; FLAT_TO_SHARP["Eb"]="D"+SHARP;
FLAT_TO_SHARP["Gb"]="F"+SHARP; FLAT_TO_SHARP["Ab"]="G"+SHARP;
FLAT_TO_SHARP["Bb"]="A"+SHARP;

export const CHORD_TOKEN_RE = new RegExp("([A-G]["+SHARP+"b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2|M)*\d*(?:/[A-G]["+SHARP+"b]?)?)","g");
export const CHORD_STRICT_RE = new RegExp("^[A-G]["+SHARP+"b]?(?:m|maj|min|dim|aug|sus|add|6|7|9|11|13|5|4|2|M)*\d*(?:/[A-G]["+SHARP+"b]?)?$");
export const TAB_LINE_RE = /[\d\-|]{4,}/;

export const CHORD_SHAPES: Record<string,number[]> = {};
CHORD_SHAPES["E"]=[0,2,2,1,0,0]; CHORD_SHAPES["Em"]=[0,2,2,0,0,0];
CHORD_SHAPES["A"]=[-1,0,2,2,2,0]; CHORD_SHAPES["Am"]=[-1,0,2,2,1,0];
CHORD_SHAPES["D"]=[-1,-1,0,2,3,2]; CHORD_SHAPES["Dm"]=[-1,-1,0,2,3,1];
CHORD_SHAPES["C"]=[-1,3,2,0,1,0]; CHORD_SHAPES["G"]=[3,2,0,0,0,3];
CHORD_SHAPES["F"]=[1,3,3,2,1,1]; CHORD_SHAPES["E5"]=[0,2,2,-1,-1,-1];
CHORD_SHAPES["A5"]=[-1,0,2,2,-1,-1]; CHORD_SHAPES["D5"]=[-1,-1,0,2,3,-1];
CHORD_SHAPES["G5"]=[3,5,5,-1,-1,-1]; CHORD_SHAPES["B5"]=[-1,2,4,4,-1,-1];
CHORD_SHAPES["C5"]=[-1,3,5,5,-1,-1]; CHORD_SHAPES["F5"]=[-1,-1,-1,2,3,1];
CHORD_SHAPES["Bm"]=[-1,2,4,4,3,2];
CHORD_SHAPES["F"+SHARP+"m"]=[2,4,4,2,2,2];
CHORD_SHAPES["C"+SHARP+"m"]=[-1,4,6,6,5,4];
CHORD_SHAPES["G"+SHARP+"m"]=[-1,4,6,6,4,4];
CHORD_SHAPES["D"+SHARP+"m"]=[-1,-1,0,2,3,1];
CHORD_SHAPES["A"+SHARP+"m"]=[-1,1,3,3,2,1];
CHORD_SHAPES["B"]=[-1,2,4,4,4,2];
CHORD_SHAPES["F"+SHARP]=[2,4,4,3,2,2];
CHORD_SHAPES["C"+SHARP]=[-1,4,6,6,6,4];
CHORD_SHAPES["G"+SHARP]=[4,6,6,5,4,4];
CHORD_SHAPES["D"+SHARP]=[-1,-1,0,2,3,-1];
CHORD_SHAPES["A"+SHARP]=[-1,1,3,3,3,1];
CHORD_SHAPES["Bb"]=[-1,1,3,3,3,1]; CHORD_SHAPES["Eb"]=[-1,-1,0,2,3,-1];
CHORD_SHAPES["Ab"]=[4,6,6,5,4,4]; CHORD_SHAPES["Db"]=[-1,-1,4,4,4,2];
CHORD_SHAPES["Gb"]=[2,2,3,4,4,2];
CHORD_SHAPES["B7"]=[-1,2,1,2,0,2]; CHORD_SHAPES["D7"]=[-1,-1,0,2,1,2];
CHORD_SHAPES["A7"]=[-1,0,2,0,2,0]; CHORD_SHAPES["E7"]=[0,2,0,1,0,0];
CHORD_SHAPES["G7"]=[3,2,0,0,0,1]; CHORD_SHAPES["C7"]=[-1,3,2,3,1,0];
CHORD_SHAPES["Am7"]=[-1,0,2,0,1,0]; CHORD_SHAPES["Em7"]=[0,2,0,0,0,0];
CHORD_SHAPES["Dm7"]=[-1,-1,0,2,1,1]; CHORD_SHAPES["Bm7"]=[-1,2,0,2,0,2];
CHORD_SHAPES["Cmaj7"]=[-1,3,2,0,0,0]; CHORD_SHAPES["Fmaj7"]=[-1,-1,3,2,1,0];
CHORD_SHAPES["Gmaj7"]=[3,2,0,0,0,2]; CHORD_SHAPES["Dmaj7"]=[-1,-1,0,2,2,2];
CHORD_SHAPES["Amaj7"]=[-1,0,2,1,2,0]; CHORD_SHAPES["Emaj7"]=[0,2,1,1,0,0];
CHORD_SHAPES["Csus4"]=[-1,3,3,0,1,0]; CHORD_SHAPES["Dsus4"]=[-1,-1,0,2,3,3];
CHORD_SHAPES["Asus4"]=[-1,0,2,2,3,0]; CHORD_SHAPES["Esus4"]=[0,2,2,2,0,0];
CHORD_SHAPES["Gsus4"]=[3,3,0,0,1,3];
CHORD_SHAPES["Cadd9"]=[-1,3,2,0,3,0]; CHORD_SHAPES["Dadd9"]=[-1,-1,0,2,3,0];
CHORD_SHAPES["Gadd9"]=[3,0,0,0,1,3]; CHORD_SHAPES["Aadd9"]=[-1,0,2,4,2,0];
CHORD_SHAPES["D9"]=[-1,-1,0,2,1,2]; CHORD_SHAPES["E9"]=[0,2,0,1,2,0];
CHORD_SHAPES["A9"]=[-1,0,2,4,2,0];
CHORD_SHAPES["Am7M"]=[-1,0,2,1,1,0];
CHORD_SHAPES["F7M"]=[-1,-1,3,2,1,0];
CHORD_SHAPES["D4"]=[-1,-1,0,2,3,3];
CHORD_SHAPES["D2"]=[-1,-1,0,2,3,0];
CHORD_SHAPES["D/F"+SHARP]=[-1,-1,0,2,3,2];
CHORD_SHAPES["G/B"]=[-1,2,0,0,0,3];

export function transposeChord(chord: string, steps: number): string {
  if (!steps) return chord;
  const baseChord = chord.split("/")[0];
  const bassPart = chord.includes("/") ? "/" + chord.split("/")[1] : "";
  const re = new RegExp("^([A-G]["+SHARP+"b]?)");
  const match = baseChord.match(re);
  if (!match) return chord;
  const root = FLAT_TO_SHARP[match[1]] || match[1];
  let idx = CHROMATIC.indexOf(root);
  if (idx === -1) return chord;
  idx = (idx + steps + 12) % 12;
  return CHROMATIC[idx] + baseChord.substring(match[1].length) + bassPart;
}

export function chordsUsed(content: string, transpose: number): string[] {
  const seen: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    if (tokens.length > 0 && tokens.every((t:string) => CHORD_STRICT_RE.test(t))) {
      for (const t of tokens) {
        const tr = transposeChord(t, transpose);
        if (!seen.includes(tr)) seen.push(tr);
      }
    }
  }
  return seen;
}
