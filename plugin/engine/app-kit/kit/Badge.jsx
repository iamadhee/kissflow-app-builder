// GENERATED from starter/src/components/kit/Badge.jsx (sha256:a25d455558d2bde7). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";
import { normalizedSeverity, severityPaint } from "./severity.js";

/**
 * Badge and Tag — the same chip with one difference: a Tag can be removed.
 *
 * Six tones, three variants, pill-shaped. Named semantic tones use the current
 * --success/--warning/--info/--danger ramps; accent uses --brand-* and neutral
 * uses --ctl-*. GaugeRing and ProgressBar share those roles, so a "warning"
 * badge and warning gauge remain the same yellow.
 *
 * Vibrancy contract (set in tokens.css): the ink stays nearly at full chroma
 * and the wash mixes into the surface, not the gray track — the chip reads as
 * saturated text on a clean tint, and inverts to a dark tint with luminous
 * text in dark mode.
 *
 * `status` encodes progress in the glyph itself — dashed ring (draft), half
 * disc (in-progress), three-quarter disc (in-review), check (completed). Each
 * status implies its tone; an explicit `tone` overrides. With no children it
 * renders icon-only as a square pill.
 * `series={1..8}` selects the active theme's chart palette for categorical data.
 *
 * `severity` is the ORDERED axis, and it is not the same thing as `tone`. The six tones are
 * CATEGORIES — nothing in "warning" says it is worse than "success" — so a queue of states drawn
 * from them has no rank, and the theme's own warning is lighter than both its success and its
 * danger, which puts the loudest chip in the middle of the scale. `severity={1..4}` (or
 * "ok"/"medium"/"high"/"critical") paints from `--severity-1..4`, which every theme derives from
 * its OWN hues at one shared lightness with chroma rising by step. Use it for anything a reader
 * ranks — priority, risk, breach, age — and keep `tone` for things that merely differ.
 *
 * <Badge tone="success">Paid</Badge>
 * <Badge severity="critical">Critical</Badge>
 * <Badge status="in-progress">In-progress</Badge>
 * <Badge status="completed" aria-label="Completed" />
 * <Tag onRemove={() => drop(id)}>Region: EU</Tag>
 */

/* Table owns the standard-density rule for any badge rendered inside a cell,
   including badges returned by a column render function. Standalone badges
   keep their requested/default size. */
const BadgeSizeContext = React.createContext(null);

