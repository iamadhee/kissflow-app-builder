import React from "react";
import { cn as cx } from "./cn.js";

/**
 * FunnelChart — one ordered pipeline, four theme-owned representations.
 *
 * `data` stays in caller order and accepts the existing `{ label, value,
 * color? }` shape plus an optional `detail`/`amount` value. The active theme
 * chooses the visual recipe; an explicit variant is available for review and
 * deliberate exceptions. Every representation is derived from the same
 * normalized stages, widths, conversion rates, and semantic colour ramp.
 *
 * <FunnelChart data={[{ label: 'Created', value: 7, detail: 182000 }]} />
 */
const RAMP = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"];
const RAMP_INK = ["var(--chart-1-ink)", "var(--chart-2-ink)", "var(--chart-3-ink)", "var(--chart-4-ink)", "var(--chart-5-ink)", "var(--chart-6-ink)", "var(--chart-7-ink)", "var(--chart-8-ink)"];
const FUNNEL_VARIANTS = new Set(["theme", "silhouette", "centered-bars", "conversion-steps", "nested-capacity"]);
const funnelVariant = (value) => FUNNEL_VARIANTS.has(value) ? value : "theme";

function StageLabel({ stage, fill, format, formatDetail, compact = false, valueMode = "both" }) {
  const detail = stage.detail ?? stage.amount;
  const showValue = valueMode === "both" || valueMode === "value";
  const showDetail = detail != null && (valueMode === "both" || valueMode === "detail");
  return (
    <div className="min-w-0 self-center">
      <div className="truncate text-sm leading-tight text-ctl-fg-muted" title={stage.label}>{stage.label}</div>
      {showValue || showDetail ? (
        <div className={cx("mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1 font-data-emphasis font-semibold tabular-nums", compact ? "text-xs-plus" : "text-sm")} style={{ color: fill }}>
          {showValue ? <span>{format ? format(stage.value, stage) : stage.value}</span> : null}
          {showValue && showDetail ? <span aria-hidden="true">·</span> : null}
          {showDetail ? <span>{formatDetail ? formatDetail(detail, stage) : detail}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function FunnelChart({ data = [], color, format, formatDetail, variant = "theme", className }) {
  const items = (Array.isArray(data) ? data : [])
    .filter((stage) => stage && typeof stage.value === "number" && Number.isFinite(stage.value))
    .map((stage) => ({ ...stage, value: Math.max(0, stage.value) }));
  const resolvedVariant = funnelVariant(variant);

  if (!items.length) {
    return (
      <div
        className={cx("flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-ctl-border text-sm text-ctl-fg-muted", className)}
        data-kf-component="funnel-chart"
        data-funnel-variant={resolvedVariant}
      >
        No data
      </div>
    );
  }

  const max = Math.max(0, ...items.map((stage) => stage.value));
  const widthAt = (value) => max > 0 ? Math.max(value > 0 ? 8 : 0, Math.min(100, value / max * 100)) : 0;
  const rateAt = (index) => {
    if (!index) return null;
    const previous = items[index - 1].value;
    return previous > 0 ? Math.round(items[index].value / previous * 100) : 0;
  };
  const fillAt = (stage, index) => stage.color || color || RAMP[index % RAMP.length];
  const inkAt = (stage, index) => stage.ink || RAMP_INK[index % RAMP_INK.length];
  const accessibleLabel = items
    .map((stage, index) => {
      const detail = stage.detail ?? stage.amount;
      return `${stage.label}: ${stage.value}${detail != null ? `, ${detail}` : ""}${index ? `, ${rateAt(index)}% of ${items[index - 1].label}` : ""}`;
    })
    .join("; ");

  return (
    <div
      className={cx("w-full", className)}
      data-kf-component="funnel-chart"
      data-funnel-variant={resolvedVariant}
      role="img"
      aria-label={accessibleLabel}
    >
      <div
        data-funnel-view="silhouette"
        aria-hidden="true"
        className="w-full items-stretch gap-x-5"
        style={{ display: "var(--funnel-silhouette-display)", gridTemplateColumns: "var(--funnel-two-column)" }}
      >
        <div className="flex flex-col">
          {items.map((stage, index) => (
            <div key={stage.label ?? index} className="flex min-w-0 items-center" style={{ minHeight: "4rem" }}>
              <StageLabel stage={stage} fill={fillAt(stage, index)} format={format} formatDetail={formatDetail} />
            </div>
          ))}
        </div>
        <div className="flex min-w-0 flex-col justify-center py-1">
          {items.map((stage, index) => {
            const currentWidth = widthAt(stage.value);
            const nextWidth = index === items.length - 1 ? currentWidth : widthAt(items[index + 1].value);
            const inset = currentWidth > 0 ? Math.max(0, (currentWidth - nextWidth) / currentWidth * 50) : 0;
            return (
              <div
                key={stage.label ?? index}
                className="mx-auto transition-[width,background-color] duration-[var(--default-transition-duration)] ease-ctl"
                style={{
                  width: `${currentWidth}%`,
                  height: "calc(4rem - 4px)",
                  background: fillAt(stage, index),
                  clipPath: `polygon(0 0, 100% 0, ${100 - inset}% 100%, ${inset}% 100%)`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        data-funnel-view="centered-bars"
        aria-hidden="true"
        className="w-full gap-x-5 gap-y-3"
        style={{ display: "var(--funnel-centered-display)", gridTemplateColumns: "var(--funnel-two-column)" }}
      >
        {items.map((stage, index) => (
          <React.Fragment key={stage.label ?? index}>
            <StageLabel stage={stage} fill={fillAt(stage, index)} format={format} valueMode="none" compact />
            <div className="flex min-w-0 items-center">
              <div
                className="mx-auto flex h-12 items-center justify-center rounded-xl px-3 font-data-emphasis text-sm font-semibold tabular-nums transition-[width,background-color] duration-[var(--default-transition-duration)] ease-ctl"
                style={{ width: `${widthAt(stage.value)}%`, background: fillAt(stage, index), color: inkAt(stage, index) }}
              >
                {format ? format(stage.value, stage) : stage.value}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div
        data-funnel-view="conversion-steps"
        aria-hidden="true"
        className="w-full gap-x-5"
        style={{ display: "var(--funnel-conversion-display)", gridTemplateColumns: "var(--funnel-three-column)" }}
      >
        {items.map((stage, index) => {
          const currentWidth = widthAt(stage.value);
          const nextWidth = index === items.length - 1 ? currentWidth : widthAt(items[index + 1].value);
          // Join the straight edges, leaving the rounded corners exposed. Use
          // the plot's coordinates so connections can widen as well as narrow.
          const edge = (width) => `calc(${(100 - width) / 2}% + min(var(--radius-lg), ${width / 2}%))`;
          const currentEdge = edge(currentWidth);
          const nextEdge = edge(nextWidth);
          return (
            <React.Fragment key={stage.label ?? index}>
              <StageLabel stage={stage} fill={fillAt(stage, index)} format={format} formatDetail={formatDetail} valueMode="detail" />
              <div className="relative flex min-w-0 flex-col items-center" style={{ minHeight: "4rem" }}>
                <div
                  className="z-[1] flex h-10 items-center justify-center rounded-lg px-3 font-data-emphasis text-sm font-semibold tabular-nums transition-[width,background-color] duration-[var(--default-transition-duration)] ease-ctl"
                  style={{ width: `${currentWidth}%`, background: fillAt(stage, index), color: inkAt(stage, index) }}
                >
                  {format ? format(stage.value, stage) : stage.value}
                </div>
                {index < items.length - 1 ? (
                  <div
                    data-funnel-connector=""
                    className="pointer-events-none absolute inset-x-0 bottom-0"
                    style={{
                      top: 'calc(var(--spacing) * 10)',
                      background: `color-mix(in oklab, ${fillAt(stage, index)} 24%, transparent)`,
                      clipPath: `polygon(${currentEdge} 0, calc(100% - ${currentEdge}) 0, calc(100% - ${nextEdge}) 100%, ${nextEdge} 100%)`,
                    }}
                  />
                ) : null}
              </div>
              <div data-funnel-rate="" className="self-center text-sm tabular-nums text-ctl-fg-muted">
                {index ? `${rateAt(index)}% of ${items[index - 1].label}` : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div
        data-funnel-view="nested-capacity"
        aria-hidden="true"
        className="w-full gap-x-5 gap-y-2"
        style={{ display: "var(--funnel-capacity-display)", gridTemplateColumns: "var(--funnel-three-column)" }}
      >
        {items.map((stage, index) => {
          const previousWidth = index ? widthAt(items[index - 1].value) : 100;
          const currentWidth = widthAt(stage.value);
          const innerWidth = previousWidth > 0 ? Math.min(100, currentWidth / previousWidth * 100) : 0;
          const detail = stage.detail ?? stage.amount;
          return (
            <React.Fragment key={stage.label ?? index}>
              <StageLabel stage={stage} fill={fillAt(stage, index)} format={format} valueMode="value" compact />
              <div
                className={cx("mx-auto flex h-14 min-w-0 items-center justify-center rounded-xl px-2", index && "border-2 border-dashed border-ctl-border")}
                style={{ width: `${previousWidth}%` }}
              >
                <div
                  className="flex h-10 items-center justify-center rounded-lg px-2 font-data-emphasis text-sm font-semibold tabular-nums transition-[width,background-color] duration-[var(--default-transition-duration)] ease-ctl"
                  style={{
                    width: `min(100%, max(5.25rem, ${innerWidth}%))`,
                    background: fillAt(stage, index),
                    color: inkAt(stage, index),
                  }}
                >
                  {detail != null
                    ? (formatDetail ? formatDetail(detail, stage) : detail)
                    : (format ? format(stage.value, stage) : stage.value)}
                </div>
              </div>
              <div data-funnel-rate="" className="self-center text-sm tabular-nums text-ctl-fg-muted">
                {index ? `${rateAt(index)}% of ${items[index - 1].label}` : null}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export { FunnelChart };
export default FunnelChart;
