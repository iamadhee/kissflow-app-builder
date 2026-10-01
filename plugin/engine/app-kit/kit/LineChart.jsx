// GENERATED from starter/src/components/kit/LineChart.jsx (sha256:a4aed2b8f350fe53). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * LineChart — trend over an ordered series.
 *
 * One normalized series model renders four bounded visual recipes. Themes pick
 * a recipe through generated CSS; callers may select the same recipe directly.
 * Comparison data always shares the primary series' value domain.
 *
 * <LineChart data={[{label:'W1', value:12}, {label:'W2', value:18}]} />
 */
const LINE_VARIANTS = new Set(['theme', 'area-points', 'reference-grid', 'step-line', 'curve-compare']);
const lineVariant = (value) => LINE_VARIANTS.has(value) ? value : 'theme';
const lineViewStyle = (view, fallback = 'none') => ({ display: `var(--line-${view}-display, ${fallback})` });
const validRows = (rows) => (Array.isArray(rows) ? rows : [])
  .filter((item) => item && typeof item.value === 'number' && isFinite(item.value));

function extent(lists, scaleMin, scaleMax) {
  const values = lists.flatMap((list) => list.map((item) => item.value));
  let min = scaleMin ?? (values.length ? Math.min(...values) : 0);
  let max = scaleMax ?? (values.length ? Math.max(...values) : 1);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  if (min > max) [min, max] = [max, min];
  return [min, max];
}

const pointPath = (points) => points
  .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  .join(' ');

const stepPath = (points) => points
  .map(([x, y], index) => index === 0
    ? `M${x.toFixed(2)},${y.toFixed(2)}`
    : `H${x.toFixed(2)} V${y.toFixed(2)}`)
  .join(' ');

// Monotone cubic interpolation keeps the curve inside each neighboring value
// pair instead of inventing peaks between observations.
function curvePath(points) {
  if (points.length < 3) return pointPath(points);
  const slopes = points.slice(1).map((point, index) => (
    (point[1] - points[index][1]) / Math.max(0.001, point[0] - points[index][0])
  ));
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes[slopes.length - 1];
    if (slopes[index - 1] * slopes[index] <= 0) return 0;
    return (slopes[index - 1] + slopes[index]) / 2;
  });

  slopes.forEach((slope, index) => {
    if (slope === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      return;
    }
    const a = tangents[index] / slope;
    const b = tangents[index + 1] / slope;
    const magnitude = Math.hypot(a, b);
    if (magnitude > 3) {
      const clamp = 3 / magnitude;
      tangents[index] = clamp * a * slope;
      tangents[index + 1] = clamp * b * slope;
    }
  });

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const run = point[0] - previous[0];
    const c1 = [previous[0] + run / 3, previous[1] + tangents[index] * run / 3];
    const c2 = [point[0] - run / 3, point[1] - tangents[index + 1] * run / 3];
    return `${path} C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${point[0].toFixed(2)},${point[1].toFixed(2)}`;
  }, `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`);
}

