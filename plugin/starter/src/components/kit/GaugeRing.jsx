import React from "react";
import { semanticToneToken } from "./semanticTone.js";
import { cn as cx } from "./cn.js";

/**
 * GaugeRing — one ratio, three theme-owned gauge geometries.
 *
 * `value`, `max`, label, tone, and sizing remain one stable data contract. The
 * active theme chooses a closed ring, an open radial ring, or a semicircle;
 * callers may use an explicit variant for review or a deliberate exception.
 *
 * <GaugeRing value={72} label="Occupied" sublabel="Average across 6 zones" />
 */
const GAUGE_VARIANTS = new Set(["theme", "closed-ring", "open-ring", "semicircle"]);
const gaugeVariant = (value) => GAUGE_VARIANTS.has(value) ? value : "theme";
const viewStyle = (view) => ({ display: `var(--gauge-${view}-display)` });

function GaugeFigure({ percent, label, ink, compact = false }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 text-center" style={{ color: ink }}>
      <span className={cx("font-data-emphasis font-semibold tabular-nums", compact ? "text-xl" : "text-2xl")}>{percent}%</span>
      {label ? <span className="block max-w-[7rem] text-balance text-sm font-medium leading-tight">{label}</span> : null}
    </div>
  );
}

function GaugeCaption({ children }) {
  return children ? <div className="max-w-[18rem] text-center text-sm leading-snug text-ctl-fg-muted">{children}</div> : null;
}

function GaugeRing({
  value = 0,
  max = 100,
  label,
  sublabel,
  color,
  tone,
  size = 150,
  minHeight,
  variant = "theme",
  className,
}) {
  const ratio = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const percent = Math.round(ratio * 100);
  const resolvedVariant = gaugeVariant(variant);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const closedDash = circumference * ratio;
  const openLength = circumference * 0.75;
  const openDash = openLength * ratio;
  const semicircleLength = Math.PI * radius;
  const semicircleDash = semicircleLength * ratio;
  const ring = tone ? semanticToneToken(tone, "base") : color || "var(--chart-1)";
  const groove = tone ? semanticToneToken(tone, "bg") : "var(--ctl-track)";
  const ink = tone ? semanticToneToken(tone, "text") : "var(--ctl-fg)";
  const accessibleLabel = [label, `${percent}%`, sublabel].filter(Boolean).join(", ");
  const dimension = typeof size === "number" ? `${size}px` : size;
  const semicircleHeight = typeof size === "number" ? `${size * 0.63}px` : dimension;
  const transition = "stroke-dasharray var(--default-transition-duration) var(--default-transition-timing-function)";

  return (
    <div
      className={cx("flex flex-col items-center", minHeight != null && "justify-center", className)}
      style={{ width: dimension, minHeight: minHeight ?? undefined }}
      data-kf-component="gauge-ring"
      data-gauge-variant={resolvedVariant}
      role="img"
      aria-label={accessibleLabel}
    >
      <div data-gauge-view="closed-ring" aria-hidden="true" className="w-full flex-col items-center gap-3" style={viewStyle("closed")}>
        <div className="relative w-full" style={{ height: dimension }}>
          <svg viewBox="0 0 140 140" width="100%" height="100%">
            <circle cx="70" cy="70" r={radius} fill="none" stroke={groove} strokeWidth="14" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={ring}
              strokeWidth="14"
              strokeLinecap={ratio >= 0.995 ? "butt" : "round"}
              strokeDasharray={`${closedDash} ${circumference - closedDash}`}
              transform="rotate(-90 70 70)"
              style={{ transition }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <GaugeFigure percent={percent} label={label} ink={ink} compact />
          </div>
        </div>
        <GaugeCaption>{sublabel}</GaugeCaption>
      </div>

      <div data-gauge-view="open-ring" aria-hidden="true" className="w-full flex-col items-center gap-3" style={viewStyle("open")}>
        <div className="relative w-full" style={{ height: dimension }}>
          <svg viewBox="0 0 140 140" width="100%" height="100%">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={groove}
              strokeWidth="14"
              strokeLinecap="butt"
              strokeDasharray={`${openLength} ${circumference - openLength}`}
              transform="rotate(135 70 70)"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={ring}
              strokeWidth="14"
              strokeLinecap="butt"
              strokeDasharray={`${openDash} ${circumference - openDash}`}
              transform="rotate(135 70 70)"
              style={{ transition }}
            />
          </svg>
          <div className="absolute inset-x-5 top-[34%] flex justify-center">
            <GaugeFigure percent={percent} label={label} ink={ink} />
          </div>
          <span className="absolute bottom-[5%] left-[8%] text-xs tabular-nums text-ctl-fg-muted">0</span>
          <span className="absolute bottom-[5%] right-[5%] text-xs tabular-nums text-ctl-fg-muted">{max}</span>
        </div>
        <GaugeCaption>{sublabel}</GaugeCaption>
      </div>

      <div data-gauge-view="semicircle" aria-hidden="true" className="w-full flex-col items-center gap-1" style={viewStyle("semicircle")}>
        <svg viewBox="0 0 140 88" width="100%" style={{ height: semicircleHeight }}>
          <path d="M 16 70 A 54 54 0 0 1 124 70" fill="none" stroke={groove} strokeWidth="14" strokeLinecap="butt" />
          <path
            d="M 16 70 A 54 54 0 0 1 124 70"
            fill="none"
            stroke={ring}
            strokeWidth="14"
            strokeLinecap="butt"
            strokeDasharray={`${semicircleDash} ${semicircleLength - semicircleDash}`}
            style={{ transition }}
          />
          <text x="9" y="86" fill="var(--ctl-fg-muted)" fontSize="11" textAnchor="middle">0</text>
          <text x="131" y="86" fill="var(--ctl-fg-muted)" fontSize="11" textAnchor="middle">{max}</text>
        </svg>
        <GaugeFigure percent={percent} label={label} ink={ink} />
        <GaugeCaption>{sublabel}</GaugeCaption>
      </div>
    </div>
  );
}

export { GaugeRing };
export default GaugeRing;
