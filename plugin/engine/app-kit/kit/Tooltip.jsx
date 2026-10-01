// GENERATED from starter/src/components/kit/Tooltip.jsx (sha256:4e273f8c3757ec71). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Tooltip — a label, never content.
 *
 * Opens on hover and on focus, so it is reachable by keyboard; closes on blur,
 * mouseleave and Escape. The delay is on open only — a tooltip that lingers on
 * the way out feels broken.
 *
 * Inverted on purpose: --tooltip-surface is dark in the light theme and light in
 * the dark one, so a tooltip never reads as another panel.
 *
 * Anything a user needs to click belongs in a Popover instead: the panel here is
 * pointer-events-none and aria-hidden to the interaction tree.
 *
 * <Tooltip label="Assign to me"><Button icon /></Tooltip>
 */
const { useState, useRef, useEffect, useId, useCallback } = React;


const PLACEMENTS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

function Tooltip({ label, children, placement = 'top', delay = 250, disabled = false, className }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const id = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const show = useCallback(() => {
    if (disabled || !label) return;
    clear();
    timer.current = setTimeout(() => setOpen(true), delay);
  }, [delay, disabled, label]);

  const hide = useCallback(() => {
    clear();
    setOpen(false);
  }, []);

  useEffect(() => clear, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hide]);

  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      <span className="contents" aria-describedby={open ? id : undefined}>
        {children}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cx(
            'absolute z-[60] w-max max-w-toast px-3 py-2 pointer-events-none',
            'bg-tooltip-surface text-tooltip-fg text-sm leading-snug font-medium',
            'rounded-md shadow-md animate-layer-in',
            PLACEMENTS[placement] || PLACEMENTS.top
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

export { Tooltip };
export default Tooltip;
