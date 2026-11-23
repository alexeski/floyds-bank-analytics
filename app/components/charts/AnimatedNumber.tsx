"use client";

import { useLayoutEffect, useRef } from "react";
import { formatNumber as format, type NumberFormat } from "@/lib/overview/format";

export type { NumberFormat };

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * A number that counts up when it first appears, and rolls from its old value
 * to the new one (with a brief highlight) when the data changes. Digits are
 * written straight to the DOM each frame, so React doesn't re-render 60 times
 * a second. Reduced-motion users see the final value immediately.
 */
export default function AnimatedNumber({
  value,
  format: kind,
  className = "",
}: {
  value: number;
  format: NumberFormat;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const first = shown.current === null;
    const from = shown.current ?? 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || from === value || !Number.isFinite(value) || !Number.isFinite(from)) {
      element.textContent = format(value, kind);
      shown.current = value;
      return;
    }

    if (!first) {
      // Restart the highlight on every change.
      element.classList.remove("motion-value-flash");
      void element.offsetWidth;
      element.classList.add("motion-value-flash");
    }

    // Paint the starting value before the browser shows the new one.
    element.textContent = format(from, kind);
    const duration = first ? 950 : 700;
    const start = performance.now();
    let frame = 0;
    let done = false;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const current = from + (value - from) * easeOutCubic(t);
      element.textContent = format(current, kind);
      shown.current = t < 1 ? current : value;
      if (t < 1) frame = requestAnimationFrame(tick);
      else done = true;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      // Interrupted mid-roll: the next roll starts from the digits on screen.
      // Only a first count-up cut short (React re-running effects in
      // development) starts over as a first appearance.
      if (first && !done) shown.current = null;
    };
  }, [value, kind]);

  return (
    <span ref={ref} className={`-mx-1 rounded-md px-1 tabular-nums ${className}`}>
      {format(value, kind)}
    </span>
  );
}
