// GENERATED from starter/src/components/kit/MultiCombobox.jsx (sha256:532a62a05ff134e1). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";
import { normalizeOptions } from "./options.js";

/**
 * MultiCombobox — Combobox where the value is a list.
 *
 * Selected values live inside the field as removable tags, which is the whole
 * reason this is a separate component rather than a `multiple` prop: one
 * selection is a line of text, several are a wrapping stack, and the field has
 * to grow. Fixed height and `truncate` can't be reconciled with that.
 *
 * Backspace on an empty query removes the last tag — the behaviour people expect
 * from every tag field and notice immediately when it is missing.
 *
 * `max` caps the selection and disables further options rather than hiding them,
 * so the list doesn't change shape when the cap is reached.
 *
 * <MultiCombobox label="Owners" options={people} value={ids} onChange={setIds} />
 */
const { useState, useRef, useEffect, useId, useMemo } = React;


function matches(text, query) {
  if (!query) return true;
  const norm = (s) =>
    String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  return norm(text).indexOf(norm(query)) > -1;
}

const PADS = { sm: 'px-2 py-1 gap-1 text-xs', md: 'px-3 py-2 gap-2 text-sm', lg: 'px-3 py-2 gap-2 text-base' };
const MINH = { sm: 'min-h-8', md: 'min-h-10', lg: 'min-h-12' };

function MultiCombobox({
  options: optionsProp = [],
  value = [],
  onChange,
  size = 'md',
  label,
  hint,
  error,
  placeholder = 'Search…',
  emptyLabel = 'No matches',
  max,
  allowFree = false,
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
  const input = useRef(null);

  const isInvalid = invalid || Boolean(error);
  const atMax = max != null && value.length >= max;
  const message = error || (atMax ? 'Maximum of ' + max + ' selected.' : hint);

  const chosen = value.map((v) => options.find((o) => o.value === v) || { value: v, label: String(v) });
  const list = useMemo(() => options.filter((o) => matches(o.label, query)), [options, query]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => setActive(0), [query, open]);

  const emit = (next) => onChange && onChange(next);

  const toggle = (opt) => {
    if (!opt || opt.disabled) return;
    const has = value.indexOf(opt.value) > -1;
    if (has) emit(value.filter((v) => v !== opt.value));
    else if (!atMax) emit(value.concat(opt.value));
    setQuery('');
    if (input.current) input.current.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Backspace' && !query && value.length) {
      e.preventDefault();
      emit(value.slice(0, -1));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const usable = list.filter((o) => !o.disabled);
      if (!usable.length) return;
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      const at = usable.indexOf(list[active]);
      setActive(list.indexOf(usable[(at + dir + usable.length) % usable.length]));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && list[active]) toggle(list[active]);
      else if (allowFree && query && !atMax) {
        emit(value.concat(query));
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  /* Read-only replaces the control rather than restyling it, so no mutation path
     (typing, stepping, scrubbing, the menu, tag removal) can survive by oversight.
     disabled wins: a field that is both stays the faded, non-interactive control. */
  const control = readOnly && !disabled ? (
    <FieldValue id={id} size={size} value={chosen.map((c) => c.label).join(', ')} />
  ) : (
    <div ref={wrap} className={cx('relative w-full', className)}>
      <div
        onClick={() => {
          if (!disabled && input.current) input.current.focus();
        }}
        className={cx(
          'flex items-center flex-wrap w-full cursor-text',
          'bg-field-surface border border-solid rounded-lg',
          'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
          'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-ctl-offset',
          PADS[size] || PADS.md,
          MINH[size] || MINH.md,
          isInvalid
            ? 'border-danger-600 focus-within:ring-danger-ring'
            : cx('border-field-border hover:border-field-border-hover focus-within:ring-brand-ring', open && 'border-brand-600'),
          disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed pointer-events-none'
        )}
      >
        {chosen.map((opt) => (
          <span
            key={String(opt.value)}
            className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-sm bg-brand-100 text-brand-text text-sm font-medium leading-none"
          >
            {opt.label}
            <button
              type="button"
              aria-label={'Remove ' + opt.label}
              onClick={(e) => {
                e.stopPropagation();
                emit(value.filter((v) => v !== opt.value));
              }}
              className="grid place-items-center w-4 h-4 rounded-sm bg-transparent border-0 text-current opacity-70 cursor-pointer transition-opacity ease-ctl duration-[var(--default-transition-duration)] hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3 h-3">
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={input}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-invalid={isInvalid || undefined}
          value={query}
          placeholder={chosen.length ? '' : placeholder}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-16 h-6 bg-transparent border-0 p-0 text-inherit outline-none placeholder:text-field-placeholder"
          {...rest}
        />
      </div>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-40 top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto p-1 bg-layer-surface border border-solid border-layer-border rounded-xl shadow-md animate-layer-in"
        >
          {list.length ? (
            list.map((opt, i) => {
              const on = value.indexOf(opt.value) > -1;
              const blocked = opt.disabled || (atMax && !on);
              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={on}
                  aria-disabled={blocked || undefined}
                  onMouseEnter={() => !blocked && setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !blocked && toggle(opt)}
                  className={cx(
                    'flex items-center gap-3 min-h-9 px-3 rounded-md text-sm',
                    'transition-colors ease-ctl duration-[var(--default-transition-duration)]',
                    blocked ? 'opacity-[.45] cursor-not-allowed' : 'cursor-pointer',
                    !blocked && i === active && 'bg-ctl-raise',
                    on ? 'text-brand-text font-medium' : 'text-ctl-fg'
                  )}
                >
                  <span
                    className={cx(
                      'grid place-items-center w-4 h-4 shrink-0 rounded-sm border border-solid',
                      on ? 'bg-brand-600 border-brand-600 text-brand-fg' : 'bg-field-surface border-field-border text-transparent'
                    )}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3 h-3">
                      <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                  {opt.meta ? <span className="shrink-0 text-sm text-ctl-fg-muted">{opt.meta}</span> : null}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col gap-1 px-3 py-3 text-sm text-ctl-fg-muted">
              <span>{emptyLabel}</span>
              {allowFree && query ? (
                <span>
                  Press Enter to add “<span className="text-ctl-fg">{query}</span>”
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
        <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-medium leading-none text-ctl-fg">
          {label}
          {max != null ? <span className="font-normal text-ctl-fg-muted tabular-nums">{value.length}/{max}</span> : null}
        </label>
      ) : null}
      {control}
      {message ? (
        <span className={cx('text-sm leading-snug', isInvalid ? 'text-danger-text' : 'text-ctl-fg-muted')}>{message}</span>
      ) : null}
    </div>
  );
}

export { MultiCombobox };
export default MultiCombobox;
