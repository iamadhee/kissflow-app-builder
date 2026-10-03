import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Menu — Popover's item list promoted to a component.
 *
 * PopoverItem covers a flat list of three actions. This covers the rest: groups
 * with labels, separators, shortcut hints, checkable items, and one level of
 * submenu. Beyond one level, a menu is a navigation problem, not a menu.
 *
 * Submenus open on hover and on ArrowRight, and close on ArrowLeft — mouse and
 * keyboard reach the same items. Roving focus lives on the panel, so the whole
 * menu is one tab stop.
 *
 * <Menu items={items} trigger={<Button>Actions</Button>} />
 */
const { useState, useRef, useEffect, useCallback } = React;


const PLACEMENTS = {
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
};

const PANEL =
  'min-w-layer p-1 bg-layer-surface border border-solid border-layer-border rounded-xl shadow-md animate-layer-in';

const ROW =
  'flex items-center gap-3 w-full min-h-9 px-3 rounded-md text-sm text-left bg-transparent border-0 cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] outline-none';

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5 shrink-0">
      <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5 shrink-0">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dot() {
  return <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-current" />;
}

function MenuRows({ items, onClose, depth = 0 }) {
  const [openSub, setOpenSub] = useState(null);

  return items.map((item, i) => {
    const key = item.key != null ? item.key : (item.label || 'row') + i;

    if (item.type === 'separator') return <span key={key} className="block h-px my-1 -mx-1 bg-layer-border" />;

    if (item.type === 'group')
      return (
        <span
          key={key}
          className="block px-3 pt-3 pb-2 text-sm font-medium uppercase tracking-wide text-ctl-fg-muted"
        >
          {item.label}
        </span>
      );

    if (item.items) {
      const on = openSub === key;
      return (
        <span
          key={key}
          className="relative block"
          onMouseEnter={() => setOpenSub(key)}
          onMouseLeave={() => setOpenSub(null)}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={on}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                setOpenSub(key);
              } else if (e.key === 'ArrowLeft') {
                setOpenSub(null);
              }
            }}
            className={cx(
              ROW,
              'justify-between text-ctl-fg hover:bg-ctl-raise focus-visible:bg-ctl-raise',
              on && 'bg-ctl-raise'
            )}
          >
            <span className="flex items-center gap-3 min-w-0">
              {item.icon ? <span className="shrink-0 text-ctl-fg-muted">{item.icon}</span> : null}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="text-ctl-fg-muted">
              <Caret />
            </span>
          </button>
          {on ? (
            <span className={cx('absolute z-40 left-full top-0 -mt-1 ml-1 block', PANEL)}>
              <MenuRows items={item.items} onClose={onClose} depth={depth + 1} />
            </span>
          ) : null}
        </span>
      );
    }

    return (
      <button
        key={key}
        type="button"
        role={item.checked != null ? 'menuitemcheckbox' : 'menuitem'}
        aria-checked={item.checked != null ? Boolean(item.checked) : undefined}
        disabled={item.disabled}
        onClick={() => {
          if (item.onSelect) item.onSelect(item);
          if (item.keepOpen !== true && onClose) onClose();
        }}
        className={cx(
          ROW,
          'justify-between',
          item.danger ? 'text-danger-text hover:bg-danger-100' : 'text-ctl-fg hover:bg-ctl-raise',
          'focus-visible:bg-ctl-raise',
          'disabled:opacity-[.45] disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className={cx('shrink-0 w-3.5 grid place-items-center', item.danger ? '' : 'text-ctl-fg-muted')}>
            {item.checked ? <Check /> : item.icon ? item.icon : item.checked === false ? null : null}
          </span>
          <span className="truncate">{item.label}</span>
        </span>
        {item.shortcut ? (
          <span className="shrink-0 font-mono text-sm text-ctl-fg-muted tracking-wide">{item.shortcut}</span>
        ) : item.selected ? (
          <span className="text-brand-text">
            <Dot />
          </span>
        ) : null}
      </button>
    );
  });
}

function Menu({ items = [], trigger, children, placement = 'bottom-start', open: openProp, onOpenChange, className }) {
  const [openState, setOpenState] = useState(false);
  const controlled = openProp != null;
  const open = controlled ? openProp : openState;
  const wrap = useRef(null);
  const panel = useRef(null);

  const set = useCallback(
    (next) => {
      if (!controlled) setOpenState(next);
      if (onOpenChange) onOpenChange(next);
    },
    [controlled, onOpenChange]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) set(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        set(false);
        return;
      }
      if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || !panel.current) return;
      e.preventDefault();
      const rows = Array.prototype.filter.call(
        panel.current.querySelectorAll('button:not([disabled])'),
        (n) => n.offsetParent !== null
      );
      if (!rows.length) return;
      const at = rows.indexOf(document.activeElement);
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      rows[(at + dir + rows.length) % rows.length].focus();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, set]);

  const kids = React.Children.toArray(children);
  const triggerNode = trigger != null ? trigger : kids[0];

  return (
    <div ref={wrap} className={cx('relative inline-block', className)}>
      <span className="contents" onClick={() => set(!open)}>
        {triggerNode}
      </span>
      {open ? (
        <div
          ref={panel}
          role="menu"
          className={cx('absolute z-40', PLACEMENTS[placement] || PLACEMENTS['bottom-start'], PANEL)}
        >
          <MenuRows items={items} onClose={() => set(false)} />
        </div>
      ) : null}
    </div>
  );
}

export { Menu };
export default Menu;
