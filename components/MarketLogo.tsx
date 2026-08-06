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

export default function MarketLogo({ market, compact = false }: Props) {
  const src = assets[market];

  if (!src) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-700 px-2 font-black text-white ${
          compact
            ? "h-9 w-[92px] text-[9px] sm:h-10 sm:w-[104px]"
            : "h-12 w-28 text-xs sm:h-14 sm:w-32"
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
        compact
          ? "h-9 w-[92px] px-2 sm:h-10 sm:w-[104px] sm:px-2.5"
          : "h-12 w-28 px-2.5 sm:h-14 sm:w-32 sm:px-3"
      }`}
    >
      <img
        src={src}
        alt={`${market} logosu`}
        className={`block object-contain ${
          compact
            ? "h-6 w-[76px] sm:h-7 sm:w-[88px]"
            : "h-8 w-[92px] sm:h-9 sm:w-[104px]"
        }`}
      />
    </span>
  );
}
