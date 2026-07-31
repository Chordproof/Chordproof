interface ChordDiagramProps {
  chord: string;
  frets: number[];
  fingers: number[];
  barre?: { from: number; to: number; fret: number };
}

const chordData: Record<string, { frets: number[]; fingers: number[] }> = {
  // Maiores
  "C":       { frets: [0,1,0,2,3,0], fingers: [0,1,0,2,3,0] },
  "C#":      { frets: [4,4,6,6,6,4], fingers: [1,1,2,3,4,1] },
  "Db":      { frets: [4,4,6,6,6,4], fingers: [1,1,2,3,4,1] },
  "D":       { frets: [0,0,0,2,3,2], fingers: [0,0,0,1,2,1] },
  "D#":      { frets: [6,6,8,8,8,6], fingers: [1,1,2,3,4,1] },
  "Eb":      { frets: [6,6,8,8,8,6], fingers: [1,1,2,3,4,1] },
  "E":       { frets: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0] },
  "F":       { frets: [1,1,2,3,3,1], fingers: [1,1,2,3,4,1] },
  "F#":      { frets: [2,4,4,3,2,2], fingers: [1,3,4,2,1,1] },
  "Gb":      { frets: [2,4,4,3,2,2], fingers: [1,3,4,2,1,1] },
  "G":       { frets: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3] },
  "G#":      { frets: [4,6,6,5,4,4], fingers: [1,3,4,2,1,1] },
  "Ab":      { frets: [4,6,6,5,4,4], fingers: [1,3,4,2,1,1] },
  "A":       { frets: [0,0,2,2,2,0], fingers: [0,0,1,2,3,0] },
  "A#":      { frets: [6,6,8,8,8,6], fingers: [1,1,2,3,4,1] },
  "Bb":      { frets: [6,6,8,8,8,6], fingers: [1,1,2,3,4,1] },
  "B":       { frets: [2,2,4,4,4,2], fingers: [1,1,2,3,4,1] },

  // Menores
  "Cm":      { frets: [3,3,5,5,4,3], fingers: [1,1,2,3,4,1] },
  "C#m":     { frets: [4,4,6,6,5,4], fingers: [1,1,2,3,4,1] },
  "Dbm":     { frets: [4,4,6,6,5,4], fingers: [1,1,2,3,4,1] },
  "Dm":      { frets: [0,0,0,2,3,1], fingers: [0,0,0,2,3,1] },
  "D#m":     { frets: [6,6,8,8,7,6], fingers: [1,1,2,3,4,1] },
  "Ebm":     { frets: [6,6,8,8,7,6], fingers: [1,1,2,3,4,1] },
  "Em":      { frets: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0] },
  "Fm":      { frets: [1,1,3,3,1,1], fingers: [1,1,3,4,1,1] },
  "F#m":     { frets: [2,4,4,2,2,2], fingers: [1,3,4,1,1,1] },
  "Gbm":     { frets: [2,4,4,2,2,2], fingers: [1,3,4,1,1,1] },
  "Gm":      { frets: [3,5,5,3,3,3], fingers: [1,3,4,1,1,1] },
  "G#m":     { frets: [4,6,6,4,4,4], fingers: [1,3,4,1,1,1] },
  "Abm":     { frets: [4,6,6,4,4,4], fingers: [1,3,4,1,1,1] },
  "Am":      { frets: [0,0,2,2,1,0], fingers: [0,0,2,3,1,0] },
  "A#m":     { frets: [6,6,8,8,7,6], fingers: [1,1,2,3,4,1] },
  "Bbm":     { frets: [6,6,8,8,7,6], fingers: [1,1,2,3,4,1] },
  "Bm":      { frets: [0,2,4,4,3,2], fingers: [0,1,3,4,2,1] },

  // Sétimas
  "C7":      { frets: [0,1,0,2,3,0], fingers: [0,1,0,2,3,0] },
  "D7":      { frets: [0,0,0,2,1,2], fingers: [0,0,0,2,1,3] },
  "E7":      { frets: [0,2,0,1,0,0], fingers: [0,2,0,1,0,0] },
  "F7":      { frets: [1,1,2,3,1,1], fingers: [1,1,2,3,1,1] },
  "G7":      { frets: [3,2,0,0,0,1], fingers: [2,1,0,0,0,3] },
  "A7":      { frets: [0,0,2,0,2,0], fingers: [0,0,1,0,2,0] },
  "B7":      { frets: [0,2,1,2,0,2], fingers: [0,2,1,3,0,4] },
  "Cm7":     { frets: [3,3,5,3,4,3], fingers: [1,1,3,1,2,1] },
  "Dm7":     { frets: [0,0,0,2,1,1], fingers: [0,0,0,2,1,1] },
  "Em7":     { frets: [0,2,0,0,0,0], fingers: [0,2,0,0,0,0] },
  "Fm7":     { frets: [1,1,3,3,1,1], fingers: [1,1,3,4,1,1] },
  "Gm7":     { frets: [3,3,5,3,3,3], fingers: [1,1,3,1,1,1] },
  "Am7":     { frets: [0,0,2,0,1,0], fingers: [0,0,2,0,1,0] },
  "Bm7":     { frets: [0,2,4,2,3,2], fingers: [0,1,3,1,2,1] },

  // Sétima maior
  "Cmaj7":   { frets: [0,1,0,0,0,0], fingers: [0,1,0,0,0,0] },
  "Dmaj7":   { frets: [0,0,0,2,2,2], fingers: [0,0,0,1,2,3] },
  "Emaj7":   { frets: [0,2,1,1,0,0], fingers: [0,3,1,2,0,0] },
  "Fmaj7":   { frets: [1,1,2,2,1,1], fingers: [1,1,2,3,1,1] },
  "Gmaj7":   { frets: [3,2,0,0,0,2], fingers: [2,1,0,0,0,3] },
  "Amaj7":   { frets: [0,0,2,1,2,0], fingers: [0,0,2,1,3,0] },
  "Bmaj7":   { frets: [2,2,4,3,4,2], fingers: [1,1,3,2,4,1] },

  // Sétima diminuta e meia-diminuta
  "Cdim":    { frets: [0,1,2,0,1,2], fingers: [0,1,2,0,1,3] },
  "Ddim":    { frets: [0,0,1,2,1,2], fingers: [0,0,1,2,1,3] },
  "Edim":    { frets: [0,1,2,0,0,0], fingers: [0,1,2,0,0,0] },
  "Gdim":    { frets: [3,4,5,3,4,5], fingers: [1,2,3,1,2,3] },
  "Adim":    { frets: [0,1,2,0,1,0], fingers: [0,1,2,0,3,0] },
  "Cm7b5":   { frets: [3,3,5,3,4,3], fingers: [1,1,3,1,2,1] },
  "Dm7b5":   { frets: [0,0,1,2,1,1], fingers: [0,0,1,3,1,1] },
  "Gm7b5":   { frets: [3,3,5,3,4,3], fingers: [1,1,3,1,2,1] },

  // Suspensos
  "Csus2":   { frets: [0,1,0,2,3,0], fingers: [0,1,0,2,3,0] },
  "Csus4":   { frets: [0,1,0,2,3,1], fingers: [0,1,0,2,3,1] },
  "Dsus2":   { frets: [0,0,0,2,3,0], fingers: [0,0,0,1,2,0] },
  "Dsus4":   { frets: [0,0,0,2,3,3], fingers: [0,0,0,1,2,3] },
  "Esus4":   { frets: [0,2,2,2,0,0], fingers: [0,1,2,3,0,0] },
  "Gsus4":   { frets: [3,2,0,0,1,3], fingers: [2,1,0,0,3,4] },
  "Asus2":   { frets: [0,0,2,2,0,0], fingers: [0,0,1,2,0,0] },
  "Asus4":   { frets: [0,0,2,2,3,0], fingers: [0,0,1,2,3,0] },

  // Com quarta
  "C4":      { frets: [0,1,0,2,3,1], fingers: [0,1,0,2,3,1] },
  "D4":      { frets: [0,0,0,2,3,0], fingers: [0,0,0,1,2,0] },
  "E4":      { frets: [0,2,2,2,0,0], fingers: [0,1,2,3,0,0] },
  "G4":      { frets: [3,2,0,0,1,3], fingers: [2,1,0,0,3,4] },
  "A4":      { frets: [0,0,2,2,3,0], fingers: [0,0,1,2,3,0] },

  // Nona
  "C9":      { frets: [0,3,2,0,3,0], fingers: [0,2,1,0,3,0] },
  "D9":      { frets: [0,0,0,2,1,2], fingers: [0,0,0,2,1,3] },
  "E9":      { frets: [0,2,0,1,0,2], fingers: [0,2,0,1,0,3] },
  "G9":      { frets: [3,2,0,0,0,2], fingers: [2,1,0,0,0,3] },
  "A9":      { frets: [0,0,2,2,0,2], fingers: [0,0,1,2,0,3] },

  // Com baixo alterado
  "C/E":     { frets: [0,0,0,2,3,0], fingers: [0,0,0,1,2,0] },
  "D/F#":    { frets: [2,0,0,2,3,2], fingers: [1,0,0,2,3,1] },
  "D11/F#":  { frets: [2,0,0,2,3,0], fingers: [1,0,0,2,3,0] },
  "G/B":     { frets: [0,2,0,0,0,3], fingers: [0,1,0,0,0,2] },
  "A/C#":    { frets: [0,0,2,2,2,0], fingers: [0,0,1,2,3,0] },
  "A7(4)":   { frets: [0,0,2,0,2,0], fingers: [0,0,2,0,1,0] },
  "A7(13)":  { frets: [0,0,2,0,2,2], fingers: [0,0,1,0,2,3] },
};

