import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import ScoutBar from "../components/scout/ScoutBar";
import { BANK_NAME, PRODUCT_NAME } from "../components/brand";
import BusinessLineIcon from "../components/BusinessLineIcon";
import Sparkline from "../components/charts/Sparkline";
import TrendChart from "../components/charts/TrendChart";
import {
  AlertIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  SparkleIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "../components/icons";
import {
  BUSINESS_LINES,
  DATA_AS_OF,
  DEPOSIT_MIX,
  DEPOSIT_TREND,
  HEADLINE_KPIS,
  QUARTERS,
  REPORTING_PERIOD,
  SIGNALS,
  type Signal,
} from "../components/sampleData";

export const metadata: Metadata = {
  title: "Overview",
};

const TREND_DATA = QUARTERS.map((label, index) => ({
  label,
  value: DEPOSIT_TREND[index],
}));

const MIX_TOTAL = DEPOSIT_MIX.reduce((sum, { value }) => sum + value, 0);
const MIX_MAX = Math.max(...DEPOSIT_MIX.map(({ value }) => value));

const SIGNAL_STYLES: Record<
  Signal["tone"],
  { label: string; badge: string; icon: typeof AlertIcon }
> = {
  critical: {
    label: "Needs attention",
    badge: "bg-red-50 text-red-700 ring-red-200",
    icon: AlertIcon,
  },
  warning: {
    label: "Watch",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    icon: AlertIcon,
  },
  good: {
    label: "Positive",
    badge: "bg-brand-50 text-brand-800 ring-brand-200",
    icon: CheckIcon,
  },
};

export default function OverviewPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-8 pb-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">
              {BANK_NAME} · Group performance
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">
              Business overview
            </h1>
            <p className="mt-1.5 max-w-2xl text-muted">
              How every line of business is performing this quarter, from
              current accounts to wealth.
            </p>
          </div>
          <dl className="flex flex-wrap gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5">
              <dt className="text-muted">Period</dt>
              <dd className="font-semibold text-ink">{REPORTING_PERIOD}</dd>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5">
              <dt className="text-muted">Region</dt>
              <dd className="font-semibold text-ink">All UK</dd>
            </div>
            <div className="flex items-center gap-1.5 rounded-md px-1 py-1.5 text-muted">
              <ClockIcon className="size-4" />
              <dt className="sr-only">Data as of</dt>
              <dd>Data as of {DATA_AS_OF}</dd>
            </div>
          </dl>
        </div>
        <ScoutBar />
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Headline metrics
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HEADLINE_KPIS.map((kpi) => {
              const TrendIcon = kpi.direction === "up" ? TrendUpIcon : TrendDownIcon;
              return (
                <li
                  key={kpi.label}
                  className="rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(2,71,49,0.04)]"
                >
                  <p className="text-sm font-semibold text-muted">{kpi.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[28px] font-extrabold leading-none tracking-tight tabular-nums text-ink">
                        {kpi.value}
                      </p>
                      <p
                        className={`mt-2 inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
                          kpi.favourable ? "text-gain" : "text-loss"
                        }`}
                      >
                        <TrendIcon className="size-3.5" />
                        {kpi.change}
                      </p>
                    </div>
                    <Sparkline
                      values={kpi.trend}
                      label={`${kpi.label}, last eight quarters`}
                      className="h-10 w-28 shrink-0"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-line bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Customer deposits
                </h2>
                <p className="text-sm text-muted">
                  Total balances, £bn, last eight quarters
                </p>
              </div>
              <p className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 ring-1 ring-brand-200">
                +7.9% year on year
              </p>
            </div>
            <div className="mt-4">
              <TrendChart
                data={TREND_DATA}
                prefix="£"
                suffix="bn"
                step={10}
                label="Line chart of customer deposits rising from £438.2bn in Q4 2024 to £472.9bn in Q3 2026"
              />
            </div>
          </section>

          <section className="flex flex-col rounded-xl border border-line bg-white p-6">
            <h2 className="text-lg font-bold tracking-tight">Deposit mix</h2>
            <p className="text-sm text-muted">
              Balances by product, £bn, {REPORTING_PERIOD}
            </p>
            <ul className="mt-6 flex flex-1 flex-col justify-between gap-5">
              {DEPOSIT_MIX.map(({ label, value }) => (
                <li key={label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{label}</span>
                    <span className="tabular-nums text-muted">
                      <span className="font-bold text-ink">£{value.toFixed(1)}bn</span>
                      {" · "}
                      {((value / MIX_TOTAL) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-brand-700"
                      style={{ width: `${(value / MIX_MAX) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="lob-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="lob-heading" className="text-xl font-bold tracking-tight">
                Lines of business
              </h2>
              <p className="text-sm text-muted">
                Headline metric and change on the previous quarter.
              </p>
            </div>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
            >
              Open all dashboards
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_LINES.map((line) => (
              <li key={line.key}>
                <Link
                  href="/analytics"
                  className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span className="rounded-lg bg-brand-50 p-2 text-brand-700 ring-1 ring-brand-100">
                        <BusinessLineIcon line={line.key} className="size-5" />
                      </span>
                      <h3 className="font-bold text-ink">{line.name}</h3>
                    </span>
                    <ArrowUpRightIcon className="size-4 text-muted transition-colors group-hover:text-brand-700" />
                  </div>
                  <p className="mt-3 flex-1 text-sm text-muted">{line.description}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight tabular-nums text-ink">
                        {line.metric}
                      </p>
                      <p className="text-xs text-muted">{line.metricLabel}</p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-bold tabular-nums ${
                        line.favourable
                          ? "bg-brand-50 text-gain"
                          : "bg-red-50 text-loss"
                      }`}
                    >
                      {line.change} QoQ
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Signals</h2>
                <p className="text-sm text-muted">
                  Notable movements detected this quarter
                </p>
              </div>
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
                {SIGNALS.length} new
              </span>
            </div>
            <ul className="divide-y divide-line">
              {SIGNALS.map((signal) => {
                const style = SIGNAL_STYLES[signal.tone];
                const Icon = style.icon;
                return (
                  <li key={signal.title} className="flex gap-4 px-6 py-4">
                    <span
                      className={`mt-0.5 h-fit rounded-md p-1.5 ring-1 ${style.badge}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{signal.title}</p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ring-1 ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{signal.detail}</p>
                    </div>
                    <span className="hidden shrink-0 text-xs font-semibold text-muted sm:block">
                      {signal.area}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-6">
            <QuickLink
              href="/analytics"
              icon={<ChartIcon className="size-5" />}
              title="Analytics"
              description="Curated Liveboards for portfolio health, card spend, deposits, and customer segments."
              cta="Browse dashboards"
            />
            <QuickLink
              href="/ai"
              icon={<SparkleIcon className="size-5" />}
              title={`${PRODUCT_NAME} AI`}
              description="Ask a question in plain English and get an answer with a chart in seconds."
              cta="Start a conversation"
              featured
            />
          </div>
        </div>
      </div>
    </>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
  cta,
  featured = false,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-xl p-6 transition-shadow hover:shadow-lg ${
        featured
          ? "bg-brand-900 text-white hover:shadow-brand-900/20"
          : "border border-line bg-white hover:shadow-brand-900/5"
      }`}
    >
      {featured && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-brand-500/25 blur-2xl"
        />
      )}
      <span
        className={`relative w-fit rounded-lg p-2.5 ${
          featured ? "bg-brand-500 text-brand-950" : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
        }`}
      >
        {icon}
      </span>
      <h3 className="relative mt-4 text-lg font-bold tracking-tight">{title}</h3>
      <p
        className={`relative mt-1 flex-1 text-sm ${featured ? "text-brand-100/85" : "text-muted"}`}
      >
        {description}
      </p>
      <span
        className={`relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${
          featured ? "text-brand-300" : "text-brand-700"
        }`}
      >
        {cta}
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
