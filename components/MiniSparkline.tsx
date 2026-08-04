type Props = {
  values?: number[];
};

export default function MiniSparkline({ values = [] }: Props) {
  const points = values.filter((value) => Number.isFinite(value)).slice(-8);

  if (points.length < 2) {
    return <span className="text-[10px] text-slate-700">—</span>;
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
  const rising = points[points.length - 1] >= points[0];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-[82px] overflow-visible" role="img" aria-label="Son fiyat trendi">
      <polyline
        points={coordinates.join(" ")}
        fill="none"
        stroke={rising ? "#34d399" : "#fb7185"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coordinates[coordinates.length - 1].split(",")[0]}
        cy={coordinates[coordinates.length - 1].split(",")[1]}
        r="2.4"
        fill={rising ? "#6ee7b7" : "#fda4af"}
      />
    </svg>
  );
}
