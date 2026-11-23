import { EmbedErrorCodes, EmbedErrorSeverity } from "@thoughtspot/visual-embed-sdk";

export type EmbedErrorSummary = {
  code: string;
  message: string;
  /** True when the embed can't work: show it to the user, not just the console. */
  fatal: boolean;
};

const FATAL_CODES: ReadonlySet<string> = new Set([
  EmbedErrorCodes.INIT_ERROR,
  EmbedErrorCodes.LOGIN_FAILED,
]);

/**
 * Reads an EmbedEvent.Error payload. The SDK sends its own errors flat
 * ({ code, errorType, message, severity }), while errors relayed from the
 * embedded ThoughtSpot app can arrive nested under `data`, so check both.
 */
export function summarizeEmbedError(payload: unknown): EmbedErrorSummary {
  const outer =
    typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
  const inner =
    typeof outer.data === "object" && outer.data !== null
      ? (outer.data as Record<string, unknown>)
      : {};
  const pick = (key: string) => outer[key] ?? inner[key];

  const rawMessage = pick("message") ?? pick("error");
  const message = Array.isArray(rawMessage)
    ? rawMessage.filter((part) => typeof part === "string").join("; ")
    : typeof rawMessage === "string"
      ? rawMessage
      : "";
  const code = String(pick("code") ?? pick("errorType") ?? "UNKNOWN");
  const severity = pick("severity");

  return {
    code,
    message,
    fatal: FATAL_CODES.has(code) || severity === EmbedErrorSeverity.SEV1,
  };
}

/**
 * Logs an embed error as one readable line. Only fatal errors use
 * console.error: in development, Next.js shows every console.error in its
 * error overlay, and most embed errors are non-fatal.
 */
export function logEmbedError(source: string, summary: EmbedErrorSummary) {
  const line = `[${source}] ${summary.code}${summary.message ? `: ${summary.message}` : ""}`;
  if (summary.fatal) console.error(line);
  else console.warn(line);
}
