type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "info" | "negative";
};

const tones = {
  default: "text-white",
  positive: "text-emerald-300",
  warning: "text-amber-300",
  info: "text-blue-300",
  negative: "text-rose-300",
};

export default function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: Props) {
  return (
    <div className="rounded-[16px] border border-white/[0.085] bg-white/[0.035] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-[26px] font-semibold tracking-[-0.04em] ${tones[tone]}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}
