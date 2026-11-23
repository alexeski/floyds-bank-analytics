/**
 * Thin adapter around tse-data-classes that turns any data payload from an
 * embedded visualization into a capped table for the "View as table" dialog.
 * The package does the parsing; this module only applies the rules the
 * dialog needs: usable-or-reject, the row cap, and date buckets.
 *
 * Isomorphic (no browser or server APIs) so a Node script can test it.
 */
import {
  ActionData,
  AnswerData,
  LiveboardData,
  DataClassType,
  createDataClass,
  detectDataClassType,
  isTabularData,
  sortObjects,
  type TabularData,
} from "tse-data-classes";

/** Rows shown in the dialog. */
export const MAX_ROWS = 100;
/**
 * Rows requested from ThoughtSpot: one more than shown, so we can tell when
 * there are more. available_data_row_count only echoes the page size.
 */
export const FETCH_ROWS = MAX_ROWS + 1;

export type TableCell = string | number | boolean | null;

export type TableColumn = {
  name: string;
  /** Every non-empty value is a number: right-align it. */
  numeric: boolean;
  /** Values were ThoughtSpot date buckets, now epoch milliseconds: format as dates in UTC. */
  date: boolean;
};

export type TableResult = {
  columns: TableColumn[];
  rows: Record<string, TableCell>[];
  /** True when the source had more than MAX_ROWS rows. */
  truncated: boolean;
};

export type SortDirection = "asc" | "desc";

/** A date bucket cell, shaped { v: { s: <epoch seconds> } }. */
function dateBucketSeconds(value: unknown): number | null {
  if (typeof value !== "object" || value === null) return null;
  const v = (value as { v?: unknown }).v;
  if (typeof v !== "object" || v === null) return null;
  const s = (v as { s?: unknown }).s;
  if (typeof s === "number" && Number.isFinite(s)) return s;
  if (typeof s === "string" && s.trim() !== "" && Number.isFinite(Number(s))) return Number(s);
  return null;
}

function toCell(value: unknown): TableCell {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  return JSON.stringify(value);
}

function logIssues(source: string, data: { errors: readonly string[]; warnings: readonly string[] }) {
  // The package's messages describe structure only (keys and column IDs), never values.
  if (data.errors.length > 0) console.warn(`[table-data] ${source} errors:`, data.errors);
  if (data.warnings.length > 0) console.warn(`[table-data] ${source} warnings:`, data.warnings);
}

/**
 * Converts a parsed TabularData into the dialog's table, or returns null when
 * it isn't usable (invalid or no rows).
 */
export function toTable(data: TabularData | undefined, source: string): TableResult | null {
  if (!data) return null;
  logIssues(source, data);
  if (!data.isValid || data.nbrRows === 0) return null;

  const names = data.columnNames;
  const objects = data.getDataAsObjects() as Record<string, unknown>[];
  const truncated = objects.length > MAX_ROWS;
  const raw = objects.slice(0, MAX_ROWS);

  const columns: TableColumn[] = names.map((name) => {
    const values = raw.map((row) => row[name]).filter((v) => v !== null && v !== undefined);
    const date = values.length > 0 && values.every((v) => dateBucketSeconds(v) !== null);
    const numeric =
      !date && values.length > 0 && values.every((v) => typeof v === "number" && Number.isFinite(v));
    return { name, numeric, date };
  });

  const rows = raw.map((row) => {
    const out: Record<string, TableCell> = {};
    for (const column of columns) {
      const value = row[column.name];
      if (column.date) {
        const seconds = dateBucketSeconds(value);
        out[column.name] = seconds === null ? null : seconds * 1000;
      } else {
        out[column.name] = toCell(value);
      }
    }
    return out;
  });

  return { columns, rows, truncated };
}

/*
 * Each source is checked with detectDataClassType() before it is parsed: the
 * package logs a console.error when a factory gets a payload it can't read,
 * and in development Next.js shows every console.error in its error overlay.
 * A missing source is expected here (we fall back to the next one).
 */

/**
 * The custom action payload: its embedAnswerData (columnar), at the root or
 * under `data`. Presence is checked directly rather than with
 * detectDataClassType(), which classifies a payload that also carries
 * contextMenuPoints as ContextActionData.
 */
export function tableFromEmbedAnswerData(payload: unknown): TableResult | null {
  const p = (typeof payload === "object" && payload !== null ? payload : {}) as {
    embedAnswerData?: unknown;
    data?: { embedAnswerData?: unknown } | null;
  };
  if (!p.embedAnswerData && !p.data?.embedAnswerData) return null;
  return toTable(ActionData.createFromJSON(payload as Parameters<typeof ActionData.createFromJSON>[0]), "embedAnswerData");
}

/**
 * The result of answerService.fetchData(). The SDK returns { columns, data },
 * which is the embedAnswerData (columnar) shape, so it is parsed with
 * ActionData; a { contents } response is parsed with AnswerData.
 */
export function tableFromAnswerService(result: unknown): TableResult | null {
  if (typeof result !== "object" || result === null) return null;
  if (detectDataClassType(result) === DataClassType.AnswerData) {
    return toTable(AnswerData.createFromJSON(result as Parameters<typeof AnswerData.createFromJSON>[0]), "answerService");
  }
  const wrapped = { embedAnswerData: result };
  if (!Array.isArray((result as { columns?: unknown }).columns)) return null;
  return toTable(
    ActionData.createFromJSON(wrapped as Parameters<typeof ActionData.createFromJSON>[0]),
    "answerService",
  );
}

/** The REST fetchLiveboardData response: one visualization from it. */
export function tableFromLiveboardData(payload: unknown, vizId: string): TableResult | null {
  if (detectDataClassType(payload) !== DataClassType.LiveboardData) return null;
  const liveboard = LiveboardData.createFromJSON(payload as Parameters<typeof LiveboardData.createFromJSON>[0]);
  logIssues("liveboardData", liveboard);
  if (!liveboard.isValid) return null;
  return toTable(liveboard.getViz(vizId), "liveboardData viz");
}

/**
 * A payload of unknown type. Unrecognized shapes are rejected (null) rather
 * than shown as an empty table.
 */
export function tableFromUnknown(payload: unknown): TableResult | null {
  if (detectDataClassType(payload) === null) {
    console.warn("[table-data] unrecognized payload shape");
    return null;
  }
  let data;
  try {
    data = createDataClass(payload);
  } catch {
    // createDataClass throws only when the payload matches no known shape.
    console.warn("[table-data] unrecognized payload shape");
    return null;
  }
  return isTabularData(data) ? toTable(data, "unknown payload") : null;
}

/** Sorts a copy of the rows: numeric-aware, empty values last in both directions. */
export function sortRows(
  rows: readonly Record<string, TableCell>[],
  column: string,
  direction: SortDirection,
): Record<string, TableCell>[] {
  return sortObjects([...rows], column, direction);
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const NUMBER_FORMAT = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

/** Formats a cell for display. Date-bucket columns are formatted in UTC. */
export function formatCell(value: TableCell, column: TableColumn): string {
  if (value === null) return "";
  if (column.date && typeof value === "number") return DATE_FORMAT.format(value);
  if (typeof value === "number") return NUMBER_FORMAT.format(value);
  return String(value);
}
