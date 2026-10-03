import React from "react";
import { FieldValue } from './FieldValue.jsx';
import { cn as cx } from "./cn.js";

/**
 * Slider and RangeSlider — a bounded continuous value.
 *
 * Built on real <input type="range"> elements, so keyboard, page-up/down and
 * screen readers work without reimplementation. The visible track and fill are
 * an absolutely positioned layer under a transparent native input.
 *
 * RangeSlider stacks two inputs and lets the pointer hit whichever thumb is
 * nearer — two overlapping natives is the only way to get real keyboard support
 * on both ends. The thumbs are clamped so they cannot cross.
 *
 * The fill percentage is the one legitimate inline style in the file: it is a
 * live value that cannot exist as a class.
 *
 * <Slider label="Threshold" value={v} onChange={setV} min={0} max={100} />
 */
const { useRef, useId } = React;


/* The native input is transparent and sits over the drawn track; its thumb is
   styled through a data attribute the page's own CSS can't reach, so the visible
   thumb is a drawn span and the input carries only the interaction. */
const NATIVE =
  'absolute inset-0 w-full h-full m-0 appearance-none bg-transparent cursor-pointer outline-none disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:opacity-0 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:opacity-0';

const THUMB =
  'absolute top-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-ctl-surface border border-solid border-brand-600 shadow-sm pointer-events-none transition-[box-shadow] ease-ctl duration-[var(--default-transition-duration)]';

function pct(v, min, max) {
  if (max === min) return 0;
  return ((v - min) / (max - min)) * 100;
}

function Ticks({ marks, min, max }) {
  return marks.map((m) => {
    const v = typeof m === 'number' ? m : m.value;
    return (
      <span
        key={String(v)}
        className="absolute top-1/2 w-1 h-1 -mt-0.5 -ml-0.5 rounded-full bg-field-border pointer-events-none"
        style={{ left: pct(v, min, max) + '%' }}
      />
    );
  });
}

function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  hint,
  unit,
  marks,
  showValue = true,
  disabled = false,
  readOnly = false,
  className,
  ...rest
}) {
  const id = rest.id || useId();
  const at = pct(value, min, max);

  /* Read-only replaces the control with its value: with no control rendered there is
     no mutation path left to block. disabled wins over readOnly. */
  if (readOnly && !disabled) {
    return (
      <div className={cx('flex flex-col gap-2 w-full', className)}>
        {label ? <label htmlFor={id} className="text-sm font-medium leading-none text-ctl-fg">{label}</label> : null}
        <FieldValue id={id} value={unit ? `${value} ${unit}` : String(value)} />
        {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
      </div>
    );
  }

  return (
    <div className={cx('flex flex-col gap-2 w-full', disabled && 'opacity-[.45]', className)}>
      {label || showValue ? (
        <div className="flex items-baseline justify-between gap-4">
          {label ? (
            <label htmlFor={id} className="text-sm font-medium leading-none text-ctl-fg">
              {label}
            </label>
          ) : null}
          {showValue ? (
            <span className="text-sm font-medium text-ctl-fg tabular-nums">
              {value}
              {unit ? <span className="text-ctl-fg-muted"> {unit}</span> : null}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative h-4 w-full">
        <span className="absolute top-1/2 left-0 right-0 h-2 -mt-1 rounded-full bg-ctl-track" />
        <span
          className="absolute top-1/2 left-0 h-2 -mt-1 rounded-full bg-brand-600 transition-[width] ease-ctl duration-[var(--default-transition-duration)]"
          style={{ width: at + '%' }}
        />
        {marks ? <Ticks marks={marks} min={min} max={max} /> : null}
        <span className={THUMB} style={{ left: at + '%' }} />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(+e.target.value)}
          className={cx(NATIVE, 'focus-visible:ring-0')}
          {...rest}
        />
      </div>

      {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
    </div>
  );
}

function RangeSlider({
  value = { start: 0, end: 100 },
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  hint,
  unit,
  marks,
  showValue = true,
  disabled = false,
  readOnly = false,
  className,
}) {
  const idA = useId();
  const idB = useId();
  const start = Math.min(value.start, value.end);
  const end = Math.max(value.start, value.end);
  const a = pct(start, min, max);
  const b = pct(end, min, max);

  const emit = (next) => onChange && onChange(next);

  /* A range's read-only value is the span itself, not two draggable ends. */
  if (readOnly && !disabled) {
    const span = `${start} – ${end}${unit ? ' ' + unit : ''}`;
    return (
      <div className={cx('flex flex-col gap-2 w-full', className)}>
        {label ? <span className="text-sm font-medium leading-none text-ctl-fg">{label}</span> : null}
        <FieldValue id={idA} value={span} />
        {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
      </div>
    );
  }

  return (
    <div className={cx('flex flex-col gap-2 w-full', disabled && 'opacity-[.45]', className)}>
      {label || showValue ? (
        <div className="flex items-baseline justify-between gap-4">
          {label ? <span className="text-sm font-medium leading-none text-ctl-fg">{label}</span> : null}
          {showValue ? (
            <span className="text-sm font-medium text-ctl-fg tabular-nums">
              {start} – {end}
              {unit ? <span className="text-ctl-fg-muted"> {unit}</span> : null}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative h-4 w-full">
        <span className="absolute top-1/2 left-0 right-0 h-2 -mt-1 rounded-full bg-ctl-track" />
        <span
          className="absolute top-1/2 h-2 -mt-1 bg-brand-600 rounded-full"
          style={{ left: a + '%', width: b - a + '%' }}
        />
        {marks ? <Ticks marks={marks} min={min} max={max} /> : null}
        <span className={THUMB} style={{ left: a + '%' }} />
        <span className={THUMB} style={{ left: b + '%' }} />

        <input
          aria-label={(label || 'Range') + ' start'}
          id={idA}
          type="range"
          min={min}
          max={max}
          step={step}
          value={start}
          disabled={disabled}
          onChange={(e) => emit({ start: Math.min(+e.target.value, end), end })}
          className={cx(NATIVE, 'z-[2]')}
        />
        <input
          aria-label={(label || 'Range') + ' end'}
          id={idB}
          type="range"
          min={min}
          max={max}
          step={step}
          value={end}
          disabled={disabled}
          onChange={(e) => emit({ start, end: Math.max(+e.target.value, start) })}
          className={cx(NATIVE, 'z-[3]')}
        />
      </div>

      {hint ? <span className="text-sm leading-snug text-ctl-fg-muted">{hint}</span> : null}
    </div>
  );
}

export { Slider, RangeSlider };
export default Slider;
