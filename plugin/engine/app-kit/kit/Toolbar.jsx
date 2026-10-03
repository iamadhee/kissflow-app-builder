// GENERATED from starter/src/components/kit/Toolbar.jsx (sha256:88671d1e6be7a1e4). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Toolbar — the strip above a Table.
 *
 * Composition, not configuration: search, filters and actions are slots, so a
 * screen puts its own controls in without this file growing a prop for each one.
 * What it owns is the layout contract — search left and elastic, filters after
 * it, actions pinned right, everything wrapping in that order at narrow widths.
 *
 * Two ways to fill the slots, because a JSX caller and a template caller can't
 * both pass nodes the same way: props (`search`, `filters`, `actions`) or
 * children carrying `data-slot="search|filters|actions"`. Unslotted children
 * land with the filters.
 *
 * FilterChip is here rather than in Badge because it is a control: it toggles,
 * carries a value, and can be cleared. A Badge is output.
 *
 * <Toolbar search={<Input .../>} filters={<FilterChip .../>} actions={…} />
 *
 * FilterChip's `count` is how many records the filter MATCHES, and it is deliberately shown before
 * the filter is applied — an operator reading a queue wants to know where the work is without
 * clicking through four filters to find out. It is not the same as `value`, which is what the filter
 * is currently set to.
 */

function Toolbar({ search, filters, actions, count, children, bordered = true, className, ...rest }) {
  const kids = React.Children.toArray(children);
  const slotOf = (node) => (node && node.props ? node.props['data-slot'] : null);
  const inSlot = (name) => {
    const found = kids.filter((k) => slotOf(k) === name);
    return found.length ? found : null;
  };
  const unslotted = kids.filter((k) => ['search', 'filters', 'actions'].indexOf(slotOf(k)) < 0);

  const searchNode = search || inSlot('search');
  const filterNode = filters || inSlot('filters') || (unslotted.length ? unslotted : null);
  const actionNode = actions || inSlot('actions');

  return (
    <div
      className={cx(
        'flex items-center gap-3 flex-wrap w-full',
        bordered && 'px-4 py-3 bg-layer-surface border border-solid border-layer-border rounded-xl',
        className
      )}
      {...rest}
    >
      {searchNode ? <div className="flex-1 min-w-48 basis-64">{searchNode}</div> : null}
      {filterNode ? <div className="flex items-center gap-2 flex-wrap min-w-0">{filterNode}</div> : null}
      {count != null ? (
        <span className="text-sm text-ctl-fg-muted tabular-nums whitespace-nowrap">{count}</span>
      ) : null}
      {actionNode ? <div className="flex items-center gap-2 ml-auto shrink-0">{actionNode}</div> : null}
    </div>
  );
}

/** A chip that is a control: active state, a value, and a clear affordance. */
function FilterChip({ label, value, count, active = false, onClick, onClear, disabled = false, className }) {
  const on = active || value != null;
  return (
    <span
      className={cx(
        'inline-flex items-center h-8 max-w-full min-w-0 rounded-lg border border-solid text-sm',
        'transition-[background-color,border-color,color] ease-ctl duration-[var(--default-transition-duration)]',
        on
          ? 'bg-field-selected border-brand-600 text-brand-text'
          : 'bg-transparent border-field-border text-ctl-fg-muted hover:border-field-border-hover hover:text-ctl-fg',
        disabled && 'opacity-[.45] pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cx(
          'inline-flex items-center gap-2 h-full min-w-0 px-3 bg-transparent border-0 text-inherit cursor-pointer rounded-lg',
          'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
          onClear && on && 'pr-2'
        )}
      >
        {/* A long label or value truncates inside a narrow rail instead of overflowing it. */}
        <span className="truncate min-w-0" title={typeof label === 'string' ? label : undefined}>{label}</span>
        {value != null ? <span className="font-medium truncate min-w-0" title={typeof value === 'string' ? value : undefined}>{value}</span> : null}
        {count != null ? (
          /* tabular, and a step down in weight: the count is what the label is ABOUT, never a
             second label competing with it. On an applied chip it inherits the chip's own ink. */
          <span className={cx('font-mono text-xs tabular-nums whitespace-nowrap', on ? 'opacity-70' : 'text-ctl-fg-subtle')}>
            {count}
          </span>
        ) : null}
      </button>
      {onClear && on ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={'Clear ' + label}
          className="grid place-items-center w-6 h-6 mr-1 rounded-sm bg-transparent border-0 text-current opacity-70 cursor-pointer transition-opacity ease-ctl duration-[var(--default-transition-duration)] hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3 h-3">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}

/** Two or three mutually exclusive view modes. More than three wants a Select. */
function ViewSwitch({ options = [], value, onChange, className }) {
  return (
    <div
      role="radiogroup"
      className={cx('inline-flex items-center gap-1 p-1 rounded-lg bg-ctl-track', className)}
    >
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={opt.label}
            onClick={() => onChange && onChange(opt.value)}
            className={cx(
              'grid place-items-center h-7 px-3 rounded-md text-sm font-medium bg-transparent border-0 cursor-pointer',
              'transition-[background-color,color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
              'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
              on ? 'bg-ctl-surface text-ctl-fg shadow-sm' : 'text-ctl-fg-muted hover:text-ctl-fg'
            )}
          >
            {opt.icon || opt.label}
          </button>
        );
      })}
    </div>
  );
}

export { Toolbar, FilterChip, ViewSwitch };
export default Toolbar;
