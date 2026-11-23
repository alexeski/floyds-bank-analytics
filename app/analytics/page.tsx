import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { listLiveboards, type LiveboardSummary } from "@/lib/thoughtspot/liveboards";
import PageHeader from "../components/PageHeader";
import {
  AlertIcon,
  ArrowUpRightIcon,
  ChartIcon,
  ClockIcon,
  GridIcon,
  LayersIcon,
} from "../components/icons";

export const metadata: Metadata = {
  title: "Analytics",
};

const UPDATED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboards"
        title="Analytics"
        description="Explore Liveboards across current accounts, savings, cards, lending, and customers."
        icon={<ChartIcon className="size-7" />}
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <Suspense fallback={<LiveboardGridSkeleton />}>
          <LiveboardGrid />
        </Suspense>
      </section>
    </>
  );
}

async function LiveboardGrid() {
  let liveboards: LiveboardSummary[];
  try {
    liveboards = await listLiveboards();
  } catch (error) {
    console.error(
      "[analytics] listing Liveboards failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <AlertIcon className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-bold">We couldn&rsquo;t load your Liveboards.</p>
          <p className="mt-1">
            Check the analytics settings in .env.local and that the token
            service is reachable, then refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <GridIcon className="size-4 text-brand-700" />
          {liveboards.length} {liveboards.length === 1 ? "Liveboard" : "Liveboards"}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <LayersIcon className="size-4" />
          Most recently updated first
        </p>
      </div>

      {liveboards.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-white p-8 text-center text-muted">
          No Liveboards are shared with you yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {liveboards.map((liveboard) => (
            <li key={liveboard.id}>
              <LiveboardTile liveboard={liveboard} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function LiveboardTile({ liveboard }: { liveboard: LiveboardSummary }) {
  const initials = liveboard.author
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/analytics/${liveboard.id}`}
      className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(2,71,49,0.04)] transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.99] active:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-lg bg-brand-50 p-2 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-700 group-hover:text-white group-hover:ring-brand-700">
          <ChartIcon className="size-5" />
        </span>
        <ArrowUpRightIcon className="size-4 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-700" />
      </div>
      <h2 className="mt-4 text-lg leading-snug font-bold tracking-tight text-ink group-hover:text-brand-900">
        {liveboard.name}
      </h2>
      <p
        className={`mt-1.5 line-clamp-2 flex-1 text-sm ${
          liveboard.description ? "text-muted" : "text-muted/70 italic"
        }`}
      >
        {liveboard.description || "No description"}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800"
          >
            {initials}
          </span>
          <span className="truncate font-semibold text-ink">{liveboard.author}</span>
        </span>
        {liveboard.modified !== null && (
          <span className="flex shrink-0 items-center gap-1 text-muted">
            <ClockIcon className="size-3.5" />
            <time dateTime={new Date(liveboard.modified).toISOString()}>
              {UPDATED_FORMAT.format(liveboard.modified)}
            </time>
          </span>
        )}
      </div>
    </Link>
  );
}

function LiveboardGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading Liveboards">
      <div className="h-5 w-32 animate-pulse rounded bg-line" />
      <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <li key={index} className="h-[196px] animate-pulse rounded-xl border border-line bg-white p-5">
            <div className="size-9 rounded-lg bg-surface" />
            <div className="mt-4 h-5 w-2/3 rounded bg-surface" />
            <div className="mt-3 h-4 w-full rounded bg-surface" />
            <div className="mt-2 h-4 w-4/5 rounded bg-surface" />
          </li>
        ))}
      </ul>
    </div>
  );
}
