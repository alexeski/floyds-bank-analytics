import Anthropic from "@anthropic-ai/sdk";
import {
  MAX_QUESTION_LENGTH,
  type ScoutEvent,
  type TranscriptBlock,
  type TranscriptMessage,
} from "@/app/components/scout/protocol";
import { runScoutTurn } from "@/lib/scout/agent";
import { ScoutConfigError } from "@/lib/scout/config";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-guards";
import { TokenServiceError } from "@/lib/thoughtspot/token-service";

const QUESTIONS_PER_MINUTE = 10;
const ONE_MINUTE_MS = 60_000;
const MAX_BODY_BYTES = 2_000_000;
const MAX_TRANSCRIPT_MESSAGES = 400;

const rateLimit = createRateLimiter(QUESTIONS_PER_MINUTE, ONE_MINUTE_MS);

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(status: number, error: string, headers: HeadersInit = {}) {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } });
}

function isBlock(value: unknown): value is TranscriptBlock {
  if (typeof value !== "object" || value === null) return false;
  const block = value as Record<string, unknown>;
  switch (block.type) {
    case "text":
      return typeof block.text === "string";
    case "tool_use":
      return (
        typeof block.id === "string" &&
        typeof block.name === "string" &&
        typeof block.input === "object" &&
        block.input !== null
      );
    case "tool_result":
      return (
        typeof block.tool_use_id === "string" &&
        typeof block.content === "string" &&
        (block.is_error === undefined || typeof block.is_error === "boolean")
      );
    default:
      return false;
  }
}

function isTranscript(value: unknown): value is TranscriptMessage[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_TRANSCRIPT_MESSAGES &&
    value.every((message) => {
      if (typeof message !== "object" || message === null) return false;
      const { role, content } = message as Record<string, unknown>;
      if (role !== "user" && role !== "assistant") return false;
      return typeof content === "string" || (Array.isArray(content) && content.every(isBlock));
    })
  );
}

/** Turns an exception into a message that is safe to show in the chat. */
function describeError(error: unknown): string {
  if (error instanceof ScoutConfigError) {
    return "Scout isn't configured on the server. Check .env.local.";
  }
  if (error instanceof TokenServiceError) {
    return "Scout couldn't connect to the analytics service for your lab user.";
  }
  if (error instanceof Anthropic.APIError) {
    // LiteLLM nests the upstream error message; surface it without links.
    const matches = [...(error.message ?? "").matchAll(/message\\*"\s*:\s*\\*"([^"\\]+)/g)];
    const detail = matches
      .at(-1)?.[1]
      ?.replace(/https?:\/\/\S+/g, "")
      .slice(0, 200);
    return `The AI service returned an error${error.status ? ` (${error.status})` : ""}${
      detail ? `: ${detail}` : "."
    }`;
  }
  return "Something went wrong while Scout was answering. Please try again.";
}

/**
 * Answers a Scout question. The model runs on the server and calls the
 * Spotter MCP server for data; progress and the reply stream back as
 * newline-delimited JSON (see ScoutEvent).
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Forbidden");
  }

  const { allowed, retryAfterSeconds } = rateLimit(clientKey(request));
  if (!allowed) {
    return errorResponse(429, "Too many requests", {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return errorResponse(413, "Conversation too long. Start a new chat.");
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return errorResponse(413, "Conversation too long. Start a new chat.");
    }
    body = JSON.parse(text);
  } catch {
    return errorResponse(400, "Invalid request");
  }

  const { question, transcript } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof question !== "string" ||
    !question.trim() ||
    question.length > MAX_QUESTION_LENGTH ||
    !isTranscript(transcript)
  ) {
    return errorResponse(400, "Invalid request");
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ScoutEvent) => {
        if (request.signal.aborted) return;
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        await runScoutTurn({
          question: question.trim(),
          transcript,
          emit,
          signal: request.signal,
        });
      } catch (error) {
        if (!request.signal.aborted) {
          // Log the error type and HTTP status only, never its details.
          const status =
            error instanceof Anthropic.APIError || error instanceof TokenServiceError
              ? ` ${error.status ?? ""}`
              : "";
          console.error(
            `[scout] turn failed: ${error instanceof Error ? error.constructor.name : "unknown"}${status}`,
          );
          emit({ type: "error", message: describeError(error) });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // The client already went away.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...NO_STORE,
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
