// GENERATED from starter/src/components/kit/AdvancedDataGrid.jsx (sha256:14005b449a00b5fd). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { useMemo, useState } from "react";
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table";

import { formatCell } from "./format.js";
import { Button } from "./Button.jsx";

// AdvancedDataGrid — a searchable, sortable work surface for large record sets, built on
// @tanstack/react-table. `DataGrid` remains the lighter choice for a short dashboard list; this one
// is for a screen whose main job IS the table.
//
// It moved here from components/kf on 15 Sep 2026, when the two component folders became one. Its
// legacy name is exported beside the canonical one because generated applications import
// `@/components/kf/DataGrid.jsx` and expect THIS API — a path the build maps here, never to the
// lighter kit DataGrid, which takes different columns.

/**
 * columns: [{ key, label, width?, align?: 'left'|'right', render?: (row) => node }]
 * rows: array of objects — straight from the SDK, no reshaping needed.
 */
function AdvancedDataGrid({ columns = [], rows = [], search = true, emptyText = "Nothing here yet.", maxHeight = 460, onOpen, openLabel = "Open" }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const normalized = useMemo(() => {
    const result = columns.map((column) => typeof column === "string" ? { key: column, label: column } : column);
    if (onOpen) result.push({ key: "__open", label: "Actions", render: (row) => <Button rank="quiet" onClick={() => onOpen(row)}>{openLabel}</Button> });
    return result;
  }, [columns, onOpen, openLabel]);
  const cols = useMemo(() => normalized.map((column) => ({
    id: column.key,
    accessorFn: (row) => row?.[column.key],
    header: column.label ?? column.key,
    cell: (context) => (column.render ? column.render(context.row.original) : formatCell(context.getValue())),
    meta: { align: column.align, width: column.width },
  })), [normalized]);

  const table = useReactTable({
    data: rows,
    columns: cols,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const body = table.getRowModel().rows;
  const tableMinWidth = normalized.reduce((total, column) => {
    const declared = Number.parseFloat(column?.width);
    return total + (Number.isFinite(declared) ? declared : column?.key === "actions" ? 216 : 136);
  }, 0);

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: "var(--ctl-surface)", borderColor: "var(--ctl-border)" }}
    >
      {search ? (
        <div className="border-b p-3" style={{ background: "var(--ctl-raise)", borderColor: "var(--ctl-border)" }}>
          <input
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={`Search ${rows.length} row${rows.length === 1 ? "" : "s"}…`}
            className="w-full rounded-lg border border-solid border-field-border bg-field-surface px-4 py-3 text-sm text-ctl-fg placeholder:text-field-placeholder shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
            style={{ borderColor: "var(--ctl-border)" }}
          />
        </div>
      ) : null}

      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full text-sm" style={{ minWidth: `${tableMinWidth}px` }}>
          <thead className="sticky top-0 z-10" style={{ background: "var(--ctl-raise)" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-0 border-b border-solid border-ctl-border">
                {headerGroup.headers.map((header) => {
                  const direction = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.column.columnDef.meta?.width, minWidth: header.column.columnDef.meta?.width }}
                      className={`cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ctl-fg-muted ${
                        header.column.columnDef.meta?.align === "right" ? "text-right" : "text-left"
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {direction ? <span className="ml-1">{direction === "asc" ? "▲" : "▼"}</span> : null}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {body.length ? body.map((row) => (
              <tr key={row.id} data-cx-row={row.original?._id || row.id} className="border-b last:border-0 hover:bg-ctl-raise" style={{ borderColor: "var(--ctl-border)" }}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{ minWidth: cell.column.columnDef.meta?.width }}
                    className={`px-4 py-3 ${cell.column.columnDef.meta?.align === "right" ? "text-right tabular-nums" : ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={cols.length || 1} className="px-4 py-10 text-center text-ctl-fg-muted">
                  {globalFilter ? `Nothing matches “${globalFilter}”.` : emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { AdvancedDataGrid };
/** The name this component had in components/kf. Same implementation, same props. */
export { AdvancedDataGrid as DataGrid };
export default AdvancedDataGrid;
