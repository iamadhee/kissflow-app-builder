import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * Textarea — Input's field shell, multi-line.
 *
 * autoGrow measures the scroll height on every change and writes it to the
 * element's own style: a live value, not a design token, which is why it is the
 * one inline style here. Without it, a textarea either scrolls at a fixed height
 * or needs a hidden mirror element.
 *
 * <Textarea label="Notes" rows={4} autoGrow maxLength={280} />
 */
const { forwardRef, useId, useRef, useCallback, useEffect } = React;


const SIZES = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-3 text-base',
};

const TextareaBase = forwardRef(function TextareaBase(
  {
    size = 'md',
    rows = 3,
    label,
    hint,
    error,
    invalid = false,
    disabled = false,
  readOnly = false,
    required = false,
    autoGrow = false,
    maxLength,
    value,
    onChange,
    className,
    ...rest
  },
  ref
) {
  const id = rest.id || useId();
  const node = useRef(null);
  const isInvalid = invalid || Boolean(error);
  const message = error || hint;
  const count = typeof value === 'string' ? value.length : 0;

  const grow = useCallback(() => {
    const el = node.current;
    if (!el || !autoGrow) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [autoGrow]);

  useEffect(grow, [value, grow]);

  const shell = cx(
    'w-full appearance-none resize-y block',
    'bg-field-surface border border-solid rounded-lg text-ctl-fg',
    'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
    'outline-none placeholder:text-field-placeholder',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset',
    SIZES[size] || SIZES.md,
    isInvalid
      ? 'border-danger-600 focus-visible:border-danger-600 focus-visible:ring-danger-ring'
      : 'border-field-border hover:border-field-border-hover focus-visible:border-brand-600 focus-visible:ring-brand-ring',
    disabled && 'bg-field-disabled opacity-[.45] cursor-not-allowed',
    autoGrow && 'resize-none overflow-hidden',
    className
  );

  /* Read-only replaces the control rather than restyling it, so no mutation path
     (typing, stepping, scrubbing, the menu, tag removal) can survive by oversight.
     disabled wins: a field that is both stays the faded, non-interactive control. */
  const field = readOnly && !disabled ? (
    <FieldValue id={id} size={size} multiline value={value} defaultValue={rest.defaultValue} />
  ) : (
    <textarea
      ref={(el) => {
        node.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      id={id}
      rows={rows}
      value={value}
      maxLength={maxLength}
      disabled={disabled}
      required={required}
      aria-invalid={isInvalid || undefined}
      aria-describedby={message ? id + '-msg' : undefined}
      className={shell}
      onChange={(e) => {
        if (onChange) onChange(e);
        grow();
      }}
      data-size={size}
      {...rest}
    />
  );

  if (!label && !message && maxLength == null) return field;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label htmlFor={id} className="text-xs tracking-wide leading-snug text-ctl-fg-muted">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
      ) : null}
      {field}
      {message || maxLength != null ? (
        <div className="flex items-start justify-between gap-4">
          <span
            id={id + '-msg'}
            className={cx('text-sm leading-snug', isInvalid ? 'text-danger-text' : 'text-ctl-fg-muted')}
          >
            {message}
          </span>
          {maxLength != null ? (
            <span
              className={cx(
                'shrink-0 text-sm tabular-nums leading-snug',
                count > maxLength * 0.9 ? 'text-danger-text' : 'text-ctl-fg-muted'
              )}
            >
              {count}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

TextareaBase.displayName = 'Textarea';

function Textarea({ innerRef, ...props }) {
  return <TextareaBase ref={innerRef} {...props} />;
}

export { Textarea, TextareaBase };
export default Textarea;
