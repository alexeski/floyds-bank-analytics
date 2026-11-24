/**
 * Sample figures shown on the overview and landing pages. They are
 * illustrative only; the lab's real numbers come from ThoughtSpot.
 */

export const REPORTING_PERIOD = "Q3 2026";
export const DATA_AS_OF = "30 Sep 2026";

export const QUARTERS = [
  "Q4 24",
  "Q1 25",
  "Q2 25",
  "Q3 25",
  "Q4 25",
  "Q1 26",
  "Q2 26",
  "Q3 26",
] as const;

export const DEPOSIT_TREND = [
  438.2, 442.9, 447.1, 451.6, 455.0, 459.8, 466.4, 472.9,
] as const;

export type Kpi = {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down";
  /** Whether the change is good news for the bank. */
  favourable: boolean;
  trend: readonly number[];
};

export const HEADLINE_KPIS: readonly Kpi[] = [
  {
    label: "Customer deposits",
    value: "£472.9bn",
    change: "+1.4% QoQ",
    direction: "up",
    favourable: true,
    trend: DEPOSIT_TREND,
  },
  {
    label: "Active customers",
    value: "26.1M",
    change: "+0.6% QoQ",
    direction: "up",
    favourable: true,
    trend: [25.2, 25.3, 25.5, 25.6, 25.7, 25.8, 25.9, 26.1],
  },
  {
    label: "Net interest margin",
    value: "2.98%",
    change: "+4 bps QoQ",
    direction: "up",
    favourable: true,
    trend: [3.11, 3.05, 2.98, 2.95, 2.93, 2.92, 2.94, 2.98],
  },
  {
    label: "Digital adoption",
    value: "81.4%",
    change: "+1.9 pts QoQ",
    direction: "up",
    favourable: true,
    trend: [72.1, 73.6, 74.8, 76.0, 77.2, 78.5, 79.5, 81.4],
  },
];

export const DEPOSIT_MIX = [
  { label: "Savings & ISAs", value: 198.4 },
  { label: "Current accounts", value: 142.1 },
  { label: "Business deposits", value: 96.8 },
  { label: "Wealth cash", value: 35.6 },
] as const;

export type BusinessLine = {
  key: "current" | "savings" | "cards" | "lending" | "business" | "wealth";
  name: string;
  description: string;
  metric: string;
  metricLabel: string;
  change: string;
  favourable: boolean;
};

export const BUSINESS_LINES: readonly BusinessLine[] = [
  {
    key: "current",
    name: "Current accounts",
    description: "Account growth, primacy, salary switching, and fee income.",
    metric: "14.8M",
    metricLabel: "Active accounts",
    change: "+0.9%",
    favourable: true,
  },
  {
    key: "savings",
    name: "Savings & ISAs",
    description: "Balances, rate sensitivity, fixed-term maturities, and attrition.",
    metric: "£198.4bn",
    metricLabel: "Savings balances",
    change: "+2.1%",
    favourable: true,
  },
  {
    key: "cards",
    name: "Credit cards",
    description: "Spend by category, revolve rates, rewards, and arrears.",
    metric: "£11.6bn",
    metricLabel: "Quarterly card spend",
    change: "+3.8%",
    favourable: true,
  },
  {
    key: "lending",
    name: "Mortgages & lending",
    description: "Gross lending, pipeline, remortgage retention, and loan book quality.",
    metric: "£6.9bn",
    metricLabel: "Gross new lending",
    change: "−2.4%",
    favourable: false,
  },
  {
    key: "business",
    name: "Small business",
    description: "Business current accounts, card acquiring, and overdraft usage.",
    metric: "1.04M",
    metricLabel: "Business clients",
    change: "+1.1%",
    favourable: true,
  },
  {
    key: "wealth",
    name: "Wealth management",
    description: "Assets under management, adviser book, and net flows.",
    metric: "£58.2bn",
    metricLabel: "Assets under management",
    change: "+4.6%",
    favourable: true,
  },
];

export type Signal = {
  tone: "good" | "warning" | "critical";
  title: string;
  detail: string;
  area: string;
  /** A question Scout can answer from the Banking model to explain the signal. */
  question: string;
};

/**
 * Signals worth a look, taken from the Banking model's figures for the 12
 * months to Nov 2026 (all regions). Each one hands Scout a follow-up question.
 */
export const SIGNALS: readonly Signal[] = [
  {
    tone: "critical",
    title: "12.6K customers rated Very Poor",
    detail: "6% of the customer base sits in the lowest credit rating.",
    area: "Credit",
    question: "How many customers have a Very Poor credit rating, by customer region and age group?",
  },
  {
    tone: "warning",
    title: "Checking balances flat over 12 months",
    detail: "Up just 0.7% while savings grew 10%: cash is moving into savings.",
    area: "Current accounts",
    question: "How did total checking and savings balances change month by month over the last 12 months?",
  },
  {
    tone: "good",
    title: "Savings balances up 10% in 12 months",
    detail: "The fastest-growing balance type, ahead of cards (+4.9%) and checking (+0.7%).",
    area: "Savings",
    question: "Which customer age groups grew their savings balances the most over the last 12 months?",
  },
  {
    tone: "good",
    title: "East holds the most deposits: $538M",
    detail: "1.8 times the Southwest ($297M), the smallest region.",
    area: "Regions",
    question: "Compare total checking and savings balances by customer region.",
  },
];
