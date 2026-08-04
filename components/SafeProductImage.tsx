"use client";

import { useEffect, useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  placeholderText?: string;
};

export default function SafeProductImage({
  src,
  alt,
  className = "h-16 w-16 rounded-2xl",
  imageClassName = "h-full w-full scale-[1.12] object-contain transition-transform duration-300 group-hover:scale-[1.18]",
  placeholderText = "Görsel yok",
}: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`group flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white p-0 ${className}`}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={imageClassName}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 px-1.5 text-center text-[9px] font-semibold leading-3 text-slate-500">
          {placeholderText}
        </div>
      )}
    </div>
  );
}
