import Link from "next/link";
import { BANK_NAME, Emblem, PRODUCT_NAME } from "./components/brand";
import BusinessLineIcon from "./components/BusinessLineIcon";
import Sparkline from "./components/charts/Sparkline";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartIcon,
  LayersIcon,
  LockIcon,
  ShieldIcon,
  SparkleIcon,
  TrendUpIcon,
  UserIcon,
} from "./components/icons";
import MarketingFooter from "./components/marketing/MarketingFooter";
import MarketingHeader from "./components/marketing/MarketingHeader";
import Swoosh from "./components/marketing/Swoosh";
import {
  BUSINESS_LINES,
  HEADLINE_KPIS,
  REPORTING_PERIOD,
} from "./components/sampleData";

const PROOF_POINTS = [
  { value: "26M", label: "customers in a single view" },
  { value: "£470bn+", label: "of deposits analysed daily" },
  { value: "6", label: "lines of business, one model" },
  { value: "< 10s", label: "from question to chart" },
] as const;

const SECURITY_POINTS = [
  {
    icon: LockIcon,
    title: "Trusted authentication",
    body: "Short-lived tokens issued server-side. Secrets never reach the browser.",
  },
  {
    icon: UserIcon,
    title: "Row-level security",
    body: "Every analyst sees only the customers, regions, and products they're entitled to.",
  },
  {
    icon: ShieldIcon,
    title: "Audit-ready",
    body: "Every question, answer, and Liveboard view is logged for governance and review.",
  },
] as const;

