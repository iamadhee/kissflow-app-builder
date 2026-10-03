import React from "react";
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeDollarSign,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleHelp,
  Clock3,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  Eye,
  FileText,
  Folder,
  Info,
  Link,
  ListFilter,
  Lock,
  Menu,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  X,
} from "lucide-react";
import { semanticToneToken } from "./semanticTone.js";
import {
  SurfaceContext,
  elevationClass,
  materialRadiusClass,
  materialStyle,
  normalizeSurfaceContext,
  resolveElevation,
} from "./Surface.js";

/**
 * StatTile — one reference-led KPI anatomy for every data state.
 *
 * The former centred alternate anatomy is intentionally gone. A tile now keeps
 * the same left-aligned hierarchy whether or not it has history:
 * caption + delta, then figure + unit, then the optional sparkline.
 * This mirrors the supplied metric-card reference while retaining our token,
 * material, alarm and semantic-tone contracts.
 *
 * `delta` accepts arbitrary text; values beginning with + or -/− gain a drawn
 * direction arrow. `tone` colours the figure, delta and spark as one state;
 * `deltaTone` can override the delta independently.
 * When label and value are the primary data, the tile derives the compact
 * content state; it may also carry one quiet `supportingText`/`description`
 * line. Supplying an icon derives the icon-label-value state. Their
 * visual recipes come from the active theme while `compactVariant` and
 * `iconVariant` provide bounded review/one-off overrides. Neither state checks
 * a theme id, and richer tiles continue to use the full anatomy.
 * Numeric `series` data similarly derives a theme-owned sparkline treatment;
 * `sparklineVariant` can select one of the six bounded chart arrangements for
 * review or a deliberate exception without changing the series data shape.
 * Alarm keeps one horizontal anatomy while its visual treatment comes from the
 * active theme: outlined, semantic-solid, or neutral with concentrated semantic
 * emphasis. `alarmVariant` can explicitly select one of those treatments for a
 * deliberate one-off; its default, `theme`, never checks a theme name here.
 *
 * <StatTile label="Open claims" value={42} unit="this month" delta="+6" series={[4,6,5,8,9,7,10]} />
 * <StatTile label="Qualified leads" value="12.80k" unit="this month" delta="+8.4%" />
 */
const cx = (...p) => p.filter(Boolean).join(' ');

// StatTile keeps its stable string icon API for generated pages, but every
// glyph is rendered by Lucide. Unknown names remain visible during review.
const STAT_TILE_ICONS = Object.freeze({
  alert: TriangleAlert,
  archive: Archive,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  bell: Bell,
  calendar: CalendarDays,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  clock: Clock3,
  close: X,
  copy: Copy,
  download: Download,
  edit: Pencil,
  external: ExternalLink,
  eye: Eye,
  file: FileText,
  filter: ListFilter,
  folder: Folder,
  info: Info,
  link: Link,
  lock: Lock,
  menu: Menu,
  minus: Minus,
  money: BadgeDollarSign,
  more: Ellipsis,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  settings: Settings,
  star: Star,
  trash: Trash2,
  upload: Upload,
  user: User,
  warning: CircleAlert,
});

const STAT_TILE_ICON_SIZES = Object.freeze({ xs: 14, sm: 16, md: 18, lg: 22, xl: 28 });

function StatTileIcon({ name, size = 'md', className }) {
  if (React.isValidElement(name)) return name;
  const Glyph = typeof name === 'string' ? STAT_TILE_ICONS[name] || CircleHelp : name;
  if (!Glyph) return null;
  return <Glyph aria-hidden="true" className={className} size={STAT_TILE_ICON_SIZES[size] || size} strokeWidth={2} />;
}

const SEMANTIC_TONES = new Set(['neutral', 'accent', 'success', 'warning', 'info', 'danger']);
const normalizeTone = (tone) => {
  if (tone == null || tone === '') return null;
  const normalized = String(tone).trim().toLowerCase();
  if (normalized === 'pending') return 'warning';
  return SEMANTIC_TONES.has(normalized) ? normalized : 'neutral';
};

const ALARM_VARIANTS = new Set(['theme', 'outline', 'solid', 'accented']);
const normalizeAlarmVariant = (variant) => {
  const normalized = String(variant || 'theme').trim().toLowerCase();
  return ALARM_VARIANTS.has(normalized) ? normalized : 'theme';
};

const COMPACT_VARIANTS = new Set(['theme', 'stacked-solid', 'stacked-soft', 'inline-solid', 'split', 'band', 'badge', 'minimal', 'corner-accent']);
const normalizeCompactVariant = (variant) => {
  const normalized = String(variant || 'theme').trim().toLowerCase();
  return COMPACT_VARIANTS.has(normalized) ? normalized : 'theme';
};

