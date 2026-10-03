import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * NumberInput — Input plus stepping, clamping, and scrub.
 *
 * Three ways in, all landing on the same clamp: type it, step it (buttons, ↑ ↓,
 * or wheel while focused), or drag the label horizontally. Scrub is the one
 * people don't expect and use most once they find it — it is why the label gets
 * a col-resize cursor.
 *
 * Empty is a real state, distinct from 0: onChange reports '' rather than
 * coercing, so a blank optional field doesn't silently become zero.
 *
 * <NumberInput label="Seats" value={n} onChange={setN} min={1} max={99} />
 */
const { useState, useRef, useEffect, useId } = React;


const SIZES = {
  sm: { shell: 'h-8 text-xs', pad: 'px-3', btn: 'w-7' },
  md: { shell: 'h-10 text-sm', pad: 'px-4', btn: 'w-8' },
  lg: { shell: 'h-12 text-base', pad: 'px-5', btn: 'w-9' },
};

function Chev({ dir }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5">
      <path
        d={dir === 'up' ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const decimals = (step) => {
  const s = String(step);
  const at = s.indexOf('.');
  return at < 0 ? 0 : s.length - at - 1;
};

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  size = 'md',
  label,
  hint,
  error,
  unit,
  scrub = true,
  invalid = false,
  disabled = false,
  readOnly = false,
  className,
  ...rest
}) {
  const id = rest.id || useId();
  const s = SIZES[size] || SIZES.md;
  const isInvalid = invalid || Boolean(error);
  const message = error || hint;
  const drag = useRef(null);

  const clamp = (n) => {
    let out = n;
    if (min != null) out = Math.max(min, out);
    if (max != null) out = Math.min(max, out);
    return +out.toFixed(decimals(step));
  };

  const emit = (n) => onChange && onChange(n);

  const bump = (dir, mult) => {
    const base = value === '' || value == null || isNaN(value) ? (min != null ? min : 0) : +value;
    emit(clamp(base + dir * step * (mult || 1)));
  };

  /* Scrub: pointer capture on the label, one step per 4px. Pixel-per-step is a
     feel constant, not a token — it does not belong in the theme. */
  useEffect(() => {
    if (!drag.current) return undefined;
    const onMove = (e) => {
      const d = drag.current;
      if (!d || !d.active) return;
      const dx = e.clientX - d.x;
      const steps = Math.trunc(dx / 4);
      if (!steps) return;
      d.x = e.clientX;
      emit(clamp((value === '' || value == null ? 0 : +value) + steps * step));
    };
    const onUp = () => {
      if (drag.current) drag.current.active = false;
      document.body.style.cursor = '';
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [value, step, min, max]); // eslint-disable-line

  const atMin = min != null && value !== '' && +value <= min;
  const atMax = max != null && value !== '' && +value >= max;

  const btn = cx(
    /* No h-* here: the two steppers set their own h-1/2, and a base h-full would
       race it in the stylesheet. */
    'grid place-items-center shrink-0 bg-transparent border-0 cursor-pointer text-ctl-fg-muted',
    'transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
    'disabled:opacity-[.45] disabled:cursor-not-allowed disabled:hover:bg-transparent',
    s.btn
  );

  /* Read-only replaces the control rather than restyling it, so no mutation path
     (typing, stepping, scrubbing, the menu, tag removal) can survive by oversight.
     disabled wins: a field that is both stays the faded, non-interactive control. */
  const field = readOnly && !disabled ? (
    <FieldValue id={id} size={size} value={value != null && value !== '' ? `${value}${unit ? ' ' + unit : ''}` : ''} />
  ) : (
    <div
      className={cx(
        'flex items-stretch w-full overflow-hidden bg-field-surface border border-solid rounded-lg',
        'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
        'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-ctl-offset',
        s.shell,
        isInvalid
          ? 'border-danger-600 focus-within:border-danger-600 focus-within:ring-danger-ring'
          : 'border-field-border hover:border-field-border-hover focus-within:border-brand-600 focus-within:ring-brand-ring',
        disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed',
        className
      )}
      data-size={size}
    >
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value == null ? '' : value}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={message ? id + '-msg' : undefined}
        role="spinbutton"
        aria-valuenow={value === '' || value == null ? undefined : +value}
        aria-valuemin={min}
        aria-valuemax={max}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.\-]/g, '');
          if (raw === '' || raw === '-') {
            emit('');
            return;
          }
          const n = parseFloat(raw);
          emit(isNaN(n) ? '' : n);
        }}
        onBlur={() => {
          if (value !== '' && value != null && !isNaN(value)) emit(clamp(+value));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            bump(1, e.shiftKey ? 10 : 1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            bump(-1, e.shiftKey ? 10 : 1);
          }
        }}
        onWheel={(e) => {
          if (document.activeElement !== e.currentTarget) return;
          e.preventDefault();
          bump(e.deltaY < 0 ? 1 : -1, 1);
        }}
        className={cx('min-w-0 flex-1 bg-transparent border-0 text-inherit tabular-nums outline-none', s.pad)}
        {...rest}
      />

      {unit ? (
        <span className="grid place-items-center shrink-0 pr-2 text-sm text-ctl-fg-muted select-none">{unit}</span>
      ) : null}

      <span className="flex flex-col shrink-0 border-0 border-l border-solid border-field-border">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increase"
          disabled={disabled || atMax}
          onClick={() => bump(1)}
          className={cx(btn, 'h-1/2 border-0 border-b border-solid border-field-border')}
        >
          <Chev dir="up" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrease"
          disabled={disabled || atMin}
          onClick={() => bump(-1)}
          className={cx(btn, 'h-1/2')}
        >
          <Chev dir="down" />
        </button>
      </span>
    </div>
  );

  if (!label && !message) return field;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label
          htmlFor={id}
          onPointerDown={
            scrub && !disabled
              ? (e) => {
                  drag.current = { active: true, x: e.clientX };
                  document.body.style.cursor = 'col-resize';
                }
              : undefined
          }
          className={cx(
            'text-sm font-medium leading-none text-ctl-fg select-none w-fit',
            scrub && !disabled && 'cursor-col-resize'
          )}
        >
          {label}
        </label>
      ) : null}
      {field}
      {message ? (
        <span id={id + '-msg'} className={cx('text-sm leading-snug', isInvalid ? 'text-danger-text' : 'text-ctl-fg-muted')}>
          {message}
        </span>
      ) : null}
    </div>
  );
}

export { NumberInput };
export default NumberInput;
