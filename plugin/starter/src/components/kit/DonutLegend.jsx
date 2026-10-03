import React from "react";
import "./DonutLegend.css";

/**
 * Donut + Legend — share/composition of a whole.
 *
 * Controlled pair, not internally linked: Donut.activeIndex and
 * Legend.onActiveChange are wired by the caller, so hovering a legend row is
 * what highlights the ring — the ring never reacts to its own hover.
 * Adjacent segments retain flat ends and expose a narrow control-surface gap,
 * keeping category boundaries crisp without visually shortening the arcs.
 *
 * <Donut segments={items} /><Legend items={items} />
 */
const cx = (...p) => p.filter(Boolean).join(' ');
const RAMP = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
];
const AUTO_SIZE = 'clamp(152px, 28cqi, 208px)';
const SIZES = { sm: 84, md: 120, lg: 172 };
const ROW_COLUMNS = {
  auto: 'var(--donut-auto-size) minmax(0,1fr)',
  sm: '84px minmax(0,1fr)',
  md: '120px minmax(0,1fr)',
  lg: '172px minmax(0,1fr)',
};
const LEGEND_VARIANTS = new Set(['theme', 'simple-rows', 'column-ledger', 'progress-rails', 'inline-summary']);
const legendVariant = (value) => LEGEND_VARIANTS.has(value) ? value : 'theme';
const legendViewStyle = (view, fallback = 'none') => ({ display: `var(--legend-${view}-display, ${fallback})` });

const segmentColor = (item, index) => item.color || RAMP[index % RAMP.length];
const segmentInk = (item, index) => item.ink || `var(--chart-${(index % RAMP.length) + 1}-fill-ink, var(--ctl-fg))`;
const validRows = (rows) => (Array.isArray(rows) ? rows : [])
  .filter((item) => item && typeof item.value === 'number' && isFinite(item.value) && item.value >= 0);
const percentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