function AxisLabels({ items }) {
  return (
    <div className="flex w-full pt-3">
      {items.map((item, index) => (
        <span
          key={item.label ?? index}
          className="min-w-0 flex-1 text-sm text-ctl-fg-muted"
          style={{ textAlign: index === 0 ? 'left' : index === items.length - 1 ? 'right' : 'center' }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function SeriesLegend({ stroke, compareStroke, seriesLabel, compareLabel }) {
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-2 pt-3 text-sm text-ctl-fg-muted">
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-8" style={{ background: stroke }} />
        {seriesLabel}
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-8" style={{ background: compareStroke }} />
        {compareLabel}
      </span>
    </div>
  );
}

function LineView({
  view,
  items,
  compare,
  width,
  height,
  domain,
  stroke,
  compareStroke,
  area,
  dots,
  grid,
  axis,
  tooltip,
  hover,
  setHover,
  seriesLabel,
  compareLabel,
  format,
  axisFormat,
  gradientId,
}) {
  const isReference = view === 'reference';
  const isStep = view === 'step';
  const isCurve = view === 'curve';
  const pad = 10;
  const lineWidth = 2.5;
  const dotRadius = 5;
  const showDots = dots && !isStep;
  const xPad = showDots ? dotRadius + lineWidth / 2 : lineWidth / 2;
  const plotHeight = height - pad * 2;
  const [min, max] = domain;
  const xAt = (index, count) => count > 1
    ? xPad + (index / (count - 1)) * (width - xPad * 2)
    : width / 2;
  const yAt = (value) => pad + (1 - (value - min) / (max - min)) * plotHeight;
  const points = items.map((item, index) => [xAt(index, items.length), yAt(item.value)]);
  const comparePoints = compare.map((item, index) => [xAt(index, compare.length), yAt(item.value)]);
  const primaryPath = isStep ? stepPath(points) : isCurve ? curvePath(points) : pointPath(points);
  const comparisonPath = isStep ? stepPath(comparePoints) : pointPath(comparePoints);
  const fillPath = points.length
    ? `${pointPath(points)} L${points.at(-1)[0].toFixed(2)},${height - pad} L${points[0][0].toFixed(2)},${height - pad} Z`
    : '';
  const gridFractions = isReference ? [0, 0.5, 1] : grid ? [0, 0.33, 0.66, 1] : [];
  const displayName = { area: 'area', reference: 'reference', step: 'step', curve: 'curve' }[view];
  const onMove = (event) => {
    if (!tooltip) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (items.length - 1)));
  };

  const plot = (
    <div className="relative min-w-0 flex-1" style={{ height }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {gridFractions.map((fraction) => (
          <line
            key={fraction}
            x1="0"
            x2={width}
            y1={pad + fraction * plotHeight}
            y2={pad + fraction * plotHeight}
            stroke="var(--ctl-border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {view === 'area' && area ? <path d={fillPath} fill={`url(#${gradientId})`} stroke="none" /> : null}
        {comparePoints.length > 1 ? (
          <path
            d={comparisonPath}
            fill="none"
            stroke={compareStroke}
            strokeWidth="2"
            strokeDasharray={isCurve ? undefined : '4 4'}
            opacity={isCurve ? 0.8 : 1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        <path d={primaryPath} fill="none" stroke={stroke} strokeWidth={lineWidth} vectorEffect="non-scaling-stroke" />
        {showDots ? points.map((point, index) => (
          <circle
            key={items[index].label ?? index}
            cx={point[0]}
            cy={point[1]}
            r={dotRadius}
            fill="var(--ctl-surface)"
            stroke={stroke}
            strokeWidth={lineWidth}
            vectorEffect="non-scaling-stroke"
            opacity={hover != null && hover !== index ? 0.35 : 1}
            aria-hidden="true"
          />
        )) : null}
      </svg>
      {tooltip && hover != null && items[hover] ? (
        <div
          className="pointer-events-none absolute z-10 min-w-max -translate-x-1/2 -translate-y-full rounded-lg border border-ctl-border bg-ctl-surface px-3 py-2 text-sm shadow-md"
          style={{ left: `${(points[hover][0] / width) * 100}%`, top: `${(points[hover][1] / height) * 100}%` }}
        >
          <div className="flex items-center gap-2 text-ctl-fg">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: stroke }} />
            {seriesLabel}: {format ? format(items[hover].value) : items[hover].value}
          </div>
          {compare[hover] ? (
            <div className="flex items-center gap-2 text-ctl-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: compareStroke }} />
              {compareLabel}: {format ? format(compare[hover].value) : compare[hover].value}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      data-line-view={view === 'area' ? 'area-points' : view === 'reference' ? 'reference-grid' : view === 'step' ? 'step-line' : 'curve-compare'}
      aria-hidden="true"
      className="w-full min-w-0 flex-col"
      style={lineViewStyle(displayName, view === 'area' ? 'flex' : 'none')}
    >
      {isReference ? (
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3">
          <div className="relative text-sm tabular-nums text-ctl-fg-muted" style={{ height }}>
            {[max, (min + max) / 2, min].map((value, index) => (
              <span
                key={index}
                className="absolute right-0"
                style={{ top: `${index * 50}%`, transform: `translateY(${index === 0 ? '0' : index === 2 ? '-100%' : '-50%'})` }}
              >
                {axisFormat ? axisFormat(value) : Number.isInteger(value) ? value : value.toFixed(1)}
              </span>
            ))}
          </div>
          {plot}
          {axis ? <span /> : null}
          {axis ? <AxisLabels items={items} /> : null}
        </div>
      ) : (
        <>
          {plot}
          {isCurve && compare.length > 1 ? <SeriesLegend stroke={stroke} compareStroke={compareStroke} seriesLabel={seriesLabel} compareLabel={compareLabel} /> : null}
          {axis ? <AxisLabels items={items} /> : null}
        </>
      )}
    </div>
  );
}

function LineChart({
  data = [],
  compare = [],
  color,
  compareColor,
  area = true,
  height = 190,
  dots = true,
  grid = false,
  tooltip = false,
  axis = true,
  seriesLabel = 'This period',
  compareLabel = 'Last period',
  format,
  axisFormat,
  scaleMin,
  scaleMax,
  variant = 'theme',
  className,
}) {
  const items = validRows(data);
  const compared = validRows(compare).slice(0, items.length);
  const hasChart = items.length >= 2;
  const frameRef = React.useRef(null);
  const uniqueId = React.useId().replace(/:/g, '');
  const [frameWidth, setFrameWidth] = React.useState(1000);
  const [hover, setHover] = React.useState(null);
  const resolvedVariant = lineVariant(variant);

  React.useLayoutEffect(() => {
    if (!hasChart || !frameRef.current) return undefined;
    const frame = frameRef.current;
    const measure = () => {
      const next = Math.max(1, frame.getBoundingClientRect().width);
      setFrameWidth((current) => Math.abs(current - next) < 0.5 ? current : next);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [hasChart]);

  const accessibleLabel = items.length
    ? items.map((item) => `${item.label}: ${format ? format(item.value) : item.value}`).join(', ')
    : 'Not enough data to chart';

  if (!hasChart) {
    return (
      <div
        className={cx('flex w-full items-center justify-center rounded-lg border border-dashed border-ctl-border text-sm text-ctl-fg-muted', className)}
        style={{ height }}
        data-kf-component="line-chart"
        data-line-variant={resolvedVariant}
        role="img"
        aria-label={accessibleLabel}
      >
        Not enough data to chart.
      </div>
    );
  }

  const domain = extent([items, compared], scaleMin, scaleMax);
  const stroke = color || 'var(--chart-1)';
  const compareStroke = compareColor || 'var(--ctl-border-strong)';
  const shared = {
    items,
    compare: compared,
    width: frameWidth,
    height,
    domain,
    stroke,
    compareStroke,
    area,
    dots,
    grid,
    axis,
    tooltip,
    hover,
    setHover,
    seriesLabel,
    compareLabel,
    format,
    axisFormat,
  };

  return (
    <div
      ref={frameRef}
      className={cx('w-full min-w-0', className)}
      data-kf-component="line-chart"
      data-line-variant={resolvedVariant}
      role="img"
      aria-label={accessibleLabel}
    >
      <LineView {...shared} view="area" gradientId={`${uniqueId}-area`} />
      <LineView {...shared} view="reference" gradientId={`${uniqueId}-reference`} />
      <LineView {...shared} view="step" gradientId={`${uniqueId}-step`} />
      <LineView {...shared} view="curve" gradientId={`${uniqueId}-curve`} />
    </div>
  );
}

export { LineChart };
export default LineChart;
