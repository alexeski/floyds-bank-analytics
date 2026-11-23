import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { getOverviewData } from "@/lib/overview/data";
import { isRegion, type OverviewData } from "@/lib/overview/types";
import {
  SERIES,
  count,
  money,
  monthLabel,
  monthYear,
  percentChange,
  signedPercent,
} from "@/lib/overview/format";
import BusinessLineIcon from "../components/BusinessLineIcon";
import AnimatedNumber, { type NumberFormat } from "../components/charts/AnimatedNumber";
import GrowthChart from "../components/charts/GrowthChart";
import Sparkline from "../components/charts/Sparkline";
import { AlertIcon, ArrowRightIcon, ArrowUpRightIcon, LayersIcon, TrendDownIcon, TrendUpIcon, UserIcon } from "../components/icons";
import { AgeColumns, ProductBars } from "./BreakdownCharts";
import RegionChart from "./RegionChart";

const PERIOD_MONTHS: Record<string, number> = { "3m": 3, "6m": 6, "12m": 12 };

/** Sequential single-hue ramp for credit ratings, lightest = lowest. */
const RATING_RAMP = ["#c2ebd7", "#8eddb9", "#3fcb93", "#00825f", "#024731"];

type Params = Promise<Record<string, string | string[] | undefined>>;

/** Entrance stagger: each section rises a beat after the previous one. */
const rise = (step: number): CSSProperties => ({ ["--rise-delay" as string]: `${step * 70}ms` });

