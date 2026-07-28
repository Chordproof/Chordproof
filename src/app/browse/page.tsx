import SearchBar from "@/components/SearchBar";
import TabCard from "@/components/TabCard";

export default function Browse() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Browse Tabs</h1>
        <p className="text-brand-muted max-w-xl mx-auto">
          Search through thousands of verified guitar tabs.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar large />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {["All", "Beginner", "Intermediate", "Advanced", "Rock", "Pop", "Blues", "Jazz", "Metal", "Folk"].map((f) => (
          <button key={f} className={`px-5 py-2 rounded-full text-sm font-bold transition ${
            f === "All" ? "bg-brand-gold text-black" : "bg-white/5 hover:bg-white/10"
          }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        <TabCard song="Wonderwall" artist="Oasis" difficulty="Beginner" isVerified={true} key_sig="F#m" />
        <TabCard song="Hotel California" artist="Eagles" difficulty="Advanced" isVerified={true} key_sig="Bm" />
        <TabCard song="Perfect" artist="Ed Sheeran" difficulty="Beginner" isVerified={true} key_sig="Ab" />
        <TabCard song="Hallelujah" artist="Jeff Buckley" difficulty="Intermediate" isVerified={true} key_sig="C" />
        <TabCard song="Creep" artist="Radiohead" difficulty="Beginner" isVerified={true} key_sig="G" />
        <TabCard song="Stairway to Heaven" artist="Led Zeppelin" difficulty="Advanced" isVerified={true} key_sig="Am" />
        <TabCard song="Nothing Else Matters" artist="Metallica" difficulty="Intermediate" isVerified={true} key_sig="Em" />
        <TabCard song="Tears in Heaven" artist="Eric Clapton" difficulty="Intermediate" isVerified={true} key_sig="A" />
        <TabCard song="Blackbird" artist="The Beatles" difficulty="Intermediate" isVerified={true} key_sig="G" />
      </div>
    </div>
  );
}
