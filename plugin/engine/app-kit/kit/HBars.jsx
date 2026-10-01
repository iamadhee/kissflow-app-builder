// GENERATED from starter/src/components/kit/HBars.jsx (sha256:8bd177542bcb6b39). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * HBars — the horizontal orientation of BarChart's theme-owned recipes.
 *
 * The public data/sort/format contract is unchanged. `variant`, `reference`
 * and `scaleMax` match BarChart so a page can rotate the chart without losing
 * its theme treatment or target semantics.
 */
const RAMP = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"];
const RAMP_INK = ["var(--chart-1-fill-ink)", "var(--chart-2-fill-ink)", "var(--chart-3-fill-ink)", "var(--chart-4-fill-ink)", "var(--chart-5-fill-ink)", "var(--chart-6-fill-ink)", "var(--chart-7-fill-ink)", "var(--chart-8-fill-ink)"];
const BAR_VARIANTS = new Set(["theme", "capacity-tracks", "stem-and-cap", "threshold-grid", "segmented-bricks", "continuous-silhouette"]);
const LABEL = "text-sm text-ctl-fg-muted";
const viewStyle = (name, fallback = "none") => ({ display: `var(--bar-${name}-display, ${fallback})` });
const pct = (value) => `${Math.max(0, Math.min(100, value * 100)).toFixed(2)}%`;

