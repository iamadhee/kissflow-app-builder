// GENERATED from starter/src/components/kit/Table.jsx (sha256:f38b6c9b9f14b039). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { BadgeSizeContext } from "./Badge.jsx";
import { semanticToneToken } from "./semanticTone.js";

// A column is labelled by `label`; `header`/`title` are accepted too (the conventions of other table
// libraries) and a column with no label at all shows its key spelled out — a blank header band is
// never the right rendering of a real column.
function columnLabel(c) {
  const v = c?.label ?? c?.header ?? c?.title;
  if (v != null && v !== '') return v;
  if (c?.hideLabel || c?.label === '') return '';
  return String(c?.key || '').replace(/^_+/, '').replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/**
 * Table — columns and rows, the language's own header band and row rule.
 *
 * Row density is the material's row inset (tokens.css, COMPONENT SPACING
 * RECIPES) — one spacing step tighter than the surface holding the table. Changing
 * the active theme's --spacing value updates every table without a per-table
 * boolean prop. rowTone lets a row read as failed/at-risk/etc via the shared
 * tone tokens, tinting the row without a full design.
 *
 * 2026-08-31 modern rework: header/row cells also carry an explicit height
 * (44px / 60px, the approved "airier" mock) so the new tint and softened rule
 * land on the exact numbers reviewed. That height is a floor, not a target —
 * that inset can still stretch a row taller, but it cannot shrink one below 44/60
 * until a table actually asks for something denser than this default.
 *
 * Sticky is the reason this file grew: `stickyHeader` needs a scroll container,
 * and `stickyColumns` needs each pinned cell to carry its own left offset, which
 * means the column widths have to be declared (`col.width`) rather than measured.
 * A sticky column with an unknown width can only be done with a measurement pass
 * and a resize observer, and that is not worth it here.
 *
 * Text cells receive the column's full configured width before they wrap. If
 * those widths do not fit the container, the table scrolls horizontally rather
 * than compressing columns and wrapping content early. A column may explicitly
 * set `maxLines` to 1, 2 or 3 when a compact summary is appropriate.
 *
 * Columns without declared pixel widths use semantic sizing. `compact` keeps
 * dates/enums/statuses economical, `balanced` protects names and identifiers,
 * and `fluid` lets descriptions absorb the remaining table width. A column's
 * `minWidth`, `maxWidth` and `grow` can refine a preset. Explicit sizing wins; the
 * fallback inference uses field type/key/label and never inspects row data, so
 * filtering and pagination cannot make the columns jump.
 *
 * Badges inside a table always use the medium density. The context reaches
 * badges returned by custom column renderers without changing standalone
 * Badge defaults or requiring every table author to repeat size="md".
 *
 * <Table columns={[{key:'name', label:'Name', sizing:'balanced'}, {key:'notes', label:'Notes', sizing:'fluid'}]} rows={data} rowKey={r => r.id} />
 */
const cx = (...p) => p.filter(Boolean).join(' ');

function SortIcon({ dir }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0" style={{ opacity: dir ? 1 : 0.35 }}>
      <path d="M5 1L8 4.5H2L5 1Z" fill="currentColor" opacity={dir === 'desc' ? 0.3 : 1} />
      <path d="M5 9L2 5.5H8L5 9Z" fill="currentColor" opacity={dir === 'asc' ? 0.3 : 1} />
    </svg>
  );
}

const TONE_PATHS = {
  success: 'M4 8.25 6.25 10.5 11.75 5',
  warning: 'M8 4.5v4.25M8 11.25h.01',
  danger: 'M8 4.5v4.25M8 11.25h.01',
  info: 'M8 7v4M8 4.5h.01',
};

/** A toned row must not communicate state by its wash alone. The mark is
 * deliberately placed in the first data cell so it remains visible when
 * columns are pinned and travels with the row's own label. */
function ToneMark({ tone }) {
  if (!tone) return null;
  const path = TONE_PATHS[tone];
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      role="img"
      aria-label={`${tone} row`}
      className="w-4 h-4 shrink-0 text-current"
      style={{ color: semanticToneToken(tone, 'text', 'var(--ctl-fg)') }}
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      {path ? (
        <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      )}
    </svg>
  );
}

