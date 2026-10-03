import React from "react";

/**
 * Input — the field shell every text control in the system is built on.
 *
 * The shell (border, surface, focus ring, height, padding) is a wrapper div;
 * the <input> inside is stripped bare. That is what lets prefix and suffix
 * content sit inside the field without per-case padding maths, and it is why
 * the focus treatment is focus-within rather than focus-visible.
 *
 * Same two sources as Button and nothing else:
 *   tailwind.theme.css — h-8/10/12, px-3/4/5, text-sm/base/lg, ring-2, duration-[var(--default-transition-duration)]
 *   tokens.css         — --field-*, --brand-*, --danger-*, --ctl-fg*
 *
 * <Input label="Email" type="email" value={v} onChange={e => set(e.target.value)} />
 */
const { forwardRef, useId } = React;


/* No border-color here: the base and danger border are same-specificity
   utilities, so stacking them let Tailwind's emission order pick the winner —
   field-border happened to come later and the invalid red never rendered. The
   colour is chosen once, in the state branch below. */
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

const SHELL = [
  'flex items-center w-full appearance-none',
  'bg-field-surface border border-solid rounded-lg',
  'text-ctl-fg',
  'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
  'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-ctl-offset',
].join(' ');

const SIZES = {
  sm: 'h-8 px-3 gap-2 text-xs',
  md: 'h-10 px-4 gap-2 text-sm',
  lg: 'h-12 px-5 gap-3 text-base',
};

const GLYPH = { sm: '12px', md: '14px', lg: '16px' };

/** Stand-in glyph: swap for your icon set's component. */
function PlaceholderIcon({ size }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ width: size, height: size }}>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const InputBase = forwardRef(function InputBase(
  {
    size = 'md',
    type = 'text',
    label,
    hint,
    error,
    prefix = false,
    suffix = false,
    invalid = false,
    disabled = false,
    readOnly = false,
    required = false,
    className,
    ...rest
  },
  ref
) {
  const id = rest.id || useId();
  const isInvalid = invalid || Boolean(error);
  const message = error || hint;
  const glyph = GLYPH[size] || GLYPH.md;

  const shell = cx(
    SHELL,
    SIZES[size] || SIZES.md,
    isInvalid
      ? 'border-danger-600 focus-within:border-danger-600 focus-within:ring-danger-ring'
      : 'border-field-border hover:border-field-border-hover focus-within:border-brand-600 focus-within:ring-brand-ring',
    disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed',
    className
  );

  /* disabled wins: a field that is both is non-interactive AND faded, not a bare value. */
  const field = readOnly && !disabled ? (
    <FieldValue
      id={id}
      size={size}
      value={rest.value}
      defaultValue={rest.defaultValue}
      aria-describedby={message ? id + '-msg' : undefined}
      aria-invalid={isInvalid || undefined}
    />
  ) : (
    <div className={shell} data-size={size} data-invalid={isInvalid || undefined}>
      {prefix ? (
        <span className="shrink-0 flex items-center text-ctl-fg-muted">
          {prefix === true ? <PlaceholderIcon size={glyph} /> : prefix}
        </span>
      ) : null}
      <input
        ref={ref}
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        aria-invalid={isInvalid || undefined}
        aria-describedby={message ? id + '-msg' : undefined}
        className="min-w-0 flex-1 h-full bg-transparent border-0 p-0 m-0 text-inherit outline-none placeholder:text-field-placeholder disabled:cursor-not-allowed"
        {...rest}
      />
      {suffix ? (
        <span className="shrink-0 flex items-center text-ctl-fg-muted">
          {suffix === true ? <PlaceholderIcon size={glyph} /> : suffix}
        </span>
      ) : null}
    </div>
  );

  if (!label && !message) return field;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label htmlFor={id} className="text-xs tracking-wide leading-snug text-ctl-fg-muted">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
      ) : null}
      {field}
      {message ? (
        <span
          id={id + '-msg'}
          className={cx('text-sm leading-snug', isInvalid ? 'text-danger-text' : 'text-ctl-fg-muted')}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
});

InputBase.displayName = 'Input';

function Input({ innerRef, ...props }) {
  return <InputBase ref={innerRef} {...props} />;
}

export { Input, InputBase };
export default Input;
