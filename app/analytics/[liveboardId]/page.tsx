import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLiveboard, isGuid, type LiveboardSummary } from "@/lib/thoughtspot/liveboards";
import { ArrowRightIcon } from "../../components/icons";
import EmbedStatus from "../../components/thoughtspot/EmbedStatus";
import LiveboardPanel from "./LiveboardPanel";

export const metadata: Metadata = {
  title: "Liveboard",
};

/**
 * Sync shell. The page fills the viewport below the sticky portal header
 * (104px tall below md, 68px from md up), and the embed area takes all the
 * height that's left, so the iframe never collapses.
 */
export default function LiveboardPage({
  params,
}: PageProps<"/analytics/[liveboardId]">) {
  return (
    <div className="flex h-[calc(100dvh-104px)] min-h-[480px] flex-col md:h-[calc(100dvh-68px)]">
      <Suspense
        fallback={
          <>
            <Toolbar title="Loading Liveboard…" />
            <div className="min-h-0 flex-1 bg-surface pt-3">
              <EmbedStatus state="loading" />
            </div>
          </>
        }
      >
        <LiveboardView params={params} />
      </Suspense>
    </div>
  );
}

async function LiveboardView({
  params,
}: {
  params: PageProps<"/analytics/[liveboardId]">["params"];
}) {
  const { liveboardId } = await params;
  if (!isGuid(liveboardId)) notFound();

  // null: the lab user can't see this Liveboard. undefined: the lookup itself
  // failed, so still try the embed, which shows its own error if needed.
  let liveboard: LiveboardSummary | null | undefined;
  try {
    liveboard = await getLiveboard(liveboardId);
  } catch (error) {
    console.error(
      "[analytics] Liveboard lookup failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }
  if (liveboard === null) notFound();

  return (
    <>
      <Toolbar title={liveboard?.name ?? "Liveboard"} />
      {/* A 12px gap in the Liveboard's own background color, so its sticky
          header card isn't drawn flush against the toolbar. */}
      <div className="min-h-0 flex-1 bg-surface pt-3">
        <LiveboardPanel
          liveboardId={liveboardId}
          username={process.env.TS_USERNAME ?? ""}
        />
      </div>
    </>
  );
}

function Toolbar({ title }: { title: string }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
      <Link
        href="/analytics"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
      >
        <ArrowRightIcon className="size-4 rotate-180" />
        All Liveboards
      </Link>
      <span className="text-line" aria-hidden="true">
        /
      </span>
      <h1 className="min-w-0 truncate text-sm font-bold text-ink">{title}</h1>
    </div>
  );
}
