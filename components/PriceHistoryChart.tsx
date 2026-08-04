type Point = {
  date: string;
  price: number;
};

type Props = {
  points: Point[];
};

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
}

export default function PriceHistoryChart({ points }: Props) {
  if (!points.length) {
    return <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-slate-400">Grafik için yeterli fiyat kaydı yok.</div>;
  }

  const width = 900;
  const height = 260;
  const left = 64;
  const right = 24;
  const top = 18;
  const bottom = 46;
  const values = points.map((item) => item.price);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.15, 1);
  const min = Math.max(0, rawMin - padding);
  const max = rawMax + padding;
  const range = max - min || 1;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const coords = points.map((item, index) => ({
    ...item,
    x: left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth),
    y: top + chartHeight - ((item.price - min) / range) * chartHeight,
  }));

  const yTicks = Array.from({ length: 5 }, (_, index) => max - (index / 4) * range);
  const xIndexes = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]));

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] min-w-[720px] w-full" role="img" aria-label="Tarih ve fiyat eksenli fiyat geçmişi grafiği">
        {yTicks.map((tick, index) => {
          const y = top + (index / 4) * chartHeight;
          return (
            <g key={tick}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="rgba(148,163,184,0.15)" />
              <text x={left - 10} y={y + 4} textAnchor="end" fill="rgba(148,163,184,0.9)" fontSize="12">{tick.toFixed(2)} TL</text>
            </g>
          );
        })}

        {xIndexes.map((index) => (
          <text key={index} x={coords[index].x} y={height - 14} textAnchor="middle" fill="rgba(148,163,184,0.9)" fontSize="12">{shortDate(coords[index].date)}</text>
        ))}

        <polyline points={coords.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {coords.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <circle cx={point.x} cy={point.y} r="5" fill="#93C5FD">
              <title>{new Date(point.date).toLocaleString("tr-TR")} · {point.price.toFixed(2)} TL</title>
            </circle>
            <text x={point.x} y={point.y - 10} textAnchor="middle" fill="#E2E8F0" fontSize="10">{point.price.toFixed(2)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
