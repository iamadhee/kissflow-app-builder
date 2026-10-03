import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * Checkbox and Radio — one file, because they are the same control with two
 * shapes and two selection rules, and splitting them guarantees they drift.
 *
 * The native input stays in the DOM (sr-only) and keeps focus, keyboard and
 * form semantics; the visible box is a sibling span driven by peer-* variants.
 * Nothing here is a custom-built input event.
 *
 * The glyph inside the box is never toggled with opacity — the box carries
 * text-transparent and peer-checked:text-brand-fg, and the glyph draws in
 * currentColor. peer-* only reaches siblings, so a variant on a descendant of
 * the box would silently never match.
 *
 * <Checkbox label="Notify me" checked={on} onChange={e => set(e.target.checked)} />
 * <Radio name="plan" value="pro" label="Pro" checked={v === 'pro'} onChange={…} />
 */
const { forwardRef, useId } = React;


const BOX = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const TEXT = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

/* Hit area is the whole label row, so the target clears 44px at md even though
   the box itself is 20px. */
const ROW = { sm: 'gap-2 py-1', md: 'gap-3 py-2', lg: 'gap-3 py-3' };

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="block h-full w-full">
      <path d="M3.5 8.4 6.3 11.2 12.5 5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="block h-full w-full">
      <path d="M4.5 8h7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function makeControl(kind) {
  const isRadio = kind === 'radio';

  const Control = forwardRef(function Control(
    {
      label,
      hint,
      size = 'md',
      indeterminate = false,
      invalid = false,
      disabled = false,
      readOnly = false,
      readOnlyLabels = { on: 'Yes', off: 'No', mixed: 'Partly' },
      className,
      ...rest
    },
    ref
  ) {
    const id = rest.id || useId();
    const box = BOX[size] || BOX.md;

    const mark = cx(
      'shrink-0 grid place-items-center border border-solid',
      box,
      isRadio ? 'rounded-full' : 'rounded-sm',
      'bg-field-surface text-transparent',
      invalid ? 'border-danger-600' : 'border-field-border',
      'transition-[background-color,border-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
      'peer-hover:border-field-border-hover',
      'peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-checked:text-brand-fg',
      'peer-indeterminate:bg-brand-600 peer-indeterminate:border-brand-600 peer-indeterminate:text-brand-fg',
      'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring',
      'peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ctl-offset',
      'peer-disabled:opacity-[.45]'
    );

  /* Read-only replaces the control with its value: with no control rendered there is
     no mutation path left to block. disabled wins over readOnly. */
    if (readOnly && !disabled) {
      const on = rest.checked != null ? rest.checked : rest.defaultChecked || false;
      const state = indeterminate && !isRadio ? readOnlyLabels.mixed : on ? readOnlyLabels.on : readOnlyLabels.off;
      return (
        <FieldValue id={id} size={size} className={cx('w-fit px-0', className)}>
          {label ? <span className="text-ctl-fg">{label}</span> : null}
          <span className="text-ctl-fg-muted">{state}</span>
        </FieldValue>
      );
    }

    return (
      <label
        htmlFor={id}
        className={cx(
          'inline-flex items-start select-none',
          ROW[size] || ROW.md,
          disabled ? 'cursor-not-allowed opacity-[.45]' : 'cursor-pointer',
          className
        )}
        data-size={size}
      >
        <input
          ref={(el) => {
            if (el && !isRadio) el.indeterminate = indeterminate;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          id={id}
          type={kind}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className="peer sr-only"
          {...rest}
        />
        <span className={mark}>
          {isRadio ? (
            <span className="w-1/2 h-1/2 rounded-full bg-current" />
          ) : (
            <span className="grid h-full w-full place-items-center p-px leading-none">{indeterminate ? <DashGlyph /> : <CheckGlyph />}</span>
          )}
        </span>
        {label || hint ? (
          <span className="flex flex-col gap-1 min-w-0">
            {label ? <span className={cx('leading-snug text-ctl-fg', TEXT[size] || TEXT.md)}>{label}</span> : null}
            {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
          </span>
        ) : null}
      </label>
    );
  });

  Control.displayName = isRadio ? 'Radio' : 'Checkbox';
  return Control;
}

const CheckboxBase = makeControl('checkbox');
const RadioBase = makeControl('radio');

function Checkbox({ innerRef, ...props }) {
  return <CheckboxBase ref={innerRef} {...props} />;
}
function Radio({ innerRef, ...props }) {
  return <RadioBase ref={innerRef} {...props} />;
}

/** Vertical set with one shared name — the only correct way to group radios. */
function RadioGroup({ name, value, onChange, options = [], size = 'md', legend, readOnly = false, className }) {
  /* The group's read-only value is the CHOSEN option's label — rendering every option
     as text would say nothing about which one is selected. */
  if (readOnly) {
    const sel = options.find((o) => o.value === value);
    return (
      <fieldset className={cx('flex flex-col gap-1 border-0 p-0 m-0 min-w-0', className)}>
        {legend ? <legend className="text-sm font-medium leading-none text-ctl-fg pb-2">{legend}</legend> : null}
        <FieldValue size={size} value={sel ? sel.label : ''} />
      </fieldset>
    );
  }

  return (
    <fieldset className={cx('flex flex-col gap-1 border-0 p-0 m-0 min-w-0', className)}>
      {legend ? <legend className="text-sm font-medium leading-none text-ctl-fg pb-2">{legend}</legend> : null}
      {options.map((opt) => (
        <Radio
          key={String(opt.value)}
          name={name}
          size={size}
          label={opt.label}
          hint={opt.hint}
          value={opt.value}
          disabled={opt.disabled}
          checked={value === opt.value}
          onChange={() => onChange && onChange(opt.value, opt)}
        />
      ))}
    </fieldset>
  );
}

export { Checkbox, Radio, RadioGroup, CheckboxBase, RadioBase };
export default Checkbox;
