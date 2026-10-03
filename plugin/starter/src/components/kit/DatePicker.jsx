import React from "react";
import { Calendar } from "./Calendar.jsx";
import { DateField } from "./DateField.jsx";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * DatePicker — DateField as the trigger, Calendar as the panel.
 *
 * Typing stays the primary path: the field is a real input, and the calendar is
 * a second way in rather than the only one. That is the whole argument for
 * building DateField and Calendar separately first.
 *
 * The panel uses the sibling Calendar and DateField modules. Callers can still
 * replace the field or calendar content through the existing composition props.
 *
 * <DatePicker label="Due date" value={v} onChange={setV} />
 */
const { useState, useRef, useEffect, useCallback } = React;


function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 6.5h11" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5" y="8.5" width="2" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function DatePicker({
  value,
  onChange,
  mode = 'single',
  display = 'iso',
  size = 'md',
  label,
  hint,
  error,
  invalid = false,
  min,
  max,
  disabled = false,
  readOnly = false,
  closeOnSelect = true,
  field,
  children,
  className,
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const openBtn = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-label="Open calendar"
      aria-expanded={open}
      disabled={disabled}
      className={cx(
        'shrink-0 grid place-items-center w-7 h-7 -mr-1 rounded-md bg-transparent border-0 cursor-pointer',
        'transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
        open ? 'text-brand-text bg-ctl-raise' : 'text-ctl-fg-muted'
      )}
    >
      <GridIcon />
    </button>
  );

  const trigger =
    field ||
    (
      <DateField
        value={mode === 'range' ? (value && value.start) || '' : value}
        onChange={mode === 'range' ? (d) => onChange && onChange({ start: d, end: value && value.end }) : onChange}
        display={display}
        size={size}
        label={label}
        hint={hint}
        error={error}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
        leadingIcon={false}
        suffix={openBtn}
      />
    );

  return (
    <div ref={wrap} className={cx('relative w-full', className)}>
      {trigger}
      {/* Read-only replaces the control with its value: with no control rendered there is
          no mutation path left to block. disabled wins over readOnly. */}
      {open && !(readOnly && !disabled) ? (
        <div className="absolute z-40 top-full left-0 mt-2 rounded-xl shadow-md animate-layer-in">
          {children || (
            <Calendar
              mode={mode}
              value={value}
              min={min}
              max={max}
              onChange={(next) => {
                if (onChange) onChange(next);
                const done = mode !== 'range' || (next && next.start && next.end);
                if (closeOnSelect && done) close();
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export { DatePicker };
export default DatePicker;
