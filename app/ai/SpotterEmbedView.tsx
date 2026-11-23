"use client";

import {
  HostEvent,
  SpotterExperienceVersion,
  type SpotterChatViewConfig,
  type SpotterSidebarViewConfig,
} from "@thoughtspot/visual-embed-sdk";
import { SpotterEmbed, useEmbedRef } from "@thoughtspot/visual-embed-sdk/react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { SparkleIcon } from "../components/icons";
import EmbedStatus from "../components/thoughtspot/EmbedStatus";
import { logEmbedError, summarizeEmbedError } from "../components/thoughtspot/embedErrors";
import { initThoughtSpot } from "../components/thoughtspot/sdk";

// Module constants keep the embed's props stable, so the iframe is never rebuilt.

const SIDEBAR_CONFIG: SpotterSidebarViewConfig = {
  enablePastConversationsSidebar: true,
  spotterSidebarDefaultExpanded: false,
  spotterSidebarTitle: "Chat history",
  spotterNewChatButtonTitle: "New conversation",
};

const EMBED_STYLE: CSSProperties = { height: "100%", width: "100%" };

/** Answer cards are labelled with the portal's assistant name. */
const SPOTTER_CHAT: SpotterChatViewConfig = { toolResponseCardBrandingLabel: "Scout" };

/** Written against the Banking model's real columns. */
const STARTER_PROMPTS = [
  {
    label: "Checking balance by region",
    query: "Total Current Checking Balance by Customer Region",
  },
  {
    label: "Savings balance trend",
    query: "Monthly Savings Balance by Statement Date for the last 12 months",
  },
  {
    label: "Customers by age and gender",
    query: "Number of Customers by Customer Age Group and Customer Gender",
  },
  {
    label: "Credit score by income group",
    query: "Average Customer Credit Score by Customer Income Group",
  },
  {
    label: "Top states by mortgage balance",
    query: "Top 10 Customer State by Current Mortgage Loan Balance (Monthly)",
  },
  {
    label: "Savings growth by region",
    query: "Savings Growth (%) by Customer Region",
  },
] as const;

type InitState = { status: "loading" } | { status: "ready" } | { status: "error"; message: string };

export default function SpotterEmbedView({
  worksheetId,
  username,
}: {
  worksheetId: string;
  username: string;
}) {
  const [init, setInit] = useState<InitState>({ status: "loading" });
  const [fatalError, setFatalError] = useState<string | null>(null);
  const embedRef = useEmbedRef<typeof SpotterEmbed>();

  useEffect(() => {
    let active = true;
    initThoughtSpot(username).then(
      () => {
        if (active) setInit({ status: "ready" });
      },
      (error: unknown) => {
        if (active) {
          setInit({
            status: "error",
            message: error instanceof Error ? error.message : "The analytics service failed to start.",
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [username]);

  // Log every embed error readably; show only fatal ones, without destroying the embed.
  const handleError = useCallback((payload: unknown) => {
    const summary = summarizeEmbedError(payload);
    logEmbedError("assistant", summary);
    if (summary.fatal) {
      setFatalError(summary.message || "We couldn't sign you in or start the assistant.");
    }
  }, []);

  const askStarter = useCallback(
    (query: string) => {
      embedRef.current
        ?.trigger(HostEvent.SpotterSearch, { query, executeSearch: true })
        .catch(() => console.warn("[assistant] starter prompt could not be sent"));
    },
    [embedRef],
  );

  if (init.status === "loading") {
    return <EmbedStatus state="loading" label="Loading the assistant…" />;
  }
  if (init.status === "error") {
    return (
      <EmbedStatus state="error" title="The assistant isn’t available." message={init.message} />
    );
  }

  return (
    <>
      <div className="shrink-0 border-b border-line bg-white">
        {/* One row that scrolls sideways on narrow screens, so it never takes height from the chat. */}
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 text-xs [scrollbar-width:none] sm:px-6">
          <span className="mr-1 flex shrink-0 items-center gap-1.5 font-semibold text-muted">
            <SparkleIcon className="size-3.5 text-brand-700" />
            Try:
          </span>
          {STARTER_PROMPTS.map(({ label, query }) => (
            <button
              key={label}
              type="button"
              title={query}
              onClick={() => askStarter(query)}
              className="shrink-0 rounded-full border border-line bg-white px-3 py-1 font-medium whitespace-nowrap text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900 active:bg-brand-100"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <SpotterEmbed
          ref={embedRef}
          worksheetId={worksheetId}
          disableSourceSelection
          hideSampleQuestions
          updatedSpotterChatPrompt
          spotterExperienceVersion={SpotterExperienceVersion.SPOTTER_2026_11}
          spotterSidebarConfig={SIDEBAR_CONFIG}
          spotterChatConfig={SPOTTER_CHAT}
          className="h-full w-full"
          style={EMBED_STYLE}
          onError={handleError}
        />
        {fatalError && (
          <div className="absolute inset-0">
            <EmbedStatus
              state="error"
              title="The assistant isn’t available."
              message={fatalError}
            />
          </div>
        )}
      </div>
    </>
  );
}
