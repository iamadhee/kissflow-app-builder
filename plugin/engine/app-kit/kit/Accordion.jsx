// GENERATED from starter/src/components/kit/Accordion.jsx (sha256:a5ed95582b7e6830). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Accordion — collapsible rows, single or multiple open.
 *
 * The open transition animates grid-template-rows from 0fr to 1fr, so the panel
 * grows to its own content height with no measurement, no max-height guess and
 * no ResizeObserver. That is the one place this file uses an inline style: the
 * value is a live number, not a design token.
 *
 * <Accordion items={items} multiple />
 */
const { useState, useId } = React;


function Caret({ open }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx('w-4 h-4 shrink-0 transition-transform ease-ctl duration-[var(--default-transition-duration)]', open && 'rotate-90')}
    >
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Accordion({
  items = [],
  multiple = false,
  defaultOpen = [],
  value,
  onChange,
  bordered = true,
  className,
}) {
  const uid = useId();
  const [openState, setOpenState] = useState(() => defaultOpen.slice());
  const controlled = value != null;
  const open = controlled ? value : openState;

  const isOpen = (key) => open.indexOf(key) > -1;

  const toggle = (key) => {
    const next = isOpen(key) ? open.filter((k) => k !== key) : multiple ? open.concat(key) : [key];
    if (!controlled) setOpenState(next);
    if (onChange) onChange(next);
  };

  return (
    <div
      data-kf-component="accordion"
      className={cx(
        'flex flex-col w-full',
        bordered && 'border border-solid border-ctl-border rounded-xl overflow-hidden bg-ctl-surface',
        className
      )}
    >
      {items.map((item, i) => {
        const key = item.key != null ? item.key : String(i);
        const on = isOpen(key);
        const headId = uid + '-h-' + i;
        const panelId = uid + '-p-' + i;
        return (
          <div
            key={key}
            className={cx(i > 0 && 'border-0 border-t border-solid border-ctl-border')}
          >
            <h3 className="m-0 font-display">
              <button
                type="button"
                id={headId}
                aria-expanded={on}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(key)}
                data-accordion-trigger=""
                className={cx(
                  'flex items-center w-full min-h-14 text-left',
                  'bg-transparent border-0 cursor-pointer text-sm font-medium text-ctl-fg',
                  'transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise',
                  'outline-none focus-visible:ring-[length:var(--ring-ctl)] focus-visible:ring-brand-ring',
                  'disabled:opacity-[.45] disabled:cursor-not-allowed disabled:hover:bg-transparent'
                )}
              >
                <span className="inline-flex shrink-0 items-center justify-center text-ctl-fg">
                  <Caret open={on} />
                </span>
                <span className="flex-1 min-w-0 leading-snug">{item.label}</span>
                {item.meta ? <span className="shrink-0 text-xs text-ctl-fg-muted">{item.meta}</span> : null}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headId}
              className="grid transition-[grid-template-rows] ease-ctl duration-[var(--default-transition-duration)]"
              style={{ gridTemplateRows: on ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div data-accordion-panel="" className="pl-12 text-sm font-medium leading-relaxed text-ctl-fg-muted">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Accordion };
export default Accordion;