const ANSWER_BARS = [
  { label: "London", value: 4.8 },
  { label: "South East", value: 3.9 },
  { label: "Scotland", value: 3.1 },
  { label: "North West", value: 2.6 },
] as const;

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <Swoosh />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pr-3 pl-1 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-brand-950">
                New
              </span>
              Meet Scout, your AI data analyst
            </p>
            <h1 className="mt-6 text-[44px] leading-[1.04] font-extrabold tracking-tight sm:text-6xl">
              Every number behind the bank.{" "}
              <span className="text-brand-400">In one place.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/90">
              {PRODUCT_NAME} brings current accounts, savings, cards, lending,
              small business, and wealth into one live view, so every team at{" "}
              {BANK_NAME} can see what&rsquo;s changing and why.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-3.5 text-[15px] font-bold text-brand-950 shadow-lg shadow-black/20 transition-colors hover:bg-brand-400"
              >
                <LockIcon className="size-4" />
                Log on to {PRODUCT_NAME}
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-[15px] font-bold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10"
              >
                See what&rsquo;s inside
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* Proof points */}
      <section className="border-b border-line">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {PROOF_POINTS.map(({ value, label }) => (
            <div key={label} className="border-l-4 border-brand-500 pl-4">
              <dt className="sr-only">{label}</dt>
              <dd className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
                {value}
              </dd>
              <dd className="mt-1 text-sm text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Lines of business */}
      <section id="platform" className="scroll-mt-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">
              The platform
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">
              One view across the whole bank
            </h2>
            <p className="mt-4 text-lg text-muted">
              Built on a governed banking model, so every team works from the
              same definitions, from the branch network to the board.
            </p>
          </div>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {BUSINESS_LINES.map((line) => (
              <li key={line.key} className="bg-white p-7">
                <span className="inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-700 ring-1 ring-brand-100">
                  <BusinessLineIcon line={line.key} className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{line.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {line.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Scout */}
      <section id="scout" className="scroll-mt-28 bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">
              Scout AI
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">
              Ask in plain English. Get the answer, not a ticket.
            </h2>
            <p className="mt-4 text-lg text-muted">
              Scout understands the bank&rsquo;s data model, so relationship
              managers, product owners, and analysts can explore without
              writing SQL or waiting on a report.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: SparkleIcon,
                  text: "Answers with charts, built from governed data",
                },
                {
                  icon: BoltIcon,
                  text: "Follow-up questions keep the context of the conversation",
                },
                {
                  icon: LayersIcon,
                  text: "Pin any answer to a Liveboard and share it with your team",
                },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="rounded-md bg-brand-700 p-1.5 text-white">
                    <Icon className="size-4" />
                  </span>
                  <span className="pt-0.5 font-medium text-ink">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-xl shadow-brand-900/5">
            <div className="flex items-center gap-2 border-b border-line pb-4">
              <span className="rounded-md bg-brand-700 p-1.5 text-white">
                <SparkleIcon className="size-4" />
              </span>
              <span className="font-bold text-ink">Scout</span>
              <span className="ml-auto text-xs text-muted">Banking model</span>
            </div>
            <div className="space-y-4 pt-5">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-700 px-4 py-2.5 text-sm text-white">
                Which regions grew current account balances fastest in{" "}
                {REPORTING_PERIOD}?
              </p>
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-line bg-surface p-4">
                <p className="text-sm text-ink">
                  <strong>London</strong> led with <strong>+4.8%</strong>{" "}
                  quarter on quarter, followed by the South East. Growth was
                  driven by salary switching into Premier accounts.
                </p>
                <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-line">
                  <p className="text-xs font-semibold text-muted">
                    Balance growth, QoQ %
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {ANSWER_BARS.map(({ label, value }) => (
                      <li key={label} className="grid grid-cols-[88px_1fr_36px] items-center gap-3 text-xs">
                        <span className="font-medium text-ink">{label}</span>
                        <span className="h-2.5 rounded-full bg-surface">
                          <span
                            className="block h-full rounded-full bg-brand-700"
                            style={{ width: `${(value / 5) * 100}%` }}
                          />
                        </span>
                        <span className="text-right font-bold tabular-nums text-ink">
                          {value}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="scroll-mt-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">
                Security
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">
                Bank-grade by design
              </h2>
              <p className="mt-4 text-lg text-muted">
                Customer data stays protected at every step, with the same
                controls our regulators expect everywhere else.
              </p>
            </div>
            <ul className="grid gap-5 sm:grid-cols-3">
              {SECURITY_POINTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-xl border border-line p-6">
                  <Icon className="size-7 text-brand-700" />
                  <h3 className="mt-4 font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative overflow-hidden bg-brand-700 text-white">
        <Swoosh className="opacity-60" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to see the whole picture?
            </h2>
            <p className="mt-2 text-brand-100">
              Log on with your work email.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3.5 text-[15px] font-bold text-brand-900 shadow-lg shadow-black/15 transition-colors hover:bg-brand-50"
          >
            <LockIcon className="size-4" />
            Log on
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

/** A stylised product screenshot for the hero. */
function HeroPreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl bg-white text-ink shadow-2xl shadow-black/40 ring-1 ring-white/20">
        <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="ml-3 flex items-center gap-2 text-xs font-semibold text-muted">
            <Emblem className="size-4" />
            {PRODUCT_NAME} · Business overview
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Group performance</p>
            <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-line">
              {REPORTING_PERIOD}
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {HEADLINE_KPIS.map((kpi) => (
              <li key={kpi.label} className="rounded-lg border border-line p-3">
                <p className="text-[11px] font-semibold text-muted">{kpi.label}</p>
                <p className="mt-1 text-xl font-extrabold tracking-tight tabular-nums">
                  {kpi.value}
                </p>
                <div className="mt-1 flex items-end justify-between">
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-gain">
                    <TrendUpIcon className="size-3" />
                    {kpi.change.replace(" QoQ", "")}
                  </span>
                  <Sparkline values={kpi.trend} label="" className="h-7 w-20" />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-end gap-1.5 rounded-lg border border-line px-3 pt-3">
            {[38, 52, 47, 63, 58, 72, 69, 84, 78, 92, 88, 100].map((height, index) => (
              <span
                key={index}
                className={`flex-1 rounded-t-sm ${index > 8 ? "bg-brand-700" : "bg-brand-200"}`}
                style={{ height: `${height * 0.7}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 -left-6 hidden w-72 rounded-xl bg-white p-4 text-ink shadow-2xl shadow-black/30 ring-1 ring-line sm:block">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-700 p-1 text-white">
            <SparkleIcon className="size-3.5" />
          </span>
          <span className="text-xs font-bold">Scout</span>
        </div>
        <p className="mt-2 text-sm leading-snug">
          Card spend on travel is up <strong className="text-gain">12%</strong>{" "}
          this quarter, led by Premier customers.
        </p>
      </div>

      <div className="absolute -top-5 -right-3 hidden items-center gap-2 rounded-full bg-white py-1.5 pr-3 pl-1.5 text-xs font-bold text-ink shadow-xl shadow-black/25 sm:flex">
        <span className="rounded-full bg-brand-500 p-1 text-brand-950">
          <ChartIcon className="size-3.5" />
        </span>
        Live data
      </div>
    </div>
  );
}
