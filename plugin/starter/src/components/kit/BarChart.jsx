import React from "react";
import { cn as cx } from "./cn.js";

/**
 * BarChart — vertical bars with one theme-owned visual recipe.
 *
 * BarChart and HBars deliberately share the SAME variant vocabulary. A theme
 * selects the metaphor once (`componentVariants.barChart`) and the two
 * components rotate it without changing its visual language.
 *
 * `reference` marks a meaningful target/capacity (for example 100 percent),
 * while `scaleMax` can reserve headroom above it. Both are optional; ordinary
 * categorical data continues to scale against its largest value.
 */
const RAMP = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"];
const RAMP_INK = ["var(--chart-1-fill-ink)", "var(--chart-2-fill-ink)", "var(--chart-3-fill-ink)", "var(--chart-4-fill-ink)", "var(--chart-5-fill-ink)", "var(--chart-6-fill-ink)", "var(--chart-7-fill-ink)", "var(--chart-8-fill-ink)"];
const BAR_VARIANTS = new Set(["theme", "capacity-tracks", "stem-and-cap", "threshold-grid", "segmented-bricks", "continuous-silhouette"]);
const LABEL = "leading-none text-sm text-ctl-fg-muted";
const viewStyle = (name, fallback = "none") => ({ display: `var(--bar-${name}-display, ${fallback})` });
const pct = (value) => `${Math.max(0, Math.min(100, value * 100)).toFixed(2)}%`;

function ValueLabel({ value, format, hot }) {
  return (
    <span className={cx("text-center font-data-emphasis text-sm font-semibold leading-none tabular-nums", hot ? "text-brand-text" : "text-ctl-fg-muted")}>
      {format ? format(value) : value}
    </span>
  );
}

/* An axis label is data the reader needs whole. It wraps onto up to two lines (breaking between
   words, then inside a word only when a single word is wider than the column) rather than being
   cut to "Meals & Ente…". */
const AXIS_LABEL = "text-center leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [overflow-wrap:anywhere]";
function AxisLabel({ label }) {
  return <span className={cx(AXIS_LABEL, LABEL)} title={label}>{label}</span>;
}

