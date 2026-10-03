import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Stepper — where you are in a multi-step flow.
 *
 * State is derived, not stored per step: anything before `current` is complete,
 * `current` is active, everything after is upcoming. A step only carries its own
 * state when it overrides that — an error, or a step completed out of order.
 *
 * Steps are buttons only when `onStepClick` is given. A step you cannot navigate
 * to should not look pressable.
 *
 * Horizontal shows labels only — a one-line track. Hints render in vertical
 * orientation, where there is room for a second line; pass `hints` to force them
 * on. Horizontal steps also wrap onto a second row rather than colliding with
 * their connectors at narrow widths.
 *
 * Focus is carried by weight, not by hiding: every step keeps its label, but
 * only the step you're standing on goes semibold — that's the active step
 * normally, and the errored step when one has been sent back (anchoring the
 * emphasis to "active" alone would leave the error state with no focused step
 * at all). Complete steps drop to an outline check instead of a filled disc —
 * green is spent once, on "a good outcome", not also on "already passed" — and
 * the connector is a flat, fixed-width --layer-border in every position,
 * passed steps included, so the marks alone carry state.
 *
 * <Stepper steps={steps} current={2} />
 */

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5">
      <path d="M3.5 8.4 6.3 11.2 12.5 5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Bang() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5">
      <path d="M8 4v5M8 11.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// complete is an outline, not a fill: a surface ground with a success ring and a
// success-coloured check. Green is the one hue this control keeps — reserved for
// "a good outcome" — so it stops doubling as "a step you already walked past".
const MARKS = {
  complete: 'bg-ctl-surface border-success-600 text-success-600',
  active: 'bg-brand-600 border-brand-600 text-brand-fg',
  error: 'bg-danger-600 border-danger-600 text-danger-fg',
  upcoming: 'bg-ctl-surface border-field-border text-ctl-fg-muted',
};

// Weight carries the focus, colour does not: only the step you're standing on —
// active, or error when a step has been sent back — goes semibold. complete and
// upcoming both read at normal (400); this is emphasis on the current step, not
// a repaint of the others. Colours are unchanged from what shipped before.
const LABELS = {
  complete: 'text-ctl-fg font-normal',
  active: 'text-brand-text font-semibold',
  error: 'text-danger-text font-semibold',
  upcoming: 'text-ctl-fg-muted font-normal',
};

function stateOf(step, i, current) {
  if (step.state) return step.state;
  if (i < current) return 'complete';
  if (i === current) return 'active';
  return 'upcoming';
}

function Stepper({
  steps = [],
  current = 0,
  orientation = 'horizontal',
  size = 'md',
  hints,
  onStepClick,
  className,
}) {
  const vertical = orientation === 'vertical';
  const showHints = hints != null ? hints : vertical;
  const mark = size === 'sm' ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-sm';

  return (
    <ol
      className={cx(
        'flex m-0 p-0 list-none w-full',
        vertical ? 'flex-col gap-0' : 'items-center gap-y-4 flex-wrap',
        className
      )}
    >
      {steps.map((step, i) => {
        const state = stateOf(step, i, current);
        const last = i === steps.length - 1;
        const clickable = Boolean(onStepClick) && state !== 'upcoming';
        const Tag = clickable ? 'button' : 'div';

        return (
          <li
            key={step.key != null ? step.key : (step.label || 'step') + i}
            // flex-initial (the default — no flex-1) + min-w-fit: steps hug their own content
            // instead of growing to fill the row. Growing lis used to hand a flex-1 connector
            // whatever space was left over, which measured 130/98/32/330px across one wrapped
            // row — the last pair split a whole row between them. A step that doesn't grow is
            // what makes the connector below a fixed, equal gap instead of leftover space.
            className={cx('flex min-w-0', vertical ? 'flex-col' : 'min-w-fit items-center')}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            {/* No outer gap-3 on the horizontal branch: the Tag below already carries its own
                gap-3 for mark↔label, and the connector carries its own mx-4 on both sides —
                a second gap-3 out here doubled up on the connector's left margin only (12px
                left / 0 right) and made the geometry asymmetric. In the vertical branch this
                gap is what spaces the mark from the label; it's inert for the connector, which
                renders as a sibling of this div, below. */}
            <div className={cx('flex min-w-0', vertical ? 'items-start gap-3' : 'items-center w-full')}>
              <Tag
                type={clickable ? 'button' : undefined}
                onClick={clickable ? () => onStepClick(i, step) : undefined}
                className={cx(
                  'flex items-center gap-3 min-w-0 bg-transparent border-0 p-0 text-left shrink-0',
                  clickable ? 'cursor-pointer' : 'cursor-default',
                  'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset rounded-md'
                )}
              >
                <span
                  className={cx(
                    'shrink-0 grid place-items-center rounded-full border border-solid font-medium tabular-nums',
                    'transition-[background-color,border-color,color] ease-ctl duration-[var(--default-transition-duration)]',
                    mark,
                    MARKS[state] || MARKS.upcoming
                  )}
                >
                  {state === 'complete' ? <Check /> : state === 'error' ? <Bang /> : i + 1}
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <span
                    className={cx(
                      // weight lives in LABELS now — it varies by state, so it has exactly
                      // one owner. This span only ever sets size and line-height.
                      'text-sm leading-snug',
                      vertical ? 'truncate' : 'whitespace-nowrap',
                      LABELS[state] || LABELS.upcoming
                    )}
                  >
                    {step.label}
                  </span>
                  {step.hint && showHints ? (
                    // 12px, not 14px: at one size the hint carried the same weight of voice as
                    // the label it supports, which undid the emphasis the moment a hint showed
                    // up. --ctl-fg-muted measures 5.38:1 on white, so 12px still clears AA (4.5:1).
                    <span
                      className={cx('text-xs leading-snug text-ctl-fg-muted', vertical ? 'truncate' : 'text-pretty')}
                    >
                      {step.hint}
                    </span>
                  ) : null}
                </span>
              </Tag>

              {!vertical && !last ? (
                // Fixed 40px, flex-none — not a spacer that absorbs whatever the row didn't use
                // (see the li above). mx-4 puts 14px on both sides now that the outer gap-3 is
                // gone, so label —14px— line —14px— next mark is symmetric. bg-layer-border
                // always, passed steps included: at 1px a green trail was a second hue spent on
                // state the marks already carry.
                <span className="h-px w-10 flex-none mx-4 bg-layer-border" aria-hidden="true" />
              ) : null}
            </div>

            {vertical && !last ? (
              // Always --layer-border — see the horizontal connector's comment above; one story,
              // one place.
              <span
                className={cx('w-px ml-4 my-1 bg-layer-border', size === 'sm' ? 'h-5' : 'h-6')}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
export default Stepper;
