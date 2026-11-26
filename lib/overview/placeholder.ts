import type { OverviewData, Region } from "./types";

/**
 * Shape-only data for the Overview page before it is connected to the bank's
 * data. Totals are NaN so every figure shows as "—"; the series and
 * breakdowns only give the page valid shapes while it shows the design spec.
 */

const FIRST_MONTH = Date.UTC(2025, 11, 1);

function monthStart(offset: number): number {
  const date = new Date(FIRST_MONTH);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.getTime();
}

export function placeholderOverview(region: Region | null): OverviewData {
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: monthStart(i),
    checking: 100 + i * 0.1,
    savings: 100 + i * 0.9,
    cards: 100 + Math.sin(i * 1.3) * 2 + i * 0.4,
  }));

  return {
    source: "placeholder",
    region,
    asOf: monthly.at(-1)?.month ?? FIRST_MONTH,
    monthly,
    totals: {
      customers: NaN,
      checking: NaN,
      savings: NaN,
      mortgage: NaN,
      ira: NaN,
      cardAdvantage: NaN,
      cardPlatinum: NaN,
      creditScore: NaN,
      products: NaN,
    },
    regions: [
      { region: "East", customers: 5, checking: 5, savings: 6 },
      { region: "South", customers: 5, checking: 4.5, savings: 4.5 },
      { region: "Midwest", customers: 4, checking: 4, savings: 4.2 },
      { region: "West", customers: 4, checking: 3.5, savings: 4 },
      { region: "Southwest", customers: 3, checking: 2.8, savings: 3 },
    ],
    products: [
      { product: "Savings", customers: 6 },
      { product: "Checking", customers: 5.4 },
      { product: "Mortgage Loan", customers: 2.8 },
      { product: "IRA", customers: 2.5 },
      { product: "Credit Card (Advantage)", customers: 1.9 },
      { product: "Credit Card (Platinum)", customers: 0.8 },
    ],
    ageGroups: [
      { group: "18-24", customers: 1, savings: 3 },
      { group: "25-34", customers: 1, savings: 4 },
      { group: "35-44", customers: 1, savings: 5 },
      { group: "45-54", customers: 1, savings: 6 },
      { group: "55-64", customers: 1, savings: 6.5 },
      { group: "65+", customers: 1, savings: 7 },
    ],
    creditRatings: [
      { rating: "very poor", customers: 6 },
      { rating: "fair", customers: 35 },
      { rating: "good", customers: 37 },
      { rating: "very good", customers: 18 },
      { rating: "exceptional", customers: 4 },
    ],
    signals: [],
  };
}
