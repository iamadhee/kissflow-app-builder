// GENERATED from starter/src/components/kit/ProgressBar.jsx (sha256:176bfa9d41c04bb5). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { semanticToneToken } from "./semanticTone.js";
import { cn as cx } from "./cn.js";

/**
 * ProgressBar — one progress model with a preserved single-row primitive and five bounded views.
 *
 * Existing calls remain single linear bars. Supplying `items` opts into the theme-owned collection
 * treatments: linear, countable cells, intensity cards, free-capacity rows, or bullet rows.
 * Each item is `{ label, value, max, tone?, color? }`; optional metadata stays additive.
 */
const PROGRESS_BAR_VARIANTS = new Set([
  "theme",
  "linear",
  "cell-grid",
  "intensity-cards",
  "free-capacity",
  "bullet-rows",
]);

const progressBarVariant = (value) => PROGRESS_BAR_VARIANTS.has(value) ? value : "theme";
const number = new Intl.NumberFormat("en-US");

function normalizeItem(item, index) {
  const value = Number(item?.value) || 0;
  const max = Math.max(1, Number(item?.max) || 100);
  const pct = value / max * 100;
  const chart = index % 8 + 1;
  const customColor = item?.color;
  return {
    ...item,
    key: item?.id ?? item?.label ?? index,
    label: String(item?.label ?? `Item ${index + 1}`),
    value,
    max,
    pct,
    fill: item?.tone ? semanticToneToken(item.tone, "base") : customColor || `var(--chart-${chart})`,
    text: item?.tone ? semanticToneToken(item.tone, "text") : item?.text || customColor || `var(--chart-${chart}-ink)`,
    fillInk: item?.tone ? semanticToneToken(item.tone, "fg") : item?.fillInk || (customColor ? "var(--brand-fg)" : `var(--chart-${chart}-fill-ink, var(--brand-fg))`),
  };
}

