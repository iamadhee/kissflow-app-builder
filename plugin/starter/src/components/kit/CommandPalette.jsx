import React from "react";
import { cn as cx } from "./cn.js";

/**
 * CommandPalette — Modal's scrim with a filtered, grouped list.
 *
 * Keyboard-first, so the arrow keys and Enter are the primary path and the mouse
 * is the fallback. Selection is an index into the flattened list, not into a
 * group, which is what lets ↑ ↓ cross group boundaries without special cases.
 *
 * It anchors near the top rather than centred: the list grows downward as the
 * query narrows, and a centred panel would shift under the reader's eye on
 * every keystroke.
 *
 * Same matching rule as Combobox — substring, case- and accent-insensitive.
 *
 * <CommandPalette open={open} onClose={close} groups={groups} />
 */
const { useState, useEffect, useMemo, useRef } = React;


function matches(text, query) {
  if (!query) return true;
  const norm = (s) =>
    String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  return norm(text).indexOf(norm(query)) > -1;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Key({ children }) {
  return (
    <span className="inline-grid place-items-center min-w-5 h-5 px-2 rounded-sm bg-ctl-track border border-solid border-layer-border font-mono text-sm text-ctl-fg-muted">
      {children}
    </span>
  );
}

function CommandPalette({
  open = false,
  onClose,
  groups = [],
  placeholder = 'Search commands…',
  emptyLabel = 'No commands match',
  footer = true,
  className,
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const listRef = useRef(null);

  /* Filter inside each group, drop the groups that empty out, and keep a flat
     list alongside so the cursor can move across group boundaries. */
  const { shown, flat } = useMemo(() => {
    const kept = [];
    const all = [];
    groups.forEach((g) => {
      const items = (g.items || []).filter((it) => matches(it.label + ' ' + (it.hint || '') + ' ' + (it.keywords || ''), query));
      if (!items.length) return;
      kept.push({ label: g.label, items });
      items.forEach((it) => all.push(it));
    });
    return { shown: kept, flat: all };
  }, [groups, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const t = setTimeout(() => input.current && input.current.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const run = (item) => {
    if (!item || item.disabled) return;
    if (item.onSelect) item.onSelect(item);
    if (onClose) onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (onClose) onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(flat[active]);
    }
  };

  let index = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 pt-24" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-overlay-scrim animate-scrim-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cx(
          'relative w-full max-w-palette flex flex-col max-h-full overflow-hidden',
          'bg-layer-surface border border-solid border-layer-border rounded-xl shadow-lg text-ctl-fg animate-modal-in',
          className
        )}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-0 border-b border-solid border-layer-border">
          <span className="shrink-0 text-ctl-fg-muted">
            <SearchIcon />
          </span>
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 h-full bg-transparent border-0 p-0 text-lg text-inherit outline-none placeholder:text-field-placeholder"
          />
          <Key>Esc</Key>
        </div>

        <div ref={listRef} id="cmdk-list" role="listbox" className="flex-1 min-h-0 overflow-y-auto p-2">
          {shown.length ? (
            shown.map((group) => (
              <div key={group.label || 'ungrouped'} className="flex flex-col">
                {group.label ? (
                  <span className="px-3 pt-3 pb-2 text-sm font-medium uppercase tracking-wide text-ctl-fg-muted">
                    {group.label}
                  </span>
                ) : null}
                {group.items.map((item) => {
                  index += 1;
                  const i = index;
                  const on = i === active;
                  return (
                    <button
                      key={item.id != null ? item.id : item.label}
                      type="button"
                      role="option"
                      aria-selected={on}
                      disabled={item.disabled}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => run(item)}
                      className={cx(
                        'flex items-center gap-3 w-full min-h-10 px-3 rounded-md text-left bg-transparent border-0 cursor-pointer',
                        'transition-colors ease-ctl duration-[var(--default-transition-duration)] outline-none',
                        on ? 'bg-field-selected' : 'hover:bg-ctl-raise',
                        'disabled:opacity-[.45] disabled:cursor-not-allowed'
                      )}
                    >
                      {item.icon ? <span className="shrink-0 text-ctl-fg-muted">{item.icon}</span> : null}
                      <span className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className={cx('text-sm font-medium leading-snug truncate', on ? 'text-brand-text font-medium' : 'text-ctl-fg')}>
                          {item.label}
                        </span>
                        {item.hint ? <span className="text-sm text-ctl-fg-muted truncate">{item.hint}</span> : null}
                      </span>
                      {item.shortcut ? <Key>{item.shortcut}</Key> : null}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="grid place-items-center py-10 text-base text-ctl-fg-muted">{emptyLabel}</div>
          )}
        </div>

        {footer ? (
          <div className="flex items-center gap-4 px-4 h-11 border-0 border-t border-solid border-layer-border text-sm text-ctl-fg-muted">
            <span className="flex items-center gap-2">
              <Key>↑</Key>
              <Key>↓</Key>
              to navigate
            </span>
            <span className="flex items-center gap-2">
              <Key>↵</Key>
              to run
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { CommandPalette };
export default CommandPalette;
