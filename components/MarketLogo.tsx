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
      <span className={`inline-flex items-center justify-center rounded-md border border-white/10 bg-slate-700 px-2 font-black text-white ${compact ? "h-7 text-[9px]" : "h-8 text-xs"}`}>
        {market}
      </span>
    );
  }

  return (
    <span
      title={market}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white shadow-sm ${
        compact ? "h-7 min-w-12 px-1.5" : "h-9 min-w-16 px-2"
      }`}
    >
      <img
        src={src}
        alt={`${market} logosu`}
        className={`object-contain ${compact ? "h-5 max-w-[68px]" : "h-7 max-w-[96px]"}`}
      />
    </span>
  );
}
