/**
 * The Overview page's design spec: what each widget is for and the data it
 * needs, written by Product Design and the Data team before anything was
 * connected. Until getOverviewData() returns live figures, the page renders
 * these specs in place of the widgets; once it does, the real widgets take
 * their place.
 *
 * The spec speaks in business terms on purpose. Mapping each line to the
 * Banking model's real columns is the build step's job (lab prompt 2).
 */

export type WidgetKind = "kpi" | "kpi-split" | "line" | "bars" | "hbars" | "columns" | "stacked" | "cards";

export type WidgetSpec = {
  /** Stable ID used in design reviews and in the build summary. */
  id: string;
  /** The title the live widget will carry. */
  title: string;
  kind: WidgetKind;
  /** The business question the widget answers. */
  question: string;
  /** What has to be measured, in plain terms. */
  data: string[];
  /** Grain and time window. */
  slice: string;
  /** Whether the region filter applies. */
  regionFilter: boolean;
  /** A design note for the build team, if any. */
  note?: string;
};

export const SPEC_META = {
  name: "Business overview",
  version: "v1.2",
  approvedBy: ["Product Design", "Data & Analytics", "Retail Finance"],
  approvedOn: "3 Nov 2026",
  source: "Banking model",
} as const;

export const KPI_SPECS: WidgetSpec[] = [
  {
    id: "KPI-01",
    title: "Customer deposits",
    kind: "kpi",
    question: "How much do customers hold with us today, and is it growing?",
    data: ["Checking + savings balances, summed across customers", "Latest statement month"],
    slice: "Monthly trend · selected period",
    regionFilter: true,
    note: "Change is first month to last month of the period.",
  },
  {
    id: "KPI-02",
    title: "Savings balances",
    kind: "kpi",
    question: "Is savings, our fastest lever, still compounding?",
    data: ["Savings balances, summed across customers"],
    slice: "Monthly trend · selected period",
    regionFilter: true,
  },
  {
    id: "KPI-03",
    title: "Card balances",
    kind: "kpi",
    question: "How much credit is outstanding on cards?",
    data: ["Advantage + Platinum card balances, summed"],
    slice: "Monthly trend · selected period",
    regionFilter: true,
    note: "Neutral colour for change: up isn't good or bad here.",
  },
  {
    id: "KPI-04",
    title: "Customers",
    kind: "kpi-split",
    question: "How big and how healthy is the customer base?",
    data: ["Distinct customers", "Average credit score", "Products held per customer"],
    slice: "Current snapshot",
    regionFilter: true,
  },
];

export const CHART_SPECS: WidgetSpec[] = [
  {
    id: "CHT-01",
    title: "What's driving balance growth",
    kind: "line",
    question: "Which balance type is growing fastest, relative to where it started?",
    data: ["Savings, checking and card balances per month", "Each indexed to 100 at the first month"],
    slice: "Monthly · selected period",
    regionFilter: true,
    note: "Indexing puts three very different sizes on one axis.",
  },
  {
    id: "CHT-02",
    title: "Deposits by region",
    kind: "bars",
    question: "Where do our deposits sit, and how does the selected region compare?",
    data: ["Checking and savings balances per region", "Customers per region"],
    slice: "Current snapshot · all five regions",
    regionFilter: false,
    note: "Always shows every region; the selected one is highlighted. Click a bar to filter.",
  },
  {
    id: "CHT-03",
    title: "Product holding",
    kind: "hbars",
    question: "Which products do customers actually hold?",
    data: ["Customers holding each product", "Share of all customers"],
    slice: "Current snapshot · most held first",
    regionFilter: true,
  },
  {
    id: "CHT-04",
    title: "Savings by age",
    kind: "columns",
    question: "Which age groups save the most per head?",
    data: ["Savings balance and customers per age group", "Average = balance ÷ customers"],
    slice: "Current snapshot · youngest first",
    regionFilter: true,
  },
  {
    id: "CHT-05",
    title: "Credit quality",
    kind: "stacked",
    question: "How is the book spread across credit ratings?",
    data: ["Customers per credit rating"],
    slice: "Current snapshot · lowest rating first",
    regionFilter: true,
  },
];

export const LOB_SPEC: WidgetSpec = {
  id: "LOB-01–06",
  title: "Lines of business",
  kind: "cards",
  question: "How is each line of business doing, at a glance?",
  data: ["One card per line: customers, headline balance, and its trend or a per-customer stat"],
  slice: "Selected period · each card links to its dashboard",
  regionFilter: true,
};

