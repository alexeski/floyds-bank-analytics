"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Point = { label: string; value: number };

type TrendChartProps = {
  data: readonly Point[];
  /** Text placed before and after each value, e.g. "£" and "bn". */
  prefix?: string;
  suffix?: string;
  /** Distance between y-axis gridlines, in data units. */
  step: number;
  label: string;
};

const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 56 };

/**
 * A single-series line chart with a hover crosshair and tooltip. Sized to its
 * container so text and strokes stay crisp at any width.
 */
export default function TrendChart({
  data,
  prefix = "",
  suffix = "",
  step,
  label,
}: TrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const values = data.map((point) => point.value);
  const yMin = Math.floor(Math.min(...values) / step) * step;
  const yMax = Math.ceil(Math.max(...values) / step) * step;
  const ticks: number[] = [];
  for (let tick = yMin; tick <= yMax; tick += step) ticks.push(tick);

  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (index: number) =>
    MARGIN.left + (index / (data.length - 1)) * plotWidth;
  const y = (value: number) =>
    MARGIN.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;

  const path = data
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`)
    .join(" ");
  const area = `${path} L${x(data.length - 1)},${MARGIN.top + plotHeight} L${x(0)},${MARGIN.top + plotHeight} Z`;

  function format(value: number) {
    return `${prefix}${value.toFixed(1)}${suffix}`;
  }

  function handlePointerMove(event: PointerEvent<SVGRectElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const index = Math.round(ratio * (data.length - 1));
    setActive(Math.min(data.length - 1, Math.max(0, index)));
  }

  const activePoint = active === null ? null : data[active];
  const previous = active !== null && active > 0 ? data[active - 1] : null;
  const change =
    activePoint && previous
      ? ((activePoint.value - previous.value) / previous.value) * 100
      : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={label}
        className="block overflow-visible"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#11b67a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#11b67a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-line"
              strokeDasharray={tick === yMin ? undefined : "3 4"}
            />
            <text
              x={MARGIN.left - 10}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
              className="fill-muted text-[11px] tabular-nums"
            >
              {prefix}
              {tick}
              {suffix}
            </text>
          </g>
        ))}
        {data.map((point, index) => (
          <text
            key={point.label}
            x={x(index)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className={`text-[11px] ${index === active ? "fill-ink font-semibold" : "fill-muted"}`}
          >
            {point.label}
          </text>
        ))}
        <path d={area} fill="url(#trend-fill)" />
        <path
          d={path}
          fill="none"
          className="stroke-brand-700"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {activePoint && active !== null && (
          <>
            <line
              x1={x(active)}
              x2={x(active)}
              y1={MARGIN.top}
              y2={MARGIN.top + plotHeight}
              className="stroke-brand-900/30"
            />
            <circle
              cx={x(active)}
              cy={y(activePoint.value)}
              r={5}
              className="fill-brand-700 stroke-white"
              strokeWidth={2}
            />
          </>
        )}
        {active === null && (
          <circle
            cx={x(data.length - 1)}
            cy={y(data[data.length - 1].value)}
            r={5}
            className="fill-brand-700 stroke-white"
            strokeWidth={2}
          />
        )}
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActive(null)}
        />
      </svg>
      {activePoint && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg shadow-brand-950/10"
          style={{
            left: Math.min(Math.max(x(active), 80), width - 80),
            top: y(activePoint.value) - 12,
          }}
        >
          <p className="font-semibold text-muted">{activePoint.label}</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-ink">
            {format(activePoint.value)}
          </p>
          {change !== null && (
            <p
              className={`font-semibold tabular-nums ${change >= 0 ? "text-gain" : "text-loss"}`}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}% vs prior quarter
            </p>
          )}
        </div>
      )}
    </div>
  );
}
