import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { ScoutEvent, TranscriptBlock, TranscriptMessage } from "@/app/components/scout/protocol";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";
import { readScoutConfig } from "./config";
import { openMcpSession, type McpSession } from "./mcp";
import { SYSTEM_PROMPT } from "./system-prompt";

/** Upper bound on model calls per question (polling a dashboard build uses several). */
const MAX_STEPS = 40;

/** Friendly status labels for the tools the Spotter MCP server offers. */
const TOOL_LABELS: Record<string, string> = {
  check_connectivity: "Checking the connection",
  search_objects: "Searching your Liveboards and answers",
  create_analysis_session: "Starting an analysis",
  send_session_message: "Asking the Analytics Agent",
  get_session_updates: "Waiting for the analysis",
  get_data: "Fetching data",
  create_dashboard: "Designing a Liveboard",
  modify_dashboard: "Updating the Liveboard",
  get_dashboard_status: "Building the Liveboard",
};

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

    const messages: TranscriptMessage[] = [
      ...transcript,
      { role: "user", content: question },
    ];
    let wroteText = false;

    for (let step = 0; step < MAX_STEPS; step += 1) {
      emit({ type: "status", label: "Thinking" });

      const stream = anthropic.messages.stream(
        {
          model: config.llm.model,
          max_tokens: config.llm.maxTokens,
          system: SYSTEM_PROMPT,
          tools,
          messages: messages as Anthropic.MessageParam[],
        },
        { signal },
      );

      let separatorPending = wroteText;
      stream.on("text", (delta) => {
        if (separatorPending) {
          emit({ type: "text", delta: "\n\n" });
          separatorPending = false;
        }
        wroteText = true;
        emit({ type: "text", delta });
      });

      const reply = await stream.finalMessage();
      const content: TranscriptBlock[] = [];
      for (const block of reply.content) {
        if (block.type === "text") {
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
      if (reply.stop_reason !== "tool_use") {
        emit({ type: "done", transcript: messages });
        return;
      }

      const results: TranscriptBlock[] = [];
      for (const block of content) {
        if (block.type !== "tool_use") continue;
        const label = TOOL_LABELS[block.name] ?? `Running ${block.name}`;
        emit({ type: "status", label });
        log(`tool ${block.name}`);
        const outcome = await mcp.callTool(
          block.name,
          block.input,
          (message) => emit({ type: "status", label: `${label}: ${message}` }),
          signal,
        );
        if (outcome.isError) log(`tool ${block.name} returned an error`);
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
      delta: "\n\nI stopped after too many steps. Try asking a narrower question.",
    });
    emit({ type: "done", transcript: messages });
  } finally {
    await mcp.close().catch(() => undefined);
  }
}
