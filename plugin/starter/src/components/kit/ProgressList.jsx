import React from "react";
import { semanticToneToken } from "./semanticTone.js";
import { cn as cx } from "./cn.js";

/**
 * ProgressList — one per-row progress model with three additive layouts.
 *
 * Existing calls remain linear rows. `variant="theme"` lets the catalog select a treatment;
 * explicit `linear`, `status-groups`, and `document-cells` values are useful for fixed workflows.
 * Every item is scaled against its own maximum: `{ label, value, max?, tone? }`.
 */
const number = new Intl.NumberFormat("en-US");
const PROGRESS_LIST_VARIANTS = new Set(["theme", "linear", "status-groups", "document-cells"]);

const progressListVariant = (value) => PROGRESS_LIST_VARIANTS.has(value) ? value : "linear";

function normalizeItem(item, index) {
  const value = Math.max(0, Number(item?.value) || 0);
  const max = Math.max(1, Number(item?.max) || 100);
  return {
    ...item,
    key: item?.id ?? item?.label ?? index,
    label: String(item?.label ?? `Item ${index + 1}`),
    value,
    max,
    pct: value / max * 100,
  };
}

function progressTone(item) {
  if (item.tone) return item.tone;
  if (item.pct >= 100) return "success";
  if (item.pct < 50) return "warning";
  return "accent";
}

function Row({ value = 0, max, tone, label, showValue = true }) {
  const pct = Math.max(0, Math.min(100, max ? value / max * 100 : value));
  const fill = tone ? semanticToneToken(tone, "base") : "var(--chart-1)";
  return (
    <div className="flex items-center gap-3">
      {/* Fixed column so bars stay aligned across rows; 32 rather than 24
          because two-word labels ("Google Chrome") need ~107px and were
          truncating at every consumer, not just wide ones. */}
      {label && <span className="w-32 shrink-0 truncate text-sm text-ctl-fg-muted">{label}</span>}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ctl-track">
        <div className="h-full rounded-full transition-[width] ease-ctl duration-[var(--default-transition-duration)]" style={{ width: pct.toFixed(1) + "%", background: fill }} />
      </div>
      {showValue && (
        <span className="w-10 shrink-0 text-right font-data-emphasis text-sm font-medium tabular-nums" style={{ color: tone ? semanticToneToken(tone, "text") : "var(--brand-text)" }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

function LinearRows({ items }) {
  return (
    <div className="contents" data-progress-list-view="linear" style={{ display: "var(--progress-list-linear-display, contents)" }}>
      {items.map((item) => (
        <Row key={item.key} value={item.value} max={item.max} tone={item.tone} label={item.label} showValue />
      ))}
    </div>
  );
}

const STATUS_GROUPS = [
  { id: "complete", label: "Complete", tone: "success", matches: (item) => item.pct >= 100 },
  { id: "under-way", label: "Under way", tone: "accent", matches: (item) => item.pct >= 50 && item.pct < 100 },
  { id: "barely-started", label: "Barely started", tone: "warning", matches: (item) => item.pct < 50 },
];

function StatusGroups({ items, noun, explicit }) {
  const total = items.length;
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-progress-list-view="status-groups"
      style={{ display: `var(--progress-list-status-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[44rem] gap-7">
        {STATUS_GROUPS.map((group) => {
          const rows = items.filter(group.matches);
          if (!rows.length) return null;
          const groupText = semanticToneToken(group.tone, "text");
          return (
            <section className="grid gap-4" key={group.id} aria-label={`${group.label} progress`}>
              <header className="grid grid-cols-[auto_minmax(2rem,1fr)_auto] items-center gap-4">
                <h3 className="m-0 font-display text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: groupText }}>
                  {group.label}
                </h3>
                <span className="h-px bg-ctl-track" aria-hidden="true" />
                <span className="text-sm text-ctl-fg-muted">{rows.length} of {total} {noun}</span>
              </header>
              <div className="grid gap-3" role="list">
                {rows.map((item) => {
                  const tone = item.tone || group.tone;
                  return (
                    <div className="grid grid-cols-[minmax(13rem,18rem)_minmax(18rem,1fr)_minmax(5rem,auto)] items-center gap-4" key={item.key} role="listitem">
                      <span className="truncate text-base text-ctl-fg-muted">{item.label}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-ctl-track" aria-hidden="true">
                        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, item.pct)}%`, background: semanticToneToken(tone, "base") }} />
                      </span>
                      <strong className="text-right font-mono text-base font-semibold tabular-nums" style={{ color: semanticToneToken(tone, "text") }}>
                        {number.format(item.value)} of {number.format(item.max)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function DocumentCells({ items, explicit }) {
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-progress-list-view="document-cells"
      style={{ display: `var(--progress-list-cells-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[44rem] gap-4" role="list">
        {items.map((item) => {
          const cells = Math.max(1, Math.round(item.max));
          const filled = Math.min(cells, Math.floor(item.value));
          const tone = progressTone(item);
          return (
            <div className="grid grid-cols-[minmax(13rem,18rem)_minmax(18rem,1fr)_minmax(5rem,auto)] items-center gap-4" key={item.key} role="listitem">
              <span className="truncate text-base text-ctl-fg-muted">{item.label}</span>
              <span className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))` }} aria-hidden="true">
                {Array.from({ length: cells }, (_, index) => (
                  <span className="h-3 rounded-[3px]" key={index} style={{ background: index < filled ? semanticToneToken(tone, "base") : "var(--ctl-track)" }} />
                ))}
              </span>
              <strong className="text-right font-mono text-base font-semibold tabular-nums" style={{ color: semanticToneToken(tone, "text") }}>
                {number.format(item.value)} of {number.format(item.max)}
              </strong>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-5 min-w-[44rem] border-t border-ctl-raise pt-3 text-sm text-ctl-fg-muted">
        One cell per required document · cell width varies because each requirement differs
      </p>
    </section>
  );
}

function ProgressList({ items = [], className, variant = "linear", noun = "items" }) {
  const normalized = (Array.isArray(items) ? items : []).map(normalizeItem);
  const resolvedVariant = progressListVariant(variant);
  const themeSelected = resolvedVariant === "theme";
  return (
    <div className={cx("flex w-full flex-col gap-3", className)} data-kf-component="progress-list" data-progress-list-variant={resolvedVariant}>
      {(themeSelected || resolvedVariant === "linear") && <LinearRows items={normalized} />}
      {(themeSelected || resolvedVariant === "status-groups") && <StatusGroups items={normalized} noun={noun} explicit={!themeSelected} />}
      {(themeSelected || resolvedVariant === "document-cells") && <DocumentCells items={normalized} explicit={!themeSelected} />}
    </div>
  );
}

export { ProgressList };
export default ProgressList;
