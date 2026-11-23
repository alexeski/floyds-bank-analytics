"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { money } from "@/lib/overview/format";

export type GrowthSeries = {
  key: string;
  label: string;
  color: string;
  values: readonly number[];
};

type GrowthChartProps = {
  labels: readonly string[];
  series: readonly GrowthSeries[];
  ariaLabel: string;
};

const HEIGHT = 280;
const MARGIN = { top: 18, right: 92, bottom: 30, left: 44 };

/**
 * Multi-series growth chart. Each series is indexed to 100 at the first month
 * shown, so measures of very different size share one axis honestly. Lines
 * are labelled at their ends (identity is never color alone), and hovering
 * shows every series' index and actual value for that month.
 */
export default function GrowthChart({ labels, series, ariaLabel }: GrowthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const indexed = series.map((s) => ({
    ...s,
    index: s.values.map((v) => (s.values[0] ? (v / s.values[0]) * 100 : 100)),
  }));
  const all = indexed.flatMap((s) => s.index);
  const step = niceStep(Math.max(...all) - Math.min(...all, 100));
  const yMin = Math.floor(Math.min(...all, 100) / step) * step;
  const yMax = Math.ceil(Math.max(...all, 100) / step) * step || yMin + step;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax + 1e-9; t += step) ticks.push(Number(t.toFixed(6)));

  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const n = labels.length;
  const x = (i: number) => MARGIN.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => MARGIN.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  // Keep end labels from overlapping: nudge them apart vertically.
  const ends = indexed
    .map((s) => ({ key: s.key, y: y(s.index[n - 1]) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i += 1) {
    if (ends[i].y - ends[i - 1].y < 16) ends[i].y = ends[i - 1].y + 16;
  }
  const endY = new Map(ends.map((e) => [e.key, e.y]));

  function onMove(event: PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setActive(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  }

  // Show as many month labels as fit (about 52px each), always including the last.
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 52))));

  return (
    <div ref={containerRef} className="relative w-full min-w-0 overflow-x-clip">
      <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel} className="block">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 100 ? "#8a948f" : "var(--color-line)"}
              strokeDasharray={t === 100 ? "4 4" : undefined}
            />
            <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
              {t}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text
              key={`${l}-${i}`}
              x={x(i)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className={`text-[11px] ${i === active ? "fill-ink font-semibold" : "fill-muted"}`}
            >
              {l}
            </text>
          ) : null,
        )}

        {indexed.map((s, seriesIndex) => (
          // Keyed by the data, so the line redraws whenever a filter changes it.
          <g key={`${s.key}:${s.values.join(",")}:${width}`}>
            <path
              pathLength={1}
              className="motion-draw"
              style={{ ["--draw-delay" as string]: `${seriesIndex * 140}ms` }}
              d={s.index.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={x(n - 1)}
              cy={y(s.index[n - 1])}
              r={4}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
              className="motion-fade-late"
              style={{ ["--fade-delay" as string]: `${900 + seriesIndex * 140}ms` }}
            />
            <text
              className="motion-fade-late fill-ink text-[12px] font-semibold"
              style={{ ["--fade-delay" as string]: `${900 + seriesIndex * 140}ms` }}
              x={x(n - 1) + 10}
              y={endY.get(s.key)}
              dy="0.32em"
            >
              {s.label}
            </text>
          </g>
        ))}

        {active !== null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + plotH} stroke="#161a18" strokeOpacity={0.25} />
            {indexed.map((s) => (
              <circle key={s.key} cx={x(active)} cy={y(s.index[active])} r={4.5} fill={s.color} stroke="white" strokeWidth={2} />
            ))}
          </g>
        )}

        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        />
      </svg>

      {active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-2 z-10 min-w-52 rounded-lg border border-line bg-white px-3 py-2.5 text-xs shadow-lg shadow-brand-950/10"
          style={{
            left: x(active) > width / 2 ? x(active) - 220 : x(active) + 14,
          }}
        >
          <p className="font-bold text-ink">{labels[active]}</p>
          <ul className="mt-1.5 space-y-1">
            {indexed.map((s) => (
              <li key={s.key} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 text-muted">{s.label}</span>
                <span className="font-semibold tabular-nums text-ink">{money(s.values[active])}</span>
                <span className="w-12 text-right tabular-nums text-muted">
                  {s.index[active] >= 100 ? "+" : "−"}
                  {Math.abs(s.index[active] - 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function niceStep(range: number): number {
  const raw = Math.max(range, 1) / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10;
  return nice * power;
}
