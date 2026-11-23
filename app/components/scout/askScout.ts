export type ScoutRole = "user" | "assistant";

export type ScoutMessage = {
  id: string;
  role: ScoutRole;
  content: string;
};

const PLACEHOLDER_REPLY =
  "Scout isn't connected yet. Once the MCP integration is in place, I'll answer questions about the bank's data here.";

/**
 * Sends a question to Scout and resolves with the assistant's reply.
 *
 * Placeholder: this will call the MCP-backed chat agent. Keep the signature
 * stable so the UI doesn't need to change when the integration lands.
 */
export async function askScout(
  question: string,
  history: readonly ScoutMessage[],
): Promise<string> {
  void question;
  void history;
  return PLACEHOLDER_REPLY;
}
