import type { Metadata } from "next";
import { Suspense } from "react";
import { findModelIdByName } from "@/lib/thoughtspot/models";
import { PRODUCT_NAME } from "../components/brand";
import PageHeader from "../components/PageHeader";
import { SparkleIcon } from "../components/icons";
import EmbedStatus from "../components/thoughtspot/EmbedStatus";
import SpotterPanel from "./SpotterPanel";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} AI`,
};

/** The data model every conversation on this page uses. */
const MODEL_NAME = "Banking";

/**
 * Sync shell. The page fills the viewport below the sticky portal header
 * (104px tall below md, 68px from md up); the chat takes all the height left
 * under the page header and starter prompts, so the iframe never collapses.
 */
export default function BankalyticsAiPage() {
  return (
    <div className="flex h-[calc(100dvh-104px)] min-h-[560px] flex-col md:h-[calc(100dvh-68px)]">
      <PageHeader
        eyebrow="Conversational analytics"
        title={`${PRODUCT_NAME} AI`}
        description="Ask about customers, balances, credit, and account growth in plain English, and get answers with charts."
        icon={<SparkleIcon className="size-7" />}
        variant="compact"
        aside={
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
            <span className="size-1.5 rounded-full bg-brand-400" />
            {MODEL_NAME} model
          </span>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<EmbedStatus state="loading" label="Loading the assistant…" />}>
          <AiWorkspace />
        </Suspense>
      </div>
    </div>
  );
}

async function AiWorkspace() {
  let modelId: string | null = null;
  let lookupFailed = false;
  try {
    modelId = await findModelIdByName(MODEL_NAME);
  } catch (error) {
    lookupFailed = true;
    console.error(
      "[ai] model lookup failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  if (!modelId) {
    return (
      <EmbedStatus
        state="error"
        title="The assistant isn’t available."
        message={
          lookupFailed
            ? "We couldn’t reach the analytics service. Check .env.local, then refresh the page."
            : `No data model named “${MODEL_NAME}” is shared with your lab user.`
        }
      />
    );
  }

  return <SpotterPanel worksheetId={modelId} username={process.env.TS_USERNAME ?? ""} />;
}
