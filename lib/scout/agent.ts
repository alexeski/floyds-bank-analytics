import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { ScoutEvent, TranscriptBlock, TranscriptMessage } from "@/app/components/scout/protocol";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";
import { readScoutConfig } from "./config";
import { openMcpSession, type McpSession } from "./mcp";
import { buildSystemPrompt, DATA_MODEL_NAME } from "./system-prompt";

/** Upper bound on model calls per question (polling a dashboard build uses several). */
const MAX_STEPS = 40;

/** Friendly status labels for the tools the Spotter MCP server offers. */
const TOOL_LABELS: Record<string, string> = {
  check_connectivity: "Checking the connection",
  search_objects: "Finding your data",
  create_analysis_session: "Starting an analysis",
  send_session_message: "Asking the Analytics Agent",
  get_session_updates: "Waiting for the analysis",
  get_data: "Fetching data",
  create_dashboard: "Designing a Liveboard",
  modify_dashboard: "Updating the Liveboard",
  get_dashboard_status: "Building the Liveboard",
};

/**
 * Reads a get_session_updates result for the analysis's latest progress note
 * ("Looking at Customer Region, Savings Growth") and whether it has finished,
 * so the status line can show real progress instead of the reply narrating it.
 */
function readAnalysisProgress(text: string): { note: string | null; done: boolean } {
  try {
    const result = JSON.parse(text) as {
      is_done?: boolean;
      session_updates?: { type?: string; text?: string }[];
    };
    const notes = (result.session_updates ?? [])
      .filter((update) => update.type === "step_notification" && update.text?.trim())
      .map((update) => update.text!.trim());
    const note = notes.at(-1) ?? null;
    return {
      // Keep the product's own name out of the status line (white label).
      note: note && !/thoughtspot|spotter/i.test(note) ? note.slice(0, 120) : null,
      done: result.is_done === true,
    };
  } catch {
    return { note: null, done: false };
  }
}

/** The Banking model's ID, looked up once per server process. */
let cachedModelId: string | null = null;

/**
 * Finds the Banking data model's ID with one search, so the model can start
 * an analysis on it directly instead of discovering a data source itself.
 * Returns null if the lookup fails; the prompt then falls back to one search.
 */
async function findDataModelId(mcp: McpSession, signal: AbortSignal): Promise<string | null> {
  if (cachedModelId) return cachedModelId;
  const outcome = await mcp.callTool(
    "search_objects",
    { query: DATA_MODEL_NAME, types: ["WORKSHEET"] },
    () => undefined,
    signal,
  );
  if (outcome.isError) return null;
  try {
    const { results } = JSON.parse(outcome.text) as {
      results?: { object_id?: string; title?: string; type?: string }[];
    };
    const match = results?.find(
      (item) =>
        item.title === DATA_MODEL_NAME &&
        item.type === "WORKSHEET" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.object_id ?? ""),
    );
    cachedModelId = match?.object_id ?? null;
  } catch {
    // Unexpected shape: leave it to the model's one-search fallback.
  }
  log(cachedModelId ? "data model found" : "data model lookup failed");
  return cachedModelId;
}

function log(message: string) {
  // Only tool names and coarse lifecycle events are logged; never arguments,
  // results, questions, or credentials.
  console.info(`[scout] ${message}`);
}

/**
 * Runs one Scout turn: the model answers `question`, calling MCP tools as
 * needed, and every step is reported through `emit`.
 */
export async function runScoutTurn({
  question,
  transcript,
  emit,
  signal,
}: {
  question: string;
  transcript: TranscriptMessage[];
  emit: (event: ScoutEvent) => void;
  signal: AbortSignal;
}): Promise<void> {
  const config = readScoutConfig();
  const anthropic = new Anthropic({
    baseURL: config.llm.baseUrl,
    apiKey: config.llm.apiKey,
    maxRetries: 1,
  });

  emit({ type: "status", label: "Connecting to your data" });
  const { token } = await getThoughtSpotToken();
  const mcp: McpSession = await openMcpSession(config, token);

  try {
    if (mcp.withheld.length > 0) {
      log(`server withheld tools: ${mcp.withheld.map((t) => t.name).join(", ")}`);
    }
    const tools: Anthropic.Tool[] = mcp.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));

    const system = buildSystemPrompt(await findDataModelId(mcp, signal));

    const messages: TranscriptMessage[] = [
      ...transcript,
      { role: "user", content: question },
    ];

    // What the status line shows while the model works between tool calls.
    let thinkingLabel = "Thinking";

    for (let step = 0; step < MAX_STEPS; step += 1) {
      emit({ type: "status", label: thinkingLabel });

      const stream = anthropic.messages.stream(
        {
          model: config.llm.model,
          max_tokens: config.llm.maxTokens,
          system,
          tools,
          messages: messages as Anthropic.MessageParam[],
        },
        { signal },
      );

      // Text streams to the chat as it arrives. If this step then calls a
      // tool, that text was narration, not the answer: it is taken back below.
      let streamedText = false;
      stream.on("text", (delta) => {
        streamedText = true;
        emit({ type: "text", delta });
      });

      const reply = await stream.finalMessage();
      const callsTools = reply.stop_reason === "tool_use";
      if (callsTools && streamedText) emit({ type: "discard" });

      const content: TranscriptBlock[] = [];
      for (const block of reply.content) {
        // Narration stays out of the transcript too, so later turns don't
        // learn to narrate from it.
        if (block.type === "text" && !callsTools) {
          content.push({ type: "text", text: block.text });
        } else if (block.type === "tool_use") {
          content.push({
            type: "tool_use",
            id: block.id,
            name: block.name,
            input: (block.input ?? {}) as Record<string, unknown>,
          });
        }
      }
      // The API rejects empty assistant turns in later requests.
      if (content.length === 0) content.push({ type: "text", text: "(no reply)" });
      messages.push({ role: "assistant", content });

      if (reply.stop_reason === "max_tokens") {
        emit({ type: "text", delta: "\n\n_(Reply cut short: it reached the length limit.)_" });
      }
      if (!callsTools) {
        emit({ type: "done", transcript: messages });
        return;
      }

      const results: TranscriptBlock[] = [];
      for (const block of content) {
        if (block.type !== "tool_use") continue;
        const label =
          block.name === "get_session_updates" && thinkingLabel !== "Thinking"
            ? thinkingLabel
            : (TOOL_LABELS[block.name] ?? `Running ${block.name}`);
        emit({ type: "status", label });
        log(`tool ${block.name}`);
        const outcome = await mcp.callTool(
          block.name,
          block.input,
          (message) => emit({ type: "status", label: `${label}: ${message}` }),
          signal,
        );
        if (outcome.isError) log(`tool ${block.name} returned an error`);
        if (block.name === "get_session_updates" && !outcome.isError) {
          const progress = readAnalysisProgress(outcome.text);
          if (progress.done) thinkingLabel = "Writing the answer";
          else if (progress.note) thinkingLabel = progress.note;
          emit({ type: "status", label: thinkingLabel });
        }
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: outcome.text || "(no output)",
          is_error: outcome.isError || undefined,
        });
      }
      messages.push({ role: "user", content: results });
    }

    emit({
      type: "text",
      delta: "I stopped after too many steps. Try asking a narrower question.",
    });
    emit({ type: "done", transcript: messages });
  } finally {
    await mcp.close().catch(() => undefined);
  }
}