function BarChart({
  data = [],
  series,
  color,
  height = 190,
  format,
  values = true,
  axis = true,
  highlightAt = 0.9,
  reference,
  scaleMax,
  variant = "theme",
  className,
}) {
  const plot = Number(height) || 190;
  const threshold = Number(highlightAt) || 0.9;
  const resolvedVariant = BAR_VARIANTS.has(variant) ? variant : "theme";
  const keys = Array.isArray(series) ? series.filter((item) => item && item.key) : [];
  const grouped = keys.length > 1;
  const items = (Array.isArray(data) ? data : []).filter((item) =>
    grouped
      ? item && keys.some((entry) => typeof item[entry.key] === "number" && Number.isFinite(item[entry.key]))
      : item && typeof item.value === "number" && Number.isFinite(item.value)
  );

  if (!items.length) {
    return (
      <div
        className={cx("flex w-full items-center justify-center rounded-lg border border-dashed border-ctl-border", LABEL, className)}
        style={{ height: plot }}
        data-kf-component="bar-chart"
        data-bar-variant={resolvedVariant}
      >
        No data
      </div>
    );
  }

  // Grouped columns remain a comparison primitive: theme recipes are for the
  // one-value-per-category form and must not scramble multi-series semantics.
  if (grouped) {
    const groupedMax = Math.max(...items.map((item) => Math.max(...keys.map((entry) => typeof item[entry.key] === "number" ? item[entry.key] : 0))), 1);
    return (
      <div className={cx("flex w-full flex-col gap-4", className)} data-kf-component="bar-chart" data-bar-variant={resolvedVariant}>
        <div className="flex flex-wrap items-center justify-end gap-4">
          {keys.map((entry, index) => (
            <span key={entry.key} className={cx("flex items-center gap-2", LABEL)}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color || RAMP[index % RAMP.length] }} />
              {entry.label || entry.key}
            </span>
          ))}
        </div>
        <div className="flex w-full items-end gap-chart" role="img" aria-label={items.map((item) => item.label).join(", ")}>
          {items.map((item, itemIndex) => (
            <div key={item.label ?? itemIndex} className="flex min-w-0 flex-1 flex-col gap-chart-label">
              <div className="flex items-end gap-1" style={{ height: plot }}>
                {keys.map((entry, index) => {
                  const value = typeof item[entry.key] === "number" ? item[entry.key] : 0;
                  return <div key={entry.key} title={`${entry.label || entry.key}: ${format ? format(value) : value}`} className="min-h-1.5 min-w-0 flex-1 rounded-t-lg transition-[height] duration-[var(--default-transition-duration)] ease-ctl" style={{ height: pct(value / groupedMax), background: entry.color || RAMP[index % RAMP.length] }} />;
                })}
              </div>
              <AxisLabel label={item.label} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const dataMax = Math.max(...items.map((item) => Math.max(0, item.value)), 1);
  const target = Number(reference) > 0 ? Number(reference) : dataMax;
  const domain = Math.max(Number(scaleMax) > 0 ? Number(scaleMax) : 0, target, dataMax, 1);
  const fillAt = (item, index) => item.color || color || RAMP[index % RAMP.length];
  const inkAt = (item, index) => item.ink || RAMP_INK[index % RAMP_INK.length];
  const isHot = (item) => dataMax > 0 && item.value >= dataMax * threshold;
  const accessibleLabel = items.map((item) => `${item.label}: ${format ? format(item.value) : item.value}`).join("; ");
  const brickTotal = 10;

  return (
    <div className={cx("w-full", className)} data-kf-component="bar-chart" data-bar-variant={resolvedVariant} role="img" aria-label={accessibleLabel}>
      <div aria-hidden="true" className="w-full items-end gap-chart" style={viewStyle("capacity", "flex")}>
        {items.map((item, index) => (
          <div key={item.label ?? index} className="flex min-w-0 flex-1 flex-col gap-chart-label">
            {values ? <ValueLabel value={item.value} format={format} hot={isHot(item)} /> : null}
            <div className="relative mx-auto w-[58%] min-w-5 max-w-14" style={{ height: plot }}>
              <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-lg bg-ctl-track" style={{ height: pct(target / domain) }} />
              <div className="absolute inset-x-0 bottom-0 min-h-1.5 rounded-lg transition-[height] duration-[var(--default-transition-duration)] ease-ctl" style={{ height: pct(item.value / domain), background: fillAt(item, index) }} />
            </div>
            {axis ? <AxisLabel label={item.label} /> : null}
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="w-full items-end gap-chart" style={viewStyle("stem")}>
        {items.map((item, index) => {
          const share = Math.max(0, Math.min(1, item.value / domain));
          return (
            <div key={item.label ?? index} className="flex min-w-0 flex-1 flex-col gap-chart-label">
              {values ? <ValueLabel value={item.value} format={format} hot={isHot(item)} /> : null}
              <div className="relative mx-auto w-full" style={{ height: plot }}>
                <div className="absolute bottom-0 left-1/2 w-1 -translate-x-1/2 rounded-full opacity-25" style={{ height: pct(share), background: fillAt(item, index) }} />
                <div className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ bottom: pct(share), background: fillAt(item, index), boxShadow: isHot(item) ? `0 0 0 0.4rem color-mix(in oklab, ${fillAt(item, index)} 14%, transparent)` : "none" }} />
              </div>
              {axis ? <AxisLabel label={item.label} /> : null}
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className="w-full flex-col" style={viewStyle("threshold")}>
        <div className="relative" style={{ height: plot }}>
          {[0.25, 0.5, 0.75, 1].map((step) => <div key={step} className="absolute inset-x-0 border-t border-ctl-track" style={{ bottom: pct(step) }} />)}
          {target < domain ? <div className="absolute inset-x-0 z-[1] border-t-2 border-dashed border-danger-600/40" style={{ bottom: pct(target / domain) }} /> : null}
          <div className="absolute inset-0 flex items-end gap-chart px-2">
            {items.map((item, index) => (
              <div key={item.label ?? index} className="flex h-full min-w-0 flex-1 items-end justify-center">
                <div className="relative w-[64%] min-w-4 max-w-16 rounded-t-lg transition-[height] duration-[var(--default-transition-duration)] ease-ctl" style={{ height: pct(item.value / domain), background: fillAt(item, index) }}>
                  {values ? <span className="absolute left-1/2 -translate-x-1/2 -translate-y-full pb-1 font-data-emphasis text-xs font-semibold tabular-nums text-ctl-fg">{format ? format(item.value) : item.value}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        {axis ? <div className="mt-2 flex gap-chart px-2">{items.map((item, index) => <span key={item.label ?? index} className={cx("min-w-0 flex-1", LABEL, AXIS_LABEL)} title={item.label}>{item.label}</span>)}</div> : null}
      </div>

      <div aria-hidden="true" className="w-full items-end gap-chart" style={viewStyle("bricks")}>
        {items.map((item, index) => {
          const filled = Math.min(brickTotal, Math.ceil(Math.max(0, item.value / target) * brickTotal));
          const overflow = item.value > target;
          return (
            <div key={item.label ?? index} className="flex min-w-0 flex-1 flex-col gap-chart-label">
              {values ? <ValueLabel value={item.value} format={format} hot={isHot(item)} /> : null}
              <div className="mx-auto flex w-[58%] min-w-5 max-w-14 flex-col justify-end gap-1" style={{ height: plot }}>
                {overflow ? <span className="block h-2.5 rounded-sm" style={{ background: fillAt(item, index) }} /> : null}
                {Array.from({ length: brickTotal }, (_, brick) => <span key={brick} className="block min-h-1.5 flex-1 rounded-sm" style={{ background: brick >= brickTotal - filled ? fillAt(item, index) : "var(--ctl-track)" }} />)}
              </div>
              {axis ? <AxisLabel label={item.label} /> : null}
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className="w-full flex-col" style={viewStyle("silhouette")}>
        <div className="flex items-end border-b-2 border-brand-600" style={{ height: plot }}>
          {items.map((item, index) => (
            <div key={item.label ?? index} className="relative flex min-w-0 flex-1 items-start justify-center px-1 pt-2 transition-[height] duration-[var(--default-transition-duration)] ease-ctl" style={{ height: pct(item.value / domain), background: fillAt(item, index), color: inkAt(item, index) }}>
              {values ? <span className="truncate font-data-emphasis text-sm font-semibold tabular-nums">{format ? format(item.value) : item.value}</span> : null}
            </div>
          ))}
        </div>
        {axis ? <div className="mt-2 flex">{items.map((item, index) => <span key={item.label ?? index} className={cx("min-w-0 flex-1 px-1", LABEL, AXIS_LABEL)} title={item.label}>{item.label}</span>)}</div> : null}
      </div>
    </div>
  );
}

export { BarChart };
export default BarChart;
