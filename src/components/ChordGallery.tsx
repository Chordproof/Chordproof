import ChordDiagram from "./ChordDiagram";

interface ChordGalleryProps {
  chords: string[];
}

export default function ChordGallery({ chords }: ChordGalleryProps) {
  const uniqueChords = Array.from(new Set(chords));

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-white/[0.06]">
      <h3 className="text-lg font-display font-bold mb-6">Chords used in this song</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {uniqueChords.map((chord) => (
          <ChordDiagram key={chord} chord={chord} />
        ))}
      </div>
    </div>
  );
}
