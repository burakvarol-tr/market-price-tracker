type Props = {
  market: string;
  compact?: boolean;
};

const styles: Record<string, string> = {
  A101: "bg-[#00AEEF] text-white",
  SOK: "bg-[#FFD500] text-[#D71920]",
  BIZIM: "bg-[#F58220] text-white",
  CARREFOUR: "bg-white text-[#1D4ED8]",
  BIM: "bg-[#E31E24] text-white",
  FILE: "bg-[#6D28D9] text-white",
  WALMART: "bg-[#0071CE] text-white",
};

const labels: Record<string, string> = {
  SOK: "ŞOK",
  BIZIM: "BİZİM",
};

export default function MarketLogo({ market, compact = false }: Props) {
  return (
    <span
      title={market}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 font-black tracking-[-0.04em] shadow-sm ${
        compact ? "h-7 min-w-9 px-2 text-[10px]" : "h-9 min-w-12 px-3 text-xs"
      } ${styles[market] ?? "bg-slate-700 text-white"}`}
    >
      {labels[market] ?? market}
    </span>
  );
}
