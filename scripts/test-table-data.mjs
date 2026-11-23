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
