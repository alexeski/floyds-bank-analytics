/**
 * The data contract for the Overview page. The page's UI is built entirely
 * against these types, so whatever fills them (placeholder or live data) the
 * page renders the same way. Don't change this file; implement
 * getOverviewData() in ./data.ts instead.
 */

export const REGIONS = ["East", "Midwest", "South", "Southwest", "West"] as const;
export type Region = (typeof REGIONS)[number];

export function isRegion(value: string | undefined): value is Region {
  return (REGIONS as readonly string[]).includes(value ?? "");
}

export type MonthPoint = {
  /** Month start, epoch milliseconds (UTC). */
  month: number;
  /** Total checking balances that month. */
  checking: number;
  /** Total savings balances that month. */
  savings: number;
  /** Total credit card balances that month (all card types). */
  cards: number;
};

/** One signal in the Overview's Signals list: a notable movement, worked out from the figures below. */
export type Signal = {
  /** The spec ID it implements, SIG-01 to SIG-04 (see SIGNAL_SPECS in ./spec.ts). */
  id: string;
  tone: "good" | "warning" | "critical";
  /** One line with the figure in it, e.g. "Savings balances up 10.0% in 12 months". */
  title: string;
  /** One sentence of context. */
  detail: string;
  /** The line of business it belongs to, shown on the right. */
  area: string;
  /** A question Scout can answer from the Banking model to explain it ("Ask Scout why"). */
  question: string;
};

export type OverviewData = {
  /** "placeholder" shows the design spec in place of the widgets; "live" lights it up. */
  source: "placeholder" | "live";
  /** The region the figures are filtered to, or null for all regions. */
  region: Region | null;
  /** Latest statement month in the data, epoch milliseconds. */
  asOf: number;
  /** One point per month, oldest first (the page shows up to the last 12). */
  monthly: MonthPoint[];
  /** Current totals for the selected region. */
  totals: {
    customers: number;
    checking: number;
    savings: number;
    mortgage: number;
    ira: number;
    cardAdvantage: number;
    cardPlatinum: number;
    /** Average credit score. */
    creditScore: number;
    /** Total products held, across all customers. */
    products: number;
  };
  /** Every region, never filtered, so the selected one can be highlighted. */
  regions: { region: string; customers: number; checking: number; savings: number }[];
  /** Customers holding each product, most held first. */
  products: { product: string; customers: number }[];
  /** Customers and total savings per age group, youngest first. */
  ageGroups: { group: string; customers: number; savings: number }[];
  /** Customers per credit rating, lowest rating first. */
  creditRatings: { rating: string; customers: number }[];
  /** The Signals list, in SIG order; computed from the fields above, so no extra queries. Empty until connected. */
  signals: Signal[];
};
