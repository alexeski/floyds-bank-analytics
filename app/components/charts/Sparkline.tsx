"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatNumber, type NumberFormat } from "@/lib/overview/format";

type SparklineProps = {
  values: readonly number[];
  label: string;
  /** Size classes for the sparkline, e.g. "h-12 w-28". */
  className?: string;
  /** Line color; the area under it uses the same color, faded. */
  color?: string;
  /** One label per value (e.g. months). With them, hovering shows the data. */
  labels?: readonly string[];
  /** How values are shown in the tooltip. */
  format?: NumberFormat;
  /**
   * Whether the sparkline takes keyboard focus. Turn off when it sits inside
   * a link or button, which shouldn't contain another focus stop.
   */
  focusable?: boolean;
};

const WIDTH = 120;
const HEIGHT = 36;
const PAD = 3;

/**
 * A tiny single-series trend line. Given labels, it's interactive: hovering
 * (or the arrow keys, when focused) shows a hairline, the point, and a small
 * tooltip with the label and value.
 */
export default function Sparkline({
  values,
  label,
  className = "",
  color = "#00825f",
  labels,
  format = "money",
  focusable = true,
}: SparklineProps) {
  const [active, setActive] = useState<number | null>(null);
  const n = values.length;
  const interactive = !!labels && labels.length === n && n > 1;

  const gradientId = `spark-${label.replace(/[^a-z0-9]/gi, "").slice(0, 24) || "x"}-${color.slice(1)}`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = PAD + (index / (n - 1)) * (WIDTH - PAD * 2);
    const y = PAD + (1 - (value - min) / span) * (HEIGHT - PAD * 2);
    return [x, y] as const;
  });
  const [lastX, lastY] = points[n - 1];
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${PAD},${HEIGHT} ${line} ${WIDTH - PAD},${HEIGHT}`;

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    // The viewBox is fitted ("meet"), so map through the drawn area.
    const scale = Math.min(box.width / WIDTH, box.height / HEIGHT);
    const offsetX = (box.width - WIDTH * scale) / 2;
    const viewX = (event.clientX - box.left - offsetX) / scale;
    const index = Math.round(((viewX - PAD) / (WIDTH - PAD * 2)) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, index)));
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowLeft" ? -1 : 1;
    setActive((current) => Math.min(n - 1, Math.max(0, (current ?? n - 1) + step)));
  }

  const point = active === null ? null : points[active];
  // Keep the tooltip inside the sparkline's box at either end.
  const anchor = point ? point[0] / WIDTH : 0;
  const tooltipPosition =
    anchor < 0.25 ? "left-0" : anchor > 0.75 ? "right-0" : "-translate-x-1/2";

  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role={label ? "img" : undefined}
        aria-label={label || undefined}
        aria-hidden={label ? undefined : true}
        className={`block h-full w-full overflow-visible ${interactive ? "cursor-crosshair" : ""} ${
          interactive && focusable ? "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50" : ""
        }`}
        tabIndex={interactive && focusable ? 0 : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerLeave={interactive ? () => setActive(null) : undefined}
        onFocus={interactive && focusable ? () => setActive(n - 1) : undefined}
        onBlur={interactive && focusable ? () => setActive(null) : undefined}
        onKeyDown={interactive && focusable ? onKeyDown : undefined}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* A transparent hit area so the whole box responds, not just the line. */}
        {interactive && <rect width={WIDTH} height={HEIGHT} fill="transparent" />}
        <polygon
          key={`a${line}`}
          points={area}
          fill={`url(#${gradientId})`}
          className="motion-fade-late"
          style={{ ["--fade-delay" as string]: "500ms" }}
        />
        {point && (
          <line
            x1={point[0]}
            x2={point[0]}
            y1={0}
            y2={HEIGHT}
            stroke="#161a18"
            strokeOpacity={0.25}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}
        <polyline
          key={`l${line}`}
          pathLength={1}
          className="motion-draw"
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {point ? (
          <circle cx={point[0]} cy={point[1]} r={3.5} fill={color} stroke="white" strokeWidth={1.5} />
        ) : (
          <circle
            key={`c${line}`}
            cx={lastX}
            cy={lastY}
            r={3}
            fill={color}
            stroke="white"
            strokeWidth={1.5}
            className="motion-fade-late"
          />
        )}
      </svg>

      {interactive && active !== null && labels && point && (
        <span
          role="status"
          className={`pointer-events-none absolute bottom-full z-20 mb-1.5 whitespace-nowrap rounded-md border border-line bg-white px-2 py-1 text-[11px] leading-tight shadow-lg shadow-brand-950/10 ${tooltipPosition}`}
          style={tooltipPosition === "-translate-x-1/2" ? { left: `${anchor * 100}%` } : undefined}
        >
          <span className="font-bold tabular-nums text-ink">{formatNumber(values[active], format)}</span>
          <span className="ml-1.5 text-muted">{labels[active]}</span>
        </span>
      )}
    </span>
  );
}
