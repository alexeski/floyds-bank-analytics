// Checks the "View as table" adapter (lib/table-data.ts) against sample payloads.
// Usage: node --no-warnings scripts/test-table-data.mjs   (Node 22.18+ runs the .ts import directly)

import assert from "node:assert/strict";
import {
  FETCH_ROWS,
  MAX_ROWS,
  formatCell,
  sortRows,
  tableFromAnswerService,
  tableFromEmbedAnswerData,
  tableFromLiveboardData,
  tableFromUnknown,
} from "../lib/table-data.ts";

// Keep the package's structure-only warnings out of the test output.
console.warn = () => {};

const VIZ = "11111111-2222-3333-4444-555555555555";

const columns = [
  { column: { id: "c1", name: "Region" } },
  { column: { id: "c2", name: "Balance" } },
  { column: { id: "c3", name: "Month" } },
];
const series = [
  { columnId: "c1", dataValue: ["London", "Scotland", null] },
  { columnId: "c2", dataValue: [1200.5, 300, 75] },
  { columnId: "c3", dataValue: [{ v: { s: 1767225600 } }, { v: { s: 1769904000 } }, null] },
];

const rowArrays = (n) => ({
  column_names: ["Customer", "Score"],
  data_rows: Array.from({ length: n }, (_, i) => [`Customer ${i + 1}`, i + 1]),
});