export default function ChordDiagram({ chord, frets, fingers, barre }: ChordDiagramProps) {
  const data = chordData[chord] || { frets: [0,0,0,0,0,0], fingers: [0,0,0,0,0,0] };
  const f = frets || data.frets;
  const fin = fingers || data.fingers;

  const stringNames = ["E", "A", "D", "G", "B", "E"];
  const maxFret = Math.max(...f.filter(n => n > 0), 0);
  const fretStart = maxFret > 4 ? Math.max(maxFret - 3, 1) : 1;
  const displayFrets = maxFret > 4
    ? [fretStart, fretStart + 1, fretStart + 2, fretStart + 3]
    : [1, 2, 3, 4];

  return (
    <div className="inline-flex flex-col items-center bg-[#1A1A1A] rounded-xl p-3 border border-white/[0.06] shadow-xl min-w-[120px]">
      <span className="text-xs font-bold text-brand-accent mb-2">{chord}</span>
      <svg width="100" height="120" viewBox="0 0 100 120" className="shrink-0">
        {maxFret <= 4 ? (
          <rect x="10" y="8" width="80" height="4" rx="1" fill="#888" />
        ) : (
          <text x="50" y="14" textAnchor="middle" fill="#A7A7A7" fontSize="8">{fretStart}ª</text>
        )}

        {[0, 1, 2, 3].map((i) => (
          <line key={`fret-${i}`} x1="14" y1={24 + i * 22} x2="86" y2={24 + i * 22} stroke="#444" strokeWidth="1" />
        ))}

        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 18 + i * 12;
          const fretPos = f[i];
          const finger = fin[i];

          return (
            <g key={`string-${i}`}>
              <line x1={x} y1="12" x2={x} y2="108" stroke={fretPos > 0 ? "#888" : "#555"} strokeWidth={1.5} />
              {fretPos === -1 && (
                <text x={x} y="20" textAnchor="middle" fill="#CF6679" fontSize="10" fontWeight="bold">X</text>
              )}
              {fretPos === 0 && (
                <circle cx={x} cy="20" r="4" fill="none" stroke="#1ED760" strokeWidth="1.5" />
              )}
              {fretPos > 0 && finger > 0 && (
                <>
                  <circle cx={x} cy={24 + (fretPos - fretStart) * 22 + 11} r="7" fill="#1ED760" />
                  <text x={x} y={24 + (fretPos - fretStart) * 22 + 15} textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">
                    {finger}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {barre && (
          <rect
            x={18 + (barre.from - 1) * 12}
            y={24 + (barre.fret - fretStart) * 22 + 5}
            width={(barre.to - barre.from + 1) * 12}
            height="14"
            rx="7"
            fill="#1ED760"
            opacity="0.8"
          />
        )}
      </svg>
      <div className="flex gap-1 mt-1">
        {stringNames.map((name, i) => (
          <span key={i} className="text-[8px] text-brand-muted uppercase" style={{ width: 12, textAlign: 'center' }}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
