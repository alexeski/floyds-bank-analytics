import type { Metadata } from "next";
import { Suspense } from "react";
import ScoutBar from "../components/scout/ScoutBar";
import { BANK_NAME } from "../components/brand";
import OverviewFilters from "./OverviewFilters";
import OverviewLive from "./OverviewLive";
import { OverviewTransitionProvider, PendingSurface } from "./OverviewTransition";
import SignalsAndLinks from "./SignalsAndLinks";

export const metadata: Metadata = {
  title: "Overview",
};

/**
 * Sync shell. The filters and the live figures read the URL's search params,
 * which are only known at request time, so each sits in its own Suspense
 * boundary; everything else renders immediately.
 */
export default function OverviewPage({ searchParams }: PageProps<"/home">) {
  return (
    <OverviewTransitionProvider>
      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-8 pb-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">{BANK_NAME} · Group performance</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-[34px]">
              Business overview
            </h1>
            <p className="mt-1.5 max-w-2xl text-muted">
              Deposits, cards, lending, and customers across every line of business, straight from
              the bank&rsquo;s data.
            </p>
          </div>
          <Suspense fallback={<div className="skeleton h-9 w-80 rounded-md ring-1 ring-line" />}>
            <OverviewFilters />
          </Suspense>
        </div>
        <ScoutBar />
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <PendingSurface>
          <Suspense fallback={<OverviewSkeleton />}>
            <OverviewLive searchParams={searchParams} />
          </Suspense>
        </PendingSurface>
        <SignalsAndLinks />
      </div>
    </OverviewTransitionProvider>
  );
}

function OverviewSkeleton() {
  const block = "skeleton rounded-xl border border-line";
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading live figures">
      <div className="skeleton h-6 w-80 rounded-full ring-1 ring-line" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-[124px]`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className={`${block} h-[390px]`} />
        <div className={`${block} h-[390px]`} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${block} h-[320px]`} />
        ))}
      </div>
    </div>
  );
}