function LinearRow({ value = 0, max, tone, color, label, showValue = false, indeterminate = false, className }) {
  const pct = indeterminate ? 34 : Math.max(0, Math.min(100, max ? value / max * 100 : value));
  const fill = tone ? semanticToneToken(tone, "base") : color || "var(--chart-1)";
  return (
    <div className={cx("flex items-center gap-3", className)}>
      {label && <span className="w-24 shrink-0 truncate text-sm text-ctl-fg-muted">{label}</span>}
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ctl-track">
        <div
          className={cx("h-full rounded-full transition-[width] ease-ctl duration-[var(--default-transition-duration)]", indeterminate && "bg-ctl-border")}
          style={{ width: `${pct.toFixed(1)}%`, background: indeterminate ? undefined : fill }}
        />
      </div>
      {showValue && (
        <span className="w-10 shrink-0 text-right font-data-emphasis text-sm font-medium tabular-nums" style={{ color: tone ? semanticToneToken(tone, "text") : "var(--brand-text)" }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

function GroupHeader({ title, meta }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <h3 className="m-0 font-display text-lg font-semibold leading-tight text-ctl-fg">{title}</h3>
      <p className="m-0 text-right text-sm text-ctl-fg-muted">{meta}</p>
    </div>
  );
}

function LinearGroup({ items, title, meta }) {
  return (
    <div className="flex-col gap-5" style={{ display: "var(--progress-linear-display, flex)" }} data-progress-view="linear">
      <GroupHeader title={title || "Progress"} meta={meta || `${items.length} measures`} />
      <div className="grid gap-4" role="list">
        {items.map((item) => (
          <LinearRow key={item.key} label={item.label} value={item.value} max={item.max} tone={item.tone} color={item.fill} showValue />
        ))}
      </div>
    </div>
  );
}

function CellGrid({ items, title, meta, cellSize }) {
  const totalCells = items.reduce((sum, item) => sum + Math.ceil(item.max / cellSize), 0);
  return (
    <div className="flex-col gap-5" style={{ display: "var(--progress-cells-display, none)" }} data-progress-view="cell-grid">
      <GroupHeader title={title || `One cell per ${number.format(cellSize)} slots`} meta={meta || `${number.format(totalCells)} cells · countable`} />
      <div className="grid gap-4" role="list">
        {items.map((item) => {
          const capacityCells = Math.ceil(item.max / cellSize);
          const filledCells = Math.ceil(Math.min(item.value, item.max) / cellSize);
          const overflowCells = Math.ceil(Math.max(0, item.value - item.max) / cellSize);
          const partial = item.value > 0 && item.value % cellSize !== 0;
          return (
            <div className="grid min-w-[44rem] grid-cols-[minmax(11rem,14rem)_minmax(18rem,1fr)_minmax(8rem,auto)] items-start gap-4" key={item.key} role="listitem">
              <span className="text-sm text-ctl-fg-muted">{item.label}</span>
              <span className="flex flex-wrap gap-2" aria-hidden="true">
                {Array.from({ length: capacityCells + overflowCells }, (_, index) => {
                  const overflow = index >= capacityCells;
                  const filled = overflow || index < filledCells;
                  const isPartial = partial && !overflow && index === filledCells - 1;
                  return (
                    <span
                      className="h-3.5 w-3.5 rounded-[3px]"
                      key={index}
                      style={{
                        background: filled ? item.fill : "var(--ctl-track)",
                        boxShadow: isPartial || overflow ? `0 0 0 2px color-mix(in oklab, ${item.fill} 18%, transparent)` : undefined,
                      }}
                    />
                  );
                })}
              </span>
              <span className="text-right font-mono text-sm tabular-nums text-ctl-fg-muted">{number.format(item.value)} / {number.format(item.max)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntensityCards({ items, title, meta }) {
  return (
    <div className="flex-col gap-5" style={{ display: "var(--progress-intensity-display, none)" }} data-progress-view="intensity-cards">
      <GroupHeader title={title || "Fill as intensity"} meta={meta || "No length at all"} />
      <div className="overflow-x-auto">
        <div className="grid min-w-[54rem] grid-cols-[repeat(6,minmax(8rem,1fr))] gap-3" role="list">
          {items.map((item) => (
            <div
              className="flex min-h-40 flex-col rounded-xl p-4"
              key={item.key}
              role="listitem"
              style={{ background: item.fill, color: item.fillInk }}
            >
              <strong className="font-mono text-3xl font-semibold tabular-nums">{Math.round(item.pct)}%</strong>
              <span className="mt-1 text-base font-medium leading-tight">{item.label}</span>
              <span className="mt-auto pt-4 font-mono text-sm tabular-nums opacity-90">{number.format(item.value)} / {number.format(item.max)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FreeCapacity({ items, title, meta }) {
  const sorted = [...items]
    .map((item) => ({ ...item, free: item.max - item.value }))
    .sort((a, b) => b.free - a.free);
  const totalFree = sorted.reduce((sum, item) => sum + item.free, 0);
  const largestFree = Math.max(1, ...sorted.map((item) => Math.max(0, item.free)));
  return (
    <div className="flex-col gap-5" style={{ display: "var(--progress-free-display, none)" }} data-progress-view="free-capacity">
      <GroupHeader title={title || "Free slots, most first"} meta={meta || `${number.format(totalFree)} free across the network`} />
      <div className="grid min-w-[44rem] gap-4" role="list">
        {sorted.map((item) => {
          const positive = item.free > 0;
          const ratio = Math.max(0, item.free) / largestFree * 100;
          const tone = item.free < 0 ? "danger" : item.free / item.max < 0.15 ? "warning" : "success";
          return (
            <div className="grid grid-cols-[minmax(11rem,14rem)_minmax(18rem,1fr)_minmax(7rem,auto)] items-center gap-4" key={item.key} role="listitem">
              <span className="text-sm text-ctl-fg-muted">{item.label}</span>
              <span className="h-3 overflow-hidden rounded-full bg-ctl-track">
                <span className="block h-full rounded-full" style={{ width: `${ratio}%`, background: semanticToneToken(tone, "base") }} />
              </span>
              <strong className="text-right font-mono text-base font-semibold tabular-nums" style={{ color: semanticToneToken(tone, "text") }}>
                {positive ? number.format(item.free) : `−${number.format(Math.abs(item.free))} over`}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BulletRows({ items, title, meta, threshold }) {
  const scaleMax = Math.max(120, ...items.map((item) => Math.ceil(item.pct / 10) * 10));
  const thresholdPosition = threshold / scaleMax * 100;
  const capacityPosition = 100 / scaleMax * 100;
  return (
    <div className="flex-col gap-5" style={{ display: "var(--progress-bullet-display, none)" }} data-progress-view="bullet-rows">
      <GroupHeader title={title || "Bullet rows"} meta={meta || "Bands behind, measure in front"} />
      <div className="grid min-w-[44rem] gap-4" role="list">
        {items.map((item) => {
          const width = Math.max(0, Math.min(100, item.pct / scaleMax * 100));
          const tone = item.pct > 100 ? "danger" : item.pct >= threshold ? "warning" : item.tone;
          const fill = tone ? semanticToneToken(tone, "base") : item.fill;
          const text = tone ? semanticToneToken(tone, "text") : item.text;
          return (
            <div className="grid grid-cols-[minmax(11rem,14rem)_minmax(18rem,1fr)_minmax(5rem,auto)] items-center gap-4" key={item.key} role="listitem">
              <span className="text-sm text-ctl-fg-muted">{item.label}</span>
              <span
                className="relative h-5 overflow-hidden rounded-md bg-ctl-track"
                style={{ background: `linear-gradient(to right, var(--ctl-track) 0 ${thresholdPosition}%, color-mix(in oklab, var(--warning-100) 70%, var(--ctl-surface)) ${thresholdPosition}% 100%)` }}
              >
                <span className="absolute inset-y-[6px] left-0" style={{ width: `${width}%`, background: fill }} />
                <span className="absolute inset-y-0 w-0.5 bg-ctl-fg" style={{ left: `${capacityPosition}%` }} aria-hidden="true" />
              </span>
              <strong className="text-right font-mono text-base font-semibold tabular-nums" style={{ color: text }}>{Math.round(item.pct)}%</strong>
            </div>
          );
        })}
      </div>
      <p className="m-0 border-t border-ctl-raise pt-3 text-sm text-ctl-fg-muted">
        Pale band to the {threshold}% limit, warm band beyond it, dark rule at capacity
      </p>
    </div>
  );
}

function ProgressBar({
  value = 0,
  max,
  tone,
  color,
  label,
  showValue = false,
  indeterminate = false,
  className,
  items,
  title,
  meta,
  variant = "theme",
  cellSize = 100,
  threshold = 85,
}) {
  // The single-row path is intentionally independent of theme recipes: every existing call keeps
  // exactly the original anatomy even after collection variants are added to the same component.
  if (!Array.isArray(items)) {
    return (
      <div data-kf-component="progress-bar" data-progress-bar-variant="linear">
        <LinearRow value={value} max={max} tone={tone} color={color} label={label} showValue={showValue} indeterminate={indeterminate} className={className} />
      </div>
    );
  }

  const normalized = items.map(normalizeItem);
  const resolvedVariant = progressBarVariant(variant);
  if (!normalized.length) {
    return (
      <div className={cx("rounded-lg border border-dashed border-ctl-border bg-ctl-surface p-6 text-sm text-ctl-fg-muted", className)} data-kf-component="progress-bar" data-progress-bar-variant={resolvedVariant}>
        No progress data.
      </div>
    );
  }

  return (
    <section
      className={cx("min-w-0 rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5", className)}
      data-kf-component="progress-bar"
      data-progress-bar-variant={resolvedVariant}
    >
      <LinearGroup items={normalized} title={title} meta={meta} />
      <div className="overflow-x-auto">
        <CellGrid items={normalized} title={title} meta={meta} cellSize={Math.max(1, Number(cellSize) || 100)} />
      </div>
      <IntensityCards items={normalized} title={title} meta={meta} />
      <div className="overflow-x-auto">
        <FreeCapacity items={normalized} title={title} meta={meta} />
      </div>
      <div className="overflow-x-auto">
        <BulletRows items={normalized} title={title} meta={meta} threshold={Math.max(0, Math.min(100, Number(threshold) || 85))} />
      </div>
    </section>
  );
}

export { ProgressBar };
export default ProgressBar;