/* The tokenised box Checkbox.jsx draws, inlined so Table has no cross-file
   dependency. accentColor on a native input can't do the indeterminate dash or
   the focus ring. */
function Box({ checked, indeterminate, onChange, label }) {
  return (
    <label className="inline-grid place-items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        aria-label={label}
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate) && !checked;
        }}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cx(
          'grid place-items-center w-4 h-4 rounded-sm border border-solid',
          'bg-field-surface border-field-border text-transparent',
          'transition-[background-color,border-color,color] ease-ctl duration-[var(--default-transition-duration)]',
          'peer-hover:border-field-border-hover',
          'peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-checked:text-brand-fg',
          'peer-indeterminate:bg-brand-600 peer-indeterminate:border-brand-600 peer-indeterminate:text-brand-fg',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ctl-offset'
        )}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3 h-3">
          {indeterminate && !checked ? (
            <path d="M4.5 8h7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          ) : (
            <path d="M3.5 8.4 6.3 11.2 12.5 5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </span>
    </label>
  );
}

/* Row treatments stay quiet enough that the header divider and 600-weight label carry the
 * hierarchy without a separate tinted header band. Sticky and pinned header cells receive the
 * table's own material surface below solely to occlude scrolling content; visually it is the
 * same surface as the table, not a header fill. */
const ROW_RULE = 'var(--table-row-border)';
const COLUMN_MAX_WIDTH = 400;
const COLUMN_MIN_WIDTH = 160;
const COLUMN_SIZING = {
  /* `action` holds controls, not prose. It never grows (a wide button centred in a wide column
     reads as a mistake) and its floor is the control's own width, which the caller declares via
     minWidth — DataGrid measures its button label. Before this existed, `sizing: 'action'` named
     nothing: the lookup missed, the label fell through the /actions?/ hint to `compact`, and the
     column inherited a 96px text floor that clipped every button in a narrow grid. */
  action: { min: 128, max: 240, grow: 0 },
  compact: { min: 140, max: 220, grow: 0.65 },
  balanced: { min: 220, max: 400, grow: 1.25 },
  fluid: { min: 320, max: Infinity, grow: 3 },
  auto: { min: COLUMN_MIN_WIDTH, max: COLUMN_MAX_WIDTH, grow: 1 },
};
/* When a real dock narrows the application, preserve the complete column grid
   before falling back to horizontal scrolling. These are compact reading
   floors, not the normal table widths: headers use tighter inline padding and
   body text may wrap, while explicit author-provided minima remain absolute. */
const COLUMN_NARROW_MIN_WIDTH = {
  /* No narrower floor than the normal one: a control has one width in both modes. */
  action: 128,
  compact: 96,
  balanced: 112,
  fluid: 160,
  auto: 112,
};
const FLUID_COLUMN_HINT = /description|reason|notes?|comments?|details?|summary|message|justification|narrative/;
const COMPACT_COLUMN_HINT = /date|time|status|risk|amount|price|total|count|number|actions?|currency|percent/;
/* Kept as a Tailwind arbitrary-value class, not this file's usual style-object constant,
   because :hover has no inline-style equivalent
   and Tailwind's scanner needs the class spelled out as a literal in source; a template
   literal built from a JS string at render time is invisible to it, so it never generates the
   rule at all (silently — nothing errors, the hover just does nothing). */
const ROW_HOVER_CLASS = 'hover:bg-[color-mix(in_oklab,var(--ctl-raise)_38%,var(--ctl-surface))]';

/* A width is a number of pixels, a "180px" string, or a "42%" share of the table's own width (the
   shapes an author reaches for). Anything else is ignored, never silently treated as "no width":
   an ignored "26%" on a category column used to leave that column at its 80px compact floor,
   breaking "Entertainment" mid-word. */
