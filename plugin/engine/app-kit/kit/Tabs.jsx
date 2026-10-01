// GENERATED from starter/src/components/kit/Tabs.jsx (sha256:c275b1a5eb2d8f6c). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";
import { tabLabel } from "./labels.js";

/**
 * Tabs — two variants, one behaviour.
 *
 *   underline  section navigation inside a page
 *   pill       a segmented switch over one view's contents
 *
 * Roving tabindex with ← → Home End, so the set is one stop in the tab order.
 * Panels are not rendered here: the caller owns its own content, which keeps
 * this file free of any assumption about how that content is loaded.
 *
 * <Tabs items={items} value={tab} onChange={setTab} variant="pill" />
 */
const { useRef, useCallback } = React;


const SIZES = {
  sm: { tab: 'h-8 px-3 text-xs-plus', gap: 'gap-2' },
  md: { tab: 'h-10 px-4 text-xs-plus', gap: 'gap-2' },
  lg: { tab: 'h-12 px-5 text-base', gap: 'gap-3' },
};

function Tabs({
  items = [],
  value,
  onChange,
  variant = 'underline',
  size = 'sm',
  fullWidth = false,
  className,
}) {
  const s = SIZES[size] || SIZES.md;
  const refs = useRef([]);
  const enabled = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i > -1);

  const focusTab = useCallback((i) => {
    const node = refs.current[i];
    if (node) node.focus();
  }, []);

  const onKeyDown = (e) => {
    const at = enabled.indexOf(items.findIndex((t) => t.value === value));
    if (at < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = enabled[(at + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next == null) return;
    e.preventDefault();
    if (onChange) onChange(items[next].value, items[next]);
    focusTab(next);
  };

  const isPill = variant === 'pill';

  const listClasses = isPill
    ? cx('inline-flex flex-wrap items-center bg-transparent', s.gap, fullWidth && 'flex w-full')
    : cx('flex max-w-full overflow-x-auto items-center border-0 border-b border-solid border-layer-border', fullWidth && 'w-full');

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className={cx(listClasses, className)}
      data-variant={variant}
    >
      {items.map((tab, i) => {
        const selected = tab.value === value;
        const base = cx(
          'relative inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap',
          'font-medium cursor-pointer select-none',
          'transition-[background-color,color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
          'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset',
          'disabled:opacity-[.45] disabled:cursor-not-allowed',
          s.tab,
          fullWidth && 'flex-1'
        );

        const look = isPill
          ? cx(
              'rounded-full border border-solid',
              selected
                ? 'border-brand-600 bg-field-selected text-brand-text shadow-none'
                : 'border-ctl-border bg-ctl-surface text-ctl-fg-muted shadow-none hover:border-ctl-border-strong hover:bg-ctl-raise hover:text-ctl-fg'
            )
          : cx(
              'bg-transparent rounded-t-md -mb-px border-0 border-b-2 border-solid',
              selected
                ? 'border-brand-600 text-brand-text'
                : 'border-transparent text-ctl-fg-muted hover:text-ctl-fg hover:border-field-border'
            );

        return (
          <button
            key={String(tab.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tab.panelId}
            tabIndex={selected ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onChange && onChange(tab.value, tab)}
            className={cx(base, look)}
          >
            {tabLabel(tab.label)}
            {tab.count != null ? (
              <span
                className={cx(
                  'inline-flex items-center h-5 px-2 rounded-full text-xs-plus font-medium tabular-nums',
                  selected ? 'bg-ctl-surface text-brand-text' : 'bg-ctl-track text-ctl-fg-subtle'
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };
export default Tabs;