const ICON_VARIANTS = new Set(['theme', 'trailing', 'heading', 'leading']);
const normalizeIconVariant = (variant) => {
  const normalized = String(variant || 'theme').trim().toLowerCase();
  return ICON_VARIANTS.has(normalized) ? normalized : 'theme';
};

const SPARKLINE_VARIANTS = new Set(['theme', 'bars-bottom', 'split', 'line-overlay', 'edge-bars', 'bars-trailing', 'classic-curve']);
const normalizeSparklineVariant = (variant) => {
  const normalized = String(variant || 'theme').trim().toLowerCase();
  return SPARKLINE_VARIANTS.has(normalized) ? normalized : 'theme';
};

/* Explicit variants use the same appearance roles emitted from the theme
   catalog. Keeping the role values local means the override remains useful in
   the review gallery without turning theme selection into component logic. */
const ALARM_VARIANT_STYLES = Object.freeze({
  outline: Object.freeze({
    '--stat-tile-alarm-surface': 'var(--material-surface)',
    '--stat-tile-alarm-image': 'var(--material-image)',
    '--stat-tile-alarm-outline': 'var(--material-border)',
    '--stat-tile-alarm-border': 'color-mix(in oklab, var(--stat-tile-alarm-tone-base) 60%, var(--material-surface))',
    '--stat-tile-alarm-side-rule-width': '0.1875rem',
    '--stat-tile-alarm-label': 'var(--ctl-fg-muted)',
    '--stat-tile-alarm-value': 'var(--stat-tile-alarm-tone-base)',
    '--stat-tile-alarm-unit': 'var(--ctl-fg-muted)',
    '--stat-tile-alarm-unit-weight': '400',
    '--stat-tile-alarm-icon-bg': 'var(--stat-tile-alarm-icon-tone-bg)',
    '--stat-tile-alarm-icon-fg': 'var(--stat-tile-alarm-icon-tone-text)',
    '--stat-tile-alarm-spark': 'var(--stat-tile-alarm-tone-base)',
    '--stat-tile-alarm-pill-bg': 'var(--stat-tile-alarm-tone-bg)',
    '--stat-tile-alarm-pill-fg': 'var(--stat-tile-alarm-tone-text)',
  }),
  solid: Object.freeze({
    '--stat-tile-alarm-surface': 'var(--stat-tile-alarm-tone-solid)',
    '--stat-tile-alarm-image': 'var(--stat-tile-alarm-tone-image)',
    '--stat-tile-alarm-outline': 'transparent',
    '--stat-tile-alarm-border': 'transparent',
    '--stat-tile-alarm-side-rule-width': '0px',
    '--stat-tile-alarm-label': 'var(--stat-tile-alarm-tone-fg)',
    '--stat-tile-alarm-value': 'var(--stat-tile-alarm-tone-fg)',
    '--stat-tile-alarm-unit': 'var(--stat-tile-alarm-tone-fg)',
    '--stat-tile-alarm-unit-weight': '600',
    '--stat-tile-alarm-icon-bg': 'color-mix(in oklab, var(--stat-tile-alarm-tone-fg) 18%, transparent)',
    '--stat-tile-alarm-icon-fg': 'var(--stat-tile-alarm-tone-fg)',
    '--stat-tile-alarm-spark': 'var(--stat-tile-alarm-tone-fg)',
    '--stat-tile-alarm-pill-bg': 'color-mix(in oklab, var(--stat-tile-alarm-tone-fg) 18%, transparent)',
    '--stat-tile-alarm-pill-fg': 'var(--stat-tile-alarm-tone-fg)',
  }),
  accented: Object.freeze({
    '--stat-tile-alarm-surface': 'var(--material-surface)',
    '--stat-tile-alarm-image': 'var(--material-image)',
    '--stat-tile-alarm-outline': 'var(--material-border)',
    '--stat-tile-alarm-border': 'transparent',
    '--stat-tile-alarm-side-rule-width': '0px',
    '--stat-tile-alarm-label': 'var(--ctl-fg)',
    '--stat-tile-alarm-value': 'var(--stat-tile-alarm-tone-text)',
    '--stat-tile-alarm-unit': 'var(--ctl-fg)',
    '--stat-tile-alarm-unit-weight': '400',
    '--stat-tile-alarm-icon-bg': 'var(--stat-tile-alarm-icon-tone-solid)',
    '--stat-tile-alarm-icon-fg': 'var(--stat-tile-alarm-icon-tone-fg)',
    '--stat-tile-alarm-spark': 'var(--stat-tile-alarm-tone-base)',
    '--stat-tile-alarm-pill-bg': 'var(--stat-tile-alarm-tone-bg)',
    '--stat-tile-alarm-pill-fg': 'var(--stat-tile-alarm-tone-text)',
  }),
});

