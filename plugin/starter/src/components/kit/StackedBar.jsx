import React from "react";
import { cn as cx } from "./cn.js";

/**
 * StackedBar — one row/category model with four additive layouts.
 *
 * Existing calls remain normalized rows with a compact legend. `variant="theme"`
 * lets the catalog choose a treatment; explicit `normalized`, `network-scale`,
 * `status-matrix`, and `shipment-cells` values pin the visual anatomy.
 */
const number = new Intl.NumberFormat("en-US");
const STACKED_BAR_VARIANTS = new Set(["theme", "normalized", "network-scale", "status-matrix", "shipment-cells"]);
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

const resolveVariant = (value) => STACKED_BAR_VARIANTS.has(value) ? value : "normalized";

function seriesTone(series) {
  return String(series?.tone || "").trim().toLowerCase();
}

function seriesFill(series, index) {
  return series?.color || TONE_FILLS[seriesTone(series)] || RAMP[index % RAMP.length];
}

function seriesText(series, index) {
  return series?.text || TONE_TEXT[seriesTone(series)] || series?.color || `var(--chart-${index % RAMP.length + 1}-ink, var(--ctl-fg))`;
}

function seriesInk(series, index) {
  return series?.ink || TONE_INK[seriesTone(series)] || (series?.color ? "var(--brand-fg)" : `var(--chart-${index % RAMP.length + 1}-fill-ink, var(--brand-fg))`);
}

function normalize(data, keys) {
  const series = keys.map((item, index) => ({
    ...item,
    key: item?.key ?? `series-${index + 1}`,
    label: String(item?.label ?? item?.key ?? `Series ${index + 1}`),
  }));
  const rows = data.map((row, rowIndex) => {
    const values = series.map((item) => ({ series: item, value: Number(row?.[item.key]) || 0 }));
    return {
      key: row?.id ?? row?.label ?? rowIndex,
      label: String(row?.label ?? `Row ${rowIndex + 1}`),
      values,
      total: values.reduce((sum, item) => sum + item.value, 0),
    };
  });
  return {
    rows,
    series: series.map((item, index) => ({
      ...item,
      index,
      total: rows.reduce((sum, row) => sum + row.values[index].value, 0),
    })),
  };
}

function Legend({ series, showTotals = false }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {series.map((item, index) => (
        <span key={item.key} className="flex items-center gap-2 text-sm text-ctl-fg-muted">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: seriesFill(item, index) }} />
          {item.label}
          {showTotals && <strong className="font-mono font-semibold tabular-nums text-ctl-fg">{number.format(item.total)}</strong>}
        </span>
      ))}
    </div>
  );
}

