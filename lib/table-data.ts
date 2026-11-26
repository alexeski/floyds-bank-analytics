/**
 * Thin adapter around tse-data-classes that turns any data payload from an
 * embedded visualization into a capped table for the "View as table" dialog.
 * The package does the parsing; this module only applies the rules the
 * dialog needs: usable-or-reject, the row cap, and dates. The package drops
 * column types, so dates are found from the source's own column metadata
 * (dataType and timeBucket) and shown at the right grain (Dec 2025, Q4 2025).
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

/** How finely a date column is shown, from its ThoughtSpot time bucket. */
export type DateGrain = "datetime" | "day" | "week" | "month" | "quarter" | "year";

export type TableColumn = {
  name: string;
  /** Every non-empty value is a number: right-align it. */
  numeric: boolean;
  /** Values are dates, stored as epoch milliseconds: format them in UTC. */
  date: boolean;
  /** For date columns: the grain to show them at. */
  grain?: DateGrain;
};

export type TableResult = {
  columns: TableColumn[];
  rows: Record<string, TableCell>[];
  /** True when the source had more than MAX_ROWS rows. */
  truncated: boolean;
};

export type SortDirection = "asc" | "desc";

/** What a source says about one column: its data type and time bucket. */
type ColumnMeta = { dataType?: string; timeBucket?: string };

/**
 * Reads column metadata from an embedAnswerData or fetchData `columns` array,
 * whose entries are { column: { name, dataType, timeBucket } }. Keyed by
 * lower-cased name, the way the package matches column names.
 */
function columnMetaFrom(columns: unknown): Map<string, ColumnMeta> {
  const meta = new Map<string, ColumnMeta>();
  if (!Array.isArray(columns)) return meta;
  for (const entry of columns) {
    if (typeof entry !== "object" || entry === null) continue;
    const column = ((entry as { column?: unknown }).column ?? entry) as Record<string, unknown>;
    if (typeof column.name !== "string") continue;
    meta.set(column.name.toLowerCase(), {
      dataType: typeof column.dataType === "string" ? column.dataType : undefined,
      timeBucket: typeof column.timeBucket === "string" ? column.timeBucket : undefined,
    });
  }
  return meta;
}

const BUCKET_GRAIN: Record<string, DateGrain> = {
  HOURLY: "datetime",
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  QUARTERLY: "quarter",
  YEARLY: "year",
};

/**
 * The grain for a column the source typed. Buckets like MONTH_OF_YEAR or
 * DAY_OF_WEEK are small numbers, not timestamps, so they aren't dates here.
 */
function grainFromMeta({ dataType, timeBucket }: ColumnMeta): DateGrain | null {
  if (timeBucket && BUCKET_GRAIN[timeBucket]) return BUCKET_GRAIN[timeBucket];
  if (timeBucket && timeBucket !== "NO_BUCKET" && timeBucket !== "AUTO") return null;
  if (dataType === "DATE") return "day";
  if (dataType === "DATE_TIME") return "datetime";
  return null;
}

/**
 * The grain for an untyped column (the REST fallback has names only), from
 * ThoughtSpot's bucketed column names such as "Month(Statement Date)".
 */
function grainFromName(name: string): DateGrain | null {
  const bucket = /^(hour|day|week|month|quarter|year)(?:ly)?\s*\(/i.exec(name.trim())?.[1]?.toLowerCase();
  if (!bucket) return null;
  return bucket === "hour" ? "datetime" : (bucket as DateGrain);
}

/** Epoch seconds between 1973 and 2286: a timestamp, not a count or an ID-like small number. */
function isEpochSeconds(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1e8 && value < 1e10;
}

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
 * it isn't usable (invalid or no rows). `meta` is the source's column
 * metadata, when it has any, used to find date columns.
 */
export function toTable(
  data: TabularData | undefined,
  source: string,
  meta: Map<string, ColumnMeta> = new Map(),
): TableResult | null {
  if (!data) return null;
  logIssues(source, data);
  if (!data.isValid || data.nbrRows === 0) return null;

  const names = data.columnNames;
  const objects = data.getDataAsObjects() as Record<string, unknown>[];
  const truncated = objects.length > MAX_ROWS;
  const raw = objects.slice(0, MAX_ROWS);

  const columns: TableColumn[] = names.map((name) => {
    const values = raw.map((row) => row[name]).filter((v) => v !== null && v !== undefined);
    const typed = meta.get(name.toLowerCase());
    const grainHint = typed ? grainFromMeta(typed) : grainFromName(name);
    let grain: DateGrain | null = null;
    if (values.length > 0 && values.every((v) => dateBucketSeconds(v) !== null)) {
      grain = grainHint ?? "day";
    } else if (grainHint && values.length > 0 && values.every(isEpochSeconds)) {
      // Typed or bucketed date columns arrive as plain epoch seconds.
      grain = grainHint;
    }
    const date = grain !== null;
    const numeric =
      !date && values.length > 0 && values.every((v) => typeof v === "number" && Number.isFinite(v));
    return date ? { name, numeric, date, grain: grain! } : { name, numeric, date };
  });

  const rows = raw.map((row) => {
    const out: Record<string, TableCell> = {};
    for (const column of columns) {
      const value = row[column.name];
      if (column.date) {
        const seconds = isEpochSeconds(value) ? value : dateBucketSeconds(value);
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
    embedAnswerData?: object;
    data?: { embedAnswerData?: object } | null;
  };
  const embedAnswerData = p.embedAnswerData ?? p.data?.embedAnswerData;
  if (!embedAnswerData) return null;
  return toTable(
    ActionData.createFromJSON(payload as Parameters<typeof ActionData.createFromJSON>[0]),
    "embedAnswerData",
    columnMetaFrom((embedAnswerData as { columns?: unknown }).columns),
  );
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
  const { columns } = result as { columns?: unknown };
  if (!Array.isArray(columns)) return null;
  return toTable(
    ActionData.createFromJSON(wrapped as Parameters<typeof ActionData.createFromJSON>[0]),
    "answerService",
    columnMetaFrom(columns),
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
  const p = payload as { columns?: unknown; embedAnswerData?: { columns?: unknown } };
  const meta = columnMetaFrom(p.embedAnswerData?.columns ?? p.columns);
  return isTabularData(data) ? toTable(data, "unknown payload", meta) : null;
}

/** Sorts a copy of the rows: numeric-aware, empty values last in both directions. */
export function sortRows(
  rows: readonly Record<string, TableCell>[],
  column: string,
  direction: SortDirection,
): Record<string, TableCell>[] {
  return sortObjects([...rows], column, direction);
}

const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const DAY_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});
const MONTH = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const NUMBER_FORMAT = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

/** Formats epoch milliseconds at a column's grain, in UTC (ThoughtSpot's buckets are UTC). */
function formatDate(ms: number, grain: DateGrain = "day"): string {
  const date = new Date(ms);
  switch (grain) {
    case "datetime":
      return DAY_TIME.format(date);
    case "week":
      return `Week of ${DAY.format(date)}`;
    case "month":
      return MONTH.format(date);
    case "quarter":
      return `Q${Math.floor(date.getUTCMonth() / 3) + 1} ${date.getUTCFullYear()}`;
    case "year":
      return String(date.getUTCFullYear());
    default:
      return DAY.format(date);
  }
}

/** Formats a cell for display. Date columns are formatted in UTC at their grain. */
export function formatCell(value: TableCell, column: TableColumn): string {
  if (value === null) return "";
  if (column.date && typeof value === "number") return formatDate(value, column.grain);
  if (typeof value === "number") return NUMBER_FORMAT.format(value);
  return String(value);
}
