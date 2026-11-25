import type { ScoutChart, ScoutEvent, TranscriptMessage } from "./protocol";

export type ScoutRole = "user" | "assistant";

export type ScoutMessage = {
  id: string;
  role: ScoutRole;
  content: string;
  /** Charts from the analysis, shown under the reply's text. */
  charts?: ScoutChart[];
  /** Set on an assistant message whose turn failed. */
  error?: boolean;
};

const ROUTE = "/api/scout";

/**
 * Sends a question and the transcript so far to /api/scout and calls
 * `onEvent` for every streamed event, in order.
 */
export async function askScout(
  question: string,
  transcript: readonly TranscriptMessage[],
  onEvent: (event: ScoutEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, transcript }),
    cache: "no-store",
    signal,
  });

  if (!response.ok || !response.body) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    onEvent({
      type: "error",
      message: body?.error ?? `Scout is unavailable (${response.status}).`,
    });
    return;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) onEvent(JSON.parse(line) as ScoutEvent);
      newline = buffer.indexOf("\n");
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as ScoutEvent);
}