function NormalizedRows({ rows, series }) {
  return (
    <div className="contents" data-stacked-bar-view="normalized" style={{ display: "var(--stacked-bar-normalized-display, contents)" }}>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-sm text-ctl-fg-muted">{row.label}</span>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-ctl-track">
              {row.values.map(({ series: item, value }, index) => {
                if (!value) return null;
                const width = row.total > 0 ? value / row.total * 100 : 0;
                return (
                  <div
                    key={item.key}
                    className="transition-[width] ease-ctl duration-[var(--default-transition-duration)]"
                    style={{ width: `${width.toFixed(1)}%`, background: seriesFill(item, index) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <Legend series={series} />
    </div>
  );
}

function GroupHeader({ title, meta }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <h3 className="m-0 font-display text-lg font-semibold leading-tight text-ctl-fg">{title}</h3>
      <p className="m-0 text-right text-sm text-ctl-fg-muted">{meta}</p>
    </header>
  );
}

function NetworkScale({ rows, series, total, widest, title, noun, explicit }) {
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-stacked-bar-view="network-scale"
      style={{ display: `var(--stacked-bar-network-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[48rem] gap-5">
        <GroupHeader title={title || "Bars scaled to the network"} meta={`${number.format(total)} ${noun} · widest row is ${number.format(widest)}`} />
        <div className="grid gap-4" role="list">
          {rows.map((row) => (
            <div className="grid grid-cols-[minmax(14rem,18rem)_minmax(22rem,1fr)_3rem] items-center gap-4" key={row.key} role="listitem">
              <span className="text-base text-ctl-fg-muted">{row.label}</span>
              <span className="h-8" aria-hidden="true">
                <span className="flex h-full overflow-hidden rounded-lg" style={{ width: `${widest > 0 ? row.total / widest * 100 : 0}%` }}>
                  {row.values.map(({ series: item, value }, index) => value > 0 ? (
                    <span
                      className="flex min-w-0 items-center justify-center font-mono text-sm font-semibold tabular-nums"
                      key={item.key}
                      style={{ width: `${row.total > 0 ? value / row.total * 100 : 0}%`, background: seriesFill(item, index), color: seriesInk(item, index) }}
                    >
                      {number.format(value)}
                    </span>
                  ) : null)}
                </span>
              </span>
              <strong className="text-right font-mono text-base font-semibold tabular-nums text-ctl-fg">{number.format(row.total)}</strong>
            </div>
          ))}
        </div>
        <div className="border-t border-ctl-raise pt-3"><Legend series={series} showTotals /></div>
      </div>
    </section>
  );
}

function StatusMatrix({ rows, series, explicit }) {
  const columns = `minmax(14rem, 1.75fr) repeat(${series.length}, minmax(8rem, 1fr)) minmax(3rem, .5fr)`;
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-stacked-bar-view="status-matrix"
      style={{ display: `var(--stacked-bar-matrix-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[58rem]" style={{ gridTemplateColumns: columns }} role="table" aria-label="Stacked values by row and category">
        <span />
        {series.map((item, index) => (
          <span className="flex items-center gap-2 px-3 pb-4 text-sm text-ctl-fg-muted" key={item.key} role="columnheader">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: seriesFill(item, index) }} />
            {item.shortLabel || item.label}
          </span>
        ))}
        <span className="pb-4 text-right font-mono text-xs uppercase tracking-[0.18em] text-ctl-fg-muted" role="columnheader">All</span>
        {rows.map((row) => (
          <React.Fragment key={row.key}>
            <span className="border-t border-ctl-raise py-5 pr-5 text-base text-ctl-fg-muted" role="rowheader">{row.label}</span>
            {row.values.map(({ series: item, value }, index) => (
              <span className="border-t border-ctl-raise px-3 py-5" key={item.key} role="cell">
                <strong className="block h-6 font-mono text-base font-semibold tabular-nums" style={{ color: value > 0 ? seriesText(item, index) : "var(--ctl-fg-subtle)" }}>
                  {value > 0 ? number.format(value) : "—"}
                </strong>
                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-ctl-track" aria-hidden="true">
                  <span className="block h-full" style={{ width: `${row.total > 0 ? Math.max(0, value) / row.total * 100 : 0}%`, background: seriesFill(item, index) }} />
                </span>
              </span>
            ))}
            <strong className="border-t border-ctl-raise py-5 text-right font-mono text-base font-semibold tabular-nums text-ctl-fg" role="cell">{number.format(row.total)}</strong>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function ShipmentCells({ rows, series, total, title, noun, explicit }) {
  const singular = noun.replace(/s$/, "");
  return (
    <section
      className="overflow-x-auto rounded-lg border border-solid border-ctl-border bg-ctl-surface p-5"
      data-stacked-bar-view="shipment-cells"
      style={{ display: `var(--stacked-bar-cells-display, ${explicit ? "block" : "none"})` }}
    >
      <div className="grid min-w-[48rem] gap-5">
        <GroupHeader title={title || `One cell per ${singular}`} meta={`${number.format(total)} cells · countable`} />
        <div className="grid gap-3" role="list">
          {rows.map((row) => (
            <div className="grid grid-cols-[minmax(14rem,18rem)_minmax(22rem,1fr)_3rem] items-center gap-4" key={row.key} role="listitem">
              <span className="text-base text-ctl-fg-muted">{row.label}</span>
              <span className="flex flex-wrap gap-2" aria-hidden="true">
                {row.values.flatMap(({ series: item, value }, index) => Array.from({ length: Math.max(0, Math.round(value)) }, (_, cellIndex) => (
                  <span className="h-8 w-8 rounded-lg" key={`${item.key}-${cellIndex}`} style={{ background: seriesFill(item, index) }} />
                )))}
              </span>
              <strong className="text-right font-mono text-base font-semibold tabular-nums text-ctl-fg">{number.format(row.total)}</strong>
            </div>
          ))}
        </div>
        <div className="border-t border-ctl-raise pt-3"><Legend series={series} showTotals /></div>
      </div>
    </section>
  );
}

function StackedBar({ data = [], keys = [], className, variant = "normalized", title, noun = "items" }) {
  const resolvedVariant = resolveVariant(variant);
  if (!data.length || !keys.length) {
    return (
      <div
        className={cx("flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-ctl-border text-sm text-ctl-fg-muted", className)}
        data-kf-component="stacked-bar"
        data-stacked-bar-variant={resolvedVariant}
      >
        No data
      </div>
    );
  }

  const normalized = normalize(data, keys);
  const total = normalized.rows.reduce((sum, row) => sum + row.total, 0);
  const widest = Math.max(0, ...normalized.rows.map((row) => row.total));
  const themeSelected = resolvedVariant === "theme";

  return (
    <div className={cx("flex w-full flex-col gap-4", className)} data-kf-component="stacked-bar" data-stacked-bar-variant={resolvedVariant}>
      {(themeSelected || resolvedVariant === "normalized") && <NormalizedRows rows={normalized.rows} series={normalized.series} />}
      {(themeSelected || resolvedVariant === "network-scale") && <NetworkScale rows={normalized.rows} series={normalized.series} total={total} widest={widest} title={title} noun={noun} explicit={!themeSelected} />}
      {(themeSelected || resolvedVariant === "status-matrix") && <StatusMatrix rows={normalized.rows} series={normalized.series} explicit={!themeSelected} />}
      {(themeSelected || resolvedVariant === "shipment-cells") && <ShipmentCells rows={normalized.rows} series={normalized.series} total={total} title={title} noun={noun} explicit={!themeSelected} />}
    </div>
  );
}

export { StackedBar };
export default StackedBar;
