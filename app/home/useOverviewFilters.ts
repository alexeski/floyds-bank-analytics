"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useOptimistic } from "react";
import { useOverviewTransition } from "./OverviewTransition";

export const PERIODS = [
  { value: "3m", label: "3M", months: 3 },
  { value: "6m", label: "6M", months: 6 },
  { value: "12m", label: "12M", months: 12 },
] as const;

/**
 * Reads and writes the Overview filters in the URL (?region=West&period=6m),
 * so they survive a refresh and can be shared. The page re-queries the data
 * on the server whenever they change.
 */
export function useOverviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Shared with the content area, which dims while the new data loads.
  const { isPending, startTransition } = useOverviewTransition();

  // The controls update instantly (optimistically); the data follows once the
  // server has answered for the new URL.
  const [filters, setOptimisticFilters] = useOptimistic({
    region: searchParams.get("region"),
    period: searchParams.get("period") ?? "12m",
  });

  const setParam = useCallback(
    (key: "region" | "period", value: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      const query = next.toString();
      startTransition(() => {
        setOptimisticFilters((current) => ({
          ...current,
          [key]: key === "period" ? (value ?? "12m") : value,
        }));
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams, startTransition, setOptimisticFilters],
  );

  return { region: filters.region, period: filters.period, setParam, isPending };
}
