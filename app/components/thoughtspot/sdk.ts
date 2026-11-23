import "client-only";

import { EMBED_CUSTOMIZATIONS } from "./theme";

const TOKEN_ROUTE = "/api/thoughtspot/token";

/**
 * Fetches a ThoughtSpot token from this app's server, which gets it from the
 * token service, so no credentials reach the browser beyond the short-lived
 * token itself. Passed to the SDK as `getAuthToken`.
 */
export async function getAuthToken(): Promise<string> {
  const response = await fetch(TOKEN_ROUTE, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }
  const { token } = (await response.json()) as { token: string };
  return token;
}

// Kept on globalThis rather than in a module variable so that a hot reload of
// this file in development can't run init() a second time.
const state = globalThis as typeof globalThis & {
  __thoughtSpotInit?: Promise<void> | null;
};

/**
 * Initializes the Visual Embed SDK exactly once for the whole app and returns
 * a promise that resolves when it is ready. Every caller shares the same
 * promise, so embeds can await it no matter which component mounts first.
 * If initialization fails, the next call tries again.
 */
export function initThoughtSpot(username: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The analytics embed only runs in the browser."));
  }

  state.__thoughtSpotInit ??= (async () => {
    const thoughtSpotHost = process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST;
    if (!thoughtSpotHost) {
      throw new Error("NEXT_PUBLIC_THOUGHTSPOT_HOST is not set in .env.local.");
    }
    if (!username) {
      throw new Error("TS_USERNAME is not set in .env.local.");
    }
    // Fail early, with a readable error, if the token service can't issue a token.
    await getAuthToken();

    // Imported here because the SDK warns when loaded during server rendering.
    const { AuthType, init } = await import("@thoughtspot/visual-embed-sdk");
    init({
      thoughtSpotHost,
      authType: AuthType.TrustedAuthTokenCookieless,
      username,
      getAuthToken,
      // Brand styling, wording, and icon for every embed. Read only here, once
      // per page load: reload the page fully to see changes to the theme.
      customizations: EMBED_CUSTOMIZATIONS,
    });
  })().catch((error: unknown) => {
    state.__thoughtSpotInit = null;
    throw error;
  });

  return state.__thoughtSpotInit;
}
