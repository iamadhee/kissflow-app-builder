// GENERATED from starter/src/components/kit/Popover.jsx (sha256:84857bad38bd73ee). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Popover — the layering primitive. Select's menu, a filter panel and a
 * dropdown are all this component with different children.
 *
 * No portal, on purpose: the panel is absolutely positioned inside a relative
 * wrapper next to the trigger, so it needs no measurement pass, no resize
 * listener and no z-index war with the host app. The cost is that it clips
 * inside an ancestor with overflow:hidden — documented, and the reason
 * placement is a fixed set of six rather than a collision-detected value.
 *
 * Controlled or uncontrolled: pass `open` + `onOpenChange` for the former.
 * The trigger is either the `trigger` prop or, if that is absent, the first
 * child — so the whole thing can be written declaratively as trigger-then-panel
 * without threading a node through props.
 *
 * <Popover trigger={<Button>Filters</Button>} placement="bottom-end">…</Popover>
 */
const { useState, useRef, useEffect, useCallback } = React;


const PLACEMENTS = {
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
  'right-start': 'left-full top-0 ml-2',
  'left-start': 'right-full top-0 mr-2',
};

function Popover({
  trigger,
  children,
  placement = 'bottom-start',
  open: openProp,
  onOpenChange,
  padded = true,
  dismissOnClickInside = false,
  className,
  panelClassName,
}) {
  const [openState, setOpenState] = useState(false);
  const controlled = openProp != null;
  const open = controlled ? openProp : openState;
  const wrap = useRef(null);

  const set = useCallback(
    (next) => {
      if (!controlled) setOpenState(next);
      if (onOpenChange) onOpenChange(next);
    },
    [controlled, onOpenChange]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) set(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') set(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, set]);

  const kids = React.Children.toArray(children);
  const triggerNode = trigger != null ? trigger : kids[0];
  const panelNodes = trigger != null ? children : kids.slice(1);

  return (
    <div ref={wrap} className={cx('relative inline-block', className)}>
      <span className="contents" onClick={() => set(!open)}>
        {triggerNode}
      </span>
      {open ? (
        <div
          role="dialog"
          className={cx(
            'absolute z-40 min-w-layer',
            PLACEMENTS[placement] || PLACEMENTS['bottom-start'],
            'bg-layer-surface border border-solid border-layer-border rounded-xl shadow-md',
            'text-ctl-fg animate-layer-in',
            padded && 'p-4',
            panelClassName
          )}
          onClick={dismissOnClickInside ? () => set(false) : undefined}
        >
          {panelNodes}
        </div>
      ) : null}
    </div>
  );
}

/** Menu rows for the common case: a popover used as an action menu. */
function PopoverItem({ children, icon = false, danger = false, disabled = false, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'flex items-center gap-2 w-full h-9 px-3 rounded-md text-sm text-left',
        'bg-transparent border-0 cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)]',
        danger ? 'text-danger-text hover:bg-danger-100' : 'text-ctl-fg hover:bg-ctl-raise',
        'disabled:opacity-[.45] disabled:cursor-not-allowed disabled:hover:bg-transparent'
      )}
    >
      {icon ? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4 shrink-0">
          <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

function PopoverSeparator() {
  return <div className="h-px my-1 -mx-1 bg-layer-border" />;
}

export { Popover, PopoverItem, PopoverSeparator };
export default Popover;
