import { FETCH_ROWS } from "@/lib/table-data";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-guards";
import { fetchVisualizationData, isGuid } from "@/lib/thoughtspot/liveboards";

const REQUESTS_PER_MINUTE = 20;
const ONE_MINUTE_MS = 60_000;

const rateLimit = createRateLimiter(REQUESTS_PER_MINUTE, ONE_MINUTE_MS);

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(status: number, error: string, headers: HeadersInit = {}) {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } });
}

/**
 * Returns the first rows of one visualization's data for the "View as table"
 * dialog, used only when the custom action payload carried no data.
 * GET /api/thoughtspot/liveboard-data?liveboardId=<guid>&vizId=<guid>
 */
export async function GET(request: Request) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Forbidden");
  }

  const { allowed, retryAfterSeconds } = rateLimit(clientKey(request));
  if (!allowed) {
    return errorResponse(429, "Too many requests", {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  const params = new URL(request.url).searchParams;
  const liveboardId = params.get("liveboardId") ?? "";
  const vizId = params.get("vizId") ?? "";
  if (!isGuid(liveboardId) || !isGuid(vizId)) {
    return errorResponse(400, "Invalid request");
  }

  try {
    const data = await fetchVisualizationData(liveboardId, vizId, FETCH_ROWS);
    return Response.json(data, { headers: NO_STORE });
  } catch (error) {
    console.error(
      "[liveboard-data] fetch failed:",
      error instanceof Error ? error.constructor.name : "unknown error",
    );
    return errorResponse(502, "Unable to load the visualization data");
  }
}
