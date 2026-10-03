// bespoke/ui.jsx — THE HOUSE STYLE a comprehensive build composes from, as Tailwind helper classes and
// the smallest components that carry them. Express assembles from the kit; comprehensive builds bespoke
// pages on these helpers, the theme's tokens and the Kissflow SDK. Derived from the clinic-trials
// bespoke crew's sponsor page (2026-09-16), which set the bar: quiet panels
// on the ctl surface, one hairline between things, mono tabular figures, chips that are tinted
// washes with ink of their tone, meters that always show their value. Every page composes from
// these and varies on them; nothing here is a kit component — plain elements, theme tokens, SVG.
import React from "react";
import { RESET_CLASS } from "./reset.js";
export { RESET_CLASS };

export const cx = (...parts) => parts.filter(Boolean).join(" ");

/* ── layout ────────────────────────────────────────────────────────────────── */
/* RELAXED, RICH, SLEEK, MODERN — the user's words for comprehensive. Every measure below is on the theme's
   4px grid and every colour is a token; the room between things is the style. */
export const PAGE = `${RESET_CLASS} mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-8 py-8 font-sans text-ctl-fg`;
// Preflight is off in this app, so headings and paragraphs keep the UA's margins unless a class says otherwise.
export const EYEBROW = "m-0 text-xs font-semibold uppercase tracking-[0.12em] text-ctl-fg-subtle";
export const TITLE = "mt-2 mb-0 text-3xl font-semibold leading-9 tracking-tight";
export const LEDE = "mt-2 mb-0 max-w-2xl text-base text-ctl-fg-muted";
export const PANEL = "rounded-xl border border-ctl-border bg-ctl-surface shadow-[0_1px_2px_rgb(0_0_0/0.03),0_12px_32px_-16px_rgb(0_0_0/0.10)]";
export const PANEL_HEAD = "flex items-baseline justify-between gap-4 px-6 py-5";
export const PANEL_TITLE = "m-0 text-base font-semibold tracking-tight";
export const PANEL_SUB = "mt-1 mb-0 text-sm text-ctl-fg-muted";
export const OF = "font-mono text-xs tabular-nums text-ctl-fg-subtle";
export const ROWS = "divide-y divide-ctl-border";
export const ROW = "grid items-center gap-5 px-6 py-4";
export const MONO = "font-mono text-sm tabular-nums text-ctl-fg";
export const MUTED = "text-xs text-ctl-fg-muted";
export const SUBTLE = "text-xs text-ctl-fg-subtle";
export const SPLIT_2_1 = "grid grid-cols-1 gap-8 xl:grid-cols-3";   // main = col-span-2, rail = col-span-1
// the selected row: a brand wash and a 2px rail on the left, the rail transparent until selected. Written
// with border-0 + border-solid first because preflight is off: a bare `border-l-2` is refused at commit
// (UNSAFE_DIRECTIONAL_BORDER) since border-solid alone would revive the browser's 3px on the other sides.
export const SELECTED = "border-0 border-l-2 border-solid border-l-brand-600 bg-brand-100";
export const UNSELECTED = "border-0 border-l-2 border-solid border-l-transparent hover:bg-ctl-raise";
export const HALVES = "grid grid-cols-1 gap-8 xl:grid-cols-2";

export function Page({ children, className = "", ...rest }) {
  return <div className={cx(PAGE, className)} {...rest}>{children}</div>;
}

