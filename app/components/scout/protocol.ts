/**
 * Wire format shared by the Scout chat UI and the /api/scout route.
 *
 * The browser holds the full transcript (including tool calls and results,
 * so multi-step tools keep their task ids across turns) and sends it with
 * every question. The route streams newline-delimited JSON events back.
 */

export type TranscriptBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | {
      type: "tool_result";
      tool_use_id: string;
      content: string;
      is_error?: boolean;
    };

export type TranscriptMessage = {
  role: "user" | "assistant";
  content: string | TranscriptBlock[];
};

export type ScoutRequest = {
  question: string;
  transcript: TranscriptMessage[];
};

/**
 * A chart from the analysis service, identified only by IDs: the browser
 * embeds it with the Visual Embed SDK, so no link is ever sent or shown.
 */
export type ScoutChart = {
  title: string;
  worksheetId: string;
  sessionId: string;
  genNo: number;
  acSessionId: string;
  acGenNo: number;
  convId: string;
  messageId: string;
};

export type ScoutEvent =
  /** What Scout is doing right now, for the status line. */
  | { type: "status"; label: string }
  /** A chunk of the assistant's reply. */
  | { type: "text"; delta: string }
  /**
   * Remove the reply text streamed so far: the model wrote it before calling
   * a tool, so it was narration ("Let me look that up"), not the answer.
   */
  | { type: "discard" }
  /** A chart to show with this reply, under its text. */
  | { type: "chart"; chart: ScoutChart }
  /** The turn finished. `transcript` replaces the browser's copy. */
  | { type: "done"; transcript: TranscriptMessage[] }
  /** The turn failed. The message is safe to show to the user. */
  | { type: "error"; message: string };

export const MAX_QUESTION_LENGTH = 2_000;