function numericWidth(value, basis) {
  if (value == null || value === '') return null;
  if (typeof value === 'string') {
    const m = value.trim().match(/^(\d+(?:\.\d+)?)\s*(px|%)?$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (m[2] === '%') return Number.isFinite(basis) && basis > 0 && n > 0 ? Math.round((basis * n) / 100) : null;
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const width = Number(value);
  return Number.isFinite(width) && width > 0 ? width : null;
}

function inferredSizing(column, index) {
  if (COLUMN_SIZING[column.sizing]) return column.sizing;
  const hint = `${column.type || ''} ${column.key || ''} ${column.label || ''}`.toLowerCase();
  if (FLUID_COLUMN_HINT.test(hint)) return 'fluid';
  if (COMPACT_COLUMN_HINT.test(hint)) return 'compact';
  return index === 0 ? 'balanced' : 'auto';
}

function sizingSpec(column, index, basis) {
  const width = numericWidth(column.width, basis);
  if (width != null && !column.sizing) {
    return { min: width, narrowMin: width, max: width, grow: 0, fixed: true, hardMax: true };
  }
  const sizing = inferredSizing(column, index);
  const preset = COLUMN_SIZING[sizing];
  const requestedMin = numericWidth(column.minWidth);
  const min = requestedMin ?? preset.min;
  const narrowMin = requestedMin ?? Math.min(min, COLUMN_NARROW_MIN_WIDTH[sizing]);
  const requestedMax = numericWidth(column.maxWidth);
  const max = requestedMax == null ? preset.max : Math.max(min, requestedMax);
  const requestedGrow = Number(column.grow);
  const grow = Number.isFinite(requestedGrow) && requestedGrow >= 0 ? requestedGrow : preset.grow;
  return { min, narrowMin, max, grow, fixed: false, hardMax: requestedMax != null };
}

/* Start every column at its semantic minimum, then water-fill the actual
   available width by grow weight. Compact and balanced columns first stop at
   their semantic caps. If space still remains, the most flexible column whose
   width was not explicitly fixed or capped absorbs it, so every semantic table
   reaches the far edge of its container even without a fluid column. */
function allocateWidths(specs, availableWidth) {
  const widths = specs.map((spec) => spec.min);
  let remaining = Math.max(0, availableWidth - widths.reduce((sum, width) => sum + width, 0));

  for (let pass = 0; pass < specs.length + 1 && remaining > 0.5; pass += 1) {
    const active = specs
      .map((spec, index) => ({ spec, index }))
      .filter(({ spec, index }) => spec.grow > 0 && widths[index] < spec.max);
    const totalGrow = active.reduce((sum, { spec }) => sum + spec.grow, 0);
    if (!totalGrow) break;
    let spent = 0;
    for (const { spec, index } of active) {
      const share = remaining * (spec.grow / totalGrow);
      const grant = Math.min(share, spec.max - widths[index]);
      widths[index] += grant;
      spent += grant;
    }
    if (spent < 0.5) break;
    remaining -= spent;
  }

  const overflowTarget = specs
    .map((spec, index) => ({ spec, index }))
    .filter(({ spec }) => spec.grow > 0 && !spec.fixed && !spec.hardMax)
    .sort((a, b) => b.spec.grow - a.spec.grow || a.index - b.index)[0];
  if (overflowTarget && remaining > 0.5) {
    widths[overflowTarget.index] += remaining;
  }

  const roundedWidths = widths.map((width) => Math.round(width));
  if (overflowTarget) {
    const roundingCorrection = Math.round(availableWidth)
      - roundedWidths.reduce((sum, width) => sum + width, 0);
    roundedWidths[overflowTarget.index] += roundingCorrection;
  }
  return roundedWidths;
}

function CellContent({ column, row, children }) {
  const isPlainText = typeof children === 'string' || typeof children === 'number';
  const lineSetting = column.maxLines;
  const maxLines = Number(lineSetting);
  /* Full wrapping is the safe data-table default. Rendered controls, badges and
     text values are clamped only when the column explicitly opts in. */
  const shouldClamp = column.maxLines !== undefined
    && Number.isFinite(maxLines)
    && maxLines > 0;
  const titleValue = typeof column.cellTitle === 'function'
    ? column.cellTitle(row)
    : column.cellTitle ?? (shouldClamp && isPlainText ? String(children) : undefined);
  const clampStyle = shouldClamp
    ? maxLines === 1
      ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: maxLines, overflow: 'hidden' }
    : undefined;

  return (
    <span
      className={cx('block min-w-0 leading-5', shouldClamp && 'max-w-full')}
      style={clampStyle}
      title={titleValue == null ? undefined : String(titleValue)}
    >
      {children}
    </span>
  );
}

function Table({
  columns = [], rows = [], empty = 'No rows.', rowKey, onRowClick,
  selected, onSelect, sort, onSort, rowTone,
  stickyHeader = false, stickyColumns = 0, maxHeight, selectionBar,
  className,
  description,
}) {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const update = () => {
      const next = Math.round(node.getBoundingClientRect().width);
      setContainerWidth((current) => current === next ? current : next);
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [columns.length]);

  if (!columns.length) return null;
  const withSelect = selected != null && !!onSelect;
  const keyOf = (row, i) => (rowKey ? rowKey(row) : i);
  const allChecked = withSelect && rows.length > 0 && rows.every((r, i) => selected.has(keyOf(r, i)));
  const someChecked = withSelect && rows.some((r, i) => selected.has(keyOf(r, i)));

  const toggleAll = () => {
    if (!withSelect) return;
    const next = new Set(selected);
    if (allChecked) rows.forEach((r, i) => next.delete(keyOf(r, i)));
    else rows.forEach((r, i) => next.add(keyOf(r, i)));
    onSelect(next);
  };
  const toggleOne = (k) => {
    if (!withSelect) return;
    const next = new Set(selected);
    next.has(k) ? next.delete(k) : next.add(k);
    onSelect(next);
  };

  /* Left offsets for pinned columns, accumulated from declared widths. The
     select column, when present, is always pinned first. */
  const selectWidth = 44;
  const widthBasis = Math.max(0, containerWidth - (withSelect ? selectWidth : 0));
  const columnWidth = (column, fallback) => {
    const declared = numericWidth(column.width, widthBasis);
    return declared == null ? fallback : Math.min(declared, COLUMN_MAX_WIDTH);
  };
  /* Fixed layout keeps every row on the same grid. Legacy explicitly-sized
     tables retain their 160–400px budget. Semantic columns use their preferred
     widths when space permits, then interpolate toward a compact reading floor
     as a dock narrows the container. Only widths below that floor scroll. */
  const intelligentSizing = columns.some((column) => column.sizing || column.minWidth || column.maxWidth || column.grow != null)
    || columns.every((column) => numericWidth(column.width, widthBasis) == null);
  const sizingSpecs = columns.map((column, index) => sizingSpec(column, index, widthBasis));
  const semanticMinWidth = sizingSpecs.reduce((total, spec) => total + spec.min, 0);
  const responsiveMinWidth = sizingSpecs.reduce((total, spec) => total + spec.narrowMin, 0);
  const availableColumnWidth = Math.max(responsiveMinWidth, containerWidth - (withSelect ? selectWidth : 0));
  const compactSizing = intelligentSizing && availableColumnWidth < semanticMinWidth;
  const responsiveSizingSpecs = compactSizing
    ? sizingSpecs.map((spec) => ({ ...spec, min: spec.narrowMin, max: spec.min }))
    : sizingSpecs;
  const allocatedWidths = intelligentSizing ? allocateWidths(responsiveSizingSpecs, availableColumnWidth) : null;
  const tableMinWidth = (withSelect ? selectWidth : 0)
    + (intelligentSizing
      ? responsiveMinWidth
      : columns.reduce((total, column) => total + columnWidth(column, COLUMN_MIN_WIDTH), 0));
  const offsets = [];
  let run = withSelect ? selectWidth : 0;
  columns.forEach((c, i) => {
    offsets[i] = run;
    if (i < stickyColumns) run += intelligentSizing ? allocatedWidths[i] : columnWidth(c, COLUMN_MIN_WIDTH);
  });
  const pinned = (i) => stickyColumns > 0 && i < stickyColumns;
  /* A column declared `pin: 'end'` (row actions) stays visible at the right edge while wide rows
     scroll, instead of sitting past the scroll boundary. */
  const pinnedEnd = (i) => columns[i]?.pin === 'end' && !pinned(i);
  const lastPinned = stickyColumns > 0 ? Math.min(stickyColumns, columns.length) - 1 : -1;

  /* Compact uppercase metadata on the quiet control surface. The first and last cells
     round the shared background band; header hierarchy comes from fill, never borders. */
  const headCell = cx(
    'border-0 bg-table-header-surface leading-4 font-medium uppercase text-[var(--ctl-fg-subtle)]',
    compactSizing ? 'text-[10px]' : 'text-[11px]',
    'first:rounded-l-md last:rounded-r-md',
    'text-left'
  );

  return (
    /* No radius, no outer border — dropped rounded-xl/border/border-ctl-border per the
       approved mock. overflow-hidden goes too: its only job was clipping content to those
       rounded corners, and with them gone it's pure downside — the scroll port right below
       already owns overflow for both the horizontal (wide table) and vertical (maxHeight)
       cases on its own, unconditionally (see that comment), so this wrapper doesn't need to
       double as a clip boundary. Keeping it would just clip anything a cell renders outside
       its own box — a combobox menu, a tooltip — for no remaining benefit. */
    <BadgeSizeContext.Provider value="md">
    <div ref={containerRef} className={cx('w-full flex flex-col bg-material-surface', className)}>
      {selectionBar && withSelect && selected.size > 0 ? (
        <div className="flex items-center kf-inline-gap px-4 py-2 bg-field-selected border-0 border-b border-solid border-ctl-border">
          <span className="text-sm font-medium text-brand-text tabular-nums">{selected.size} selected</span>
          <button
            type="button"
            onClick={() => onSelect(new Set())}
            className="text-sm text-ctl-fg-muted bg-transparent border-0 cursor-pointer underline decoration-dotted hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring rounded-sm"
          >
            Clear
          </button>
          <span className="flex items-center gap-2 ml-auto">{selectionBar}</span>
        </div>
      ) : null}

      {/* The scroll port is unconditional: a table wider than its card must scroll horizontally,
          never clip under the card's overflow-hidden — clipping crushed the trailing columns and
          wrapped every cell into multi-line rows. */}
      <div
        className={cx('w-full min-w-0', (stickyHeader || stickyColumns > 0) ? 'overflow-auto' : 'overflow-x-auto')}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table
          data-kf-component="table"
          data-density={compactSizing ? 'compact' : 'default'}
          className="w-full border-collapse text-left"
          style={{
            tableLayout: 'fixed',
            minWidth: tableMinWidth,
            /* The w-full class owns the normal width. minWidth above only
               takes over when the column contract genuinely needs overflow. */
            width: '100%',
          }}
        >
          {description ? <caption className="caption-top px-4 py-3 text-left text-sm text-ctl-fg-muted" data-kf-table-description="">{description}</caption> : null}
          {intelligentSizing ? (
            <colgroup>
              {withSelect ? <col style={{ width: selectWidth }} /> : null}
              {columns.map((column, index) => <col key={column.key} style={{ width: allocatedWidths[index] }} />)}
            </colgroup>
          ) : null}
          <thead>
            <tr>
              {withSelect && (
                <th
                  data-table-cell=""
                  className={cx(headCell, stickyHeader && 'sticky top-0 z-[3]', stickyColumns > 0 && 'sticky left-0 z-[4]')}
                  style={{
                    height: 44,
                    width: selectWidth,
                  }}
                >
                  <Box checked={allChecked} indeterminate={someChecked} onChange={toggleAll} label="Select all rows" />
                </th>
              )}
              {columns.map((c, i) => {
                const active = sort && sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    data-table-cell=""
                    className={cx(
                      headCell,
                      onSort && 'cursor-pointer select-none',
                      stickyHeader && 'sticky top-0 z-[2]',
                      pinned(i) && 'sticky z-[3]',
                      pinnedEnd(i) && 'sticky right-0 z-[3]'
                    )}
                    style={Object.assign(
                      {
                        height: 44,
                        ...(intelligentSizing ? null : { maxWidth: COLUMN_MAX_WIDTH }),
                        overflowWrap: 'break-word',
                      },
                      intelligentSizing
                        ? { width: allocatedWidths[i] }
                        : c.width ? { width: columnWidth(c, COLUMN_MAX_WIDTH) } : null,
                      pinned(i) ? { left: offsets[i] } : null
                    )}
                    onClick={() => onSort && onSort(c.key)}
                  >
                    <span className={cx('flex items-center gap-2', c.align === 'right' && 'justify-end')}>
                      {columnLabel(c)}
                      {onSort && c.sortable !== false && <SortIcon dir={active ? sort.dir : null} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!rows.length ? (
              <tr>
                <td colSpan={columns.length + (withSelect ? 1 : 0)} data-table-cell="" className="text-center text-sm text-ctl-fg-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const k = keyOf(row, i);
                const tone = rowTone && rowTone(row);
                const checked = withSelect && selected.has(k);
                /* Pinned cells need an opaque background of their own — the row's
                   background scrolls with the row, but a sticky cell sits above it. */
                const cellBg = tone ? semanticToneToken(tone, 'bg') : checked ? 'var(--field-selected)' : 'var(--ctl-surface)';
                return (
                  <tr
                    key={k}
                    data-cx-row={String(row["data-cx-row"] ?? k)}
                    /* Hover is new — the shipped table never had one. It has to be a class:
                       inline style can't express :hover at all, so this is the one spot that
                       breaks from this file's inline-style-for-computed-colour convention, and
                       only because there's no other way to do it. It's harmless to leave active
                       on a checked/toned row too — the inline `background` below always wins
                       over a class, hover included, so it simply has no visible effect there. */
                    className={cx(
                      'border-0 border-b border-solid border-ctl-border last:border-b-0',
                      ROW_HOVER_CLASS,
                      onRowClick && 'cursor-pointer'
                    )}
                    style={{
                      background: checked && !tone ? 'var(--field-selected)' : tone ? semanticToneToken(tone, 'bg') : undefined,
                      /* Themeable row rule, ROW_RULE not the class's full-strength border-color.
                         Forced into an inline longhand rather than the class: border-ctl-border
                         (kept verbatim, a kit-sync.test.mjs contract) sets the border-color
                         shorthand, so the only way to change just this row's rendered colour
                         without editing that shared token utility is a longhand override here —
                         and it has to be the JS style, not a scoped `--ctl-border` var, because a
                         var would inherit into this row's own <td> and retint the pinned-column
                         divider (border-0 border-r border-ctl-border below) along with it. */
                      borderBottomColor: ROW_RULE,
                    }}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {withSelect && (
                      <td
                        data-table-cell=""
                        className={cx(stickyColumns > 0 && 'sticky left-0 z-[1]')}
                        style={Object.assign({ height: 60, width: selectWidth }, stickyColumns > 0 ? { background: cellBg } : null)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box checked={checked} onChange={() => toggleOne(k)} label="Select row" />
                      </td>
                    )}
                    {columns.map((c, ci) => {
                      const content = c.render ? c.render(row) : row[c.key];
                      return (
                        <td
                          key={c.key}
                          data-table-cell=""
                          className={cx(
                            'text-sm text-ctl-fg',
                            /* a pill wider than its column wraps its words rather than running into the next cell */
                            '[&_[data-tone]]:whitespace-normal [&_[data-tone]]:leading-tight [&_[data-tone]]:max-w-full',
                            c.align === 'right' && 'text-right font-data-emphasis tabular-nums',
                            pinned(ci) && 'sticky z-[1]',
                            pinned(ci) && ci === lastPinned && 'border-0 border-r border-solid border-ctl-border',
                            pinnedEnd(ci) && 'sticky right-0 z-[1] border-0 border-l border-solid border-ctl-border'
                          )}
                          style={Object.assign(
                            {
                              height: 60,
                              ...(intelligentSizing ? null : { maxWidth: COLUMN_MAX_WIDTH }),
                              overflowWrap: 'break-word',
                            },
                            pinned(ci) ? { left: offsets[ci], background: cellBg } : null,
                            pinnedEnd(ci) ? { background: cellBg } : null
                          )}
                        >
                          {ci === 0 && tone ? (
                            <span className="flex min-w-0 items-start gap-2">
                              <ToneMark tone={tone} />
                              <span className="min-w-0 flex-1">
                                <CellContent column={c} row={row}>{content}</CellContent>
                              </span>
                            </span>
                          ) : (
                            <CellContent column={c} row={row}>{content}</CellContent>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
    </BadgeSizeContext.Provider>
  );
}

export { Table };
export default Table;
