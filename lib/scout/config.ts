import "server-only";

/**
 * Reads Scout's settings from the environment. Values are normalized
 * defensively (quotes, whitespace, missing scheme, trailing slashes, a
 * trailing /v1) and are never logged.
 */

export class ScoutConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScoutConfigError";
  }
}

const DEFAULT_MAX_TOKENS = 16_000;

function clean(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .trim();
}

function requireValue(name: string): string {
  const value = clean(process.env[name]);
  if (!value) throw new ScoutConfigError(`Missing environment variable ${name}`);
  return value;
}

function parseUrl(name: string): URL {
  let value = requireValue(name);
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      throw new ScoutConfigError(`${name} must use https`);
    }
    return url;
  } catch (error) {
    if (error instanceof ScoutConfigError) throw error;
    throw new ScoutConfigError(`${name} is not a valid URL`);
  }
}

export type ScoutConfig = {
  llm: { baseUrl: string; apiKey: string; model: string; maxTokens: number };
  mcpUrl: URL;
  /** Host of the ThoughtSpot instance, sent to the MCP server as x-ts-host. */
  thoughtSpotHost: string;
};

export function readScoutConfig(): ScoutConfig {
  const llmUrl = parseUrl("LITELLM_URL");
  // The Anthropic SDK appends /v1/messages itself.
  const llmPath = llmUrl.pathname.replace(/\/+$/, "").replace(/\/v1$/i, "");

  const maxTokens = Number.parseInt(clean(process.env.LITELLM_MAX_TOKENS), 10);

  return {
    llm: {
      baseUrl: `${llmUrl.origin}${llmPath}`,
      apiKey: requireValue("LITELLM_API_KEY"),
      model: requireValue("LITELLM_MODEL"),
      maxTokens:
        Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : DEFAULT_MAX_TOKENS,
    },
    mcpUrl: parseUrl("TS_MCP_URL"),
    thoughtSpotHost: parseUrl("NEXT_PUBLIC_THOUGHTSPOT_HOST").host,
  };
}
