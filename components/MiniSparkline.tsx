type Props = {
  values?: number[];
};

export default function MiniSparkline({ values = [] }: Props) {
  const points = values.filter((value) => Number.isFinite(value)).slice(-8);

  if (points.length === 0) {
    return <span className="text-[9px] font-medium text-slate-600">Geçmiş yok</span>;
  }

  if (points.length === 1) {
    return <span className="text-[9px] font-medium text-blue-300/70">Yeni kayıt</span>;
  }

  const width = 82;
  const height = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coordinates = points.map((value, index) => {
    const x = (index / Math.max(1, points.length - 1)) * width;
    const y = height - 3 - ((value - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = points[0];
  const last = points[points.length - 1];
  const rising = last > first;
  const falling = last < first;
  const stroke = rising ? "#34d399" : falling ? "#fb7185" : "#60a5fa";
  const dot = rising ? "#6ee7b7" : falling ? "#fda4af" : "#93c5fd";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-[82px] overflow-visible" role="img" aria-label="Son fiyat trendi">
      <polyline
        points={coordinates.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coordinates[coordinates.length - 1].split(",")[0]}
        cy={coordinates[coordinates.length - 1].split(",")[1]}
        r="2.4"
        fill={dot}
      />
    </svg>
  );
}
