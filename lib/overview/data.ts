import "server-only";

import { connection } from "next/server";
import { placeholderOverview } from "./placeholder";
import type { OverviewData, Region } from "./types";

export { REGIONS, isRegion } from "./types";
export type { MonthPoint, OverviewData, Region } from "./types";

/**
 * Returns the Overview page's figures for a region (null means all regions).
 *
 * Not connected yet: this returns placeholder shapes, so the page renders as
 * a greyed-out preview. Lab prompt 2 replaces this function body with live
 * queries against the "Banking" model; the page lights up as soon as it
 * returns data with source: "live". The OverviewData contract in ./types.ts
 * stays the same.
 */
export async function getOverviewData(region: Region | null): Promise<OverviewData> {
  // Request-time data: keeps this out of the prerendered static shell.
  await connection();
  return placeholderOverview(region);
}
