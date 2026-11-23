/** Number formatting shared by the Overview page's server and client code. */

/** $962.1M, $1.08B, $8.9K. */
export function money(value: number): string {
  if (!Number.isFinite(value)) return "\u2014";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(abs >= 1e10 ? 1 : 2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/** 107.8K, 1.2M, 950. */
export function count(value: number): string {
  if (!Number.isFinite(value)) return "\u2014";
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e4) return `${(value / 1e3).toFixed(1)}K`;
  return Math.round(value).toLocaleString("en-US");
}

/** +10.0%, −2.4% (true minus sign). */
export function signedPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "\u2014";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function percentChange(from: number, to: number): number {
  return from === 0 ? 0 : ((to - from) / from) * 100;
}

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Dec", or "Dec 25" when the year should show. */
export function monthLabel(epochMs: number, withYear = false): string {
  if (!withYear) return MONTH.format(epochMs);
  const date = new Date(epochMs);
  return `${MONTH.format(epochMs)} ${String(date.getUTCFullYear()).slice(2)}`;
}

/** "Nov 2026". */
export function monthYear(epochMs: number): string {
  return MONTH_YEAR.format(epochMs);
}

/**
 * Series colors, validated with the dataviz palette checker (lightness,
 * chroma, color-blind separation, contrast). Green and orange sit in the
 * color-blind warning band, so lines are always labelled directly as well.
 */
export const SERIES = {
  savings: "#00825f",
  checking: "#2a78d6",
  cards: "#eb6834",
} as const;

export type NumberFormat = "money" | "count" | "integer" | "decimal2" | "percent";

/** One switch for every number style on the page (serializable across the server boundary). */
export function formatNumber(value: number, kind: NumberFormat): string {
  // Missing figures (e.g. before the page is connected to live data).
  if (!Number.isFinite(value)) return "\u2014";
  switch (kind) {
    case "money":
      return money(value);
    case "count":
      return count(value);
    case "integer":
      return Math.round(value).toLocaleString("en-US");
    case "decimal2":
      return value.toFixed(2);
    case "percent":
      return signedPercent(value);
  }
}