function Donut({ segments = [], size = 'md', activeIndex = null, caption = 'total', label, sublabel, format, className, children, ...rest }) {
  const dim = size === 'auto' ? 'var(--donut-auto-size, 152px)' : SIZES[size] || SIZES.md;
  const compactCenter = size === 'sm';
  const items = validRows(segments).filter((d) => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0);
  const r = 54;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className={cx('flex flex-col items-center gap-2', className)} {...rest}>
      {children}
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          viewBox="0 0 140 140"
          width="100%"
          height="100%"
          role="img"
          aria-label={items.length ? items.map((item) => `${item.label}: ${item.value}`).join(', ') : `No ${caption} data`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--ctl-surface)" strokeWidth="14" />
          {total <= 0 ? (
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--ctl-track)" strokeWidth="14" />
          ) : (
            items.map((d, i) => {
              const dash = (d.value / total) * C;
              const separator = items.length > 1 ? Math.min(3, dash * 0.35) : 0;
              const visibleDash = Math.max(0, dash - separator);
              const dashoffset = -(acc + separator / 2);
              acc += dash;
              const dimmed = activeIndex != null && activeIndex !== i;
              return (
                <circle
                  key={d.label ?? i}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={segmentColor(d, i)}
                  strokeWidth="14"
                  strokeLinecap="butt"
                  strokeDasharray={visibleDash + ' ' + (C - visibleDash)}
                  strokeDashoffset={dashoffset}
                  style={{ opacity: dimmed ? 0.35 : 1, transition: 'opacity var(--default-transition-duration) var(--default-transition-timing-function)' }}
                >
                  <title>{d.label}: {d.value}</title>
                </circle>
              );
            })
          )}
        </svg>
        {/* label/sublabel ARE the hole when given, not a second block beneath it.
           They used to render below the svg, which meant a caller passing a
           formatted total got the raw sum as the headline and their own figure as
           a footnote — the same quantity twice, with the meaningless form
           winning. A donut has exactly one centre, and the caller's label is the
           better claim on it.

           format covers the case where the sum IS the figure but needs units: a
           bare reduce() of the data has no idea whether it is dollars, thousands
           or percent. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className={cx(compactCenter ? 'text-base' : 'text-lg', 'font-data-emphasis font-semibold tabular-nums text-ctl-fg')}>
            {label != null ? label : total > 0 ? (format ? format(total) : total) : '\u2014'}
          </span>
          <span className={cx(
            compactCenter ? 'text-2xs leading-none' : 'text-sm leading-tight',
            'max-w-[78%] text-center text-pretty text-ctl-fg-muted',
          )}>
            {sublabel != null ? sublabel : caption}
          </span>
        </div>
      </div>
    </div>
  );
}

function Legend({
  items = [],
  title,
  showValue = true,
  showPercent = true,
  activeIndex = null,
  onActiveChange,
  variant = 'theme',
  className,
}) {
  const rows = validRows(items);
  const total = rows.reduce((s, d) => s + d.value, 0);
  const resolvedVariant = legendVariant(variant);
  const accessibleLabel = rows.length
    ? rows.map((item) => `${item.label}: ${item.value}, ${percentage(item.value, total)}%`).join('; ')
    : 'No legend data';
  const interaction = (index) => ({
    onMouseEnter: () => onActiveChange && onActiveChange(index),
    onMouseLeave: () => onActiveChange && onActiveChange(null),
    style: {
      opacity: activeIndex != null && activeIndex !== index ? 0.45 : 1,
      cursor: onActiveChange ? 'pointer' : 'default',
    },
  });

  return (
    <div
      className={cx('w-full min-w-0', className)}
      data-kf-component="donut-legend"
      data-legend-variant={resolvedVariant}
      role="img"
      aria-label={accessibleLabel}
    >
      <div data-legend-view="simple-rows" aria-hidden="true" className="w-full flex-col gap-4" style={legendViewStyle('simple', 'flex')}>
        {title ? <h3 className="font-display text-lg font-semibold text-ctl-fg">{title}</h3> : null}
        {rows.map((item, index) => {
          const pct = percentage(item.value, total);
          return (
            <div
              key={item.label ?? index}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-4 text-base"
              {...interaction(index)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segmentColor(item, index) }} />
              <span className="min-w-0 truncate text-ctl-fg-muted">{item.label}</span>
              {showValue ? <span className="font-data-emphasis font-medium tabular-nums text-ctl-fg">{item.value}</span> : <span />}
              {showPercent ? <span className="w-12 text-right tabular-nums text-ctl-fg-muted">{pct}%</span> : <span />}
            </div>
          );
        })}
      </div>

      <div data-legend-view="column-ledger" aria-hidden="true" className="w-full flex-col" style={legendViewStyle('ledger')}>
        {title ? <h3 className="mb-4 font-display text-lg font-semibold text-ctl-fg">{title}</h3> : null}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_5rem_5rem] items-end gap-x-4 border-x-0 border-t-0 border-b border-solid border-ctl-border pb-3 font-mono text-2xs font-semibold uppercase tracking-[.14em] text-ctl-fg-muted">
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span className="text-right">Count</span>
          <span className="text-right">Share</span>
        </div>
        {rows.map((item, index) => {
          const pct = percentage(item.value, total);
          return (
            <div
              key={item.label ?? index}
              className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_5rem_5rem] items-center gap-x-4 border-x-0 border-t-0 border-b border-solid border-ctl-border py-4 text-base last:border-b-0"
              {...interaction(index)}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: segmentColor(item, index) }} />
              <span className="min-w-0 truncate text-ctl-fg">{item.label}</span>
              {showValue ? <span className="text-right font-data-emphasis font-semibold tabular-nums text-ctl-fg">{item.value}</span> : <span />}
              {showPercent ? <span className="text-right tabular-nums text-ctl-fg-muted">{pct}%</span> : <span />}
            </div>
          );
        })}
      </div>

      <div data-legend-view="progress-rails" aria-hidden="true" className="w-full flex-col gap-5" style={legendViewStyle('progress')}>
        {title ? <h3 className="font-display text-lg font-semibold text-ctl-fg">{title}</h3> : null}
        {rows.map((item, index) => {
          const pct = percentage(item.value, total);
          const railFigure = showValue ? item.value : showPercent ? `${pct}%` : null;
          return (
            <div key={item.label ?? index} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-8 gap-y-2" {...interaction(index)}>
              <span className="min-w-0 truncate text-base text-ctl-fg">{item.label}</span>
              {railFigure != null ? <span className="row-span-2 self-center font-data-emphasis text-xl font-semibold tabular-nums" style={{ color: segmentColor(item, index) }}>{railFigure}</span> : null}
              <div className="h-2 min-w-0 overflow-hidden rounded-full bg-ctl-track">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: segmentColor(item, index) }} />
              </div>
            </div>
          );
        })}
      </div>

      <div data-legend-view="inline-summary" aria-hidden="true" className="w-full flex-col gap-5" style={legendViewStyle('inline')}>
        {title ? <h3 className="font-display text-lg font-semibold text-ctl-fg">{title}</h3> : null}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {rows.map((item, index) => {
            const pct = percentage(item.value, total);
            return (
              <div key={item.label ?? index} className="flex min-w-0 items-center gap-3 text-base" {...interaction(index)}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segmentColor(item, index) }} />
                <span className="whitespace-nowrap text-ctl-fg">{item.label}</span>
                {showValue ? <span className="font-data-emphasis font-semibold tabular-nums text-ctl-fg">{item.value}</span> : null}
                {showPercent ? <span className="tabular-nums text-ctl-fg-muted">{pct}%</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * DonutLegend — Donut and Legend wired together.
 *
 * They exist separately because either is useful alone, but paired they need one
 * piece of shared state: hovering a legend row should highlight its arc and vice
 * versa. Callers kept re-implementing that, so it lives here.
 *
 * `data` is the single series both halves read — Donut calls it `segments` and
 * Legend calls it `items`, which is exactly the seam this wrapper hides.
 */
function DonutLegend({
  data = [],
  size = 'md',
  caption = 'total',
  label,
  sublabel,
  format,
  showValue = true,
  showPercent = true,
  layout = 'row',
  variant = 'theme',
  legendVariant = 'theme',
  legendTitle,
  className,
}) {
  const [active, setActive] = React.useState(null);
  const rowColumns = ROW_COLUMNS[size] || ROW_COLUMNS.md;
  const rows = validRows(data);
  const total = rows.reduce((sum, item) => sum + item.value, 0);
  const totalFigure = label != null ? label : total > 0 ? (format ? format(total) : total) : '\u2014';
  const totalCaption = sublabel != null ? sublabel : caption;
  const stripColumns = rows.length ? rows.map((item) => `${Math.max(item.value, 0.001)}fr`).join(' ') : '1fr';

  return (
    <div
      className={cx('min-w-0', className)}
      style={{ containerType: 'inline-size', containerName: 'donut-chart', '--donut-auto-size': AUTO_SIZE, '--donut-row-columns': rowColumns }}
      onMouseLeave={() => setActive(null)}
      data-kf-component="donut-chart"
      data-donut-variant={variant}
    >
      <div
        data-donut-ledger-layout={layout}
        className={cx(
          'min-w-0',
          layout === 'column'
            ? 'grid-cols-1 justify-items-center'
            : 'grid-cols-1 items-center',
        )}
        style={{
          display: 'var(--donut-ledger-display, grid)',
          gap: 'var(--donut-ledger-gap, 1.25rem)',
        }}
      >
        <Donut
          segments={data}
          size={size}
          activeIndex={active}
          caption={caption}
          label={label}
          sublabel={sublabel}
          format={format}
          className="shrink-0"
        />
        {/* Auto is bounded by the component's own inline-size container:
            152px minimum, 28% preferred and 208px maximum. The legend owns the
            remaining column, while its own compact maximum keeps labels,
            values and percentages visually connected. Narrow layouts stack
            without squeezing. */}
        <div className="w-full min-w-0">
          <Legend
            items={data}
            showValue={showValue}
            showPercent={showPercent}
            activeIndex={active}
            onActiveChange={setActive}
            variant={legendVariant}
            title={legendTitle}
          />
        </div>
      </div>

      <div
        className="relative mx-auto w-full max-w-2xl place-items-center"
        style={{
          display: 'var(--donut-orbit-display, none)',
          minHeight: 'var(--donut-orbit-min-height, 22rem)',
        }}
      >
        <Donut
          segments={rows}
          size={size === 'sm' ? 'md' : 'lg'}
          activeIndex={active}
          caption={caption}
          label={label}
          sublabel={sublabel}
          format={format}
          className="relative z-10"
        />
        {rows.map((item, index) => {
          const angle = (-45 + (index / Math.max(rows.length, 1)) * 360) * Math.PI / 180;
          const x = Math.cos(angle);
          const y = Math.sin(angle);
          const pct = percentage(item.value, total);
          return (
            <div
              key={item.label ?? index}
              className="absolute z-20 min-w-28 text-sm leading-snug transition-opacity"
              onMouseEnter={() => setActive(index)}
              style={{
                left: `calc(50% + ${(x * 10).toFixed(3)}rem)`,
                top: `calc(50% + ${(y * 8).toFixed(3)}rem)`,
                transform: 'translate(-50%, -50%)',
                textAlign: x > 0.25 ? 'left' : x < -0.25 ? 'right' : 'center',
                opacity: active != null && active !== index ? 0.45 : 1,
              }}
            >
              <span className="block text-ctl-fg">{item.label}</span>
              <span className="block font-data-emphasis font-semibold tabular-nums" style={{ color: segmentColor(item, index) }}>
                {showValue ? item.value : null}{showValue && showPercent ? ' · ' : null}{showPercent ? `${pct}%` : null}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="min-w-0"
        style={{ display: 'var(--donut-strip-display, none)', gap: '1.25rem' }}
        role="img"
        aria-label={rows.length ? rows.map((item) => `${item.label}: ${item.value}, ${percentage(item.value, total)}%`).join('; ') : `No ${caption} data`}
      >
        <div className="text-right text-sm text-ctl-fg-muted">{totalFigure} {totalCaption}</div>
        <div
          className="flex min-w-0 overflow-hidden bg-ctl-track"
          style={{
            height: 'var(--donut-strip-height, 5.5rem)',
            borderRadius: 'var(--donut-strip-radius, var(--radius-lg))',
            gap: 'var(--donut-strip-gap, 0px)',
          }}
        >
          {rows.map((item, index) => {
            const pct = percentage(item.value, total);
            return (
              <div
                key={item.label ?? index}
                className="flex min-w-0 flex-col justify-center overflow-hidden px-4 transition-opacity"
                onMouseEnter={() => setActive(index)}
                style={{
                  flexBasis: 0,
                  flexGrow: Math.max(item.value, 0.001),
                  background: segmentColor(item, index),
                  color: segmentInk(item, index),
                  opacity: active != null && active !== index ? 0.45 : 1,
                }}
              >
                {showValue ? <span className="font-data-emphasis text-lg font-semibold tabular-nums">{item.value}</span> : null}
                {showPercent ? <span className="text-sm tabular-nums">{pct}%</span> : null}
              </div>
            );
          })}
        </div>
        <div className="grid min-w-0 gap-0" style={{ gridTemplateColumns: stripColumns }} aria-hidden="true">
          {rows.map((item, index) => (
            <span
              key={item.label ?? index}
              className="min-w-0 truncate pt-3 text-sm text-ctl-fg"
              onMouseEnter={() => setActive(index)}
              style={{ opacity: active != null && active !== index ? 0.45 : 1 }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Donut, Legend, DonutLegend };
export default DonutLegend;
