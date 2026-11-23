import "server-only";

import { isGuid, restClient } from "./liveboards";

/**
 * Finds a data model (worksheet or model, "LOGICAL_TABLE" in the REST API)
 * by its exact name, as the lab user sees it. Returns its GUID, or null.
 */
export async function findModelIdByName(name: string): Promise<string | null> {
  const api = await restClient();
  const results = await api.searchMetadata({
    metadata: [{ type: "LOGICAL_TABLE", name_pattern: name }],
    record_size: 50,
  });
  // name_pattern is a partial match, so keep only the exact name.
  const match = results.find(
    (item) => item.metadata_name === name && isGuid(item.metadata_id ?? ""),
  );
  return match?.metadata_id ?? null;
}