/** Eyebrow · title · lede on the left; actions on the right, on one baseline. */
export function PageHeader({ eyebrow, title, lede, actions, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0">
        {eyebrow ? <p className={EYEBROW}>{eyebrow}</p> : null}
        <h1 className={TITLE}>{title}</h1>
        {lede ? <p className={LEDE}>{lede}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({ children, className = "", ...rest }) {
  return <section className={cx(PANEL, className)} {...rest}>{children}</section>;
}

export function PanelHeader({ title, sub, of, actions }) {
  return (
    <header className={PANEL_HEAD}>
      <div className="min-w-0">
        <h2 className={PANEL_TITLE}>{title}</h2>
        {sub ? <p className={PANEL_SUB}>{sub}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : of ? <span className={OF}>{of}</span> : null}
    </header>
  );
}

/* ── figures ───────────────────────────────────────────────────────────────── */
/** One strip, N dials, a hairline between them. Wraps to one column narrow, two at sm, N at xl. */
export function KpiStrip({ children, cols = 4, className = "" }) {
  const xl = { 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" }[cols] || "xl:grid-cols-4";
  return (
    <Panel className={className}>
      <div className={cx("grid grid-cols-1 divide-y divide-ctl-border sm:grid-cols-2 sm:divide-y-0", xl, "xl:divide-x")}>{children}</div>
    </Panel>
  );
}

const FIGURE_TONE = { neutral: "text-ctl-fg", danger: "text-danger-text", warning: "text-warning-text", success: "text-success-text", brand: "text-brand-text", info: "text-info-text" };

/** A small line of recent values, the last point emphasised; `values` are numbers, the scale is theirs. */
export function Sparkline({ values = [], tone = "brand", className = "" }) {
  const pts = (Array.isArray(values) ? values : []).map(Number).filter(Number.isFinite);
  if (pts.length < 2) return null;
  const w = 96, h = 28, min = Math.min(...pts), max = Math.max(...pts), span = max - min || 1;
  const x = (i) => (i / (pts.length - 1)) * (w - 4) + 2, y = (v) => h - 3 - ((v - min) / span) * (h - 6);
  const d = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const ink = { brand: "text-brand-text", danger: "text-danger-text", warning: "text-warning-text", success: "text-success-text", info: "text-info-text", neutral: "text-ctl-fg-muted" }[tone] || "text-brand-text";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className={cx("shrink-0", ink, className)}>
      <path d={`${d} L${x(pts.length - 1).toFixed(1)},${h} L2,${h} Z`} fill="currentColor" opacity="0.10" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1])} r="2.5" fill="currentColor" />
    </svg>
  );
}

/** label · figure (mono, large) with an optional `of` beside it · a delta chip · a sub line · a sparkline or meter.
 *  A RICH KPI says where the number is going: `delta` is `{ value: "+12%", tone: "success", label: "vs last week" }`
 *  and `spark` a short series of recent values. A dashboard's figures are bare without one or the other. */
export function Kpi({ label, value, of, sub, tone = "neutral", meter, delta, spark, children, ...rest }) {
  const rich = [delta ? "delta" : null, spark ? "spark" : null, meter != null ? "meter" : null, of != null ? "of" : null].filter(Boolean).join(" ");
  return (
    <div className="p-6" data-cx-kpi="" data-kf-kpi-rich={rich || undefined} {...rest}>
      <p className="m-0 text-xs font-medium text-ctl-fg-muted">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="m-0 flex items-baseline gap-2 font-mono text-4xl leading-none tracking-tight tabular-nums">
          <span className={FIGURE_TONE[tone] || FIGURE_TONE.neutral}>{value}</span>
          {of != null ? <span className="text-xl text-ctl-fg-subtle">/ {of}</span> : null}
        </p>
        {spark ? <Sparkline values={spark} tone={tone === "neutral" ? "brand" : tone} /> : null}
      </div>
      {delta || sub ? (
        <p className="mt-2 mb-0 flex flex-wrap items-center gap-2 text-xs text-ctl-fg-subtle">
          {delta ? <Chip tone={delta.tone || "neutral"}>{delta.value}</Chip> : null}
          {delta?.label ? <span>{delta.label}</span> : null}
          {sub ? <span>{sub}</span> : null}
        </p>
      ) : null}
      {meter != null ? <Track pct={meter} className="mt-3" /> : null}
      {children}
    </div>
  );
}

/* ── pictures ──────────────────────────────────────────────────────────────── */
/** The photograph in an Image field, whatever shape the SDK or the seed gave it: a URL string, an
 *  `{ src, alt, sourceUrl, photographer, provider }` asset, or an array of attachments. */
export function photoOf(value) {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return null;
  if (typeof v === "string") return /^https:\/\//i.test(v) ? { src: v, alt: "" } : null;
  const src = v.src || v.url || v.Url || v.link;
  return typeof src === "string" && /^https:\/\//i.test(src) ? { src, alt: v.alt || v.Name || "", sourceUrl: v.sourceUrl, photographer: v.photographer, provider: v.provider, illustrative: Boolean(v.illustrative) } : null;
}

