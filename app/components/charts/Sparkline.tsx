type SparklineProps = {
  values: readonly number[];
  label: string;
  className?: string;
};

const WIDTH = 120;
const HEIGHT = 36;
const PAD = 3;

/** A tiny single-series trend line for KPI tiles. */
export default function Sparkline({ values, label, className }: SparklineProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = PAD + (index / (values.length - 1)) * (WIDTH - PAD * 2);
    const y = PAD + (1 - (value - min) / span) * (HEIGHT - PAD * 2);
    return [x, y] as const;
  });
  const [lastX, lastY] = points[points.length - 1];
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${PAD},${HEIGHT} ${line} ${WIDTH - PAD},${HEIGHT}`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      <polygon points={area} className="fill-brand-500/10" />
      <polyline
        points={line}
        fill="none"
        className="stroke-brand-600"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r={3} className="fill-brand-600 stroke-white" strokeWidth={1.5} />
    </svg>
  );
}
