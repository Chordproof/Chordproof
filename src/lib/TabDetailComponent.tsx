"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import TransposeControls from "@/components/TransposeControls";
import AutoScrollControl from "@/components/AutoScrollControl";
import ArtistAvatar from "@/components/ArtistAvatar";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import StageMode from "@/components/StageMode";
import EasyModeToggle from "@/components/EasyModeToggle";
import PdfButton from "@/components/PdfButton";
import PrintButton from "@/components/PrintButton";
import AddToSetlist from "@/components/AddToSetlist";
import ChordTransitionTrainer from "@/components/ChordTransitionTrainer";
import SmartKey from "@/components/SmartKey";
import InstrumentPicker from "@/components/InstrumentPicker";
import SaveTabButton from "@/components/SaveTabButton";
import DrumMachine from "@/components/DrumMachine";
import type { InstrumentKey } from "@/lib/instruments";
import { BadgeCheck, AlertTriangle, Share2, Play, MousePointer2, Loader2, ChevronDown, Youtube, Zap, MoreHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { recordAction } from "@/lib/gamification";
import { chordsUsed } from "@/lib/chordData";
import { MiniFretboard, ChordDiagram, ThemePicker, THEMES, type ThemeKey } from "@/lib/fretboard";
import { renderContent, renderTablature, hasInlineTablature } from "@/lib/tabRenderer";
import { usePlusAccess } from "@/components/PlusGate";
import { audioEngine, chordMidiFromName, chordMidiFromShape, bassMidiForChord } from "@/lib/audio";
import { CHORD_SHAPES } from "@/lib/chordData";
import SoundToggle from "@/components/SoundToggle";
import PlayProgression from "@/components/PlayProgression";


function Sep() {
  return <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />;
}

/**
 * Recebe `initialTab` do Server Component: com ela, o HTML já sai com a cifra
 * renderizada (o Google lê o conteúdo) e não há busca no Supabase ao carregar.
 * Sem ela, o comportamento antigo (fetch no cliente) continua valendo.
 */
export default function TabDetailComponent({
  params,
  initialTab = null,
}: {
  params: { artist: string; song: string };
  initialTab?: any | null;
}) {
  const [tab, setTab] = useState<any>(initialTab);
  const [loading, setLoading] = useState(!initialTab);
  const [notFound, setNotFound] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [showTablature, setShowTablature] = useState(true);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [youtubeId, setYoutubeId] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>("amber");
  const [easyOverride, setEasyOverride] = useState<{ content: string; capo: number | null } | null>(null);
  const [trainerOpen, setTrainerOpen] = useState(false);
  const [drumOpen, setDrumOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [instrument, setInstrument] = useState<InstrumentKey>("guitar");
  const plus = usePlusAccess();

  /**
   * Clique num acorde da cifra: abre o diagrama E toca o acorde.
   * Usa o desenho real de violão quando existe (vozes de verdade); senão
   * calcula pelo nome. A transposição da tela entra no som.
   */
  const handleChordClick = (chord: string) => {
    setActiveChord(chord);
    const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    const m = chord.match(/^([A-G])([#b]?)(.*)$/);
    let name = chord;
    if (m && transpose) {
      let idx = NOTE_NAMES.indexOf(m[1]);
      if (m[2] === "#") idx += 1;
      if (m[2] === "b") idx += 11;
      idx = ((idx % 12) + transpose + 12) % 12;
      name = NOTE_NAMES[idx] + (m[3] || "");
    }
    const shape = CHORD_SHAPES[name] || CHORD_SHAPES[chord];
    const midis = shape && shape.length === 6
      ? chordMidiFromShape(shape)
      : chordMidiFromName(name, bassMidiForChord(chord));
    audioEngine.unlock().then(() => audioEngine.playChord(midis, name));
  };

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-instrument") as InstrumentKey | null;
    if (saved && ["guitar", "acoustic", "bass", "cavaco", "ukulele", "piano"].includes(saved)) setInstrument(saved);
  }, []);
  useEffect(() => { localStorage.setItem("chordproof-instrument", instrument); }, [instrument]);

  useEffect(() => {
    const saved = localStorage.getItem("chordproof-theme") as ThemeKey | null;
    if (saved && THEMES[saved]) setThemeKey(saved);
  }, []);

  useEffect(() => { localStorage.setItem("chordproof-theme", themeKey); }, [themeKey]);

  const theme = THEMES[themeKey];

  useEffect(() => {
    // Se o servidor já mandou a cifra, o HTML veio completo: nada a buscar.
    if (initialTab) { recordAction("OPEN_TAB"); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("tabs").select("*").eq("slug_artist", params.artist).eq("slug_song", params.song).maybeSingle();
      if (!active) return;
      if (error || !data) { setNotFound(true); } else { setTab(data); recordAction("OPEN_TAB"); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [params.artist, params.song, initialTab]);

  useEffect(() => {
    if (!tab) return;
    // Injeta info da música para o StageMode buscar o BPM automaticamente
    (window as any).__stageTrackInfo = { artist: tab.artist || params.artist.replace(/-/g, " "), song: tab.song || params.song.replace(/-/g, " "), keySig: tab.key_sig || "" };
    const id = tab.youtube_id || tab.video_id || tab.youtube || tab.video_url || tab.yt_id || "";
    if (id) { setYoutubeId(id); return; }
    setYoutubeLoading(true);
    const a = tab.artist || params.artist.replace(/-/g, " ");
    const s = tab.song || params.song.replace(/-/g, " ");
    fetch("/api/youtube-search?q=" + encodeURIComponent(a + " " + s + " official")).then(r => r.json()).then(d => { if (d.videoId) setYoutubeId(d.videoId); }).catch(() => {}).finally(() => setYoutubeLoading(false));
  }, [tab]);

  if (loading) return <div className="flex items-center justify-center py-32 text-brand-muted"><Loader2 className="animate-spin mr-3" /> Loading tab...</div>;
  if (notFound || !tab) return (
    <div className="text-center py-32 space-y-4">
      <h1 className="text-4xl font-bold">Tab not found</h1>
      <p className="text-brand-muted">This tab isn't in our database yet.</p>
      <a href="/request" className="inline-block bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] px-6 py-3 rounded-full font-bold hover:scale-105 transition">Request this tab</a>
    </div>
  );

  const songName = tab.song || params.song.replace(/-/g, " ");
  const artistName = tab.artist || params.artist.replace(/-/g, " ");
  const content = easyOverride ? easyOverride.content : tab.content || "";
  const tablature = tab.tablature || "";
  const usedChords = chordsUsed(content, transpose);

  /**
   * CAPOTRASTE: o banco guarda em `capo`. O diagrama precisa do NUMERO para
   * desenhar a barra na casa certa — antes o capo so existia como selo no topo
   * e o desenho do acorde escondia a informacao, entao quem lia cifra com capo
   * tocava na casa errada. Sao 254 cifras com capo no catalogo.
   */
  const capoFret = (() => {
    const raw = (tab as any)?.capo;
    if (raw === null || raw === undefined || raw === "") return 0;
    const n = parseInt(String(raw).replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) && n > 0 && n <= 12 ? n : 0;
  })();
  // Idioma: o navegador do visitante. O site e em ingles, mas capotraste e
  // "variacao" sao justamente onde o iniciante brasileiro se perde.
  const locale: string | undefined = undefined;
  const isPt =
    typeof navigator !== "undefined" &&
    navigator.language.toLowerCase().startsWith("pt");
  const hasTab = tablature && tablature.trim().length > 0;

  return (
    <div style={{maxWidth:"1400px",margin:"0 auto"}}>
      <nav className="text-sm text-brand-muted" style={{marginBottom:"24px"}}><ol className="flex gap-2">
        <li><a href="/" className="hover:text-[var(--c-text)]">Home</a></li><li>/</li>
        <li><a href="/browse" className="hover:text-[var(--c-text)]">Browse</a></li><li>/</li>
        <li><a href={"/artist/"+params.artist} className="hover:text-[var(--c-text)] capitalize">{artistName}</a></li>
      </ol></nav>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6" style={{marginBottom:"24px"}}>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim"><BadgeCheck size={14} /> VERIFIED</div>}
          </div>
          <div className="flex items-center gap-2">
            <ArtistAvatar name={artistName} slug={params.artist} imageUrl={tab.artist_image_url} size="xs" />
            <Link href={`/artist/${params.artist}`} className="text-xl text-brand-muted hover:text-brand-gold hover:underline transition-colors inline-block">
              {artistName}
            </Link>
          </div>
          <div className="flex gap-4 pt-2 flex-wrap">
            {tab.key_sig && <span className="bg-[var(--c-overlay-soft)] px-3 py-1 rounded text-sm">Key: <strong>{tab.key_sig}</strong></span>}
            {tab.difficulty && <span className="bg-[var(--c-overlay-soft)] px-3 py-1 rounded text-sm">Difficulty: <strong className="text-green-400">{tab.difficulty}</strong></span>}
            {capoFret > 0 && <span className="bg-[var(--c-gold-soft)] text-[var(--c-gold)] px-3 py-1 rounded text-sm font-bold tracking-wide">{isPt ? `CAPOTRASTE NA CASA ${capoFret}` : `CAPO ON FRET ${capoFret}`}</span>}
            {easyOverride?.capo && <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded text-sm font-bold">Easy capo: <strong>{easyOverride.capo}</strong></span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <SaveOfflineButton tab={tab} slugArtist={params.artist} slugSong={params.song} />
          <AddToSetlist tabId={tab.id} song={songName} artist={artistName} />
          <SaveTabButton artist={params.artist} song={params.song} />
          <SoundToggle />
          <a href="#tab-content" className="flex items-center gap-2 px-6 py-3 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] rounded-full font-bold hover:scale-105 transition"><Play size={18} /> Play</a>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"12px",marginBottom:"24px"}} className="md:hidden">
        <div className="bg-[var(--c-card)] rounded-xl p-3">
          <p className="text-xs text-brand-muted mb-2">Chords used</p>
          <div className="flex flex-wrap gap-2">
            {usedChords.map((c) => (<div key={c} onClick={() => handleChordClick(c)} style={{cursor:"pointer"}}><MiniFretboard chord={c} theme={theme} instrument={instrument} capo={capoFret} locale={locale} /></div>))}
          </div>
        </div>
      </div>

      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} theme={theme} instrument={instrument} capo={capoFret} locale={locale} />}
    </div>
  );
}