/** A grid of cards: one column narrow, two at sm, `cols` at xl. Records with a picture are read this way, never as a table. */
export function CardGrid({ children, cols = 3, className = "" }) {
  const count = [2, 3, 4].includes(cols) ? cols : 3;
  return <div className={cx("grid gap-6", className)} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(15rem, calc((100% - ${(count - 1) * 1.5}rem) / ${count}))), 1fr))` }} data-kf-catalog="cards">{children}</div>;
}

/** An image-led card: the picture (4:3, cover), then title, subtitle, chips, a meta line, and the card's
 *  own action. A record without a picture keeps the same card with a quiet "No photo" plate, so the grid
 *  stays a grid. A stock photograph credits its photographer. */
export function MediaCard({ image, title, subtitle, chips, meta, action, onClick, aspect = "aspect-[4/3]", className = "", children, ...rest }) {
  const photo = photoOf(image);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [photo?.src]);
  const Tag = onClick ? "button" : "article";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} data-kf-component="card" className={cx(PANEL, "flex min-w-0 flex-col overflow-hidden text-left", onClick ? "cursor-pointer appearance-none border-ctl-border p-0 hover:bg-ctl-raise" : "", className)} {...rest}>
      <div className={cx("relative w-full overflow-hidden bg-ctl-track", aspect)}>
        {photo && !failed ? <img src={photo.src} alt={photo.alt || (typeof title === "string" ? title : "")} loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
          : <div className="absolute inset-0 flex items-center justify-center text-xs text-ctl-fg-subtle" role="img" aria-label={`No photo for ${typeof title === "string" ? title : "this record"}`}>No photo</div>}
        {photo?.illustrative ? <span className="absolute bottom-2 left-2 rounded-full bg-ctl-surface px-2 py-1 text-xs text-ctl-fg-muted">Illustrative</span> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <div className="min-w-0">
          <h3 className="m-0 truncate text-base font-semibold tracking-tight" title={typeof title === "string" ? title : undefined}>{title}</h3>
          {subtitle ? <p className="mt-1 mb-0 truncate text-sm text-ctl-fg-muted">{subtitle}</p> : null}
        </div>
        {chips ? <div className="flex flex-wrap gap-2">{chips}</div> : null}
        {children}
        {meta || action ? (
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <span className={cx(MUTED, "truncate")}>{meta}</span>
            {action ? <span className="shrink-0">{action}</span> : null}
          </div>
        ) : null}
        {photo?.sourceUrl ? <Credit photo={photo} /> : null}
      </div>
    </Tag>
  );
}

/** "Photo by <photographer> on Pexels" — a stock photograph is credited where it is shown. */
export function Credit({ photo, className = "" }) {
  if (!photo?.sourceUrl) return null;
  return (
    <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={cx("text-xs text-ctl-fg-subtle underline", className)}>
      {photo.photographer ? `Photo by ${photo.photographer}` : "Photo source"}{photo.provider === "pexels" ? " on Pexels" : photo.provider === "openverse" ? " via Openverse" : ""}
    </a>
  );
}

/** A status summary as ONE counted row: label, then chip + count per state, then a note. */
export function Band({ label, items = [], note, className = "", ...rest }) {
  return (
    <div className={cx(PANEL, "flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3", className)} role="group" aria-label={label} {...rest}>
      {label ? <span className={EYEBROW}>{label}</span> : null}
      {items.map((it, i) => (
        <span key={it.key ?? it.label ?? i} className="inline-flex items-center gap-2 text-sm text-ctl-fg-muted">
          <Chip tone={it.tone}>{it.label}</Chip>
          <span className="font-mono text-sm font-semibold tabular-nums text-ctl-fg">{fmtInt(it.count)}</span>
        </span>
      ))}
      {note ? <span className="ml-auto text-xs text-ctl-fg-subtle">{note}</span> : null}
    </div>
  );
}

/* ── marks ─────────────────────────────────────────────────────────────────── */
export const CHIP_TONES = {
  neutral: "bg-ctl-raise text-ctl-fg-muted",
  brand: "bg-brand-100 text-brand-text",
  danger: "bg-danger-100 text-danger-text",
  warning: "bg-warning-100 text-warning-text",
  success: "bg-success-100 text-success-text",
  info: "bg-info-100 text-info-text",
};

export function Chip({ tone = "neutral", children, title, className = "" }) {
  return (
    <span title={title} className={cx("inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-xs font-medium leading-none", CHIP_TONES[tone] || CHIP_TONES.neutral, className)}>
      {children}
    </span>
  );
}

const FILL = { brand: "bg-brand-600", danger: "bg-danger-600", warning: "bg-warning-600", success: "bg-success-600", info: "bg-info-600" };

/** The bare track: a proportional fill, no text. */
export function Track({ pct = 0, tone = "brand", className = "" }) {
  const w = Math.round(Math.min(100, Math.max(0, pct)));
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-ctl-track", className)} aria-hidden="true">
      <div className={cx("h-full rounded-full", FILL[tone] || FILL.brand)} style={{ width: `${w}%` }} />
    </div>
  );
}

/** A meter shows its value beside the track — even at 0. */
export function Meter({ value, max, fill, tone = "brand", label, sub, className = "" }) {
  const pct = Math.round(Math.min(1, Math.max(0, fill ?? (max ? value / max : 0))) * 100);
  return (
    <div className={cx("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className={MONO}>{label}</span>
        {sub ? <span className="truncate text-xs text-ctl-fg-subtle">{sub}</span> : null}
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ctl-track" role="meter" aria-valuemin={0} aria-valuemax={max ?? 100} aria-valuenow={value ?? 0} aria-label={typeof label === "string" ? label : undefined}>
        <div className={cx("h-full rounded-full", FILL[tone] || FILL.brand)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** A dot that carries its tone; hollow for "not yet". */
export function Dot({ tone = "neutral", hollow = false, className = "" }) {
  const ink = { danger: "text-danger-text", warning: "text-warning-text", success: "text-success-text", brand: "text-brand-text", info: "text-info-text", neutral: "text-ctl-fg-subtle" }[tone] || "text-ctl-fg-subtle";
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={cx("shrink-0", ink, className)}>
      <circle cx="5" cy="5" r="4" fill={hollow ? "none" : "currentColor"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ── controls ──────────────────────────────────────────────────────────────── */
// Preflight is off: a <button> keeps the UA's 2px outset border and grey face unless every variant says otherwise.
const BTN = {
  primary: "border-0 bg-brand-600 text-brand-fg hover:bg-brand-700",
  secondary: "border border-ctl-border bg-ctl-surface text-ctl-fg hover:bg-ctl-raise",
  ghost: "border-0 bg-transparent text-ctl-fg-muted hover:bg-ctl-raise hover:text-ctl-fg",
  danger: "border-0 bg-danger-600 text-brand-fg hover:opacity-90",
};

/** Buttons are quiet by default: a row's decision is `sm` (32px, small text); only a page's main action
 *  asks for `md`. `xs` is for inline affordances beside text. A row of 36px filled buttons reads as a
 *  toolbar, not a list — the user's verdict on the shipments panel. */
export function Btn({ variant = "secondary", size = "sm", className = "", type = "button", children, ...rest }) {
  const h = size === "xs" ? "h-7 px-2 text-xs" : size === "md" ? "h-10 px-5 text-sm" : "h-8 px-3 text-xs";
  return (
    <button type={type} className={cx("inline-flex shrink-0 appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium leading-none disabled:cursor-not-allowed disabled:opacity-50", h, BTN[variant] || BTN.secondary, className)} {...rest}>
      {children}
    </button>
  );
}

export const FIELD_LABEL = "text-xs font-medium text-ctl-fg-muted";
export const INPUT = "h-10 w-full rounded-lg border border-ctl-border bg-ctl-surface px-4 text-sm text-ctl-fg placeholder:text-ctl-fg-subtle focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-ring";
export const TEXTAREA = "w-full rounded-lg border border-ctl-border bg-ctl-surface px-4 py-3 text-sm text-ctl-fg placeholder:text-ctl-fg-subtle focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-ring";

export const SELECT = `${INPUT} appearance-none bg-no-repeat pr-10`;
export const DATE = `${INPUT} font-mono`;

/** A form's fields on the grid: one column narrow, two at md; a `Field` may span both with `className="md:col-span-2"`. */
export function FormGrid({ children, className = "" }) {
  return <div className={cx("grid grid-cols-1 gap-5 md:grid-cols-2", className)}>{children}</div>;
}

/** A titled group of fields inside a form: an eyebrow, a one-line note, then the grid. */
export function FormSection({ title, note, children, className = "" }) {
  return (
    <section className={cx("flex flex-col gap-4", className)}>
      <div>
        <p className={EYEBROW}>{title}</p>
        {note ? <p className="mt-1 mb-0 text-sm text-ctl-fg-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** The bar under a form: the primary action (md), a secondary beside it, a note on the left. Never a bare text button. */
export function FormActions({ primary, secondary, note, className = "" }) {
  return (
    <div className={cx("flex flex-wrap items-center justify-between gap-4 border-t border-ctl-border pt-5", className)}>
      <span className={MUTED}>{note}</span>
      <div className="flex items-center gap-3">{secondary}{primary}</div>
    </div>
  );
}

export function Field({ label, required, hint, children, className = "" }) {
  return (
    <label className={cx("block min-w-0", className)}>
      <span className={FIELD_LABEL}>{label}{required ? <span className="text-danger-text"> *</span> : null}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-ctl-fg-subtle">{hint}</span> : null}
    </label>
  );
}

/* ── states ────────────────────────────────────────────────────────────────── */
export function Skeleton({ className = "" }) {
  return <div className={cx("animate-pulse rounded bg-ctl-track", className)} aria-hidden="true" />;
}

export function Empty({ title, children, action }) {
  return (
    <div className="rounded-xl border border-dashed border-ctl-border px-6 py-12 text-center">
      <p className="m-0 text-sm font-medium text-ctl-fg">{title}</p>
      {children ? <p className="mt-1 mb-0 text-sm text-ctl-fg-muted">{children}</p> : null}
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}

const NOTICE = { warning: "bg-warning-100 text-warning-text", danger: "bg-danger-100 text-danger-text", info: "bg-info-100 text-info-text", success: "bg-success-100 text-success-text" };
export function Notice({ tone = "warning", children, className = "" }) {
  return <div role="status" className={cx("rounded-lg border border-ctl-border px-4 py-3 text-sm", NOTICE[tone] || NOTICE.warning, className)}>{children}</div>;
}

/* ── formatters ────────────────────────────────────────────────────────────── */
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
/* ── values, as the SDK hands them ───────────────────────────────────────────── */
/** The label of a Reference/User value (`{ _id, Name }`), of an array of them, or of a scalar — never "[object Object]". */
// the SDK answers a list read as `{ Data: [...] }` (a bare array from some mocks): every page reads rows
// through this, never `r.data` or `r.items` alone — a page that guessed showed nothing on a seeded flow
export const rowsOf = (r) => (Array.isArray(r) ? r : r?.Data ?? r?.items ?? r?.data ?? []);
export const labelOf = (v) => (v == null ? "" : Array.isArray(v) ? v.map(labelOf).filter(Boolean).join(", ") : typeof v === "object" ? String(v.Name ?? v.name ?? v.label ?? v._id ?? "") : String(v));
const moneyFmt = new Map();
export const fmtMoney = (n, currency = "USD") => { const v = typeof n === "object" && n ? Number(n.amount ?? n.value) : Number(n); if (!Number.isFinite(v)) return "—"; const c = (typeof n === "object" && n?.currency) || currency; if (!moneyFmt.has(c)) { try { moneyFmt.set(c, new Intl.NumberFormat(undefined, { style: "currency", currency: c, maximumFractionDigits: 2 })); } catch { moneyFmt.set(c, new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })); } } return moneyFmt.get(c).format(v); };
const dateTimeFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
export const fmtDateTime = (v) => { const t = typeof v === "number" ? v : Date.parse(v); return Number.isFinite(t) ? dateTimeFmt.format(t) : "—"; };
export const fmtPct = (n, digits = 0) => (n == null || !Number.isFinite(Number(n)) ? "—" : `${Number(n).toFixed(digits)}%`);
/** A field value shown by its type — the bespoke page's display adapter. `type` is the field's type from the brief. */
export function fmtValue(v, type = "Text", opts = {}) {
  if (v == null || v === "") return "—";
  switch (type) {
    case "Reference": case "User": case "Select": case "Multiselect": case "Checklist": return labelOf(v);
    case "Date": return fmtDate(v);
    case "DateTime": return fmtDateTime(v);
    case "Currency": return fmtMoney(v, opts.currency);
    case "Number": return typeof v === "number" ? new Intl.NumberFormat().format(v) : String(v);
    case "Boolean": case "Checkbox": return v === true || v === "true" || v === "Yes" ? (opts.yes || "Yes") : (opts.no || "No");
    case "Attachment": case "Image": { const a = Array.isArray(v) ? v : [v]; return a.map((x) => (typeof x === "string" ? x.split("/").pop() : x?.Name || x?.name || x?.alt || "file")).join(", "); }
    default: return typeof v === "object" ? labelOf(v) : String(v);
  }
}

/* ── charts, drawn ───────────────────────────────────────────────────────────── */
/** Horizontal bars: `items: [{ label, value, tone?, sub? }]`, scaled to the largest. The domain's ranking, not a library's. */
export function Bars({ items = [], max, unit = "", className = "" }) {
  const top = max ?? Math.max(1, ...items.map((i) => Number(i.value) || 0));
  return (
    <div className={cx("flex flex-col gap-3", className)} role="list">
      {items.map((it, i) => (
        <div key={it.key ?? it.label ?? i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1" role="listitem">
          <span className="truncate text-sm text-ctl-fg" title={typeof it.label === "string" ? it.label : undefined}>{it.label}</span>
          <span className={MONO}>{fmtInt(it.value)}{unit}</span>
          <Track pct={(Number(it.value) || 0) / top * 100} tone={it.tone || "brand"} className="col-span-2" />
          {it.sub ? <span className={cx(SUBTLE, "col-span-2")}>{it.sub}</span> : null}
        </div>
      ))}
    </div>
  );
}

const STACK_FILL = { brand: "bg-brand-600", danger: "bg-danger-600", warning: "bg-warning-600", success: "bg-success-600", info: "bg-info-600", neutral: "bg-ctl-border-strong" };
/** One segmented bar of shares with its legend: `parts: [{ label, value, tone }]`. A status mix, a cost split. */
export function Stack({ parts = [], className = "" }) {
  const total = parts.reduce((n, p) => n + (Number(p.value) || 0), 0) || 1;
  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-ctl-track" role="img" aria-label={parts.map((p) => `${p.label} ${fmtInt(p.value)}`).join(", ")}>
        {parts.map((p, i) => <div key={p.key ?? p.label ?? i} className={cx("h-full", STACK_FILL[p.tone] || STACK_FILL.brand)} style={{ width: `${(Number(p.value) || 0) / total * 100}%` }} title={`${p.label}: ${fmtInt(p.value)}`} />)}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {parts.map((p, i) => <span key={p.key ?? p.label ?? i} className="inline-flex items-center gap-2 text-xs text-ctl-fg-muted"><Dot tone={p.tone || "brand"} />{p.label}<span className="font-mono tabular-nums text-ctl-fg">{fmtInt(p.value)}</span></span>)}
      </div>
    </div>
  );
}

export const fmtInt = (n) => (n === null || n === undefined ? "—" : new Intl.NumberFormat().format(n));
export const fmtDate = (v) => { const t = typeof v === "number" ? v : Date.parse(v); return Number.isFinite(t) ? dateFmt.format(t) : "—"; };
export const fmtAge = (days) => (days === null || days === undefined || !Number.isFinite(days) ? "—" : days < 0 ? `in ${Math.abs(Math.round(days))} d` : days < 1 ? "today" : `${Math.round(days)} d`);
export const fmtHours = (h) => (h === null || h === undefined || !Number.isFinite(h) ? "—" : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} d`);
