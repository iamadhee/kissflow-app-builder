import React from "react";
import { cn as cx } from "./cn.js";

/**
 * SegmentBar — one proportional segment model with three additive layouts.
 *
 * Existing calls remain the original thin rail with an optional inline legend.
 * `variant="theme"` lets the theme catalog select a treatment; explicit
 * `rail-legend`, `contained-labels`, and `split-summary` values pin a layout.
 * Zero-value segments are skipped entirely, never rendered as a zero-width sliver.
 * Fill priority: d.color, semantic d.tone, then the complete chart-token ramp.
 */
const number = new Intl.NumberFormat("en-US");
const SEGMENT_BAR_VARIANTS = new Set(["theme", "rail-legend", "contained-labels", "split-summary"]);
const RAMP = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];
const TONE_FILLS = {
  success: "var(--data-success-fill, var(--success-600))",
  warning: "var(--data-warning-fill, var(--warning-600))",
  danger: "var(--data-danger-fill, var(--danger-600))",
  info: "var(--data-info-fill, var(--info-600))",
};
const TONE_TEXT = {
  success: "var(--success-text, var(--success-700))",
  warning: "var(--warning-text, var(--warning-700))",
  danger: "var(--danger-text, var(--danger-700))",
  info: "var(--info-text, var(--info-700))",
};
const TONE_INK = {
  success: "var(--success-fg, var(--brand-fg))",
  warning: "var(--warning-fg, var(--brand-fg))",
  danger: "var(--danger-fg, var(--brand-fg))",
  info: "var(--info-fg, var(--brand-fg))",
};

const resolveVariant = (value) => SEGMENT_BAR_VARIANTS.has(value) ? value : "rail-legend";

function segmentTone(segment) {
  return String(segment?.tone || "").trim().toLowerCase();
}

function segmentFill(segment, index) {
  return segment?.color || TONE_FILLS[segmentTone(segment)] || RAMP[index % RAMP.length];
}

function segmentText(segment, index) {
  return segment?.text || TONE_TEXT[segmentTone(segment)] || segment?.color || `var(--chart-${index % RAMP.length + 1}-ink, var(--ctl-fg))`;
}

function segmentInk(segment, index) {
  return segment?.ink || TONE_INK[segmentTone(segment)] || (segment?.color ? "var(--brand-fg)" : `var(--chart-${index % RAMP.length + 1}-fill-ink, var(--brand-fg))`);
}

function RailLegend({ items, legend }) {
  return (
    <div className="contents" data-segment-bar-view="rail-legend" style={{ display: "var(--segment-bar-rail-display, contents)" }}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-ctl-track">
        {items.map((item, index) => (
          <div
            key={item.key}
            className="transition-[width] ease-ctl duration-[var(--default-transition-duration)]"
            style={{ width: `${item.share.toFixed(1)}%`, background: segmentFill(item, index) }}
          />
        ))}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-4">
          {items.map((item, index) => (
            <span key={item.key} className="flex items-center gap-2 text-sm text-ctl-fg-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: segmentFill(item, index) }} />
              {item.label} <span className="font-medium text-ctl-fg">{number.format(item.value)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ContainedLabels({ items, total, title, meta, explicit }) {
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-segment-bar-view="contained-labels"
      style={{ display: `var(--segment-bar-contained-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[44rem] gap-5">
        <header className="flex items-start justify-between gap-4">
          <h3 className="m-0 font-display text-lg font-semibold leading-tight text-ctl-fg">{title || "Segments"}</h3>
          <p className="m-0 text-right text-sm text-ctl-fg-muted">{meta || `${number.format(total)} in all`}</p>
        </header>
        <div className="flex min-h-11 w-full overflow-hidden rounded-xl bg-ctl-track" role="list">
          {items.map((item, index) => (
            <div
              className="flex min-w-0 items-center justify-center gap-2 px-3 text-center text-sm"
              key={item.key}
              role="listitem"
              style={{ width: `${item.share}%`, background: segmentFill(item, index), color: segmentInk(item, index) }}
            >
              <strong className="font-mono text-base font-semibold tabular-nums">{number.format(item.value)}</strong>
              <span className="truncate">{item.shortLabel || item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SplitSummary({ items, explicit }) {
  const columns = items.map((item) => `${item.value}fr`).join(" ");
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-segment-bar-view="split-summary"
      style={{ display: `var(--segment-bar-summary-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[44rem] gap-4">
        <div className="grid gap-2" style={{ gridTemplateColumns: columns }} aria-hidden="true">
          {items.map((item, index) => (
            <span className="h-3 rounded-lg" key={item.key} style={{ background: segmentFill(item, index) }} />
          ))}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: columns }} role="list">
          {items.map((item, index) => (
            <div className="min-w-0" key={item.key} role="listitem">
              <strong className="block font-mono text-xl font-semibold tabular-nums" style={{ color: segmentText(item, index) }}>
                {number.format(item.value)}
              </strong>
              <span className="block truncate text-sm text-ctl-fg-muted">{item.shortLabel || item.label}</span>
              <span className="block font-mono text-sm tabular-nums text-ctl-fg-subtle">{Math.round(item.share)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SegmentBar({ segments = [], legend = true, className, variant = "rail-legend", title, meta }) {
  const source = Array.isArray(segments) ? segments : [];
  const positive = source.filter((item) => item && typeof item.value === "number" && item.value > 0);
  const total = positive.reduce((sum, item) => sum + item.value, 0);
  const items = positive.map((item, index) => ({
    ...item,
    key: item.id ?? item.label ?? index,
    label: String(item.label ?? `Segment ${index + 1}`),
    share: total > 0 ? item.value / total * 100 : 0,
  }));
  const resolvedVariant = resolveVariant(variant);
  const themeSelected = resolvedVariant === "theme";

  return (
    <div
      className={cx("flex w-full flex-col gap-2", className)}
      data-kf-component="segment-bar"
      data-segment-bar-variant={resolvedVariant}
    >
      {(themeSelected || resolvedVariant === "rail-legend") && <RailLegend items={items} legend={legend} />}
      {(themeSelected || resolvedVariant === "contained-labels") && <ContainedLabels items={items} total={total} title={title} meta={meta} explicit={!themeSelected} />}
      {(themeSelected || resolvedVariant === "split-summary") && <SplitSummary items={items} explicit={!themeSelected} />}
    </div>
  );
}

export { SegmentBar };
export default SegmentBar;
