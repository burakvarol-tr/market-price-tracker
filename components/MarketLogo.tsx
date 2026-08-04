type Props = {
  market: string;
  compact?: boolean;
};

function A101Logo({ compact }: { compact: boolean }) {
  return (
    <span className={`inline-flex items-center overflow-hidden rounded-md border border-white/15 shadow-sm ${compact ? "h-7 w-11" : "h-8 w-14"}`}>
      <span className="flex h-full w-[42%] items-center justify-center bg-white text-[9px] font-black text-[#00AEEF]">A</span>
      <span className="flex h-full flex-1 items-center justify-center bg-[#00AEEF] text-[9px] font-black text-white">101</span>
    </span>
  );
}

function SokLogo({ compact }: { compact: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md border border-yellow-300 bg-[#FFD500] px-2 font-black text-[#E31E24] shadow-sm ${compact ? "h-7 text-[10px]" : "h-8 text-xs"}`}>
      ŞOK
    </span>
  );
}

function BizimLogo({ compact }: { compact: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md border border-orange-300 bg-[#F58220] px-2 font-black text-white shadow-sm ${compact ? "h-7 text-[10px]" : "h-8 text-xs"}`}>
      BİZİM
    </span>
  );
}

function CarrefourLogo({ compact }: { compact: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 font-black text-[#1D4ED8] shadow-sm ${compact ? "h-7 text-[8px]" : "h-8 text-[10px]"}`}>
      <svg viewBox="0 0 40 32" className={compact ? "h-4 w-5" : "h-5 w-6"} aria-hidden="true">
        <path d="M19 3 7 8 2 16l5 8 12 5-5-9h8l-5-4 5-4h-8z" fill="#E31E24" />
        <path d="m21 3 12 5 5 8-5 8-12 5 5-9h-8l5-4-5-4h8z" fill="#1D4ED8" />
      </svg>
      CARREFOUR
    </span>
  );
}

export default function MarketLogo({ market, compact = false }: Props) {
  if (market === "A101") return <A101Logo compact={compact} />;
  if (market === "SOK") return <SokLogo compact={compact} />;
  if (market === "BIZIM") return <BizimLogo compact={compact} />;
  if (market === "CARREFOUR") return <CarrefourLogo compact={compact} />;

  return (
    <span className={`inline-flex items-center justify-center rounded-md border border-white/10 bg-slate-700 px-2 font-black text-white ${compact ? "h-7 text-[9px]" : "h-8 text-xs"}`}>
      {market}
    </span>
  );
}
