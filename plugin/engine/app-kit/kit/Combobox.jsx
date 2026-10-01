// GENERATED from starter/src/components/kit/Combobox.jsx (sha256:4304a9791e981163). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";
import { normalizeOptions } from "./options.js";

/**
 * Combobox — Select, plus typing.
 *
 * The difference that matters: a Select's value is always one of the options, a
 * Combobox's may not be. `allowFree` decides which, and it changes what Enter
 * means — commit the highlighted option, or commit what was typed.
 *
 * Filtering is a plain substring match, case- and accent-insensitive, exposed as
 * `matches` so Menu and CommandPalette can hold the same rule without importing
 * across files (each component file resolves standalone).
 *
 * `loading` is for async option sets: the panel stays open with a spinner row
 * rather than flashing "No results" while a request is in flight.
 *
 * <Combobox label="Owner" options={people} value={v} onChange={setV} />
 */
const { useState, useRef, useEffect, useId, useMemo } = React;


/** Shared matching rule. Substring, not fuzzy: fuzzy ranking surprises people
    who typed a whole word and got a different one first. */
function matches(text, query) {
  if (!query) return true;
  const norm = (s) =>
    String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  return norm(text).indexOf(norm(query)) > -1;
}

const SIZES = {
  sm: 'h-8 px-3 gap-2 text-xs',
  md: 'h-10 px-4 gap-2 text-sm',
  lg: 'h-12 px-5 gap-3 text-base',
};

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx('w-4 h-4 transition-transform ease-ctl duration-[var(--default-transition-duration)]', open && 'rotate-180')}
    >
      <path d="M4 6.5 8 10.5l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4 animate-spin [animation-duration:700ms]">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Combobox({
  options: optionsProp = [],
  value,
  onChange,
  onQueryChange,
  size = 'md',
  label,
  hint,
  error,
  placeholder = 'Search…',
  allowFree = false,
  loading = false,
  emptyLabel = 'No matches',
  invalid = false,
  disabled = false,
  readOnly = false,
  className,
  ...rest
}) {
  // whatever the caller has — plain strings from the data model, {value,label}, or SDK rows
  const options = normalizeOptions(optionsProp);
  const id = rest.id || useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrap = useRef(null);

  const isInvalid = invalid || Boolean(error);
  const message = error || hint;
  const selected = options.find((o) => o.value === value);

  /* When closed, the input shows the selected label; typing replaces it. */
  const text = open ? query : selected ? selected.label : allowFree && value != null ? String(value) : '';

  const list = useMemo(
    () => (onQueryChange ? options : options.filter((o) => matches(o.label, query))),
    [options, query, onQueryChange]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => setActive(0), [query, open]);

  const commit = (opt) => {
    if (!opt || opt.disabled) return;
    if (onChange) onChange(opt.value, opt);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const usable = list.filter((o) => !o.disabled);
      if (!usable.length) return;
      const at = usable.indexOf(list[active]);
      const next = usable[(at + dir + usable.length) % usable.length];
      setActive(list.indexOf(next));
    } else if (e.key === 'Enter') {
      if (open && list[active]) {
        e.preventDefault();
        commit(list[active]);
      } else if (allowFree && query) {
        e.preventDefault();
        if (onChange) onChange(query, null);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const shell = cx(
    'flex items-center w-full bg-field-surface border border-solid rounded-lg',
    'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
    'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-ctl-offset',
    SIZES[size] || SIZES.md,
    isInvalid
      ? 'border-danger-600 focus-within:ring-danger-ring'
      : cx('border-field-border hover:border-field-border-hover focus-within:ring-brand-ring', open && 'border-brand-600'),
    disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed pointer-events-none'
  );

  /* Read-only replaces the control rather than restyling it, so no mutation path
     (typing, stepping, scrubbing, the menu, tag removal) can survive by oversight.
     disabled wins: a field that is both stays the faded, non-interactive control. */
  const control = readOnly && !disabled ? (
    <FieldValue id={id} size={size} value={selected ? selected.label : (allowFree && value != null ? String(value) : '')} />
  ) : (
    <div ref={wrap} className={cx('relative w-full', className)}>
      <div className={shell}>
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={id + '-list'}
          aria-activedescendant={open && list[active] ? id + '-opt-' + active : undefined}
          aria-invalid={isInvalid || undefined}
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (onQueryChange) onQueryChange(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 h-full bg-transparent border-0 p-0 text-inherit outline-none placeholder:text-field-placeholder"
          {...rest}
        />
        <span className="shrink-0 text-ctl-fg-muted">{loading ? <Spinner /> : <Chevron open={open} />}</span>
      </div>

      {open ? (
        <div
          id={id + '-list'}
          role="listbox"
          className="absolute z-40 top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto p-1 bg-layer-surface border border-solid border-layer-border rounded-xl shadow-md animate-layer-in"
        >
          {loading ? (
            <div className="flex items-center gap-2 h-9 px-3 text-sm text-ctl-fg-muted">
              <Spinner /> Searching…
            </div>
          ) : list.length ? (
            list.map((opt, i) => {
              const isSel = opt.value === value;
              return (
                <div
                  key={String(opt.value)}
                  id={id + '-opt-' + i}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => !opt.disabled && setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(opt)}
                  className={cx(
                    'flex items-center justify-between gap-3 min-h-9 px-3 py-2 rounded-md text-sm cursor-pointer',
                    'transition-colors ease-ctl duration-[var(--default-transition-duration)]',
                    opt.disabled && 'opacity-[.45] cursor-not-allowed',
                    isSel ? 'bg-field-selected text-brand-text font-medium' : 'text-ctl-fg',
                    !opt.disabled && !isSel && i === active && 'bg-ctl-raise'
                  )}
                >
                  <span className="flex flex-col gap-1 min-w-0">
                    <span className="truncate">{opt.label}</span>
                    {opt.hint ? <span className="text-sm text-ctl-fg-muted truncate">{opt.hint}</span> : null}
                  </span>
                  {opt.meta ? <span className="shrink-0 text-sm text-ctl-fg-muted">{opt.meta}</span> : null}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col gap-1 px-3 py-3 text-sm text-ctl-fg-muted">
              <span>{emptyLabel}</span>
              {allowFree && query ? (
                <span>
                  Press Enter to use “<span className="text-ctl-fg">{query}</span>”
                </span>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  if (!label && !message) return control;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium leading-none text-ctl-fg">
          {label}
        </label>
      ) : null}
      {control}
      {message ? (
        <span className={cx('text-sm leading-snug', isInvalid ? 'text-danger-text' : 'text-ctl-fg-muted')}>{message}</span>
      ) : null}
    </div>
  );
}

export { Combobox, matches };
export default Combobox;