/** Everything on the Overview page that comes from live data. */
export default async function OverviewLive({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const regionParam = typeof params.region === "string" ? params.region : undefined;
  const periodParam = typeof params.period === "string" ? params.period : "12m";
  const region = isRegion(regionParam) ? regionParam : null;
  const months = PERIOD_MONTHS[periodParam] ?? 12;

  let data: OverviewData;
  try {
    data = await getOverviewData(region);
  } catch (error) {
    console.error("[overview] data load failed:", error instanceof Error ? error.message : "unknown");
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <AlertIcon className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-bold">We couldn&rsquo;t load live figures.</p>
          <p className="mt-1">Check the analytics settings in .env.local, then refresh the page.</p>
        </div>
      </div>
    );
  }

  const range = data.monthly.slice(-months);
  const first = range[0];
  const last = range.at(-1) ?? first;
  const labels = range.map((m) => monthLabel(m.month, true));
  const scope = region ?? "All regions";
  const periodText = `${months} months`;

  const deposits = range.map((m) => m.checking + m.savings);
  const t = data.totals;
  // Before the page is connected to live data, everything renders as a
  // greyed-out, non-interactive preview with "—" for every figure.
  const ghost = data.source === "placeholder";
  // Changes are only meaningful for real figures.
  const change = (from: number, to: number) => (ghost ? NaN : percentChange(from, to));
  // Figures from the placeholder shapes are never shown: they read "—".
  const figure = (value: number) => (ghost ? NaN : value);
  const productCount = (name: string) =>
    figure(data.products.find((p) => p.product === name)?.customers ?? 0);

  return (
    <div className="space-y-6">
      {ghost && <NotConnected />}
      <div
        aria-hidden={ghost || undefined}
        className={ghost ? "pointer-events-none space-y-6 opacity-40 blur-[2.5px] grayscale select-none" : "space-y-6"}
      >
      <p className="motion-rise flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted" style={rise(0)}>
        {ghost ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-muted ring-1 ring-line">
            <span className="size-1.5 rounded-full bg-muted" />
            Sample shapes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-800 ring-1 ring-brand-200">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
            Live data
          </span>
        )}
        <span className="font-semibold text-ink">{scope}</span>·<span>last {periodText}</span>·
        <span>statements to {monthYear(data.asOf)}</span>
      </p>

      {/* KPIs */}
      <section aria-label="Headline metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Customer deposits"
          value={figure(last.checking + last.savings)}
          format="money"
          step={1}
          change={change(deposits[0], deposits.at(-1) ?? 0)}
          caption={`vs ${monthLabel(first.month, true)}`}
          trend={deposits}
          labels={labels}
          color="#006a4d"
        />
        <KpiTile
          label="Savings balances"
          value={figure(last.savings)}
          format="money"
          step={2}
          change={change(first.savings, last.savings)}
          caption={`vs ${monthLabel(first.month, true)}`}
          trend={range.map((m) => m.savings)}
          labels={labels}
          color={SERIES.savings}
        />
        <KpiTile
          label="Card balances"
          value={figure(last.cards)}
          format="money"
          step={3}
          change={change(first.cards, last.cards)}
          caption={`vs ${monthLabel(first.month, true)}`}
          trend={range.map((m) => m.cards)}
          labels={labels}
          color={SERIES.cards}
          neutral
        />
        <div className="motion-rise rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(2,71,49,0.04)]" style={rise(4)}>
          <p className="text-sm font-semibold text-muted">Customers</p>
          <p className="mt-2 text-[28px] leading-none font-extrabold tracking-tight text-ink">
            <AnimatedNumber value={t.customers} format="count" />
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs">
            <div>
              <dt className="text-muted">Avg credit score</dt>
              <dd className="mt-0.5 text-base font-bold text-ink">
                <AnimatedNumber value={t.creditScore} format="integer" />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Products each</dt>
              <dd className="mt-0.5 text-base font-bold text-ink">
                <AnimatedNumber value={t.customers ? t.products / t.customers : 0} format="decimal2" />
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Growth + regions */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <Card
          title="What's driving balance growth"
          subtitle={`Balances indexed to 100 in ${monthLabel(first.month, true)} · ${scope}`}
          aside={
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Legend color={SERIES.savings} label="Savings" value={money(figure(last.savings))} />
              <Legend color={SERIES.checking} label="Checking" value={money(figure(last.checking))} />
              <Legend color={SERIES.cards} label="Cards" value={money(figure(last.cards))} />
            </ul>
          }
        >
          <GrowthChart
            labels={labels}
            series={[
              { key: "savings", label: "Savings", color: SERIES.savings, values: range.map((m) => m.savings) },
              { key: "cards", label: "Cards", color: SERIES.cards, values: range.map((m) => m.cards) },
              { key: "checking", label: "Checking", color: SERIES.checking, values: range.map((m) => m.checking) },
            ]}
            ariaLabel={`Indexed growth over ${periodText}: savings ${signedPercent(change(first.savings, last.savings))}, cards ${signedPercent(change(first.cards, last.cards))}, checking ${signedPercent(change(first.checking, last.checking))}`}
          />
        </Card>

        <Card
          title="Deposits by region"
          step={6}
          subtitle="Current checking and savings balances"
          aside={
            <ul className="flex gap-3 text-xs">
              <Legend color={SERIES.checking} label="Checking" />
              <Legend color={SERIES.savings} label="Savings" />
            </ul>
          }
        >
          <RegionChart rows={data.regions} />
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card step={7} title="Product holding" subtitle={`Share of ${count(t.customers)} customers`}>
          <ProductBars rows={data.products} customers={t.customers} />
        </Card>
        <Card step={8} title="Savings by age" subtitle="Average savings balance per customer">
          <AgeColumns rows={data.ageGroups} />
        </Card>
        <Card step={9} title="Credit quality" subtitle="Customers by credit rating">
          <CreditMix rows={data.creditRatings} />
        </Card>
      </div>

      {/* Lines of business */}
      <section aria-labelledby="lob-heading" className="motion-rise" style={rise(10)}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="lob-heading" className="text-xl font-bold tracking-tight">
              Lines of business
            </h2>
            <p className="text-sm text-muted">
              Customers, balances, and change over the last {periodText} · {scope}
            </p>
          </div>
          <Link href="/analytics" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
            Open all dashboards
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LobCard
            icon={<BusinessLineIcon line="current" className="size-5" />}
            name="Current accounts"
            customers={productCount("Checking")}
            metric={t.checking}
            metricLabel="Checking balances"
            change={change(first.checking, last.checking)}
            trend={range.map((m) => m.checking)}
            labels={labels}
            color={SERIES.checking}
          />
          <LobCard
            icon={<BusinessLineIcon line="savings" className="size-5" />}
            name="Savings"
            customers={productCount("Savings")}
            metric={t.savings}
            metricLabel="Savings balances"
            change={change(first.savings, last.savings)}
            trend={range.map((m) => m.savings)}
            labels={labels}
            color={SERIES.savings}
          />
          <LobCard
            icon={<BusinessLineIcon line="cards" className="size-5" />}
            name="Credit cards"
            customers={productCount("Credit Card (Advantage)") + productCount("Credit Card (Platinum)")}
            customersLabel="cards held"
            metric={t.cardAdvantage + t.cardPlatinum}
            metricLabel="Advantage and Platinum balances"
            change={change(first.cards, last.cards)}
            trend={range.map((m) => m.cards)}
            labels={labels}
            color={SERIES.cards}
          />
          <LobCard
            icon={<BusinessLineIcon line="lending" className="size-5" />}
            name="Mortgages"
            customers={productCount("Mortgage Loan")}
            metric={t.mortgage}
            metricLabel="Monthly mortgage balance"
            stat={`${money(t.mortgage / productCount("Mortgage Loan"))} per borrower`}
          />
          <LobCard
            icon={<BusinessLineIcon line="wealth" className="size-5" />}
            name="Wealth (IRA)"
            customers={productCount("IRA")}
            metric={t.ira}
            metricLabel="Retirement assets"
            stat={`${money(t.ira / productCount("IRA"))} per investor`}
          />
          <LobCard
            icon={<UserIcon className="size-5" />}
            name="Customer base"
            customers={t.customers}
            metric={t.creditScore}
            metricFormat="integer"
            metricLabel="Average credit score"
            stat={`${t.customers ? (t.products / t.customers).toFixed(2) : "—"} products per customer`}
          />
        </ul>
      </section>
      </div>
    </div>
  );
}

