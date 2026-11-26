import { count, money, percentChange } from "./format";
import type { OverviewData, Signal } from "./types";

/**
 * Works out the Signals list (SIG-01 to SIG-04 in ./spec.ts) from figures the
 * Overview already has, so it needs no extra queries. Pure, so a script can
 * check it.
 */

const MONTHS = 12;

/** "very poor" → "Very Poor". */
function titleCase(text: string): string {
  return text.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

/** 10.04 → "10.0", −0.7 → "0.7": the sign is said in words. */
function pct(value: number): string {
  return Math.abs(value).toFixed(1);
}

/** +10.0% / −0.7%, for the comparisons in brackets. */
function signedPct(value: number): string {
  return `${value < 0 ? "−" : "+"}${pct(value)}%`;
}

function upDown(value: number): "up" | "down" {
  return value < 0 ? "down" : "up";
}

/** SIG-01: how much of the customer base sits in the lowest credit rating. */
function creditRisk(data: Omit<OverviewData, "signals">): Signal | null {
  const lowest = data.creditRatings[0];
  if (!lowest || !data.totals.customers) return null;
  const share = (lowest.customers / data.totals.customers) * 100;
  const rating = titleCase(lowest.rating);
  return {
    id: "SIG-01",
    tone: share >= 5 ? "critical" : share >= 2 ? "warning" : "good",
    title: `${count(lowest.customers)} customers rated ${rating}`,
    detail: `${pct(share)}% of the customer base sits in the lowest credit rating.`,
    area: "Credit",
    question: `How many customers have a ${rating} credit rating, by customer region and age group?`,
  };
}

/** First-to-last change of each balance type over the latest 12 months. */
function yearChange(data: Omit<OverviewData, "signals">) {
  const range = data.monthly.slice(-MONTHS);
  const first = range[0];
  const last = range.at(-1);
  if (!first || !last || range.length < 2) return null;
  return {
    checking: percentChange(first.checking, last.checking),
    savings: percentChange(first.savings, last.savings),
    cards: percentChange(first.cards, last.cards),
  };
}

/** SIG-02: is the current account book moving, and is cash shifting to savings? */
function currentAccounts(change: NonNullable<ReturnType<typeof yearChange>>): Signal {
  const { checking, savings } = change;
  const flat = Math.abs(checking) < 2;
  const shifting = savings - checking >= 5;
  return {
    id: "SIG-02",
    tone: checking >= 2 ? "good" : "warning",
    title: flat
      ? "Checking balances flat over 12 months"
      : `Checking balances ${upDown(checking)} ${pct(checking)}% in 12 months`,
    detail:
      `${checking < 0 ? "Down" : "Up"} ${pct(checking)}% while savings ${savings < 0 ? "fell" : "grew"} ${pct(savings)}%.` +
      (shifting ? " Cash is moving into savings." : ""),
    area: "Current accounts",
    question: "How did total checking and savings balances change month by month over the last 12 months?",
  };
}

const BALANCE_TYPES = [
  { key: "savings", name: "Savings", lower: "savings", area: "Savings" },
  { key: "checking", name: "Checking", lower: "checking", area: "Current accounts" },
  { key: "cards", name: "Card", lower: "cards", area: "Cards" },
] as const;

/** SIG-03: which balance type grew fastest over 12 months. */
function fastestGrowing(change: NonNullable<ReturnType<typeof yearChange>>): Signal {
  const ranked = [...BALANCE_TYPES].sort((a, b) => change[b.key] - change[a.key]);
  const [best, ...others] = ranked;
  const growth = change[best.key];
  return {
    id: "SIG-03",
    tone: growth > 0 ? "good" : "warning",
    title: `${best.name} balances ${upDown(growth)} ${pct(growth)}% in 12 months`,
    detail: `The fastest-growing balance type, ahead of ${others
      .map((other) => `${other.lower} (${signedPct(change[other.key])})`)
      .join(" and ")}.`,
    area: best.area,
    question: `Which customer age groups grew their ${best.lower === "cards" ? "card" : best.lower} balances the most over the last 12 months?`,
  };
}

/** SIG-04: where deposits sit; always covers all five regions. */
function depositConcentration(data: Omit<OverviewData, "signals">): Signal | null {
  const byDeposits = data.regions
    .map((row) => ({ region: row.region, deposits: row.checking + row.savings }))
    .sort((a, b) => b.deposits - a.deposits);
  const top = byDeposits[0];
  const smallest = byDeposits.at(-1);
  if (!top || !smallest || top === smallest || !smallest.deposits) return null;
  return {
    id: "SIG-04",
    tone: "good",
    title: `${top.region} holds the most deposits: ${money(top.deposits)}`,
    detail: `${(top.deposits / smallest.deposits).toFixed(1)} times the ${smallest.region} (${money(smallest.deposits)}), the smallest region.`,
    area: "Regions",
    question: "Compare total checking and savings balances by customer region.",
  };
}

/** The Signals list, in SIG order. A signal whose figures are missing is left out. */
export function buildSignals(data: Omit<OverviewData, "signals">): Signal[] {
  const change = yearChange(data);
  return [
    creditRisk(data),
    change ? currentAccounts(change) : null,
    change ? fastestGrowing(change) : null,
    depositConcentration(data),
  ].filter((signal): signal is Signal => signal !== null);
}
