"use client";

import { useState, type MouseEvent, type Ref } from "react";
import { AlertIcon, CloseIcon } from "../../components/icons";
import {
  MAX_ROWS,
  formatCell,
  sortRows,
  type SortDirection,
  type TableResult,
} from "@/lib/table-data";

export type TableDialogState =
  | { status: "loading"; title: string }
  | { status: "ready"; title: string; table: TableResult }
  | { status: "error"; title: string; message: string };

/**
 * The "View as table" dialog: a native <dialog> the parent opens with
 * showModal() as soon as the action is clicked. Escape (the dialog's cancel),
 * the × button, and a click on the backdrop all close it.
 */
export default function TableDialog({
  ref,
  state,
  requestId,
  onClose,
}: {
  ref: Ref<HTMLDialogElement>;
  state: TableDialogState | null;
  /** Changes with every click, so sorting resets for each new table. */
  requestId: number;
  onClose: () => void;
}) {
  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // The dialog element itself only receives clicks outside the panel.
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="table-dialog-title"
      className="m-auto w-[min(960px,calc(100vw-2rem))] max-w-none rounded-xl p-0 text-ink shadow-2xl shadow-brand-950/30 backdrop:bg-brand-950/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[min(720px,calc(100dvh-4rem))] flex-col">
        <header className="flex items-start gap-3 border-b border-line bg-white px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.12em] text-brand-700 uppercase">
              View as table
            </p>
            <h2 id="table-dialog-title" className="mt-0.5 truncate text-lg font-bold tracking-tight">
              {state?.title ?? "Visualization data"}
            </h2>
            {state?.status === "ready" && (
              <p className="mt-0.5 text-sm text-muted">
                {state.table.truncated
                  ? `First ${MAX_ROWS} rows`
                  : `${state.table.rows.length} ${state.table.rows.length === 1 ? "row" : "rows"}`}
                {" · "}
                {state.table.columns.length}{" "}
                {state.table.columns.length === 1 ? "column" : "columns"}
              </p>
            )}
          </div>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Close"
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-brand-50 hover:text-brand-900"
            >
              <CloseIcon className="size-5" />
            </button>
          </form>
        </header>

        <div className="min-h-48 flex-1 overflow-auto bg-surface">
          {state?.status === "loading" && (
            <div role="status" className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-muted">
              <span className="size-7 animate-spin rounded-full border-3 border-brand-200 border-t-brand-700" />
              Loading data…
            </div>
          )}
          {state?.status === "error" && (
            <div role="alert" className="flex h-48 items-center justify-center p-6">
              <p className="flex max-w-md items-start gap-2.5 text-sm text-ink">
                <AlertIcon className="mt-0.5 size-5 shrink-0 text-loss" />
                {state.message}
              </p>
            </div>
          )}
          {state?.status === "ready" && <DataTable key={requestId} table={state.table} />}
        </div>
      </div>
    </dialog>
  );
}

function DataTable({ table }: { table: TableResult }) {
  const [sort, setSort] = useState<{ column: string; direction: SortDirection } | null>(null);
  const rows = sort ? sortRows(table.rows, sort.column, sort.direction) : table.rows;

  function toggleSort(column: string) {
    setSort((current) =>
      current?.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    );
  }

  return (
    <table className="w-full border-separate border-spacing-0 text-left text-sm">
      <thead>
        <tr>
          {table.columns.map((column) => {
            const active = sort?.column === column.name;
            return (
              <th
                key={column.name}
                scope="col"
                aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                className="sticky top-0 z-10 border-b border-line bg-white p-0 font-semibold whitespace-nowrap"
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.name)}
                  className={`flex w-full items-center gap-1 px-4 py-2.5 transition-colors hover:bg-brand-50 hover:text-brand-900 ${
                    column.numeric ? "justify-end" : ""
                  } ${active ? "text-brand-800" : "text-ink"}`}
                >
                  {column.name}
                  <span aria-hidden="true" className={`text-xs ${active ? "" : "text-line"}`}>
                    {active && sort.direction === "desc" ? "▼" : "▲"}
                  </span>
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="bg-white">
        {rows.map((row, index) => (
          <tr key={index} className="hover:bg-brand-50/60">
            {table.columns.map((column) => (
              <td
                key={column.name}
                className={`border-b border-line px-4 py-2 whitespace-nowrap ${
                  column.numeric ? "text-right tabular-nums" : ""
                } ${row[column.name] === null ? "text-muted" : ""}`}
              >
                {row[column.name] === null ? "—" : formatCell(row[column.name], column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
