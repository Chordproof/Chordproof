"use client";
import { useState, useEffect } from "react";

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

  // Busca a foto real do artista na Wikipedia (API pública, sem chave)
  const loadWiki = () => {
    const wikiTitle = name.trim().replace(/ /g, "_");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((d) => {
        const thumb = d?.thumbnail?.source;
        setSrc(thumb || initialsUrl(name));
      })
      .catch(() => setSrc(initialsUrl(name)));
  };

  // Sem image_url no banco: já busca na Wikipedia no primeiro render
  useEffect(() => {
    if (!imageUrl) loadWiki();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleError = () => {
    if (src && src !== initialsUrl(name)) {
      // Imagem atual falhou: se era a do banco, tenta Wikipedia; senão, vai para as iniciais
      if (src === imageUrl) {
        loadWiki();
      } else {
        setSrc(initialsUrl(name));
      }
    } else {
      // Até as iniciais falharam: mostra a letra pura
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