function HBars({
  data = [],
  color,
  format,
  max = 8,
  sort = true,
  height = 190,
  reference,
  scaleMax,
  variant = "theme",
  className,
}) {
  const cap = Number(max) > 0 ? Number(max) : 8;
  const resolvedVariant = BAR_VARIANTS.has(variant) ? variant : "theme";
  const items = (Array.isArray(data) ? data : []).filter((item) => item && typeof item.value === "number" && Number.isFinite(item.value));

  if (!items.length) {
    return (
      <div
        className={cx("flex w-full items-center justify-center rounded-lg border border-dashed border-ctl-border", LABEL, className)}
        style={{ height }}
        data-kf-component="h-bars"
        data-bar-variant={resolvedVariant}
      >
        No data
      </div>
    );
  }

  const ordered = sort === false ? items : [...items].sort((a, b) => b.value - a.value);
  const rows = ordered.slice(0, cap);
  const availableRowH = Number(height) > 0 ? Number(height) / rows.length : 30;
  const rowHeight = Math.max(24, Math.min(30, availableRowH));
  const dataMax = Math.max(...rows.map((item) => Math.max(0, item.value)), 1);
  const target = Number(reference) > 0 ? Number(reference) : dataMax;
  const domain = Math.max(Number(scaleMax) > 0 ? Number(scaleMax) : 0, target, dataMax, 1);
  const fillAt = (item, index) => item.color || color || RAMP[index % RAMP.length];
  const inkAt = (item, index) => item.ink || RAMP_INK[index % RAMP_INK.length];
  const accessibleLabel = rows.map((item) => `${item.label}: ${format ? format(item.value) : item.value}`).join("; ");
  const brickTotal = 10;

  return (
    <div className={cx("w-full", className)} data-kf-component="h-bars" data-bar-variant={resolvedVariant} role="img" aria-label={accessibleLabel}>
      <div aria-hidden="true" className="w-full flex-col gap-chart" style={viewStyle("capacity", "flex")}>
        {rows.map((item, index) => (
          <div key={item.label ?? index} className="flex min-w-0 items-center gap-3" style={{ minHeight: rowHeight }}>
            <span className={cx("w-44 shrink-0 text-left leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [overflow-wrap:anywhere]", LABEL)} title={item.label}>{item.label}</span>
            <div className="relative h-5 min-w-0 flex-1">
              <div className="absolute inset-y-0 left-0 rounded-lg bg-ctl-track" style={{ width: pct(target / domain) }} />
              <div className="absolute inset-y-0 left-0 min-w-1.5 rounded-lg transition-[width] duration-[var(--default-transition-duration)] ease-ctl" style={{ width: pct(item.value / domain), background: fillAt(item, index) }} />
            </div>
            <span className="min-w-14 shrink-0 whitespace-nowrap text-right font-data-emphasis text-sm font-semibold tabular-nums text-ctl-fg">{format ? format(item.value) : item.value}</span>
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="w-full flex-col gap-chart" style={viewStyle("stem")}>
        {rows.map((item, index) => {
          const share = Math.max(0, Math.min(1, item.value / domain));
          return (
            <div key={item.label ?? index} className="flex min-w-0 items-center gap-3" style={{ minHeight: rowHeight }}>
              <span className={cx("w-44 shrink-0 text-left leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [overflow-wrap:anywhere]", LABEL)} title={item.label}>{item.label}</span>
              <div className="relative h-5 min-w-0 flex-1">
                <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full opacity-25" style={{ width: pct(share), background: fillAt(item, index) }} />
                <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: pct(share), background: fillAt(item, index), boxShadow: item.value === dataMax ? `0 0 0 0.35rem color-mix(in oklab, ${fillAt(item, index)} 14%, transparent)` : "none" }} />
              </div>
              <span className="min-w-14 shrink-0 whitespace-nowrap text-right font-data-emphasis text-sm font-semibold tabular-nums text-ctl-fg">{format ? format(item.value) : item.value}</span>
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className="w-full flex-col gap-chart" style={viewStyle("threshold")}>
        {rows.map((item, index) => (
          <div key={item.label ?? index} className="flex min-w-0 items-center gap-3" style={{ minHeight: rowHeight }}>
            <span className={cx("w-44 shrink-0 text-left leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [overflow-wrap:anywhere]", LABEL)} title={item.label}>{item.label}</span>
            <div className="relative h-6 min-w-0 flex-1">
              {[0.25, 0.5, 0.75, 1].map((step) => <span key={step} className="absolute inset-y-0 border-l border-ctl-track" style={{ left: pct(step) }} />)}
              {target < domain ? <span className="absolute inset-y-[-0.25rem] z-[1] border-l-2 border-dashed border-danger-600/40" style={{ left: pct(target / domain) }} /> : null}
              <div className="absolute inset-y-1 left-0 min-w-1.5 rounded-r-lg transition-[width] duration-[var(--default-transition-duration)] ease-ctl" style={{ width: pct(item.value / domain), background: fillAt(item, index) }} />
            </div>
            <span className="min-w-14 shrink-0 whitespace-nowrap text-right font-data-emphasis text-sm font-semibold tabular-nums text-ctl-fg">{format ? format(item.value) : item.value}</span>
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="w-full flex-col gap-chart" style={viewStyle("bricks")}>
        {rows.map((item, index) => {
          const filled = Math.min(brickTotal, Math.ceil(Math.max(0, item.value / target) * brickTotal));
          const overflow = item.value > target;
          return (
            <div key={item.label ?? index} className="flex min-w-0 items-center gap-3" style={{ minHeight: rowHeight }}>
              <span className={cx("w-44 shrink-0 text-left leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [overflow-wrap:anywhere]", LABEL)} title={item.label}>{item.label}</span>
              <div className="flex h-5 min-w-0 flex-1 gap-1">
                {Array.from({ length: brickTotal }, (_, brick) => <span key={brick} className="min-w-1.5 flex-1 rounded-sm" style={{ background: brick < filled ? fillAt(item, index) : "var(--ctl-track)" }} />)}
                {overflow ? <span className="w-2 shrink-0 rounded-sm" style={{ background: fillAt(item, index) }} /> : null}
              </div>
              <span className="min-w-14 shrink-0 whitespace-nowrap text-right font-data-emphasis text-sm font-semibold tabular-nums text-ctl-fg">{format ? format(item.value) : item.value}</span>
            </div>
          );
        })}
      </div>

      <div aria-hidden="true" className="w-full flex-col" style={viewStyle("silhouette")}>
        {rows.map((item, index) => (
          <div key={item.label ?? index} className="flex min-w-0 items-center gap-3" style={{ minHeight: rowHeight }}>
            <span className={cx("w-44 shrink-0 text-left leading-tight [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [overflow-wrap:anywhere]", LABEL)} title={item.label}>{item.label}</span>
            <div className="relative h-7 min-w-0 flex-1">
              <div className="absolute inset-y-0 left-0 flex min-w-8 items-center justify-end rounded-r-lg px-2 transition-[width] duration-[var(--default-transition-duration)] ease-ctl" style={{ width: pct(item.value / domain), background: fillAt(item, index), color: inkAt(item, index) }}>
                <span className="truncate font-data-emphasis text-xs font-semibold tabular-nums">{format ? format(item.value) : item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { HBars };
export default HBars;
