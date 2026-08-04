"use client";

import { useState } from "react";

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
  imageClassName = "h-[96%] w-[96%] object-contain",
  placeholderText = "Görsel yok",
}: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white p-0.5 ${className}`}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={imageClassName}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 px-2 text-center text-[10px] font-semibold leading-4 text-slate-500">
          {placeholderText}
        </div>
      )}
    </div>
  );
}
