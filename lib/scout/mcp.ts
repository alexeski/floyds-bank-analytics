import "server-only";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { ScoutConfig } from "./config";

/** Spotter analysis and dashboard builds can run for minutes. */
const TOOL_TIMEOUT_MS = 5 * 60_000;
/** Tool results are trimmed so the transcript the browser holds stays small. */
const MAX_TOOL_RESULT_CHARS = 40_000;

export type McpTool = {
  name: string;
  description: string;
  inputSchema: { type: "object"; [key: string]: unknown };
};

export type ToolOutcome = {
  /** The result as the model sees it: links removed, length capped. */
  text: string;
  /** The untouched result, for the server's own use only (never sent to the model or browser). */
  raw: string;
  isError: boolean;
};

export type McpSession = {
  tools: McpTool[];
  /** Tools the server reported as unavailable, with its stated reason. */
  withheld: { name: string; reason: string }[];
  callTool: (
    name: string,
    input: Record<string, unknown>,
    onProgress: (message: string) => void,
    signal: AbortSignal,
  ) => Promise<ToolOutcome>;
  close: () => Promise<void>;
};

/**
 * Scout users have no direct access to ThoughtSpot, so links are removed
 * from tool results before the model sees them.
 */
function stripLinks(text: string): string {
  return text.replace(/\bhttps?:\/\/[^\s"'<>)\]]+/gi, "[link removed]");
}

function rawText(result: Awaited<ReturnType<Client["callTool"]>>): string {
  const parts: string[] = [];
  if (Array.isArray(result.content)) {
    for (const part of result.content) {
      if (part.type === "text") parts.push(part.text);
      else parts.push(`[${part.type} content omitted]`);
    }
  }
  if (parts.length === 0 && result.structuredContent) {
    parts.push(JSON.stringify(result.structuredContent));
  }
  return parts.join("\n\n");
}

function toModelText(raw: string): string {
  const text = stripLinks(raw);
  return text.length > MAX_TOOL_RESULT_CHARS
    ? `${text.slice(0, MAX_TOOL_RESULT_CHARS)}\n\n[Result truncated]`
    : text;
}

/** Reads any "withheld tools" notice the server attaches to its tool list. */
function readWithheld(meta: unknown): { name: string; reason: string }[] {
  if (typeof meta !== "object" || meta === null) return [];
  const withheld: { name: string; reason: string }[] = [];
  for (const [key, value] of Object.entries(meta)) {
    if (!/withheld|unavailable|disabled|hidden/i.test(key) || !Array.isArray(value)) continue;
    for (const entry of value) {
      if (typeof entry === "string") withheld.push({ name: entry, reason: "No reason given" });
      else if (typeof entry === "object" && entry !== null) {
        const record = entry as Record<string, unknown>;
        withheld.push({
          name: String(record.name ?? record.tool ?? "unknown"),
          reason: String(record.reason ?? record.message ?? "No reason given"),
        });
      }
    }
  }
  return withheld;
}

/**
 * Connects to the Spotter MCP server as the lab user and loads every tool it
 * offers. Calls run against ThoughtSpot as the owner of `token`.
 */
export async function openMcpSession(
  config: ScoutConfig,
  token: string,
): Promise<McpSession> {
  const transport = new StreamableHTTPClientTransport(config.mcpUrl, {
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-ts-host": config.thoughtSpotHost,
      },
    },
  });
  const client = new Client({ name: "bankalytics-scout", version: "1.0.0" });
  await client.connect(transport);

  const tools: McpTool[] = [];
  let withheld: { name: string; reason: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await client.listTools(cursor ? { cursor } : undefined);
    withheld = withheld.concat(readWithheld(page._meta));
    for (const tool of page.tools) {
      tools.push({
        name: tool.name,
        description: tool.description ?? "",
        inputSchema: tool.inputSchema as McpTool["inputSchema"],
      });
    }
    cursor = page.nextCursor;
  } while (cursor);

  return {
    tools,
    withheld,
    async callTool(name, input, onProgress, signal) {
      try {
        const result = await client.callTool(
          { name, arguments: input },
          undefined,
          {
            signal,
            timeout: TOOL_TIMEOUT_MS,
            resetTimeoutOnProgress: true,
            onprogress: (progress) => {
              if (progress.message) onProgress(progress.message);
            },
          },
        );
        const raw = rawText(result);
        return { text: toModelText(raw), raw, isError: result.isError === true };
      } catch (error) {
        if (signal.aborted) throw error;
        const text = `The tool call failed: ${error instanceof Error ? stripLinks(error.message) : "unknown error"}`;
        return { text, raw: text, isError: true };
      }
    },
    close: () => client.close(),
  };
}