/** The six line-of-business cards, as a table in the spec. */
export const LOB_ROWS: { id: string; line: string; customers: string; metric: string; footer: string }[] = [
  { id: "LOB-01", line: "Current accounts", customers: "Customers with checking", metric: "Checking balances", footer: "Change over period + trend" },
  { id: "LOB-02", line: "Savings", customers: "Customers with savings", metric: "Savings balances", footer: "Change over period + trend" },
  { id: "LOB-03", line: "Credit cards", customers: "Cards held (both types)", metric: "Advantage + Platinum balances", footer: "Change over period + trend" },
  { id: "LOB-04", line: "Mortgages", customers: "Customers with a mortgage", metric: "Monthly mortgage balance", footer: "Balance per borrower" },
  { id: "LOB-05", line: "Wealth (IRA)", customers: "Customers with an IRA", metric: "Retirement assets", footer: "Assets per investor" },
  { id: "LOB-06", line: "Customer base", customers: "All customers", metric: "Average credit score", footer: "Products per customer" },
];

/**
 * The Signals list: four notable movements worked out from the figures the
 * page already loads (no extra queries), each with a follow-up question for
 * Scout. Text in {braces} is filled from the data. Money uses money(), counts
 * use count(), and percentages have one decimal (lib/overview/format.ts).
 * "12 months" means the first and last of the latest 12 monthly points.
 */
export type SignalSpec = {
  id: string;
  /** What the signal watches. */
  name: string;
  /** The `area` label shown on the right. */
  area: string;
  /** The title, as a template. */
  title: string;
  /** The detail line, as a template. */
  detail: string;
  /** How to pick the tone: good, warning, or critical. */
  tone: string;
  /** Which OverviewData fields it reads. */
  data: string;
  /** Whether the region filter applies. */
  regionFilter: boolean;
  /** The question "Ask Scout why" sends, as a template. */
  question: string;
};

export const SIGNALS_SPEC: WidgetSpec = {
  id: "SIG-01–04",
  title: "Signals",
  kind: "cards",
  question: "What changed that someone should look at, and why?",
  data: ["Four signals worked out from the figures above: no extra queries", "Each one hands Scout a follow-up question"],
  slice: "Latest 12 months · newest figures",
  regionFilter: true,
  note: "SIG-04 compares regions, so it always covers all five. Keep the four in this order.",
};

export const SIGNAL_SPECS: SignalSpec[] = [
  {
    id: "SIG-01",
    name: "Credit risk",
    area: "Credit",
    title: "{count} customers rated {Lowest rating}",
    detail: "{share}% of the customer base sits in the lowest credit rating.",
    tone: "critical at 5% or more, warning from 2%, good below 2%",
    data: "creditRatings[0] (lowest rating, title case) ÷ totals.customers",
    regionFilter: true,
    question: "How many customers have a {Lowest rating} credit rating, by customer region and age group?",
  },
  {
    id: "SIG-02",
    name: "Current account momentum",
    area: "Current accounts",
    title: "Checking balances flat over 12 months (within ±2%), else “Checking balances up|down {x}% in 12 months”",
    detail: "“Up|Down {x}% while savings grew|fell {y}%.”, adding “ Cash is moving into savings.” when savings grew 5 points more",
    tone: "good when up 2% or more, otherwise warning",
    data: "monthly: checking and savings, first vs last of 12 months",
    regionFilter: true,
    question: "How did total checking and savings balances change month by month over the last 12 months?",
  },
  {
    id: "SIG-03",
    name: "Fastest-growing balance",
    area: "Savings, Current accounts or Cards (the winner's)",
    title: "{Type} balances up|down {x}% in 12 months",
    detail: "The fastest-growing balance type, ahead of {other} ({±a}%) and {other} ({±b}%).",
    tone: "good when it grew, warning when even the best fell",
    data: "monthly: savings, checking, cards; the largest 12-month change wins",
    regionFilter: true,
    question: "Which customer age groups grew their {type} balances the most over the last 12 months?",
  },
  {
    id: "SIG-04",
    name: "Deposit concentration",
    area: "Regions",
    title: "{Region} holds the most deposits: {money}",
    detail: "{ratio} times the {smallest region} ({money}), the smallest region.",
    tone: "always good",
    data: "regions: checking + savings per region (ratio with one decimal)",
    regionFilter: false,
    question: "Compare total checking and savings balances by customer region.",
  },
];

/** Every widget ID in the spec, in page order. */
export const SPEC_COUNT = KPI_SPECS.length + CHART_SPECS.length + LOB_ROWS.length + SIGNAL_SPECS.length;