function Sparkline({ series, color, bleed, bare, themed = false }) {
  const gradientId = React.useId().replace(/[^a-z0-9]/gi, '');
  const pts = (Array.isArray(series) ? series : []).filter((v) => typeof v === 'number' && isFinite(v));
  if (pts.length < 2) return null;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min;
  const span = range || 1;
  const xAt = (i) => 2 + (i / (pts.length - 1)) * 96;
  const yAt = (v) => range ? 30 - ((v - min) / span) * 26 : 16;
  const co = pts.map((v, i) => [xAt(i), yAt(v)]);
  const n = (x) => Math.round(x * 100) / 100;
  /* Catmull-Rom through the points, converted to cubics: a trend line reads as
     a movement, and the polyline's corners made every sample look like an event.
     Clamp each control point to its segment's value range. Unbounded controls
     make equal or near-equal samples bulge beyond the data and invent a peak. */
  const T = 0.16;
  const clampY = (value, a, b) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), value));
  const line = co.reduce((d, p1, i) => {
    if (i === 0) return 'M' + n(p1[0]) + ',' + n(p1[1]);
    const p0 = co[i - 2] || co[i - 1];
    const prev = co[i - 1];
    const p2 = co[i + 1] || p1;
    const c1 = [prev[0] + (p1[0] - p0[0]) * T, clampY(prev[1] + (p1[1] - p0[1]) * T, prev[1], p1[1])];
    const c2 = [p1[0] - (p2[0] - prev[0]) * T, clampY(p1[1] - (p2[1] - prev[1]) * T, prev[1], p1[1])];
    return d + ' C' + n(c1[0]) + ',' + n(c1[1]) + ' ' + n(c2[0]) + ',' + n(c2[1]) + ' ' + n(p1[0]) + ',' + n(p1[1]);
  }, '');
  const area = line + ` L100,36 L0,36 Z`;
  const id = `st-fade-${gradientId}`;
  const pointHeight = (point) => range ? 22 + ((point - min) / span) * 78 : 72;
  const pointOpacity = (point) => range ? 0.34 + ((point - min) / span) * 0.46 : 0.68;
  const lastPoint = co[co.length - 1];

  return (
    <div
      aria-hidden="true"
      data-stat-tile-spark-chart={themed ? '' : undefined}
      className={themed ? 'relative min-w-0 overflow-hidden' : cx('mt-auto overflow-hidden pt-3', bleed ? 'self-stretch' : 'w-full', bleed && !bare && '-mx-5 -mb-5')}
      style={themed ? {
        gridColumn: 'var(--stat-tile-spark-chart-column)',
        gridRow: 'var(--stat-tile-spark-chart-row)',
        justifySelf: 'var(--stat-tile-spark-chart-justify)',
        alignSelf: 'var(--stat-tile-spark-chart-align)',
        width: 'var(--stat-tile-spark-chart-width)',
        height: 'var(--stat-tile-spark-chart-height)',
        margin: bleed && !bare ? 'var(--stat-tile-spark-chart-margin)' : 0,
        opacity: 'var(--stat-tile-spark-chart-opacity)',
        zIndex: 'var(--stat-tile-spark-chart-z)',
      } : bleed && bare ? {
        marginInline: 'calc(var(--material-bare-cell-padding-inline) * -1)',
        marginBottom: 'calc(var(--material-bare-cell-padding-block) * -1)',
      } : undefined}
    >
      <div
        data-stat-tile-spark-line={themed ? '' : undefined}
        className="relative h-full w-full"
        style={{ display: themed ? 'var(--stat-tile-spark-line-display)' : 'block' }}
      >
        <svg
          viewBox="0 0 100 36"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{
            display: 'block',
            transform: themed ? 'var(--stat-tile-spark-line-transform)' : 'none',
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={themed ? 'var(--stat-tile-spark-line-fill-opacity)' : '0.22'} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={'url(#' + id + ')'} stroke="none" />
          <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          aria-hidden="true"
          data-stat-tile-spark-dot={themed ? '' : undefined}
          className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            display: themed ? 'var(--stat-tile-spark-dot-display)' : 'none',
            left: `${lastPoint[0]}%`,
            top: `${(lastPoint[1] / 36) * 100}%`,
            background: color,
          }}
        />
      </div>
      <div
        data-stat-tile-spark-bars={themed ? '' : undefined}
        className="h-full w-full items-end"
        style={{ display: themed ? 'var(--stat-tile-spark-bars-display)' : 'none', gap: 'var(--stat-tile-spark-bars-gap)' }}
      >
        {pts.map((point, index) => (
          <span
            key={`${index}-${point}`}
            data-stat-tile-spark-bar=""
            data-last={index === pts.length - 1 ? 'true' : undefined}
            style={{
              '--spark-point-height': `${pointHeight(point)}%`,
              '--spark-point-opacity': pointOpacity(point),
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
  alarm = false,
  alarmVariant = 'theme',
  delta,
  tone,
  deltaTone,
  series,
  bleed = true,
  icon,
  iconTone,
  supportingText,
  description,
  compactVariant = 'theme',
  iconVariant = 'theme',
  sparklineVariant = 'theme',
  className,
  style,
}) {
  const ambient = normalizeSurfaceContext(React.useContext(SurfaceContext));
  const mat = ambient.material;
  const bare = mat === 'bare';
  const spacing = mat === 'spacing';
  const unframed = mat === 'flat' || spacing;
  const resolvedElevation = resolveElevation({ geometry: ambient.geometry, material: mat });
  const resolvedTone = normalizeTone(tone);
  const resolvedDeltaTone = normalizeTone(deltaTone);
  const resolvedIconTone = normalizeTone(iconTone);
  const resolvedAlarmVariant = normalizeAlarmVariant(alarmVariant);
  const resolvedCompactVariant = normalizeCompactVariant(compactVariant);
  const resolvedIconVariant = normalizeIconVariant(iconVariant);
  const resolvedSparklineVariant = normalizeSparklineVariant(sparklineVariant);
  const figureColor = resolvedTone ? semanticToneToken(resolvedTone, 'base') : 'var(--ctl-fg)';
  const pillTone = resolvedDeltaTone || resolvedTone;
  const sparkColor = resolvedTone ? semanticToneToken(resolvedTone, 'base') : 'var(--chart-1)';
  const alarmTone = resolvedTone || 'danger';
  const alarmColor = semanticToneToken(alarmTone, 'base');
  const hasSeries = Array.isArray(series) && series.filter((point) => typeof point === 'number' && isFinite(point)).length >= 2;
  const compactSupportingText = supportingText ?? description;
  const hasCompactSupporting = compactSupportingText != null && compactSupportingText !== '';
  const sparklineState = hasSeries && !alarm;
  const hasRichContent = unit != null || delta != null || alarm || hasSeries;
  const iconLabelValueOnly = icon != null && !hasRichContent;
  const labelValueOnly = icon == null && !hasRichContent;
  const compactIconTone = resolvedIconTone || resolvedTone || 'accent';
  const alarmIconTone = resolvedIconTone || resolvedTone || 'danger';
  const alarmIcon = icon || 'alert';
  const compactFillTone = resolvedTone || 'accent';
  const compactLocalColor = semanticToneToken(compactFillTone, 'base');
  const sparkTone = resolvedTone || 'accent';
  const sparkDeltaTone = resolvedDeltaTone || resolvedTone || 'accent';
  const labelClass = 'text-sm font-normal text-ctl-fg-muted';
  const deltaText = typeof delta === 'string' || typeof delta === 'number' ? String(delta).trim() : '';
  const deltaDirection = /^[+]/.test(deltaText) ? 'up' : /^[-−]/.test(deltaText) ? 'down' : null;
  const alarmToneStyle = alarm ? {
    '--stat-tile-alarm-tone-base': alarmColor,
    '--stat-tile-alarm-tone-bg': semanticToneToken(alarmTone, 'bg'),
    '--stat-tile-alarm-tone-text': semanticToneToken(alarmTone, 'text'),
    '--stat-tile-alarm-tone-solid': semanticToneToken(alarmTone, 'solid'),
    '--stat-tile-alarm-tone-fg': semanticToneToken(alarmTone, 'fg'),
    '--stat-tile-alarm-tone-image': semanticToneToken(alarmTone, 'surfaceImage'),
    '--stat-tile-alarm-icon-tone-bg': semanticToneToken(alarmIconTone, 'bg'),
    '--stat-tile-alarm-icon-tone-text': semanticToneToken(alarmIconTone, 'text'),
    '--stat-tile-alarm-icon-tone-solid': semanticToneToken(alarmIconTone, 'solid'),
    '--stat-tile-alarm-icon-tone-fg': semanticToneToken(alarmIconTone, 'fg'),
    ...(resolvedAlarmVariant === 'theme' ? null : ALARM_VARIANT_STYLES[resolvedAlarmVariant]),
    backgroundColor: 'var(--stat-tile-alarm-surface)',
    backgroundImage: 'var(--stat-tile-alarm-image)',
  } : null;
  const compactToneStyle = labelValueOnly ? {
    '--stat-tile-compact-tone-base': compactLocalColor,
    '--stat-tile-compact-tone-bg': semanticToneToken(compactFillTone, 'bg'),
    '--stat-tile-compact-tone-text': semanticToneToken(compactFillTone, 'text'),
    '--stat-tile-compact-tone-solid': semanticToneToken(compactFillTone, 'solid'),
    '--stat-tile-compact-tone-fg': semanticToneToken(compactFillTone, 'fg'),
    '--stat-tile-compact-tone-image': semanticToneToken(compactFillTone, 'surfaceImage'),
  } : null;
  const compactBareStyle = labelValueOnly && bare ? {
    '--stat-tile-compact-columns': 'minmax(0, 1fr)',
    '--stat-tile-compact-rows': 'auto auto',
    '--stat-tile-compact-column-gap': '0.75rem',
    '--stat-tile-compact-row-gap': '0.5rem',
    '--stat-tile-compact-align-content': 'center',
    '--stat-tile-compact-min-height': '0px',
    '--stat-tile-compact-value-column': '1',
    '--stat-tile-compact-value-row': '1',
    '--stat-tile-compact-value-justify': 'start',
    '--stat-tile-compact-value-align': 'center',
    '--stat-tile-compact-value-bg': 'transparent',
    '--stat-tile-compact-value-color': compactLocalColor,
    '--stat-tile-compact-value-radius': '0px',
    '--stat-tile-compact-value-padding': '0',
    '--stat-tile-compact-value-margin': '0',
    '--stat-tile-compact-value-width': 'auto',
    '--stat-tile-compact-value-min-width': '0',
    '--stat-tile-compact-value-height': 'auto',
    '--stat-tile-compact-value-size': '2.25rem',
    '--stat-tile-compact-value-weight': '500',
    '--stat-tile-compact-label-column': '1',
    '--stat-tile-compact-label-row': '2',
    '--stat-tile-compact-label-align': 'center',
    '--stat-tile-compact-label-bg': 'transparent',
    '--stat-tile-compact-label-color': 'var(--ctl-fg-muted)',
    '--stat-tile-compact-label-padding': '0',
    '--stat-tile-compact-label-margin': '0',
    '--stat-tile-compact-label-transform': 'none',
    '--stat-tile-compact-label-weight': '400',
    '--stat-tile-compact-label-tracking': 'normal',
    '--stat-tile-compact-label-size': '0.875rem',
    '--stat-tile-compact-label-line-height': '1.25rem',
    '--stat-tile-compact-supporting-column': '1',
    '--stat-tile-compact-supporting-row': '3',
    '--stat-tile-compact-supporting-align': 'center',
    '--stat-tile-compact-supporting-color': 'var(--ctl-fg-muted)',
    '--stat-tile-compact-supporting-margin': '0',
    '--stat-tile-compact-supporting-size': '0.75rem',
    '--stat-tile-compact-supporting-line-height': '1.125rem',
    '--stat-tile-compact-decoration-display': 'none',
  } : null;
  const iconToneStyle = iconLabelValueOnly ? {
    '--stat-tile-icon-tone-bg': semanticToneToken(compactIconTone, 'bg'),
    '--stat-tile-icon-tone-text': semanticToneToken(compactIconTone, 'text'),
    '--stat-tile-icon-tone-solid': semanticToneToken(compactIconTone, 'solid'),
    '--stat-tile-icon-tone-fg': semanticToneToken(compactIconTone, 'fg'),
  } : null;
  const sparkToneStyle = sparklineState ? {
    '--stat-tile-spark-tone-base': sparkColor,
    '--stat-tile-spark-tone-bg': semanticToneToken(sparkTone, 'bg'),
    '--stat-tile-spark-tone-text': semanticToneToken(sparkTone, 'text'),
    '--stat-tile-spark-tone-solid': semanticToneToken(sparkTone, 'solid'),
    '--stat-tile-spark-tone-fg': semanticToneToken(sparkTone, 'fg'),
    '--stat-tile-spark-delta-tone-bg': semanticToneToken(sparkDeltaTone, 'bg'),
    '--stat-tile-spark-delta-tone-text': semanticToneToken(sparkDeltaTone, 'text'),
  } : null;

  const caption = alarm ? (
    <span className={cx('inline-flex min-w-0 items-center', labelClass)} style={{ color: 'var(--stat-tile-alarm-label)' }}>
      <span className="min-w-0 truncate">{label}</span>
      <span className="sr-only">In alarm</span>
    </span>
  ) : (
    <span className={cx('min-w-0 truncate', labelClass)}>{label}</span>
  );

  const pill = delta != null && (
    <span
      className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1 text-xs font-medium tabular-nums"
      style={{
        background: alarm ? 'var(--stat-tile-alarm-pill-bg)' : pillTone ? semanticToneToken(pillTone, 'bg') : 'var(--ctl-track)',
        color: alarm ? 'var(--stat-tile-alarm-pill-fg)' : pillTone ? semanticToneToken(pillTone, 'text') : 'var(--ctl-fg-muted)',
      }}
    >
      {deltaDirection && <StatTileIcon name={deltaDirection === 'up' ? 'arrowUp' : 'arrowDown'} size="xs" />}
      {delta}
    </span>
  );

  return (
    <div
      className={cx(
        'relative flex h-full flex-col overflow-hidden bg-material-surface [background-image:var(--material-image)]',
        !bare && 'px-5 py-4',
        materialRadiusClass(mat),
        elevationClass(resolvedElevation),
        className
      )}
      /* Panel's edge is an OUTLINE, not a border: a border takes a line of box,
         so a bleeding sparkline could never reach the tile's real edge. The
         inset outline follows the radius without changing layout; Flat and
         Spacing omit that edge as part of the shared material contract. */
      style={Object.assign(
        bare ? {
          paddingInline: 'var(--material-bare-cell-padding-inline)',
          paddingBlock: 'var(--material-bare-cell-padding-block)',
        } : unframed ? { outline: 'none' } : { outline: `1px solid ${alarm ? 'var(--stat-tile-alarm-outline)' : 'var(--material-border)'}`, outlineOffset: '-1px' },
        materialStyle(mat, ambient.geometry),
        alarmToneStyle,
        compactToneStyle,
        iconToneStyle,
        sparkToneStyle,
        labelValueOnly && !bare ? {
          padding: 'var(--stat-tile-compact-outer-padding)',
          backgroundColor: 'var(--stat-tile-compact-surface)',
          backgroundImage: 'var(--stat-tile-compact-image)',
          outline: '1px solid var(--stat-tile-compact-outline)',
          outlineOffset: '-1px',
        } : null,
        unframed ? { outline: 'none' } : null,
        compactBareStyle,
        style
      )}
      data-kf-component="stat-tile"
      data-material={mat}
      data-elevation={resolvedElevation}
      data-padding={bare ? 'bare-cell' : 'md'}
      data-content={alarm ? 'alarm' : labelValueOnly ? 'label-value' : iconLabelValueOnly ? 'icon-label-value' : 'full'}
      data-alarm-variant={alarm ? resolvedAlarmVariant : undefined}
      data-compact-variant={labelValueOnly ? resolvedCompactVariant : undefined}
      data-icon-variant={iconLabelValueOnly ? resolvedIconVariant : undefined}
      data-sparkline-variant={sparklineState ? resolvedSparklineVariant : undefined}
    >
      {alarm && (
        bare ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0"
            style={{
              top: 'var(--material-bare-cell-padding-block)',
              bottom: 'var(--material-bare-cell-padding-block)',
              width: 'var(--stat-tile-alarm-side-rule-width)',
              background: 'var(--stat-tile-alarm-tone-base)',
            }}
          />
        ) : !spacing ? (
          <span
            aria-hidden="true"
            className={cx('pointer-events-none absolute inset-0', materialRadiusClass(mat))}
            style={{ border: '1px solid var(--stat-tile-alarm-border)' }}
          />
        ) : null
      )}
      {alarm ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex min-w-0 items-center gap-3">
                {caption}
                {pill}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <span className="font-data-emphasis text-[36px] font-medium leading-none tracking-[-.035em] tabular-nums" style={{ color: 'var(--stat-tile-alarm-value)' }}>
                  {value}
                </span>
                {unit && <span className="text-sm text-ctl-fg-muted" style={{ color: 'var(--stat-tile-alarm-unit)', fontWeight: 'var(--stat-tile-alarm-unit-weight)' }}>{unit}</span>}
              </div>
            </div>
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg"
              style={{ background: 'var(--stat-tile-alarm-icon-bg)', color: 'var(--stat-tile-alarm-icon-fg)' }}
            >
              <StatTileIcon name={alarmIcon} size="md" />
            </span>
          </div>
          {series && <Sparkline series={series} color="var(--stat-tile-alarm-spark)" bleed={bleed} bare={bare} />}
        </>
      ) : labelValueOnly ? (
        <>
          {!bare ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                display: 'var(--stat-tile-compact-decoration-display)',
                background: 'var(--stat-tile-compact-decoration-bg)',
                opacity: 'var(--stat-tile-compact-decoration-opacity)',
                width: 'var(--stat-tile-compact-decoration-size)',
                height: 'var(--stat-tile-compact-decoration-size)',
                top: 'var(--stat-tile-compact-decoration-top)',
                right: 'var(--stat-tile-compact-decoration-right)',
              }}
            />
          ) : null}
          <div
            className="z-10 min-h-0 min-w-0 flex-1"
            style={{
              position: 'var(--stat-tile-compact-layout-position)',
              inset: 'var(--stat-tile-compact-layout-inset)',
              display: 'grid',
              boxSizing: 'border-box',
              gridTemplateColumns: 'var(--stat-tile-compact-columns)',
              gridTemplateRows: 'var(--stat-tile-compact-rows)',
              columnGap: 'var(--stat-tile-compact-column-gap)',
              rowGap: 'var(--stat-tile-compact-row-gap)',
              alignItems: 'center',
              alignContent: 'var(--stat-tile-compact-align-content)',
              minHeight: 'var(--stat-tile-compact-min-height)',
              padding: 'var(--stat-tile-compact-layout-padding)',
            }}
          >
            <span
              data-stat-tile-compact-value=""
              className="font-data-emphasis text-[36px] font-medium leading-none tracking-[-.035em] tabular-nums"
              style={{
                gridColumn: 'var(--stat-tile-compact-value-column)',
                gridRow: hasCompactSupporting
                  ? 'var(--stat-tile-compact-value-row-with-supporting, var(--stat-tile-compact-value-row))'
                  : 'var(--stat-tile-compact-value-row)',
                justifySelf: 'var(--stat-tile-compact-value-justify)',
                alignSelf: 'var(--stat-tile-compact-value-align)',
                display: 'grid',
                placeItems: 'center',
                boxSizing: 'border-box',
                background: 'var(--stat-tile-compact-value-bg)',
                color: 'var(--stat-tile-compact-value-color)',
                padding: 'var(--stat-tile-compact-value-padding)',
                margin: 'var(--stat-tile-compact-value-margin)',
                width: 'var(--stat-tile-compact-value-width)',
                minWidth: 'var(--stat-tile-compact-value-min-width)',
                height: 'var(--stat-tile-compact-value-height)',
                fontSize: 'var(--stat-tile-compact-value-size)',
                fontWeight: 'var(--stat-tile-compact-value-weight)',
              }}
            >{value}</span>
            <span
              className="min-w-0 truncate"
              style={{
                gridColumn: 'var(--stat-tile-compact-label-column)',
                gridRow: 'var(--stat-tile-compact-label-row)',
                alignSelf: 'var(--stat-tile-compact-label-align)',
                background: 'var(--stat-tile-compact-label-bg)',
                color: 'var(--stat-tile-compact-label-color)',
                padding: 'var(--stat-tile-compact-label-padding)',
                margin: 'var(--stat-tile-compact-label-margin)',
                textTransform: 'var(--stat-tile-compact-label-transform)',
                fontWeight: 'var(--stat-tile-compact-label-weight)',
                letterSpacing: 'var(--stat-tile-compact-label-tracking)',
                fontSize: 'var(--stat-tile-compact-label-size)',
                lineHeight: 'var(--stat-tile-compact-label-line-height)',
              }}
            >{label}</span>
            {hasCompactSupporting ? (
              <span
                data-stat-tile-compact-supporting=""
                className="min-w-0 truncate"
                style={{
                  gridColumn: 'var(--stat-tile-compact-supporting-column)',
                  gridRow: 'var(--stat-tile-compact-supporting-row)',
                  alignSelf: 'var(--stat-tile-compact-supporting-align)',
                  color: 'var(--stat-tile-compact-supporting-color)',
                  margin: 'var(--stat-tile-compact-supporting-margin)',
                  fontSize: 'var(--stat-tile-compact-supporting-size)',
                  lineHeight: 'var(--stat-tile-compact-supporting-line-height)',
                }}
              >{compactSupportingText}</span>
            ) : null}
          </div>
        </>
      ) : iconLabelValueOnly ? (
        <div
          data-stat-tile-icon-layout=""
          className="min-w-0"
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--stat-tile-icon-columns)',
            gridTemplateRows: 'var(--stat-tile-icon-rows)',
            columnGap: 'var(--stat-tile-icon-column-gap)',
            rowGap: 'var(--stat-tile-icon-row-gap)',
            alignItems: 'center',
          }}
        >
          <span
            data-stat-tile-icon-label=""
            className={cx('min-w-0 truncate', labelClass)}
            style={{ gridColumn: 'var(--stat-tile-icon-label-column)', gridRow: 'var(--stat-tile-icon-label-row)' }}
          >{label}</span>
          <span
            className="font-data-emphasis text-[36px] font-medium leading-none tracking-[-.035em] tabular-nums text-ctl-fg"
            style={{
              gridColumn: 'var(--stat-tile-icon-value-column)',
              gridRow: 'var(--stat-tile-icon-value-row)',
              margin: 'var(--stat-tile-icon-value-margin)',
            }}
          >{value}</span>
          <span
            data-stat-tile-icon-chip=""
            className="grid shrink-0 place-items-center text-base"
            style={{
              gridColumn: 'var(--stat-tile-icon-chip-column)',
              gridRow: 'var(--stat-tile-icon-chip-row)',
              width: 'var(--stat-tile-icon-chip-size)',
              height: 'var(--stat-tile-icon-chip-size)',
              background: 'var(--stat-tile-icon-chip-bg)',
              color: 'var(--stat-tile-icon-chip-fg)',
            }}
          >
            <StatTileIcon name={icon} size="md" className="size-[var(--stat-tile-icon-glyph-size)]" />
          </span>
        </div>
      ) : sparklineState ? (
        <div
          data-stat-tile-spark-layout=""
          className="min-w-0 flex-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--stat-tile-spark-columns)',
            gridTemplateRows: 'var(--stat-tile-spark-rows)',
            columnGap: 'var(--stat-tile-spark-column-gap)',
            rowGap: 'var(--stat-tile-spark-row-gap)',
            alignItems: 'center',
          }}
        >
          <span
            data-stat-tile-spark-label=""
            className={cx('relative z-10 min-w-0 truncate', labelClass)}
            style={{
              gridColumn: 'var(--stat-tile-spark-label-column)',
              gridRow: 'var(--stat-tile-spark-label-row)',
              justifySelf: 'var(--stat-tile-spark-label-justify)',
              alignSelf: 'var(--stat-tile-spark-label-align)',
              boxSizing: 'border-box',
              background: 'var(--stat-tile-spark-label-bg)',
              color: 'var(--stat-tile-spark-label-color)',
              padding: 'var(--stat-tile-spark-label-padding)',
              margin: 'var(--stat-tile-spark-label-margin)',
            }}
          >{label}</span>
          {delta != null && (
            <span
              data-stat-tile-spark-delta=""
              className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full text-xs font-medium tabular-nums"
              style={{
                gridColumn: 'var(--stat-tile-spark-delta-column)',
                gridRow: 'var(--stat-tile-spark-delta-row)',
                justifySelf: 'var(--stat-tile-spark-delta-justify)',
                alignSelf: 'var(--stat-tile-spark-delta-align)',
                background: 'var(--stat-tile-spark-delta-bg)',
                color: 'var(--stat-tile-spark-delta-color)',
                padding: 'var(--stat-tile-spark-delta-padding)',
              }}
            >
              {deltaDirection && <StatTileIcon name={deltaDirection === 'up' ? 'arrowUp' : 'arrowDown'} size="xs" />}
              {delta}
            </span>
          )}
          <div
            data-stat-tile-spark-value=""
            className="relative z-10 flex min-w-0 items-baseline gap-2"
            style={{
              gridColumn: 'var(--stat-tile-spark-value-column)',
              gridRow: 'var(--stat-tile-spark-value-row)',
              justifySelf: 'var(--stat-tile-spark-value-justify)',
              alignSelf: 'var(--stat-tile-spark-value-align)',
              boxSizing: 'border-box',
              background: 'var(--stat-tile-spark-value-bg)',
              color: 'var(--stat-tile-spark-value-color)',
              padding: 'var(--stat-tile-spark-value-padding)',
              margin: 'var(--stat-tile-spark-value-margin)',
            }}
          >
            <span className="font-data-emphasis text-[36px] font-medium leading-none tracking-[-.035em] tabular-nums">{value}</span>
            {unit && <span className="text-xs opacity-70">{unit}</span>}
          </div>
          <Sparkline series={series} color={sparkColor} bleed={bleed} bare={bare} themed />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            {caption}
            {pill}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-data-emphasis text-[36px] font-medium leading-none tracking-[-.035em] tabular-nums" style={{ color: figureColor }}>
              {value}
            </span>
            {unit && <span className="text-xs text-ctl-fg-muted">{unit}</span>}
          </div>
          {series && <Sparkline series={series} color={sparkColor} bleed={bleed} bare={bare} />}
        </>
      )}
      {/* A prop this component accepts and silently ignores is worse than one it rejects: the caller
          cannot tell. `description` was read into compactSupportingText and then rendered in exactly
          ONE of five layouts (label+value), so any tile carrying a unit, a delta, an alarm or a series
          dropped it without a word. A depot dashboard passed four descriptions and showed one — and
          the prop check passes, because the prop is on the contract. The label+value branch keeps its
          own grid-placed line; every other branch renders it here. */}
      {hasCompactSupporting && !labelValueOnly ? (
        <p
          data-stat-tile-supporting=""
          className="m-0 mt-2 text-xs leading-snug text-ctl-fg-muted"
        >{compactSupportingText}</p>
      ) : null}
    </div>
  );
}

export { StatTile };
export default StatTile;
