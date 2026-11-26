import Link from "next/link";
import type { ReactNode } from "react";
import { PRODUCT_NAME } from "../components/brand";
import { AlertIcon, ArrowRightIcon, ChartIcon, CheckIcon, SparkleIcon } from "../components/icons";
import type { Signal } from "@/lib/overview/types";
import AskAboutSignal from "./AskAboutSignal";
import { SignalsSpec } from "./OverviewSpec";

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

/**
 * The Signals list and the two quick links. `signals` comes from
 * getOverviewData(); null means the data isn't connected yet, so the Signals
 * column shows its design spec (SIG-01 to SIG-04) instead.
 */
export default function SignalsAndLinks({ signals }: { signals: readonly Signal[] | null }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      {signals === null ? <SignalsSpec /> : <SignalList signals={signals} />}

      {/* Beside the tall spec frame, the links keep their own height. */}
      <div className={`grid gap-6 ${signals === null ? "self-start" : ""}`}>
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

/** The live Signals list, worked out by getOverviewData() from the page's figures. */
function SignalList({ signals }: { signals: readonly Signal[] }) {
  return (
    <section className="rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Signals</h2>
          <p className="text-sm text-muted">
            Notable movements in the last 12 months. Ask Scout to explain any of them.
          </p>
        </div>
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
          {signals.length} new
        </span>
      </div>
      {signals.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No signals right now.</p>
      ) : (
        <ul className="divide-y divide-line">
          {signals.map((signal) => {
            const style = SIGNAL_STYLES[signal.tone];
            const Icon = style.icon;
            return (
              <li key={signal.id} className="flex gap-4 px-6 py-4">
                <span className={`mt-0.5 h-fit rounded-md p-1.5 ring-1 ${style.badge}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{signal.title}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ring-1 ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{signal.detail}</p>
                  <AskAboutSignal question={signal.question} />
                </div>
                <span className="hidden shrink-0 text-xs font-semibold text-muted sm:block">
                  {signal.area}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