/** Shown until getOverviewData() returns live figures. */
function NotConnected() {
  return (
    <section className="motion-rise flex flex-col gap-4 rounded-xl border border-dashed border-brand-300 bg-white p-5 sm:flex-row sm:items-center">
      <span className="w-fit rounded-lg bg-brand-50 p-2.5 text-brand-700 ring-1 ring-brand-100">
        <LayersIcon className="size-6" />
      </span>
      <div className="flex-1">
        <p className="font-bold text-ink">Live data isn&rsquo;t connected yet</p>
        <p className="mt-0.5 text-sm text-muted">
          Every chart, filter, and card below is built and waiting. Connect this page&rsquo;s data
          layer to the bank&rsquo;s Banking model and it comes alive.
        </p>
      </div>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted ring-1 ring-line">
        <span className="size-1.5 rounded-full bg-muted" />
        Preview
      </span>
    </section>
  );
}

function Card({
  title,
  subtitle,
  aside,
  step = 5,
  children,
}: {
  title: string;
  subtitle: string;
  aside?: ReactNode;
  step?: number;
  children: ReactNode;
}) {
  return (
    <section style={rise(step)} className="motion-rise flex min-w-0 flex-col rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(2,71,49,0.04)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        {aside}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value?: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="font-semibold text-ink">{label}</span>
      {value && <span className="tabular-nums text-muted">{value}</span>}
    </li>
  );
}

