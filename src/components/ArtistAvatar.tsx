"use client";
import { useState, useEffect, useRef } from "react";

interface ArtistAvatarProps {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  /**
   * Grupo a que o artista pertence (a letra da inicial). Passar isso casa a
   * cor do fallback com o restante do site; sem isso a inicial ganha um tom
   * derivado do nome, que é estável mas não é da paleta.
   */
  hue?: number;
}

const sizeClasses = {
  xs: "w-10 h-10 text-sm",
  sm: "w-14 h-14 text-lg",
  md: "w-20 h-20 text-2xl",
  lg: "w-32 h-32 md:w-40 md:h-40 text-4xl md:text-5xl",
};

const itunesSize = (size: "xs" | "sm" | "md" | "lg") =>
  size === "lg" ? "1000x1000bb" : size === "md" ? "600x600bb" : "300x300bb";

const cacheKey = (name: string) => `cp-avatar-${name.toLowerCase()}`;

/**
 * Cor determinística a partir do nome. Serve só para o fallback de inicial:
 * a mesma banda tem sempre o mesmo tom, e bandas próximas na lista não
 * repetem o mesmo círculo verde.
 */
function hueFor(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export default function ArtistAvatar({
  name,
  imageUrl,
  size = "sm",
  hue,
}: ArtistAvatarProps) {
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
  const [failed, setFailed] = useState(false);
  const tried = useRef({ wiki: false, itunes: false });

  const saveCache = (url: string) => {
    try {
      localStorage.setItem(cacheKey(name), url);
    } catch {}
  };

  const loadWiki = () => {
    tried.current.wiki = true;
    const title = name.trim().replace(/ /g, "_");
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
      .then((d) => {
        const thumb: string | undefined = d?.thumbnail?.source;
        if (thumb) {
          setSrc(thumb);
          saveCache(thumb);
        } else {
          loadItunes();
        }
      })
      .catch(() => loadItunes());
  };

  const loadItunes = () => {
    tried.current.itunes = true;
    fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        name
      )}&entity=musicArtist&limit=1`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nf"))))
      .then((d) => {
        const art: string | undefined = d?.results?.[0]?.artworkUrl100;
        if (art) {
          const big = art.replace(/100x100bb\.(jpg|png)$/, `${itunesSize(size)}.$1`);
          setSrc(big);
          saveCache(big);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
  };

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
    } else {
      setFailed(true);
    }
  };

  // Fallback: inicial sobre gradiente da paleta (dourado → verde), nunca um
  // avatar de terceiros genérico. É o mesmo desenho em qualquer tamanho.
  if (failed || !src) {
    const h = hue ?? hueFor(name);
    const initial = name.trim().charAt(0).toUpperCase();
    return (
      <div
        className={`${sizeClasses[size]} relative rounded-full shrink-0 overflow-hidden flex items-center justify-center font-black select-none`}
        style={{
          background: `linear-gradient(135deg, hsl(${h} 55% 42%), hsl(${
            (h + 40) % 360
          } 60% 26%))`,
          color: "rgba(255,255,255,.92)",
        }}
        aria-label={name}
        role="img"
      >
        <span className="relative z-10">{initial}</span>
        {/* argola dourada sutil: amarra o fallback à marca */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px rgba(240,180,41,.35)" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full shrink-0 overflow-hidden bg-[var(--c-overlay-soft)]`}
      style={{ boxShadow: "inset 0 0 0 1px var(--c-hairline)" }}
    >
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );
}
