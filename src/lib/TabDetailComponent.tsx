"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AutoScrollControl from "@/components/AutoScrollControl";
import ArtistAvatar from "@/components/ArtistAvatar";
import SaveOfflineButton from "@/components/SaveOfflineButton";
import AddToSetlist from "@/components/AddToSetlist";
import ChordTransitionTrainer from "@/components/ChordTransitionTrainer";
import SmartKey from "@/components/SmartKey";
import SaveTabButton from "@/components/SaveTabButton";
import DrumMachine from "@/components/DrumMachine";
import type { InstrumentKey } from "@/lib/instruments";
import { BadgeCheck, AlertTriangle, Share2, Play, Loader2, Youtube } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { recordAction } from "@/lib/gamification";
import { chordsUsed } from "@/lib/chordData";
import { MiniFretboard, ChordDiagram, THEMES, type ThemeKey } from "@/lib/fretboard";
import TabActionBar from "@/components/TabActionBar";
import { renderContent, renderTablature, hasInlineTablature } from "@/lib/tabRenderer";
import { usePlusAccess } from "@/components/PlusGate";
import { audioEngine } from "@/lib/audio";
import { useSession } from "next-auth/react";
import SoundToggle from "@/components/SoundToggle";
import PlayProgression from "@/components/PlayProgression";
import ContinueBar from "@/components/ContinueBar";
import { scoreDifficulty } from "@/lib/difficulty";


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
  const [easyOn, setEasyOn] = useState(false);
  const [easyDismissed, setEasyDismissed] = useState(false);
  const [easyApply, setEasyApply] = useState(0);
  const [trainerOpen, setTrainerOpen] = useState(false);
  const [drumOpen, setDrumOpen] = useState(false);
  const [instrument, setInstrument] = useState<InstrumentKey>("guitar");
  // linha (índice no content) que está tocando agora — vem do PlayProgression
  const [activeLine, setActiveLine] = useState<number | null>(null);
  // "Follow the tab": quando ligado, a página rola até a linha que está tocando
  const [follow, setFollow] = useState(true);
  /**
   * CONTINUAR DE ONDE PAREI: se a conta parou NESTA cifra, o player começa do
   * acorde salvo. A posição é gravada de tempos em tempos (não a cada acorde,
   * para não escrever no banco dezenas de vezes por minuto).
   */
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const posGravarRef = useRef<number>(0);
  const plus = usePlusAccess();
  // sem sessão não há posição a buscar: /api/position devolveria 401 em toda
  // visita anônima (é a maioria do tráfego) e sujaria o console.
  const { status: authStatus } = useSession();
  // nomes para exibir/gravar — precisam existir ANTES de gravarPosicao usá-los
  const songName = tab?.song || params.song.replace(/-/g, " ");
  const artistName = tab?.artist || params.artist.replace(/-/g, " ");

  // Onde esta conta parou nesta música?
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/position", { cache: "no-store" });
        if (!r.ok) return;
        const d = await r.json();
        const p = d?.position;
        if (!active || !p) return;
        if (p.slug_artist === params.artist && p.slug_song === params.song) {
          const idx = Number(p.chord_index);
          if (Number.isFinite(idx) && idx > 0) setResumeAt(idx);
        }
      } catch {
        /* sem sessão: começa do topo, como antes */
      }
    })();
    return () => {
      active = false;
    };
  }, [params.artist, params.song, authStatus]);

  /**
   * Grava o ponto de retorno. Limita a 1 gravação a cada 15s: o player avisa
   * a cada acorde (a música mediana tem 80) e escrever no banco 80 vezes por
   * música seria desperdício.
   */
  const gravarPosicao = (chordIndex: number) => {
    const agora = Date.now();
    if (agora - posGravarRef.current < 15000) return;
    posGravarRef.current = agora;
    fetch("/api/position", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slugArtist: params.artist,
        slugSong: params.song,
        songTitle: songName,
        artistName: artistName,
        chordIndex,
      }),
    }).catch(() => {});
  };

  /**
   * Rolagem que acompanha a música. Quem toca tem as duas mãos no instrumento
   * e não pode rolar a tela — é o motivo de existir. A linha fica 38% abaixo
   * do topo (e não no meio), que é onde o olho lê adiante da mão.
   */
  useEffect(() => {
    if (!follow || activeLine === null) return;
    const el = document.querySelector(`[data-tab-body] [data-line="${activeLine}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const alvo = window.scrollY + r.top - window.innerHeight * 0.38;
    // só rola se saiu de uma faixa confortável: evita tremor a cada acorde
    const fora = r.top < window.innerHeight * 0.18 || r.top > window.innerHeight * 0.72;
    if (!fora) return;
    window.scrollTo({ top: Math.max(0, alvo), behavior: "smooth" });
  }, [activeLine, follow]);

  /**
   * Clique num acorde da cifra: abre o diagrama E toca o acorde.
   * O som sai no TIMBRE do instrumento escolhido (playChordFor), não mais como
   * guitarra fixa. A transposição da tela entra no som.
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
    audioEngine.unlock().then(() => audioEngine.playChordFor(name, instrument));
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
    if (initialTab) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("tabs").select("*").eq("slug_artist", params.artist).eq("slug_song", params.song).maybeSingle();
      if (!active) return;
      if (error || !data) { setNotFound(true); } else { setTab(data); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [params.artist, params.song, initialTab]);

  /**
   * Registra a visita SÓ com sessão ativa. Antes o recordAction rodava em toda
   * abertura de cifra e o POST /api/stats voltava 401 para quem não estava
   * logado — que é a maioria do tráfego, então sujava o console de todo mundo.
   */
  useEffect(() => {
    if (authStatus !== "authenticated" || !tab) return;
    recordAction("OPEN_TAB");
  }, [authStatus, tab?.id]);

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

  const content = easyOverride ? easyOverride.content : tab.content || "";
  const tablature = tab.tablature || "";
  const usedChords = chordsUsed(content, transpose);

  /**
   * CAPOTRASTE: o banco guarda em `capo`. O diagrama precisa do NUMERO para
   * desenhar a barra na casa certa — antes o capo só existia como selo no topo
   * e o desenho do acorde escondia a informação. 254 cifras têm capo.
   */
  const capoFret = (() => {
    const raw = (tab as any)?.capo;
    if (raw === null || raw === undefined || raw === "") return 0;
    const n = parseInt(String(raw).replace(/[^0-9]/g, ""), 10);
    return Number.isFinite(n) && n > 0 && n <= 12 ? n : 0;
  })();
  // O site é inteiro em inglês, então o diagrama também: detectar o idioma do
  // navegador misturava "Capotraste na casa 3" com "Chords used in this tab".
  const locale = "en";
  const hasTab = tablature && tablature.trim().length > 0;

  return (
    <div style={{maxWidth:"1400px",margin:"0 auto"}}>
      <nav className="text-sm text-brand-muted" style={{marginBottom:"24px"}}><ol className="flex gap-2">
        <li><a href="/" className="hover:text-[var(--c-text)]">Home</a></li><li>/</li>
        <li><a href="/browse" className="hover:text-[var(--c-text)]">Browse</a></li><li>/</li>
        <li><a href={"/artist/"+params.artist} className="hover:text-[var(--c-text)] capitalize">{artistName}</a></li>
      </ol></nav>
      {/* continuar de onde parei + streak: só aparece para conta logada */}
      <ContinueBar currentSlugArtist={params.artist} currentSlugSong={params.song} />
      <div className="flex flex-col md:flex-row justify-between items-start gap-6" style={{marginBottom:"24px"}}>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold">{songName}</h1>
            {tab.is_verified && <div className="flex items-center gap-1 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold gold-seal-anim"><BadgeCheck size={14} /> VERIFIED</div>}
          </div>
          {/* Nome do artista com foto ao lado */}
          <div className="flex items-center gap-2">
            <ArtistAvatar name={artistName} slug={params.artist} imageUrl={tab.artist_image_url} size="xs" />
            <Link href={`/artist/${params.artist}`} className="text-xl text-brand-muted hover:text-brand-gold hover:underline transition-colors inline-block">
              {artistName}
            </Link>
          </div>
          <div className="flex gap-4 pt-2 flex-wrap">
            {tab.key_sig && <span className="bg-[var(--c-overlay-soft)] px-3 py-1 rounded text-sm">Key: <strong>{tab.key_sig}</strong></span>}
            {/* A NOTA CALCULADA, não o campo `difficulty` antigo.
                Medi os 1.166: o rótulo antigo dizia "Beginner" para cifras com
                média de 7,3 acordes e "Advanced" para 9,1 — praticamente o
                mesmo. Pior: a trilha /learn classifica a MESMA música pela nota
                calculada, então manter os dois mostrava "Difficulty: Beginner"
                aqui e "Easy" na trilha, na mesma música. Uma fonte só. */}
            {(() => {
              const d = scoreDifficulty({ content: tab.content, capo: tab.capo });
              return (
                <span className="bg-[var(--c-overlay-soft)] px-3 py-1 rounded text-sm">
                  Difficulty: <strong className="text-green-400">{d.label}</strong>
                </span>
              );
            })()}
            {capoFret > 0 && <span className="bg-[var(--c-gold-soft)] text-[var(--c-gold)] px-3 py-1 rounded text-sm font-bold tracking-wide">CAPO ON FRET {capoFret}</span>}
            {easyOverride?.capo && <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded text-sm font-bold">Easy capo: <strong>{easyOverride.capo}</strong></span>}
          </div>
          {tab.genre && <p className="text-sm text-brand-muted pt-1">Style: {tab.genre}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-3 bg-[var(--c-overlay-soft)] rounded-full hover:bg-[var(--c-overlay)]" title={copied ? "Link copied!" : "Share"}><Share2 size={20} className={copied ? "text-brand-gold" : ""} /></button>
          <SaveOfflineButton tab={tab} slugArtist={params.artist} slugSong={params.song} />
          <AddToSetlist tabId={tab.id} song={songName} artist={artistName} />
          <SaveTabButton artist={params.artist} song={params.song} />
          <SoundToggle />
          <a href="#tab-content" className="flex items-center gap-2 px-6 py-3 bg-[var(--c-cta-bg)] text-[var(--c-cta-text)] rounded-full font-bold hover:scale-105 transition"><Play size={18} /> Play</a>
        </div>
      </div>
      {/*
        ACTION BAR — extraída para <TabActionBar/>: uma linha, com hierarquia
        (Transpose ancora à esquerda, instrumento e menu à direita). Antes esta
        barra gastava 122px em 2 linhas e o seletor de instrumento caía sozinho
        na segunda. No celular os 9 controles continuam visíveis, em ícone.
      */}
      <TabActionBar
        transpose={transpose}
        onTranspose={setTranspose}
        showTablature={showTablature}
        onToggleTablature={() => setShowTablature((v) => !v)}
        plusAccess={plus.hasAccess}
        onOpenTrainer={() => { if (plus.hasAccess) setTrainerOpen(true); else window.location.href = "/pricing?feature=Trainer"; }}
        onOpenDrums={() => { if (plus.hasAccess) setDrumOpen(true); else window.location.href = "/pricing?feature=Drums"; }}
        easyContent={tab.content || ""}
        easyOn={easyOn}
        onEasyToggle={setEasyOn}
        onEasyOverride={(easyContent, capo) => setEasyOverride(easyContent ? { content: easyContent, capo } : null)}
        easyCapo={easyOverride?.capo ?? null}
        easyDismissed={easyDismissed}
        onEasyDismiss={() => setEasyDismissed(true)}
        easyApply={easyApply}
        onEasyTry={() => setEasyApply((n) => n + 1)}
        instrument={instrument}
        onInstrumentChange={setInstrument}
        themeKey={themeKey}
        onThemeChange={setThemeKey}
        songName={songName}
        artistName={artistName}
        content={content}
        capo={tab.capo}
        keySig={tab.key_sig}
        tab={tab}
        stageChildren={
          <>
            {renderContent(content, showTablature, transpose, handleChordClick, theme, activeLine)}
            {showTablature && hasTab && !hasInlineTablature(content) && renderTablature(tablature)}
          </>
        }
      />
      {/* flexDirection="column" no style INLINE vencia a classe md:flex-row do
          Tailwind (inline > classe): o layout ficava em UMA coluna em qualquer
          largura e o bloco do video caia depois da cifra inteira, ate no
          desktop. Agora a direcao vem das classes: coluna no mobile, duas
          colunas a partir de md. */}
      <div style={{display:"flex",gap:"24px",alignItems:"flex-start"}} className="flex-col md:flex-row md:items-start">
        <div style={{flex:"3 1 0%",minWidth:"0",width:"100%"}} className="order-2 md:order-1 md:w-auto">
          <div id="tab-content" data-tab-body className="glass-card rounded-2xl p-8" style={{marginBottom:"24px"}}>
            <div style={{fontFamily:"monospace",fontSize:"1rem",lineHeight:"1.6"}}>{renderContent(content, showTablature, transpose, handleChordClick, theme, activeLine)}</div>
            {showTablature && hasTab && !hasInlineTablature(content) && renderTablature(tablature)}
          </div>
          {usedChords.length > 0 && (
            <section className="glass-card rounded-2xl p-6 space-y-4" style={{marginBottom:"24px"}}>
              <h2 className="text-2xl font-bold">Chords used in this tab</h2>
              <p className="text-sm text-brand-muted">Hover over a chord in the tab to see its shape. Click to hear it:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:"12px"}}>
                {usedChords.map((c) => (<div key={c} onClick={() => handleChordClick(c)} style={{cursor:"pointer"}}><MiniFretboard chord={c} theme={theme} instrument={instrument} capo={capoFret} locale={locale} /></div>))}
              </div>
            </section>
          )}
          <SmartKey
            keySig={tab.key_sig}
            chords={usedChords}
            currentTranspose={transpose}
            onApplyTranspose={setTranspose}
          />
          <div className="flex items-center gap-2 text-sm text-brand-muted"><AlertTriangle size={16} className="text-brand-gold" /><span>Found an error? </span><button className="text-brand-gold hover:underline">Report this tab</button></div>
        </div>
        <div style={{flex:"1 0 320px",maxWidth:"360px",width:"100%"}} className="order-1 md:order-2 md:w-auto">
          <div style={{position:"sticky",top:"24px"}}>
            {/* Ouvir vem PRIMEIRO: quem quer ouvir acha antes de quem quer ver. */}
            <div style={{marginBottom:"16px"}}>
              <PlayProgression
                content={tab.content || ""}
                transpose={transpose}
                genre={tab.genre || null}
                artist={artistName}
                song={songName}
                instrument={instrument}
                artistSlug={params.artist}
                songSlug={params.song}
                onActiveLine={setActiveLine}
                resumeAt={resumeAt}
                onChordPlayed={gravarPosicao}
                follow={follow}
                onFollowChange={setFollow}
              />
            </div>
            {youtubeId ? (
              <div className="glass-card rounded-2xl p-4 space-y-3" style={{marginBottom:"16px"}}>
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Watch &amp; Play</h3>
                <iframe className="w-full aspect-video rounded-xl border border-[var(--c-hairline)]" src={"https://www.youtube.com/embed/"+youtubeId} title={songName + " - " + artistName} allowFullScreen />
                <p className="text-xs text-brand-muted">Play along with the video while reading the tab.</p>
              </div>
            ) : youtubeLoading ? (
              <div className="glass-card rounded-2xl p-4 space-y-3" style={{marginBottom:"16px"}}>
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Searching video...</h3>
                <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-brand-muted" size={24} /></div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-4 space-y-2" style={{marginBottom:"16px"}}>
                <h3 className="text-lg font-bold flex items-center gap-2"><Youtube size={20} className="text-red-500" /> Video</h3>
                <p className="text-sm text-brand-muted">No video found for this tab.</p>
              </div>
            )}
            {/* No mobile o bloco de vídeo sobe para antes da cifra (order-1),
                então esta referência rápida NÃO sobe junto: ela duplica a seção
                "Chords used in this tab", que fica logo abaixo da cifra e já
                mostra os mesmos acordes com o desenho. No desktop continua. */}
            {usedChords.length > 0 && (
              <div className="hidden md:block glass-card rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider">Quick Reference</h3>
                <div className="flex flex-wrap gap-2">
                  {usedChords.map((c) => (<button key={c} onClick={() => handleChordClick(c)} className="px-3 py-1.5 bg-[var(--c-overlay-soft)] rounded-lg text-sm hover:bg-brand-gold/10 transition-colors" style={{color:"#047857",fontWeight:700}}>{c}</button>))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {activeChord && <ChordDiagram chord={activeChord} onClose={() => setActiveChord(null)} theme={theme} instrument={instrument} capo={capoFret} locale={locale} />}
      {trainerOpen && <ChordTransitionTrainer chords={usedChords} onClose={() => setTrainerOpen(false)} theme={theme} />}
      {drumOpen && <DrumMachine genre={tab.genre || null} artist={artistName} song={songName} onClose={() => setDrumOpen(false)} accentColor={theme.dot} />}
      <AutoScrollControl />
    </div>
  );
}
