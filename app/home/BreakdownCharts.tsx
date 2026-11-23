"use client";

import { useState } from "react";
import { count, money } from "@/lib/overview/format";

/** Customers holding each product, as share of the customer base. */
export function ProductBars({
  rows,
  customers,
}: {
  rows: readonly { product: string; customers: number }[];
  customers: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...rows.map((r) => r.customers));
  return (
    <ul className="space-y-2.5">
      {rows.map((row, index) => {
        const share = customers ? (row.customers / customers) * 100 : 0;
        return (
          <li
            key={row.product}
            onPointerEnter={() => setHover(row.product)}
            onPointerLeave={() => setHover(null)}
            className="group"
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-ink">{row.product}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {hover === row.product ? (
                  <span className="font-semibold text-ink">{row.customers.toLocaleString("en-US")} customers</span>
                ) : (
                  <>
                    <span className="font-bold text-ink">{share.toFixed(0)}%</span> · {count(row.customers)}
                  </>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-surface">
              <div
                className="motion-bar-x h-full rounded-full bg-brand-700 transition-colors group-hover:bg-brand-900"
                style={{ width: `${(row.customers / max) * 100}%`, ["--bar-delay" as string]: `${550 + index * 60}ms` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Average savings per customer by age group, as columns. */
export function AgeColumns({
  rows,
}: {
  rows: readonly { group: string; customers: number; savings: number }[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const values = rows.map((r) => (r.customers ? r.savings / r.customers : 0));
  const max = Math.max(...values);
  const peak = values.indexOf(max);

  return (
    <div className="relative">
      <div className="flex h-44 items-end gap-2 border-b border-line pb-px">
        {rows.map((row, i) => {
          const isActive = active === i;
          return (
            <button
              key={row.group}
              type="button"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${row.group}: ${money(values[i])} average savings per customer`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <span
                className={`mb-1 text-[11px] font-bold tabular-nums transition-colors ${
                  i === peak || isActive ? "text-ink" : "text-muted"
                }`}
              >
                {money(values[i])}
              </span>
              <span
                className={`motion-bar-y w-full max-w-10 rounded-t-[4px] ${
                  i === peak ? "bg-brand-700" : "bg-brand-300"
                } ${isActive ? "brightness-90" : ""}`}
                style={{ height: `${(values[i] / max) * 80}%`, ["--bar-delay" as string]: `${600 + i * 70}ms` }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {rows.map((row) => (
          <span key={row.group} className="flex-1 text-center text-[11px] font-medium text-muted">
            {row.group}
          </span>
        ))}
      </div>
      {active !== null && (
        <div className="pointer-events-none absolute -top-2 right-0 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg shadow-brand-950/10">
          <p className="font-bold text-ink">Age {rows[active].group}</p>
          <p className="text-muted">
            {rows[active].customers.toLocaleString("en-US")} customers · {money(rows[active].savings)} saved
          </p>
        </div>
      )}
    </div>
  );
}
