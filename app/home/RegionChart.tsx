"use client";

import { useState } from "react";
import { SERIES, count, money } from "@/lib/overview/format";
import { useOverviewFilters } from "./useOverviewFilters";

type RegionRow = { region: string; customers: number; checking: number; savings: number };

/**
 * Deposits by region, as stacked checking + savings bars. Clicking a region
 * filters the whole page to it; clicking it again clears the filter.
 */
export default function RegionChart({ rows }: { rows: readonly RegionRow[] }) {
  const { region, setParam } = useOverviewFilters();
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...rows.map((r) => r.checking + r.savings));

  return (
    <div>
      <ul className="space-y-1">
        {rows.map((row, index) => {
          const total = row.checking + row.savings;
          const selected = region === row.region;
          const dimmed = region !== null && !selected;
          return (
            <li key={row.region} className="relative">
              <button
                type="button"
                onClick={() => setParam("region", selected ? null : row.region)}
                onPointerEnter={() => setHover(row.region)}
                onPointerLeave={() => setHover(null)}
                aria-pressed={selected}
                aria-label={`${row.region}: ${money(total)} in deposits. ${selected ? "Clear region filter" : "Filter the page to this region"}`}
                className={`w-full rounded-lg px-2.5 py-2 text-left transition-all ${
                  selected ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-surface"
                } ${dimmed ? "opacity-45 hover:opacity-100" : ""}`}
              >
                <span className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold text-ink">{row.region}</span>
                  <span className="font-bold tabular-nums text-ink">{money(total)}</span>
                </span>
                <span
                  className="motion-bar-x mt-1.5 flex h-2.5 w-full gap-0.5"
                  style={{ ["--bar-delay" as string]: `${400 + index * 70}ms` }}
                  aria-hidden="true"
                >
                  <span
                    className="h-full rounded-l-full transition-[width] duration-700 ease-out"
                    style={{ width: `${(row.checking / max) * 100}%`, background: SERIES.checking }}
                  />
                  <span
                    className="h-full rounded-r-full transition-[width] duration-700 ease-out"
                    style={{ width: `${(row.savings / max) * 100}%`, background: SERIES.savings }}
                  />
                </span>
              </button>
              {hover === row.region && (
                <div className="pointer-events-none absolute top-1/2 right-full z-10 mr-2 w-48 -translate-y-1/2 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg shadow-brand-950/10">
                  <p className="font-bold text-ink">{row.region}</p>
                  <p className="mt-1 flex justify-between text-muted">
                    Customers <span className="font-semibold tabular-nums text-ink">{count(row.customers)}</span>
                  </p>
                  <p className="flex justify-between text-muted">
                    Checking <span className="font-semibold tabular-nums text-ink">{money(row.checking)}</span>
                  </p>
                  <p className="flex justify-between text-muted">
                    Savings <span className="font-semibold tabular-nums text-ink">{money(row.savings)}</span>
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 px-2.5 text-xs text-muted">
        {region ? "Click the region again to clear the filter." : "Click a region to filter the page."}
      </p>
    </div>
  );
}
