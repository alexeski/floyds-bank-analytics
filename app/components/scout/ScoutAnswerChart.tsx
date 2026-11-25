"use client";

import { SpotterMessage } from "@thoughtspot/visual-embed-sdk/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertIcon } from "../icons";
import { logEmbedError, summarizeEmbedError } from "../thoughtspot/embedErrors";
import { thoughtSpotReady } from "../thoughtspot/sdk";
import type { ScoutChart } from "./protocol";

const EMBED_STYLE = { height: "100%", width: "100%" } as const;
/**
 * The answer embed can't size itself to its content, so it gets a fixed
 * height. Its content (title, column chips, legend, chart, axis, footer)
 * measures 610 to 670px across chart shapes and screen widths, and the chart
 * stretches to fill any spare room, so 680px never cuts it off.
 */
const CHART_HEIGHT = "h-[680px]";

/**
 * One chart from Scout's analysis, embedded with the SDK's SpotterMessage
 * component (a single analysis answer), so it uses the app's sign-in and brand styling like every other
 * embed. Loaded only in the browser (see ScoutChat).
 */
export default function ScoutAnswerChart({ chart }: { chart: ScoutChart }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    thoughtSpotReady().then(
      () => active && setState("ready"),
      () => active && setState("error"),
    );
    return () => {
      active = false;
    };
  }, []);

  // A stable object, so the embed doesn't re-render the iframe on every update.
  const message = useMemo(
    () => ({
      worksheetId: chart.worksheetId,
      sessionId: chart.sessionId,
      genNo: chart.genNo,
      acSessionId: chart.acSessionId,
      acGenNo: chart.acGenNo,
      convId: chart.convId,
      messageId: chart.messageId,
    }),
    [chart],
  );

  const handleError = useCallback((payload: unknown) => {
    const summary = summarizeEmbedError(payload);
    logEmbedError("scout chart", summary);
    if (summary.fatal) setState("error");
  }, []);

  return (
    <figure
      aria-label={chart.title ? `Chart: ${chart.title}` : "Chart"}
      className="overflow-hidden rounded-xl border border-line bg-white shadow-sm"
    >
      <div className={`relative ${CHART_HEIGHT}`}>
        {state === "ready" && (
          <SpotterMessage
            message={message}
            query={chart.title}
            className="h-full w-full"
            style={EMBED_STYLE}
            onError={handleError}
          />
        )}
        {state === "loading" && (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-muted">
            <span className="size-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
            Loading chart…
          </div>
        )}
        {state === "error" && (
          <div className="flex h-full items-center justify-center gap-2 px-6 text-center text-xs text-muted">
            <AlertIcon className="size-4 shrink-0 text-loss" />
            This chart couldn&rsquo;t be loaded. The answer above still stands.
          </div>
        )}
      </div>
    </figure>
  );
}
