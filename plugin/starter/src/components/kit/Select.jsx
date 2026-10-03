import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";
import { normalizeOptions } from "./options.js";

/**
 * Select — a listbox, not a styled native <select>.
 *
 * Native select can't be styled past the trigger, so once a product needs an
 * option row with two lines or a check mark, the native element is a dead end.
 * This is the custom one: a button trigger reusing Input's field shell, and a
 * menu reusing Popover's layer treatment (--layer-surface, shadow-md,
 * animate-layer-in). Keyboard: ↑ ↓ Home End Enter Esc, type-ahead on letters.
 *
 * The field shell is duplicated here rather than imported from Input.jsx —
 * each component file resolves standalone. If the shell changes, it changes in
 * both, and the Controls page diffs them.
 *
 * <Select label="Stage" options={opts} value={v} onChange={setV} />
 */
const { useState, useRef, useEffect, useId, useCallback } = React;


const SIZES = {
  sm: 'h-8 px-3 gap-2 text-xs',
  md: 'h-10 px-4 gap-2 text-sm',
  lg: 'h-12 px-5 gap-3 text-base',
};

const CHEV = { sm: '12px', md: '14px', lg: '16px' };

function Chevron({ size, open }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cx('transition-transform ease-ctl duration-[var(--default-transition-duration)]', open && 'rotate-180')}
    >
      <path d="M4 6.5 8 10.5l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ size }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size }}>
      <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Select({
  options: optionsProp = [],
  value,
  onChange,
  size = 'md',
  label,
  hint,
  error,
  placeholder = 'Select…',
  placement = 'auto',
  invalid = false,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  className,
  ...rest
}) {
  // whatever the caller has — plain strings from the data model, {value,label}, or SDK rows
  const options = normalizeOptions(optionsProp);
  const id = rest.id || useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  /* Which way the listbox opens. Measured on open rather than fixed: a select
     near the bottom of the viewport (or of an overflow-hidden pane, like the
     sidebar footer) must flip upward or its menu is clipped to a sliver. */
  const [drop, setDrop] = useState('down');
  const wrap = useRef(null);
  const list = useRef(null);
  const typed = useRef({ str: '', at: 0 });

  const isInvalid = invalid || Boolean(error);
  const message = error || hint;
  const glyph = CHEV[size] || CHEV.md;
  const selected = options.findIndex((o) => o.value === value);
  const current = selected > -1 ? options[selected] : null;

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, close]);

  useEffect(() => {
    if (open) setActive(selected > -1 ? selected : 0);
  }, [open]); // eslint-disable-line

  React.useLayoutEffect(() => {
    if (!open || !wrap.current) return;
    if (placement !== 'auto') { setDrop(placement); return; }
    const r = wrap.current.getBoundingClientRect();
    /* Estimate before paint: option rows are h-9 (36px) + p-1, capped at max-h-64. */
    const est = Math.min(options.length * 36 + 8, 256) + 16;
    setDrop(r.bottom + est > window.innerHeight && r.top > est ? 'up' : 'down');
  }, [open, placement, options.length]);

  const commit = (i) => {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    if (onChange) onChange(opt.value, opt);
    close();
  };

  const step = (from, dir) => {
    for (let i = 1; i <= options.length; i += 1) {
      const next = (from + dir * i + options.length * 2) % options.length;
      if (!options[next].disabled) return next;
    }
    return from;
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => step(a < 0 ? -1 : a, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => step(a < 0 ? 0 : a, -1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(step(-1, 1));
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(step(0, -1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(active);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current.str = now - typed.current.at > 700 ? e.key : typed.current.str + e.key;
      typed.current.at = now;
      const q = typed.current.str.toLowerCase();
      const hit = options.findIndex((o) => !o.disabled && String(o.label).toLowerCase().startsWith(q));
      if (hit > -1) setActive(hit);
    }
  };

  const trigger = cx(
    'flex items-center justify-between w-full appearance-none text-left cursor-pointer',
    'bg-field-surface border border-solid rounded-lg',
    'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset',
    SIZES[size] || SIZES.md,
    isInvalid
      ? 'border-danger-600 focus-visible:ring-danger-ring'
      : cx('border-field-border hover:border-field-border-hover focus-visible:ring-brand-ring', open && 'border-brand-600'),
    current ? 'text-ctl-fg' : 'text-field-placeholder',
    disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed pointer-events-none'
  );

  /* Read-only replaces the control rather than restyling it, so no mutation path
     (typing, stepping, scrubbing, the menu, tag removal) can survive by oversight.
     disabled wins: a field that is both stays the faded, non-interactive control. */
  const control = readOnly && !disabled ? (
    <FieldValue id={id} size={size} value={current ? current.label : ''} />
  ) : (
    <div ref={wrap} className={cx('relative', fullWidth ? 'w-full' : 'inline-block', className)}>
      <button
        type="button"
        id={id}
        className={trigger}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={isInvalid || undefined}
        aria-describedby={message ? id + '-msg' : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        data-size={size}
        {...rest}
      >
        <span className="truncate">{current ? current.label : placeholder}</span>
        <span className="shrink-0 text-ctl-fg-muted">
          <Chevron size={glyph} open={open} />
        </span>
      </button>

      {open ? (
        <div
          ref={list}
          role="listbox"
          aria-labelledby={id}
          aria-activedescendant={active > -1 ? id + '-opt-' + active : undefined}
          className={cx(
            'absolute z-40 left-0 right-0 max-h-64 overflow-y-auto p-1 bg-layer-surface border border-solid border-layer-border rounded-xl shadow-md animate-layer-in',
            drop === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {options.map((opt, i) => {
            const isSel = opt.value === value;
            return (
              <div
                key={String(opt.value)}
                id={id + '-opt-' + i}
                role="option"
                aria-selected={isSel}
                aria-disabled={opt.disabled || undefined}
                onMouseEnter={() => !opt.disabled && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
                className={cx(
                  'flex items-center justify-between gap-2 h-9 px-3 rounded-md text-sm cursor-pointer select-none',
                  'transition-colors ease-ctl duration-[var(--default-transition-duration)]',
                  opt.disabled && 'opacity-[.45] cursor-not-allowed',
                  isSel ? 'bg-field-selected text-brand-text font-medium' : 'text-ctl-fg',
                  !opt.disabled && !isSel && i === active && 'bg-ctl-raise',
                  !opt.disabled && isSel && i === active && 'brightness-95'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSel ? <Check size="14px" /> : null}
              </div>
            );
          })}
          {options.length === 0 ? (
            <div className="h-9 px-3 flex items-center text-sm text-ctl-fg-muted">No options</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (!label && !message) return control;

  return (
    <div className={cx('flex flex-col gap-2', fullWidth && 'w-full')}>
      {label ? (
        <label htmlFor={id} className="text-xs tracking-wide leading-snug text-ctl-fg-muted">
          {label}
        </label>
      ) : null}
      {control}
      {message ? (
        <span id={id + '-msg'} className={cx('text-sm leading-snug', isInvalid ? 'text-danger-text' : 'text-ctl-fg-muted')}>
          {message}
        </span>
      ) : null}
    </div>
  );
}

export { Select };
export default Select;