const SIZES = {
  sm: 'h-6 px-3 text-2xs gap-1',
  md: 'h-7 px-4 text-xs-plus gap-2',
  lg: 'h-8 px-4 text-sm gap-2',
};
/* Icon-only: width pins to the height, so the chip is a circle. */
const ICON_ONLY = { sm: 'w-6 px-0 justify-center', md: 'w-7 px-0 justify-center', lg: 'w-8 px-0 justify-center' };
const GLYPH = { sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5' };

/* Written out per tone rather than built from a template string, so the class
   names survive a build-time Tailwind scan. */
const TONES = {
  neutral: {
    soft: 'bg-ctl-track text-ctl-fg',
    solid: 'bg-ctl-fg-muted text-ctl-surface',
    outline: 'border border-solid border-ctl-border-strong text-ctl-fg',
  },
  accent: {
    soft: 'bg-brand-100 text-brand-text',
    solid: 'bg-brand-600 text-brand-fg',
    outline: 'border border-solid border-brand-600 text-brand-text',
  },
  success: {
    soft: 'bg-success-100 text-success-text',
    solid: 'bg-success-700 text-success-fg',
    outline: 'border border-solid border-success-600 text-success-text',
  },
  warning: {
    soft: 'bg-warning-100 text-warning-text',
    solid: 'bg-warning-600 text-warning-fg',
    outline: 'border border-solid border-warning-600 text-warning-text',
  },
  info: {
    soft: 'bg-info-100 text-info-text',
    solid: 'bg-info-700 text-info-fg',
    outline: 'border border-solid border-info-600 text-info-text',
  },
  danger: {
    soft: 'bg-danger-100 text-danger-text',
    solid: 'bg-danger-600 text-danger-fg',
    outline: 'border border-solid border-danger-600 text-danger-text',
  },
};

/* The glyphs draw in currentColor so they inherit the variant's ink — the same
   saturated colour as the label, which is what makes the set read as one chip
   rather than icon + text. Only the completed check knocks out in --brand-fg,
   the same relationship as a solid chip's label. */
const STATUS = {
  draft: {
    tone: 'neutral',
    glyph: (cls) => (
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className={cls}>
        <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="2.4 2.6" />
      </svg>
    ),
  },
  'in-progress': {
    tone: 'warning',
    glyph: (cls) => (
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className={cls}>
        <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 3.2a3.8 3.8 0 0 1 0 7.6Z" fill="currentColor" />
      </svg>
    ),
  },
  'in-review': {
    tone: 'info',
    glyph: (cls) => (
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className={cls}>
        <circle cx="7" cy="7" r="5.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 7V3.2A3.8 3.8 0 1 1 3.2 7Z" fill="currentColor" />
      </svg>
    ),
  },
  completed: {
    tone: 'success',
    glyph: (cls) => (
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className={cls}>
        <circle cx="7" cy="7" r="6" fill="currentColor" />
        <path d="M4.4 7.3l1.8 1.8 3.4-4" stroke="var(--brand-fg)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

const SERIES_COUNT = 8;

function normalizedSeries(series) {
  const value = Number(series);
  if (!Number.isFinite(value) || value < 1) return null;
  return ((Math.trunc(value) - 1) % SERIES_COUNT) + 1;
}

function Badge({ children, tone, status, series, severity, variant = 'soft', size, className, style, ...rest }) {
  const contextualSize = React.useContext(BadgeSizeContext);
  const resolvedSize = contextualSize || size || 'md';
  const s = status ? STATUS[status] : null;
  const resolvedTone = tone || (s && s.tone) || 'neutral';
  const t = TONES[resolvedTone] || TONES.neutral;
  const seriesNumber = normalizedSeries(series);
  const step = normalizedSeverity(severity);
  /* A ranked badge paints from the ordered scale and takes no tone class — the two would fight over
     background and colour, and the rank is the more specific statement. */
  const severityStyle = severityPaint(step);
  const seriesStyle = seriesNumber ? {
    background: `color-mix(in oklab, var(--chart-${seriesNumber}) 14%, var(--ctl-surface))`,
    color: `var(--chart-${seriesNumber}-ink)`,
  } : null;
  const iconOnly = s && children == null;
  return (
    <span
      className={cx(
        'inline-flex items-center shrink-0 rounded-full leading-none whitespace-nowrap',
        SIZES[resolvedSize] || SIZES.md,
        iconOnly && (ICON_ONLY[resolvedSize] || ICON_ONLY.md),
        step ? 'border border-solid' : (t[variant] || t.soft),
        className
      )}
      data-kf-block={step ? 'badge' : undefined}
      data-kf-severity={step || undefined}
      data-tone={step ? undefined : seriesNumber ? 'series' : resolvedTone}
      data-series={seriesNumber || undefined}
      data-status={status || undefined}
      style={Object.assign({}, seriesStyle, severityStyle, style)}
      {...rest}
    >
      {s ? s.glyph(cx('shrink-0', GLYPH[resolvedSize] || GLYPH.md)) : null}
      {children}
    </span>
  );
}

function Tag({ children, tone = 'neutral', variant = 'soft', size = 'md', onRemove, className, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      className={cx(
        'inline-flex items-center shrink-0 rounded-full font-medium leading-none whitespace-nowrap',
        SIZES[size] || SIZES.md,
        onRemove && 'pr-1',
        t[variant] || t.soft,
        className
      )}
      data-tone={tone}
      {...rest}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="grid place-items-center w-4 h-4 ml-1 shrink-0 rounded-full bg-transparent border-0 text-current opacity-70 cursor-pointer transition-opacity ease-ctl duration-[var(--default-transition-duration)] hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3 h-3">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}

export { Badge, Tag, TONES, STATUS, BadgeSizeContext };
export default Badge;
