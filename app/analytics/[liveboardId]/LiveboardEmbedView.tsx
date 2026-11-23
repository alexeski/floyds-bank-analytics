"use client";

import {
  Action,
  CustomActionTarget,
  CustomActionsPosition,
  SpotterExperienceVersion,
  type AnswerService,
  type CustomAction,
  type MessagePayload,
  type SpotterChatViewConfig,
  type SpotterVizConfig,
} from "@thoughtspot/visual-embed-sdk";
import { LiveboardEmbed } from "@thoughtspot/visual-embed-sdk/react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  FETCH_ROWS,
  tableFromAnswerService,
  tableFromEmbedAnswerData,
  tableFromLiveboardData,
  type TableResult,
} from "@/lib/table-data";
import { logEmbedError, summarizeEmbedError } from "../../components/thoughtspot/embedErrors";
import { initThoughtSpot } from "../../components/thoughtspot/sdk";
import EmbedStatus from "../../components/thoughtspot/EmbedStatus";
import TableDialog, { type TableDialogState } from "./TableDialog";

// Module constants keep the embed's props stable, so the iframe is never rebuilt.

/**
 * Hide Explore (Spotter's per-visualization analysis, Action.AskAi, stays
 * visible) and every TML action.
 */
const HIDDEN_ACTIONS: Action[] = [
  Action.Explore,
  Action.TML,
  Action.ExportTML,
  Action.ImportTML,
  Action.UpdateTML,
  Action.EditTML,
];

const VIEW_AS_TABLE_ID = "view-as-table";

/** In every visualization's menu. No scoping, so it appears on all of them. */
const CUSTOM_ACTIONS: CustomAction[] = [
  {
    id: VIEW_AS_TABLE_ID,
    name: "View as table",
    position: CustomActionsPosition.MENU,
    target: CustomActionTarget.VIZ,
  },
];

const EMBED_STYLE: CSSProperties = { height: "100%", width: "100%" };

/** The Liveboard's AI panel speaks as Scout, the portal's assistant. */
const SPOTTER_VIZ: SpotterVizConfig = {
  brandName: "Scout",
  brandHeadline: "Hi, I'm",
  description: "Ask about this Liveboard's data in plain English.",
  inputChatPlaceholder: "Ask Scout about this Liveboard…",
  loaderHeadline: "Scout is crunching the numbers…",
  spotterBrandName: "Scout",
  insightTileBrandName: "Scout insight",
};

const SPOTTER_CHAT: SpotterChatViewConfig = { toolResponseCardBrandingLabel: "Scout" };

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The SDK attaches an AnswerService to custom action payloads. */
type CustomActionMessage = MessagePayload & { answerService?: AnswerService };

type InitState = { status: "loading" } | { status: "ready" } | { status: "error"; message: string };

/**
 * Loads the clicked visualization's data, trying each source in turn:
 * the payload's embedAnswerData, then answerService.fetchData(), then (only
 * with a GUID vizId) the server's REST fallback.
 */
async function loadTable(payload: CustomActionMessage, liveboardId: string): Promise<TableResult | null> {
  const fromPayload = tableFromEmbedAnswerData(payload);
  if (fromPayload) return fromPayload;

  if (payload.answerService) {
    try {
      const fromService = tableFromAnswerService(await payload.answerService.fetchData(0, FETCH_ROWS));
      if (fromService) return fromService;
    } catch {
      console.warn("[view-as-table] answerService.fetchData failed");
    }
  }

  const vizId: unknown = payload.data?.vizId;
  if (typeof vizId === "string" && GUID_PATTERN.test(vizId)) {
    const params = new URLSearchParams({ liveboardId, vizId });
    const response = await fetch(`/api/thoughtspot/liveboard-data?${params}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Data route returned ${response.status}`);
    return tableFromLiveboardData(await response.json(), vizId);
  }
  return null;
}

function vizTitle(payload: CustomActionMessage): string {
  const name: unknown = payload.data?.embedAnswerData?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Visualization data";
}

export default function LiveboardEmbedView({
  liveboardId,
  username,
}: {
  liveboardId: string;
  username: string;
}) {
  const [init, setInit] = useState<InitState>({ status: "loading" });
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<TableDialogState | null>(null);
  const [requestId, setRequestId] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Results from a click the user has since closed or replaced are ignored.
  const latestRequest = useRef(0);

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

  // Log every embed error readably. Fatal ones (sign-in failed, embed can't
  // render) are also shown over the embed; the embed itself is never destroyed.
  const handleError = useCallback((payload: unknown) => {
    const summary = summarizeEmbedError(payload);
    logEmbedError("liveboard", summary);
    if (summary.fatal) {
      setFatalError(summary.message || "We couldn't sign you in or show this Liveboard.");
    }
  }, []);

  const handleCustomAction = useCallback(
    async (payload: CustomActionMessage) => {
      if (payload.data?.id !== VIEW_AS_TABLE_ID) return;

      // Open the dialog straight away, so a click never does nothing.
      const id = latestRequest.current + 1;
      latestRequest.current = id;
      const title = vizTitle(payload);
      setRequestId(id);
      setDialog({ status: "loading", title });
      if (!dialogRef.current?.open) dialogRef.current?.showModal();

      let next: TableDialogState;
      try {
        const table = await loadTable(payload, liveboardId);
        next = table
          ? { status: "ready", title, table }
          : { status: "error", title, message: "This visualization has no rows to show." };
      } catch {
        next = {
          status: "error",
          title,
          message: "We couldn't load this visualization's data. Please try again.",
        };
      }
      if (latestRequest.current === id) setDialog(next);
    },
    [liveboardId],
  );

  const handleDialogClose = useCallback(() => {
    latestRequest.current += 1;
    setDialog(null);
  }, []);

  if (init.status === "loading") return <EmbedStatus state="loading" />;
  if (init.status === "error") return <EmbedStatus state="error" message={init.message} />;

  return (
    <div className="relative h-full">
      <LiveboardEmbed
        liveboardId={liveboardId}
        hiddenActions={HIDDEN_ACTIONS}
        customActions={CUSTOM_ACTIONS}
        updatedSpotterChatPrompt
        spotterExperienceVersion={SpotterExperienceVersion.SPOTTER_2026_11}
        enableLiveboardDataCache
        spotterViz={SPOTTER_VIZ}
        spotterChatConfig={SPOTTER_CHAT}
        className="h-full w-full"
        style={EMBED_STYLE}
        onError={handleError}
        onCustomAction={handleCustomAction}
      />
      {fatalError && (
        <div className="absolute inset-0">
          <EmbedStatus state="error" message={fatalError} />
        </div>
      )}
      <TableDialog
        ref={dialogRef}
        state={dialog}
        requestId={requestId}
        onClose={handleDialogClose}
      />
    </div>
  );
}
