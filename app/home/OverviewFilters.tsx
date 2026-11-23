"use client";

import { PERIODS, useOverviewFilters } from "./useOverviewFilters";

const REGIONS = ["East", "Midwest", "South", "Southwest", "West"] as const;

/** Region and period filters. Both are real: they change the queries. */
export default function OverviewFilters() {
  const { region, period, setParam, isPending } = useOverviewFilters();

  return (
    <div className="flex flex-wrap items-center gap-3" aria-busy={isPending}>
      <label className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-muted">Region</span>
        <span className="relative">
          <select
            value={region ?? ""}
            onChange={(event) => setParam("region", event.target.value || null)}
            className="appearance-none rounded-md border border-line bg-white py-1.5 pr-8 pl-3 text-sm font-semibold text-ink outline-none transition-colors hover:border-brand-300 focus:border-brand-600 focus:ring-3 focus:ring-brand-500/20"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-2.5 size-3 -translate-y-1/2 text-muted">
            <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </label>

      <div
        role="radiogroup"
        aria-label="Period"
        className="relative grid grid-cols-3 rounded-md border border-line bg-surface p-0.5"
      >
        {/* The white thumb slides to the selected period. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded bg-white shadow-sm ring-1 ring-line transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${Math.max(0, PERIODS.findIndex((p) => p.value === period)) * 100}%)` }}
        />
        {PERIODS.map((p) => {
          const selected = period === p.value;
          return (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setParam("period", p.value === "12m" ? null : p.value)}
              className={`relative z-10 rounded px-3 py-1 text-sm font-semibold transition-colors duration-300 ${
                selected ? "text-brand-900" : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <span
        className={`flex items-center gap-1.5 text-xs font-semibold text-muted transition-opacity ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
        role="status"
      >
        <span className="size-3 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
        Updating…
      </span>
    </div>
  );
}