const tests = {
  "columnar, wrapped (data is an array of data sets)"() {
    const t = tableFromEmbedAnswerData({ embedAnswerData: { columns, data: [{ columnDataLite: series }] } });
    assert.deepEqual(t.columns.map((c) => c.name), ["Region", "Balance", "Month"]);
    assert.equal(t.rows.length, 3);
    assert.equal(t.truncated, false);
  },
  "columnar, unwrapped (data is a single data set, under payload.data)"() {
    const t = tableFromEmbedAnswerData({ data: { embedAnswerData: { columns, data: { columnDataLite: series } } } });
    assert.equal(t.rows.length, 3);
    assert.equal(t.rows[0].Region, "London");
  },
  "a payload that also has contextMenuPoints still reads embedAnswerData"() {
    const t = tableFromEmbedAnswerData({
      type: "customAction",
      data: { id: "view-as-table", contextMenuPoints: { selectedPoints: [] }, embedAnswerData: { columns, data: [{ columnDataLite: series }] } },
    });
    assert.equal(t.rows.length, 3);
  },
  "more columns than data series (hidden columns are dropped)"() {
    const extra = [...columns, { column: { id: "c4", name: "Hidden" } }];
    const t = tableFromEmbedAnswerData({ embedAnswerData: { columns: extra, data: [{ columnDataLite: series }] } });
    assert.deepEqual(t.columns.map((c) => c.name), ["Region", "Balance", "Month"]);
  },
  "numeric and date-bucket columns are detected; dates are epoch seconds in UTC"() {
    const t = tableFromEmbedAnswerData({ embedAnswerData: { columns, data: [{ columnDataLite: series }] } });
    const [region, balance, month] = t.columns;
    assert.equal(region.numeric, false);
    assert.equal(balance.numeric, true);
    assert.equal(month.date, true);
    assert.equal(t.rows[0].Month, 1767225600 * 1000);
    assert.equal(formatCell(t.rows[0].Month, month), "01 Jan 2026");
    assert.equal(t.rows[2].Month, null);
  },
  "typed date columns (plain epoch seconds) are shown at their time bucket"() {
    // The real shape: dates arrive as INT64 epoch seconds; only the column metadata says they're dates.
    const col = (id, name, dataType, timeBucket) => ({ column: { id, name, dataType, timeBucket } });
    const typed = [
      col("m", "Month(Statement Date)", "DATE", "MONTHLY"),
      col("q", "Quarter(Statement Date)", "DATE", "QUARTERLY"),
      col("y", "Year(Statement Date)", "DATE", "YEARLY"),
      col("w", "Week(Statement Date)", "DATE", "WEEKLY"),
      col("d", "Statement Date", "DATE", "NO_BUCKET"),
      col("t", "Opened At", "DATE_TIME", "NO_BUCKET"),
      col("moy", "Month of Year(Statement Date)", "DATE", "MONTH_OF_YEAR"),
      col("b", "Average Balance", "DOUBLE", "NO_BUCKET"),
      col("id", "Account Number", "INT64", "NO_BUCKET"),
    ];
    const dec2025 = 1764547200; // 1 Dec 2025 00:00 UTC
    const data = [{ columnDataLite: [
      { columnId: "m", dataValue: [dec2025] },
      { columnId: "q", dataValue: [dec2025] },
      { columnId: "y", dataValue: [dec2025] },
      { columnId: "w", dataValue: [dec2025] },
      { columnId: "d", dataValue: [dec2025] },
      { columnId: "t", dataValue: [dec2025 + 14 * 3600] },
      { columnId: "moy", dataValue: [12] },
      { columnId: "b", dataValue: [8194.89] },
      { columnId: "id", dataValue: [1764547201] },
    ] }];
    for (const t of [
      tableFromEmbedAnswerData({ data: { embedAnswerData: { columns: typed, data } } }),
      tableFromAnswerService({ columns: typed, data }),
    ]) {
      const shown = Object.fromEntries(t.columns.map((c) => [c.name, formatCell(t.rows[0][c.name], c)]));
      assert.equal(shown["Month(Statement Date)"], "Dec 2025");
      assert.equal(shown["Quarter(Statement Date)"], "Q4 2025");
      assert.equal(shown["Year(Statement Date)"], "2025");
      assert.equal(shown["Week(Statement Date)"], "Week of 01 Dec 2025");
      assert.equal(shown["Statement Date"], "01 Dec 2025");
      assert.equal(shown["Opened At"], "01 Dec 2025, 14:00");
      assert.equal(shown["Month of Year(Statement Date)"], "12", "MONTH_OF_YEAR is a number, not a timestamp");
      assert.equal(shown["Account Number"], "1,764,547,201", "an untimed INT64 stays a number");
      const month = t.columns.find((c) => c.name === "Month(Statement Date)");
      assert.equal(month.numeric, false);
      assert.equal(t.rows[0]["Month(Statement Date)"], dec2025 * 1000, "stored as ms, so it sorts by time");
    }
  },
  "REST data has names only: bucketed names are dates, other numbers are not"() {
    const payload = {
      metadata_id: "lb",
      contents: [{
        visualization_id: VIZ,
        visualization_name: "Trend",
        column_names: ["Month(Statement Date)", "Average Monthly Savings Balance", "Customer ID"],
        data_rows: [[1764547200, 8194.89, 1764547200], [1767225600, 8260.95, 1767225600]],
      }],
    };
    const t = tableFromLiveboardData(payload, VIZ);
    const [month, balance, id] = t.columns;
    assert.equal(month.date, true);
    assert.equal(formatCell(t.rows[1][month.name], month), "Jan 2026");
    assert.equal(balance.numeric, true);
    assert.equal(id.date, false, "no bucket in the name: left as a number");
  },
  "answerService.fetchData result ({ columns, data }) is read"() {
    const t = tableFromAnswerService({ columns, data: [{ columnDataLite: series }] });
    assert.equal(t.rows.length, 3);
  },
  "row arrays: answer { contents } shape"() {
    const t = tableFromAnswerService({ metadata_id: "x", contents: [rowArrays(5)] });
    assert.equal(t.rows.length, 5);
    assert.equal(t.rows[4].Score, 5);
  },
  "row arrays: REST liveboard data, one viz by id"() {
    const payload = {
      metadata_id: "lb",
      contents: [{ visualization_id: VIZ, visualization_name: "Scores", ...rowArrays(7) }],
    };
    const t = tableFromLiveboardData(payload, VIZ);
    assert.equal(t.rows.length, 7);
    assert.equal(tableFromLiveboardData(payload, "00000000-0000-0000-0000-000000000000"), null);
  },
  "101-row cap: 101 rows become 100 plus truncated"() {
    assert.equal(FETCH_ROWS, 101);
    const t = tableFromAnswerService({ metadata_id: "x", contents: [rowArrays(FETCH_ROWS)] });
    assert.equal(t.rows.length, MAX_ROWS);
    assert.equal(t.truncated, true);
    const exact = tableFromAnswerService({ metadata_id: "x", contents: [rowArrays(MAX_ROWS)] });
    assert.equal(exact.truncated, false);
  },
  "empty results are not usable"() {
    assert.equal(tableFromAnswerService({ metadata_id: "x", contents: [rowArrays(0)] }), null);
    assert.equal(tableFromEmbedAnswerData({ embedAnswerData: { columns, data: [{ columnDataLite: [] }] } }), null);
  },
  "unknown shapes are rejected, not shown as an empty table"() {
    assert.equal(tableFromUnknown({ foo: 1 }), null);
    assert.equal(tableFromUnknown(null), null);
    assert.equal(tableFromEmbedAnswerData({ foo: 1 }), null);
    assert.equal(tableFromAnswerService("nope"), null);
    assert.notEqual(tableFromUnknown({ embedAnswerData: { columns, data: [{ columnDataLite: series }] } }), null);
  },
  "sorting is numeric-aware with empty values last, both directions"() {
    const rows = [{ v: 10 }, { v: null }, { v: 9 }, { v: 100 }];
    assert.deepEqual(sortRows(rows, "v", "asc").map((r) => r.v), [9, 10, 100, null]);
    assert.deepEqual(sortRows(rows, "v", "desc").map((r) => r.v), [100, 10, 9, null]);
    assert.deepEqual(rows.map((r) => r.v), [10, null, 9, 100], "input is not mutated");
  },
};

let failed = 0;
for (const [name, run] of Object.entries(tests)) {
  try {
    run();
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}\n      ${error.message}`);
  }
}
console.log(`\n${Object.keys(tests).length - failed}/${Object.keys(tests).length} passed`);
process.exit(failed ? 1 : 0);
