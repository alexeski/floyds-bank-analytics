import type { Metadata } from "next";
import PageHeader from "../components/PageHeader";
import { ChartIcon, ClockIcon, GridIcon, LayersIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Analytics",
};

type Preview = "bars" | "line" | "donut" | "table";

const DASHBOARDS: readonly {
  title: string;
  description: string;
  area: string;
  preview: Preview;
}[] = [
  {
    title: "Portfolio Overview",
    description: "Balances, income, and growth across every line of business.",
    area: "Group",
    preview: "bars",
  },
  {
    title: "Credit Card Performance",
    description: "Spend by category, revolve rates, rewards, and arrears.",
    area: "Cards",
    preview: "line",
  },
  {
    title: "Deposit Trends",
    description: "Current account and savings inflows, outflows, and rate sensitivity.",
    area: "Deposits",
    preview: "donut",
  },
  {
    title: "Customer Segments",
    description: "Household profitability, product holding, and churn risk.",
    area: "Customers",
    preview: "table",
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboards"
        title="Analytics"
        description="Explore curated Liveboards across current accounts, savings, cards, lending, and customers."
        icon={<ChartIcon className="size-7" />}
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <GridIcon className="size-4 text-brand-700" />
            {DASHBOARDS.length} dashboards
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <LayersIcon className="size-4" />
            Powered by ThoughtSpot Liveboards
          </p>
        </div>

        <ul className="mt-4 grid gap-5 sm:grid-cols-2">
          {DASHBOARDS.map(({ title, description, area, preview }) => (
            <li
              key={title}
              className="flex flex-col overflow-hidden rounded-xl border border-line bg-white"
            >
              <div
                aria-hidden="true"
                className="flex h-40 items-end bg-gradient-to-br from-brand-50 to-surface px-6 pt-6"
              >
                <DashboardPreview kind={preview} />
              </div>
              <div className="flex flex-1 flex-col border-t border-line p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                      {area}
                    </p>
                    <h2 className="mt-1 text-lg font-bold tracking-tight">{title}</h2>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs font-semibold text-muted ring-1 ring-line">
                    <ClockIcon className="size-3.5" />
                    Coming soon
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** A decorative thumbnail suggesting the kind of dashboard. */
function DashboardPreview({ kind }: { kind: Preview }) {
  const card = "rounded-t-lg border border-b-0 border-line bg-white shadow-sm";
  if (kind === "bars") {
    return (
      <div className={`${card} flex h-full w-full items-end gap-2 px-5 pt-5`}>
        {[46, 62, 54, 78, 70, 88, 96].map((height, index) => (
          <span
            key={index}
            className={`flex-1 rounded-t ${index === 6 ? "bg-brand-700" : "bg-brand-300"}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    );
  }
  if (kind === "line") {
    return (
      <div className={`${card} h-full w-full px-4 pt-4`}>
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0 70 L30 58 L60 62 L90 40 L120 44 L150 24 L200 12 L200 80 L0 80Z" className="fill-brand-500/15" />
          <path d="M0 70 L30 58 L60 62 L90 40 L120 44 L150 24 L200 12" fill="none" className="stroke-brand-700" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    );
  }
  if (kind === "donut") {
    return (
      <div className={`${card} flex h-full w-full items-center gap-6 px-6 pt-4`}>
        <svg viewBox="0 0 42 42" className="size-24 -rotate-90">
          <circle cx="21" cy="21" r="15.9" fill="none" className="stroke-brand-100" strokeWidth="6" />
          <circle cx="21" cy="21" r="15.9" fill="none" className="stroke-brand-700" strokeWidth="6" strokeDasharray="42 58" />
          <circle cx="21" cy="21" r="15.9" fill="none" className="stroke-brand-400" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="-43" />
        </svg>
        <div className="flex-1 space-y-2.5">
          {[90, 64, 40].map((width, index) => (
            <span key={index} className="block h-2 rounded-full bg-brand-100" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={`${card} h-full w-full space-y-3 px-5 pt-5`}>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-3">
          <span className="h-2 w-1/3 rounded-full bg-brand-100" />
          <span className="h-2 flex-1 rounded-full bg-surface" />
          <span
            className={`h-2 w-12 rounded-full ${row === 1 ? "bg-red-200" : "bg-brand-300"}`}
          />
        </div>
      ))}
    </div>
  );
}
