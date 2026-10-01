// GENERATED from starter/src/components/kit/DateField.jsx (sha256:47f1f0fb7e0c04e6). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * DateField — typing a date, with no calendar.
 *
 * Most dates are known, and typing eight digits beats nine clicks through a
 * month grid. The field auto-inserts separators as you type, accepts a paste of
 * any of the three common orders, and only reports a value once the whole date
 * parses — a half-typed date is not an invalid date.
 *
 * Value in and out is always ISO (YYYY-MM-DD); `display` only changes what the
 * user sees and types.
 *
 * <DateField label="Due" value={v} onChange={setV} display="dmy" />
 */
const { useState, useEffect, useId } = React;


const SIZES = {
  sm: 'h-8 px-3 gap-2 text-xs',
  md: 'h-10 px-4 gap-2 text-sm',
  lg: 'h-12 px-5 gap-3 text-base',
};

const ICON_SIZES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-[18px] w-[18px]',
};

const pad = (n) => (n < 10 ? '0' + n : String(n));

const ORDERS = {
  iso: { hint: 'YYYY-MM-DD', sep: '-', parts: ['y', 'm', 'd'], widths: [4, 2, 2] },
  dmy: { hint: 'DD/MM/YYYY', sep: '/', parts: ['d', 'm', 'y'], widths: [2, 2, 4] },
  mdy: { hint: 'MM/DD/YYYY', sep: '/', parts: ['m', 'd', 'y'], widths: [2, 2, 4] },
};

function toDisplay(isoStr, order) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoStr || ''));
  if (!m) return '';
  const map = { y: m[1], m: m[2], d: m[3] };
  return order.parts.map((p) => map[p]).join(order.sep);
}

/** Groups the digits by the order's widths, so separators are never typed. */
function fromDigits(digits, order) {
  const map = {};
  let at = 0;
  order.parts.forEach((p, i) => {
    map[p] = digits.slice(at, at + order.widths[i]);
    at += order.widths[i];
  });
  if (!map.y || map.y.length < 4 || map.m.length < 2 || map.d.length < 2) return null;
  const y = +map.y;
  const mo = +map.m;
  const d = +map.d;
  if (mo < 1 || mo > 12 || d < 1 || d > new Date(y, mo, 0).getDate()) return null;
  return y + '-' + pad(mo) + '-' + pad(d);
}

function groupDigits(digits, order) {
  const out = [];
  let at = 0;
  order.widths.forEach((w) => {
    const chunk = digits.slice(at, at + w);
    if (chunk) out.push(chunk);
    at += w;
  });
  return out.join(order.sep);
}

function CalIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cx('block', className)}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DateField({
  value,
  onChange,
  display = 'iso',
  size = 'md',
  label,
  hint,
  error,
  invalid = false,
  disabled = false,
  readOnly = false,
  leadingIcon = true,
  suffix,
  className,
  ...rest
}) {
  const id = rest.id || useId();
  const order = ORDERS[display] || ORDERS.iso;
  const [text, setText] = useState(() => toDisplay(value, order));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setText(toDisplay(value, order));
    setDirty(false);
  }, [value, display]); // eslint-disable-line

  const digitsNeeded = order.widths.reduce((a, b) => a + b, 0);
  const typedDigits = text.replace(/\D/g, '');
  const incomplete = dirty && typedDigits.length === digitsNeeded && !fromDigits(typedDigits, order);
  const isInvalid = invalid || Boolean(error) || incomplete;
  const message = incomplete ? 'That date doesn’t exist.' : error || hint;

  const shell = cx(
    'flex items-center w-full bg-field-surface border border-solid rounded-lg',
    'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
    'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-ctl-offset',
    SIZES[size] || SIZES.md,
    isInvalid
      ? 'border-danger-600 focus-within:border-danger-600 focus-within:ring-danger-ring'
      : 'border-field-border hover:border-field-border-hover focus-within:border-brand-600 focus-within:ring-brand-ring',
    disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed',
    className
  );

  /* Read-only replaces the control rather than restyling it, so no mutation path
     (typing, stepping, scrubbing, the menu, tag removal) can survive by oversight.
     disabled wins: a field that is both stays the faded, non-interactive control. */
  const field = readOnly && !disabled ? (
    <FieldValue id={id} size={size} value={text} />
  ) : (
    <div className={shell} data-size={size}>
      {leadingIcon ? (
        <span className="shrink-0 text-ctl-fg-muted">
          <CalIcon className={ICON_SIZES[size] || ICON_SIZES.md} />
        </span>
      ) : null}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={order.hint}
        value={text}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={message ? id + '-msg' : undefined}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, digitsNeeded);
          setText(groupDigits(digits, order));
          setDirty(true);
          const parsed = fromDigits(digits, order);
          if (onChange && (parsed || !digits)) onChange(parsed || '');
        }}
        className="min-w-0 flex-1 h-full bg-transparent border-0 p-0 text-inherit tabular-nums outline-none placeholder:text-field-placeholder"
        {...rest}
      />
      {suffix ? <span className="shrink-0 flex items-center">{suffix}</span> : null}
    </div>
  );

  if (!label && !message) return field;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium leading-none text-ctl-fg">
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

export { DateField, toDisplay };
export default DateField;
