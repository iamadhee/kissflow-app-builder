// GENERATED from starter/src/components/kit/Toggle.jsx (sha256:824e235fe3e581c9). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * Toggle — a switch. Same state contract as Checkbox (a native checkbox input,
 * peer-driven visuals), different meaning: a toggle applies immediately, a
 * checkbox is collected and submitted. If the change needs a Save button, it is
 * a Checkbox.
 *
 * The knob travels on the one shared duration, so it never looks faster or
 * slower than the rest of the system.
 *
 * <Toggle label="Auto-assign" checked={on} onChange={e => set(e.target.checked)} />
 */
const { forwardRef, useId } = React;


/* Track and knob geometry is the one place a pixel pair has to agree, so it is
   written out per size instead of derived. The knob is a flex child and the
   travel is animated as the track's left padding: peer-* variants only reach
   siblings, so a transform on the knob (a descendant of the track) would never
   fire. Every number lands on Tailwind's own scale —
   travel = track - 2 * inset - knob. */
const SIZES = {
  sm: { track: 'w-8 h-5 p-1', knob: 'w-4 h-4', move: 'peer-checked:pl-4', text: 'text-xs' },
  md: { track: 'w-10 h-6 p-1', knob: 'w-4 h-4', move: 'peer-checked:pl-5', text: 'text-sm' },
  lg: { track: 'w-14 h-8 p-1', knob: 'w-6 h-6', move: 'peer-checked:pl-7', text: 'text-base' },
};

const ToggleBase = forwardRef(function ToggleBase(
  { label, hint, size = 'md', labelPosition = 'right', stretch, disabled = false, readOnly = false,
    readOnlyLabels = { on: 'On', off: 'Off' }, className, ...rest },
  ref
) {
  const id = rest.id || useId();
  const s = SIZES[size] || SIZES.md;
  const shouldStretch = stretch ?? labelPosition === 'left';

  const track = cx(
    'relative shrink-0 flex items-center rounded-full',
    s.track,
    s.move,
    'bg-ctl-track',
    'transition-[padding-left,background-color,box-shadow] ease-ctl duration-[var(--default-transition-duration)]',
    'peer-checked:bg-brand-600',
    'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-ring',
    'peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ctl-offset',
    'peer-disabled:opacity-[.45]'
  );

  const knob = cx('shrink-0 rounded-full bg-ctl-surface shadow-sm', s.knob);

  const text =
    label || hint ? (
      <span className="flex flex-col gap-1 min-w-0">
        {label ? <span className={cx('leading-snug text-ctl-fg', s.text)}>{label}</span> : null}
        {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
      </span>
    ) : null;

  /* Read-only replaces the control with its value: with no control rendered there is
     no mutation path left to block. disabled wins over readOnly. */
  if (readOnly && !disabled) {
    const on = rest.checked != null ? rest.checked : rest.defaultChecked || false;
    return (
      <span
        className={cx('inline-flex items-center gap-3 py-2', shouldStretch && 'justify-between w-full', className)}
        data-size={size}
      >
        {text}
        <FieldValue id={id} size={size} value={on ? readOnlyLabels.on : readOnlyLabels.off} className="w-fit px-0" />
      </span>
    );
  }

  return (
    <label
      htmlFor={id}
      className={cx(
        'inline-flex items-center gap-3 py-2 select-none',
        labelPosition === 'left' && 'flex-row-reverse',
        shouldStretch && 'justify-between w-full',
        !shouldStretch && 'w-fit',
        disabled ? 'cursor-not-allowed opacity-[.45]' : 'cursor-pointer',
        className
      )}
      data-size={size}
    >
      <input ref={ref} id={id} type="checkbox" role="switch" disabled={disabled} className="peer sr-only" {...rest} />
      <span className={track}>
        <span className={knob} />
      </span>
      {text}
    </label>
  );
});

ToggleBase.displayName = 'Toggle';

function Toggle({ innerRef, ...props }) {
  return <ToggleBase ref={innerRef} {...props} />;
}

export { Toggle, ToggleBase };
export default Toggle;
