"use client";
import { useState, useEffect, useRef } from "react";

interface ArtistAvatarProps {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "w-10 h-10 text-lg",
  sm: "w-14 h-14 text-xl",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 md:w-40 md:h-40 text-5xl md:text-6xl",
};

// Tamanho pedido ao iTunes conforme o tamanho do avatar
const itunesSize = (size: "xs" | "sm" | "md" | "lg") =>
  size === "lg" ? "1000x1000bb" : size === "md" ? "600x600bb" : "300x300bb";

const initialsUrl = (name: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=1ED760,22c55e,059669&textColor=000000`;

const cacheKey = (name: string) => `cp-avatar-${name.toLowerCase()}`;

export default function ArtistAvatar({ name, slug, imageUrl, size = "sm" }: ArtistAvatarProps) {
  const [src, setSrc] = useState<string>(() => {
    // 1) Foto fixa no banco tem prioridade
    if (imageUrl) return imageUrl;
    // 2) Cache local evita buscar de novo a cada visita
    try {
      const cached = localStorage.getItem(cacheKey(name));
      if (cached) return cached;
    } catch {}
    return "";
  });
  const tried = useRef({ wiki: false, itunes: false });

  const saveCache = (url: string) => {
    try {
      localStorage.setItem(cacheKey(name), url);
    } catch {}
  };

  // Fonte 2: Wikipedia (API pública, sem chave)
  const loadWiki = () => {
    tried.current.wiki = true;
    const title = name.trim().replace(/ /g, "_");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
      .then((d) => {
        const thumb = d?.thumbnail?.source;
        if (thumb) {
          setSrc(thumb);
          saveCache(thumb);
        } else {
          loadItunes();
        }
      })
      .catch(() => loadItunes());
  };

  // Fonte 3: iTunes / Apple Music (foto maior para avatares grandes)
  const loadItunes = () => {
    tried.current.itunes = true;
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=1`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
      .then((d) => {
        const art = d?.results?.[0]?.artworkUrl100;
        if (art) {
          const big = art.replace(/100x100bb\.(jpg|png)$/, `${itunesSize(size)}.$1`);
          setSrc(big);
          saveCache(big);
        } else {
          setSrc(initialsUrl(name));
        }
      })
      .catch(() => setSrc(initialsUrl(name)));
  };

  // Sem image_url nem cache: busca na Wikipedia no primeiro render
  useEffect(() => {
    if (!src && !imageUrl && !tried.current.wiki) loadWiki();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleError = () => {
    if (src === imageUrl && imageUrl) {
      loadWiki();
    } else if (!tried.current.wiki) {
      loadWiki();
    } else if (!tried.current.itunes) {
      loadItunes();
    } else if (src !== initialsUrl(name)) {
      setSrc(initialsUrl(name));
    } else {
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
