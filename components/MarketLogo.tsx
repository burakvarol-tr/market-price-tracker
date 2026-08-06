type Props = {
  market: string;
  compact?: boolean;
};

const assets: Record<string, string> = {
  A101: "/markets/a101.svg",
  SOK: "/markets/sok.svg",
  BIZIM: "/markets/bizim.svg",
  CARREFOUR: "/markets/carrefour.svg",
};

const compactImageSize: Record<string, string> = {
  A101: "h-auto w-[72px]",
  BIZIM: "h-auto w-[58px]",
  CARREFOUR: "h-auto w-[70px]",
  SOK: "h-auto w-[48px]",
};

const regularImageSize: Record<string, string> = {
  A101: "h-auto w-[88px]",
  BIZIM: "h-auto w-[72px]",
  CARREFOUR: "h-auto w-[86px]",
  SOK: "h-auto w-[60px]",
};

export default function MarketLogo({ market, compact = false }: Props) {
  const src = assets[market];

  if (!src) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-700 px-2 font-black text-white ${
          compact ? "h-9 w-[92px] text-[9px]" : "h-12 w-28 text-xs"
        }`}
      >
        {market}
      </span>
    );
  }

  return (
    <span
      title={market}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white shadow-sm ${
        compact ? "h-9 w-[92px] px-2" : "h-12 w-28 px-2.5"
      }`}
    >
      <img
        src={src}
        alt={`${market} logosu`}
        className={`max-h-full max-w-full object-contain ${
          compact
            ? compactImageSize[market] ?? "h-auto w-[68px]"
            : regularImageSize[market] ?? "h-auto w-[84px]"
        }`}
      />
    </span>
  );
}