function ChangeBadge({ change, neutral = false }: { change: number; neutral?: boolean }) {
  const up = change >= 0;
  const Icon = up ? TrendUpIcon : TrendDownIcon;
  const tone = neutral ? "text-muted" : up ? "text-gain" : "text-loss";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${tone}`}>
      <Icon className="size-3.5" />
      <AnimatedNumber value={change} format="percent" />
    </span>
  );
}

function KpiTile({
  label,
  value,
  format,
  step,
  change,
  caption,
  trend,
  labels,
  color,
  neutral = false,
}: {
  label: string;
  value: number;
  format: NumberFormat;
  step: number;
  change: number;
  caption: string;
  trend: readonly number[];
  labels: readonly string[];
  color: string;
  neutral?: boolean;
}) {
  return (
    <div className="motion-rise rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(2,71,49,0.04)]" style={rise(step)}>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-[28px] leading-none font-extrabold tracking-tight text-ink">
            <AnimatedNumber value={value} format={format} />
          </p>
          <p className="mt-2 flex items-center gap-1.5">
            <ChangeBadge change={change} neutral={neutral} />
            <span className="text-xs text-muted">{caption}</span>
          </p>
        </div>
        <Sparkline values={trend} labels={labels} format="money" label={`${label} by month`} color={color} className="h-12 w-28" />
      </div>
    </div>
  );
}

function LobCard({
  icon,
  name,
  customers,
  customersLabel = "customers",
  metric,
  metricFormat = "money",
  metricLabel,
  change,
  trend,
  labels,
  color,
  stat,
}: {
  icon: ReactNode;
  name: string;
  customers: number;
  customersLabel?: string;
  metric: number;
  metricFormat?: NumberFormat;
  metricLabel: string;
  change?: number;
  trend?: readonly number[];
  labels?: readonly string[];
  color?: string;
  stat?: string;
}) {
  return (
    <li>
      <Link
        href="/analytics"
        className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-3">
            <span className="rounded-lg bg-brand-50 p-2 text-brand-700 ring-1 ring-brand-100">{icon}</span>
            <span>
              <h3 className="font-bold text-ink">{name}</h3>
              <p className="text-xs text-muted">
                <AnimatedNumber value={customers} format="integer" /> {customersLabel}
              </p>
            </span>
          </span>
          <ArrowUpRightIcon className="size-4 text-muted transition-colors group-hover:text-brand-700" />
        </div>
        <div className="mt-5 flex flex-1 items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-ink">
              <AnimatedNumber value={metric} format={metricFormat} />
            </p>
            <p className="text-xs text-muted">{metricLabel}</p>
          </div>
          {trend && color && (
            <Sparkline
              values={trend}
              labels={labels}
              format="money"
              focusable={false}
              label={`${name} balances by month`}
              color={color}
              className="h-9 w-24"
            />
          )}
        </div>
        <div className="mt-4 border-t border-line pt-3 text-xs">
          {change !== undefined ? (
            <span className="flex items-center gap-1.5">
              <ChangeBadge change={change} />
              <span className="text-muted">over the period</span>
            </span>
          ) : (
            <span className="font-semibold text-muted">{stat}</span>
          )}
        </div>
      </Link>
    </li>
  );
}

function CreditMix({ rows }: { rows: readonly { rating: string; customers: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.customers, 0);
  return (
    <div>
      <div
        className="motion-bar-x flex h-4 w-full gap-0.5 overflow-hidden rounded-full"
        style={{ ["--bar-delay" as string]: "650ms" }}
        role="img"
        aria-label="Customers by credit rating"
      >
        {rows.map((r, i) => (
          <span
            key={r.rating}
            className="h-full transition-[width] duration-700 ease-out first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(r.customers / total) * 100}%`, background: RATING_RAMP[i] ?? RATING_RAMP.at(-1) }}
          />
        ))}
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        {rows.map((r, i) => (
          <li key={r.rating} className="flex items-center gap-2.5">
            <span className="size-3 rounded-sm" style={{ background: RATING_RAMP[i] ?? RATING_RAMP.at(-1) }} />
            <span className="flex-1 capitalize text-ink">{r.rating}</span>
            <span className="tabular-nums text-muted">{count(r.customers)}</span>
            <span className="w-10 text-right font-bold tabular-nums text-ink">
              {total ? Math.round((r.customers / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
