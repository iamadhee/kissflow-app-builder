// GENERATED from starter/src/components/kit/CsvImport.jsx (sha256:fb788f95853c4273). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { useCallback, useState } from "react";
import Papa from "papaparse";

import { Alert } from "./Alert.jsx";
import { FileDrop } from "./FileDrop.jsx";
import { Table } from "./Table.jsx";

// Getting a spreadsheet into the app, which is how most real data arrives.
//
// Two components, one job: the shared FileDrop provides the keyboard-accessible drop target and
// papaparse provides streaming parsing, quoted fields, embedded newlines, and BOM handling.
// Splitting on commas by hand works until the first address field with a comma in it, and then it
// silently shifts every column right for that row only.
//
// It PREVIEWS and hands back rows. It does not write anything: only the page knows which model these
// belong to and whether they need mapping first, and an import that writes on drop is an import with
// no undo.

/**
 * onRows: (rows, meta) => void — rows are objects keyed by the header line.
 * Nothing is persisted here; call createItem yourself once the user confirms.
 */
export function CsvImport({ onRows, maxPreview = 5, maxSizeMb = 10, label = "Drop a CSV here, or click to choose" }) {
  const [state, setState] = useState({ rows: [], errors: [], file: null, parsing: false });

  const onDrop = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setState({
        rows: [],
        errors: [{ message: `File exceeds the ${maxSizeMb}MB limit.` }],
        file,
        parsing: false,
      });
      return;
    }
    setState((current) => ({ ...current, parsing: true, file, errors: [] }));
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",     // a trailing newline is not a row of empty fields
      dynamicTyping: false,         // keep everything a string: "007" and "1.10" must survive intact
      complete: ({ data, errors, meta }) => {
        setState({ rows: data, errors: errors.slice(0, 3), file, parsing: false });
        onRows?.(data, meta);
      },
      error: (error) => setState({ rows: [], errors: [{ message: error.message }], file, parsing: false }),
    });
  }, [maxSizeMb, onRows]);

  const cols = state.rows.length ? Object.keys(state.rows[0]) : [];
  const previewRows = state.rows.slice(0, maxPreview);
  const previewColumns = cols.map((column, index) => ({
    key: column,
    label: column,
    sizing: index === 0 ? "balanced" : "auto",
    render: (row) => String(row[column] ?? ""),
  }));

  return (
    <div data-kf-component="csv-import" className="flex w-full flex-col gap-4">
      <FileDrop
        accept=".csv,text/csv,text/plain"
        files={state.file ? [state.file] : []}
        onFiles={onDrop}
        onRemove={state.parsing ? undefined : () => setState({ rows: [], errors: [], file: null, parsing: false })}
        disabled={state.parsing}
        invalid={state.errors.length > 0}
        label={state.parsing ? "Reading CSV…" : label}
        hint={`CSV up to ${maxSizeMb}MB`}
      />

      {state.errors.length ? (
        <Alert tone="danger" title="Could not read this CSV">
          {state.errors.map((error) => (
            error.row == null ? error.message : `Row ${error.row}: ${error.message}`
          )).join(" · ")}
        </Alert>
      ) : null}

      {state.rows.length ? (
        <div className="flex min-w-0 flex-col gap-3">
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-solid border-ctl-border px-4 py-3"
            style={{ background: "var(--ctl-raise)" }}
          >
            <span className="min-w-0 truncate text-sm font-semibold text-ctl-fg">{state.file?.name}</span>
            <span className="shrink-0 text-xs text-ctl-fg-muted tabular-nums">
              {state.rows.length} row{state.rows.length === 1 ? "" : "s"} · showing first {previewRows.length}
            </span>
          </div>
          <Table
            columns={previewColumns}
            rows={previewRows}
            empty="This CSV contains no data rows."
          />
        </div>
      ) : null}
    </div>
  );
}

/** The other direction. Downloads client-side — no endpoint, nothing leaves the browser. */
export function downloadCsv(rows = [], filename = "export.csv") {
  if (!rows.length) return;
  const csv = Papa.unparse(rows);
  // the BOM is what makes Excel open a UTF-8 file without mangling every accented character
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
