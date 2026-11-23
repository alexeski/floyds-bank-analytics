import Link from "next/link";
import type { ReactNode } from "react";
import { PRODUCT_NAME } from "../components/brand";
import { AlertIcon, ArrowRightIcon, ChartIcon, CheckIcon, SparkleIcon } from "../components/icons";
import { SIGNALS, type Signal } from "../components/sampleData";

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

/** The Signals list (sample content for now) and the two quick links. */
export default function SignalsAndLinks() {
  return (
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
