import "server-only";

import { connection } from "next/server";
import { restClient } from "@/lib/thoughtspot/liveboards";
import { findModelIdByName } from "@/lib/thoughtspot/models";
import { buildSignals } from "./signals";
import type { MonthPoint, OverviewData, Region } from "./types";

/**
 * Live data for the Overview page, queried from the "Banking" model with the
 * REST searchData API. Every query is a ThoughtSpot search string, so the
 * same questions can later be answered by a Liveboard or by Scout.
 */

const MODEL_NAME = "Banking";
const CACHE_TTL_MS = 5 * 60_000;

export { REGIONS, isRegion } from "./types";
export type { MonthPoint, OverviewData, Region } from "./types";

type Row = (string | number | null)[];

const cache = new Map<string, { at: number; data: OverviewData }>();
let modelIdPromise: Promise<string> | undefined;

async function modelId(): Promise<string> {
  modelIdPromise ??= findModelIdByName(MODEL_NAME).then((id) => {
    if (!id) throw new Error(`No data model named "${MODEL_NAME}" is shared with the lab user`);
    return id;
  });
  return modelIdPromise.catch((error) => {
    modelIdPromise = undefined;
    throw error;
  });
}

function num(value: Row[number]): number {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

/** "a) 18-24" → "18-24": the model prefixes sort keys to some labels. */
function label(value: Row[number]): string {
  return String(value ?? "").replace(/^[a-z]\)\s*/, "");
}

export async function getOverviewData(region: Region | null): Promise<OverviewData> {
  // Runtime data (a user token): never prerendered, and Date.now() is safe after this.
  await connection();

  const key = region ?? "all";
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const [api, id] = await Promise.all([restClient(), modelId()]);
  const filter = region ? ` [Customer Region] = '${region}'` : "";

  async function search(query: string, rows = 100): Promise<Row[]> {
    const response = await api.searchData({
      logical_table_identifier: id,
      query_string: query,
      data_format: "COMPACT",
      record_size: rows,
    });
    return (response.contents?.[0]?.data_rows ?? []) as Row[];
  }

  const [monthly, totals, regions, products, ageGroups, creditRatings] = await Promise.all([
    search(
      `sum [Monthly Checking Balance] sum [Monthly Savings Balance] sum [Monthly Credit Card (Advantage) Balance] sum [Monthly Credit Card (Platinum) Balance] [Statement Date].monthly sort by [Statement Date]${filter}`,
    ),
    search(
      `[Number of Customers] sum [Current Checking Balance] sum [Current Savings Balance] sum [Current Mortgage Loan Balance (Monthly)] sum [Current IRA Balance] sum [Current Credit Card (Advantage) Balance] sum [Current Credit Card (Platinum) Balance] average [Customer Credit Score] sum [Number of Products]${filter}`,
      1,
    ),
    search(
      "[Customer Region] [Number of Customers] sum [Current Checking Balance] sum [Current Savings Balance]",
    ),
    search(`[Product] [Number of Customers] sort by [Number of Customers] descending${filter}`),
    search(`[Customer Age Group] [Number of Customers] sum [Current Savings Balance] sort by [Customer Age Group]${filter}`),
    search(`[Customer Credit Rating] [Number of Customers] sort by [Customer Credit Rating]${filter}`),
  ]);

  const months: MonthPoint[] = monthly
    .map((row) => ({
      month: num(row[0]) * 1000,
      checking: num(row[1]),
      savings: num(row[2]),
      cards: num(row[3]) + num(row[4]),
    }))
    .sort((a, b) => a.month - b.month);

  const [t = []] = totals;
  const figures: Omit<OverviewData, "signals"> = {
    source: "live",
    region,
    asOf: months.at(-1)?.month ?? 0,
    monthly: months,
    totals: {
      customers: num(t[0]),
      checking: num(t[1]),
      savings: num(t[2]),
      mortgage: num(t[3]),
      ira: num(t[4]),
      cardAdvantage: num(t[5]),
      cardPlatinum: num(t[6]),
      creditScore: num(t[7]),
      products: num(t[8]),
    },
    regions: regions
      .map((row) => ({
        region: String(row[0]),
        customers: num(row[1]),
        checking: num(row[2]),
        savings: num(row[3]),
      }))
      .sort((a, b) => b.checking + b.savings - (a.checking + a.savings)),
    products: products.map((row) => ({ product: String(row[0]), customers: num(row[1]) })),
    ageGroups: ageGroups.map((row) => ({
      group: label(row[0]),
      customers: num(row[1]),
      savings: num(row[2]),
    })),
    creditRatings: creditRatings.map((row) => ({
      rating: label(row[0]),
      customers: num(row[1]),
    })),
  };
  // Signals are worked out from the figures above: no extra queries.
  const data: OverviewData = { ...figures, signals: buildSignals(figures) };

  cache.set(key, { at: Date.now(), data });
  return data;
}
