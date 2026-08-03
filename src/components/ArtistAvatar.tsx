"use client";
import { useState, useEffect, useRef } from "react";

interface ArtistAvatarProps {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-14 h-14 text-xl",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 md:w-40 md:h-40 text-5xl md:text-6xl",
};

const initialsUrl = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=1ED760,22c55e,059669&textColor=000000`;

export default function ArtistAvatar({ name, slug, imageUrl, size = "sm" }: ArtistAvatarProps) {
  const [src, setSrc] = useState<string>(imageUrl || "");
  const tried = useRef({ wiki: false, itunes: false });

  // Fonte 2: Wikipedia (API pública, sem chave)
  const loadWiki = () => {
    tried.current.wiki = true;
    const title = name.trim().replace(/ /g, "_");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
      .then((d) => {
        const thumb = d?.thumbnail?.source;
        if (thumb) setSrc(thumb);
        else loadItunes();
      })
      .catch(() => loadItunes());
  };

  // Fonte 3: iTunes / Apple Music (API pública, sem chave, CORS liberado)
  const loadItunes = () => {
    tried.current.itunes = true;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=1`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
      .then((d) => {
        const art = d?.results?.[0]?.artworkUrl100;
        if (art) {
          // Troca a miniatura 100x100 por 600x600
          setSrc(art.replace(/100x100bb\.(jpg|png)$/, "600x600bb.$1"));
        } else {
          setSrc(initialsUrl(name));
        }
      })
      .catch(() => setSrc(initialsUrl(name)));
  };

  // Sem image_url no banco: já busca na Wikipedia no primeiro render
  useEffect(() => {
    if (!imageUrl) loadWiki();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleError = () => {
    if (src === imageUrl && imageUrl) {
      // A foto do banco falhou → tenta Wikipedia
      loadWiki();
    } else if (!tried.current.wiki) {
      // A foto atual (banco) falhou sem ter passado pela Wikipedia → tenta Wikipedia
      loadWiki();
    } else if (!tried.current.itunes) {
      // Wikipedia falhou/sem foto → tenta iTunes
      loadItunes();
    } else if (src !== initialsUrl(name)) {
      // iTunes falhou → iniciais (DiceBear)
      setSrc(initialsUrl(name));
    } else {
      // Até as iniciais falharam → inicial pura
      setSrc("");
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-brand-accent to-emerald-700 flex items-center justify-center font-black shrink-0 overflow-hidden`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={handleError} />
      ) : (
        <span>{name.charAt(0)}</span>
      )}
    </div>
  );
}
