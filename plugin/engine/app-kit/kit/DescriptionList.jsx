// GENERATED from starter/src/components/kit/DescriptionList.jsx (sha256:431b8752c3d5e75b). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * DescriptionList — the label/value pairs beside every record.
 *
 * A real <dl>, not a two-column grid of divs: the pairing is in the markup, so a
 * screen reader announces "Stage, Triage" rather than four unrelated strings.
 *
 * Three layouts, and the choice is about measure rather than taste: `rows` for a
 * detail panel (label left, value right, one pair per line), `stacked` for narrow
 * columns, `grid` for a wide two-up block. `rows` is the default because it is
 * the one that survives a long value.
 *
 * An absent value renders the em dash, not nothing. A <dd> left empty collapses to a
 * label with blank space after it, which reads as a page that failed to load rather than
 * a record with a field nobody filled — and because FieldValue has always shown the dash,
 * a card holding both components showed "Category —" directly above a blank "Request
 * number" and invited the reader to believe the two meant different things.
 *
 * Deliberately not applied to `false` or `0`: both are values a field genuinely holds, and
 * a "0 open findings" that renders as a dash is worse than one that renders as zero.
 *
 * <DescriptionList items={[{ label: 'Stage', value: 'Triage' }]} />
 */

const GAPS = { sm: 'gap-2', md: 'gap-3', lg: 'gap-4' };

/* The same dash FieldValue and formatCell use, so the three agree on what empty looks like. */
const EMPTY = '—';
const shown = (value) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0) ? EMPTY : value;
const isEmpty = (value) => shown(value) === EMPTY;

function DescriptionList({
  items = [],
  layout = 'rows',
  size = 'md',
  labelWidth = '9rem',
  dividers = false,
  className,
}) {
  const text = size === 'sm' ? 'text-xs' : 'text-sm';

  if (layout === 'stacked')
    return (
      <dl className={cx('flex flex-col m-0', GAPS[size] || GAPS.md, className)}>
        {items.map((it, i) => (
          <div key={(it.label || '') + i} className={cx('flex flex-col gap-1 min-w-0', dividers && i > 0 && 'pt-3 border-0 border-t border-solid border-layer-border')}>
            <dt className="text-sm leading-none text-ctl-fg-muted">{it.label}</dt>
            <dd className={cx('m-0 leading-relaxed text-pretty', isEmpty(it.value) ? 'text-ctl-fg-muted' : 'text-ctl-fg', text)}>{shown(it.value)}</dd>
          </div>
        ))}
      </dl>
    );

  if (layout === 'grid')
    return (
      <dl className={cx('grid grid-cols-2 m-0 gap-x-8', GAPS[size] || GAPS.md, className)}>
        {items.map((it, i) => (
          <div key={(it.label || '') + i} className="flex flex-col gap-1 min-w-0">
            <dt className="text-sm leading-none text-ctl-fg-muted">{it.label}</dt>
            <dd className={cx('m-0 leading-relaxed text-pretty', isEmpty(it.value) ? 'text-ctl-fg-muted' : 'text-ctl-fg', text)}>{shown(it.value)}</dd>
          </div>
        ))}
      </dl>
    );

  return (
    <dl className={cx('flex flex-col m-0 w-full', GAPS[size] || GAPS.md, className)}>
      {items.map((it, i) => (
        <div
          key={(it.label || '') + i}
          className={cx(
            'flex items-baseline gap-4 min-w-0',
            dividers && i > 0 && 'pt-3 border-0 border-t border-solid border-layer-border'
          )}
        >
          <dt className="shrink-0 text-sm leading-relaxed text-ctl-fg-muted" style={{ width: labelWidth }}>
            {it.label}
          </dt>
          <dd className={cx('m-0 flex-1 min-w-0 leading-relaxed text-pretty', isEmpty(it.value) ? 'text-ctl-fg-muted' : 'text-ctl-fg', text)}>{shown(it.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export { DescriptionList };
export default DescriptionList;
