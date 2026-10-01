// GENERATED from starter/src/components/kit/VirtualList.jsx (sha256:d96e4989fd9371e6). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

// A list of ten thousand rows that scrolls like a list of ten.
//
// The alternative the generator reaches for is `.slice(0, 50)` — which is not the same thing, because
// the other 9,950 records silently do not exist and nothing on screen says so. This renders only what
// fits in the viewport while the scrollbar reflects the real total, so the data is all there and the
// page stays responsive.
//
// Use it when the row count is unbounded (an audit log, every transaction, a full member directory).
// For a table with sorting and filtering use DataGrid; for a short list use plain markup — a
// virtualiser over twenty rows is machinery for nothing.

/**
 * rows: any[]  ·  renderRow: (row, index) => node
 * rowHeight: estimated px per row — it only needs to be close; the measured height wins.
 */
export function VirtualList({ rows = [], renderRow, rowHeight = 44, height = 420, overscan = 8, emptyText = "Nothing here yet." }) {
  const parent = useRef(null);
  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parent.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  if (!rows.length) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-ctl-border bg-ctl-surface px-5 py-10 text-sm text-ctl-fg-muted"
           data-kf-component="virtual-list-empty"
           style={{ height }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div
      ref={parent}
      className="overflow-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset"
      data-kf-component="virtual-list"
      tabIndex={0}
      style={{
        height,
        scrollbarColor: "var(--ctl-border-strong) var(--ctl-surface)",
        scrollbarGutter: "stable",
      }}
    >
      {/* the spacer carries the FULL height, so the scrollbar tells the truth about how much there is */}
      <div style={{ height: v.getTotalSize(), width: "100%", position: "relative" }}>
        {v.getVirtualItems().map((item) => (
          <div key={item.key}
               ref={v.measureElement}
               data-index={item.index}
               style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }}>
            {renderRow?.(rows[item.index], item.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
