import "server-only";

import {
  ThoughtSpotRestApi,
  createBearerAuthenticationConfig,
  type MetadataSearchResponse,
} from "@thoughtspot/rest-api-sdk";
import { getThoughtSpotToken } from "./token-service";

export type LiveboardSummary = {
  /** The Liveboard GUID, used as the route param and the embed's liveboardId. */
  id: string;
  name: string;
  description: string;
  author: string;
  /** Last modified time, epoch milliseconds. */
  modified: number | null;
};

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGuid(value: string): boolean {
  return GUID_PATTERN.test(value);
}

export async function restClient() {
  const { token, thoughtspotUrl } = await getThoughtSpotToken();
  const host = process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST?.trim() || thoughtspotUrl;
  return new ThoughtSpotRestApi(
    createBearerAuthenticationConfig(new URL(host).origin, async () => token),
  );
}

function toSummary(item: MetadataSearchResponse): LiveboardSummary | null {
  const header = (item.metadata_header ?? {}) as Record<string, unknown>;
  const id = item.metadata_id ?? "";
  if (!isGuid(id) || header.isDeleted === true || header.isHidden === true) {
    return null;
  }
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  return {
    id,
    name: text(item.metadata_name) || "Untitled Liveboard",
    description: text(header.description),
    author: text(header.authorDisplayName) || text(header.authorName) || "Unknown",
    modified: typeof header.modified === "number" ? header.modified : null,
  };
}

/** Every Liveboard the lab user can see, most recently updated first. */
export async function listLiveboards(): Promise<LiveboardSummary[]> {
  const api = await restClient();
  const results = await api.searchMetadata({
    metadata: [{ type: "LIVEBOARD" }],
    record_size: -1,
    sort_options: { field_name: "MODIFIED", order: "DESC" },
  });
  return results.map(toSummary).filter((item) => item !== null);
}

/** One Liveboard by GUID, or null if the lab user can't see it. */
export async function getLiveboard(id: string): Promise<LiveboardSummary | null> {
  if (!isGuid(id)) return null;
  const api = await restClient();
  const results = await api.searchMetadata({
    metadata: [{ type: "LIVEBOARD", identifier: id }],
    record_size: 1,
  });
  const first = results[0];
  return first ? toSummary(first) : null;
}

/**
 * Data for one visualization on a Liveboard, from the REST fetchLiveboardData
 * API, as the raw response (normalized by lib/table-data.ts).
 */
export async function fetchVisualizationData(
  liveboardId: string,
  vizId: string,
  rows: number,
): Promise<unknown> {
  if (!isGuid(liveboardId) || !isGuid(vizId)) {
    throw new Error("Invalid Liveboard or visualization id");
  }
  const api = await restClient();
  return api.fetchLiveboardData({
    metadata_identifier: liveboardId,
    visualization_identifiers: [vizId],
    record_offset: 0,
    record_size: rows,
    data_format: "COMPACT",
  });
}
