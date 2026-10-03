import React from "react";
import { ContentHeader } from "./ContentHeader.jsx";
import { cn as cx } from "./cn.js";

/**
 * Drawer — Modal's mechanics, anchored to an edge.
 *
 * Same three obligations as Modal (focus return, Tab trap, scroll lock) and the
 * same no-portal trade-off. It is a separate file rather than a Modal variant
 * because the layout is genuinely different: full-height, edge-anchored, and
 * usually holding a form the user works through top to bottom.
 *
 * Use it over Modal when the content is longer than a decision — filters, a
 * record's details, a multi-field edit.
 *
 * The panel itself has no padding. Header, scrollable content and footer are full-width siblings
 * with their own insets, so the header/footer dividers always reach both edges. Put form actions
 * in `footer`; a divider authored inside `children` is content-level and intentionally inset.
 *
 * <ItemForm.Root {...formProps}>
 *   <Drawer open={open} onClose={close} title="Edit record" footer={<ItemForm.Actions />}>
 *     <ItemForm.Fields />
 *   </Drawer>
 * </ItemForm.Root>
 */
const { useEffect, useRef, useCallback } = React;


const SIZES = { sm: 'max-w-drawer-sm', md: 'max-w-drawer-md', lg: 'max-w-drawer-lg' };

const SIDES = {
  right: { pos: 'right-0 top-0 bottom-0', anim: 'animate-drawer-right', edge: 'border-0 border-l' },
  left: { pos: 'left-0 top-0 bottom-0', anim: 'animate-drawer-left', edge: 'border-0 border-r' },
};

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Drawer({
  open,
  mode = 'overlay',
  onClose,
  title,
  description,
  footer,
  children,
  side = 'right',
  size = 'md',
  closeOnScrim = true,
  showClose = true,
  className,
  ...rest
}) {
  const panel = useRef(null);
  const restore = useRef(null);
  const close = useCallback(() => onClose && onClose(), [onClose]);
  const s = SIDES[side] || SIDES.right;

  useEffect(() => {
    if (!open) return undefined;
    const doc = document;
    restore.current = doc.activeElement;
    const prevOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';

    const first = panel.current && panel.current.querySelector(FOCUSABLE);
    (first || panel.current).focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const nodes = Array.prototype.filter.call(
        panel.current.querySelectorAll(FOCUSABLE),
        (n) => n.offsetParent !== null
      );
      if (!nodes.length) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && doc.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && doc.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    doc.addEventListener('keydown', onKey, true);
    return () => {
      doc.removeEventListener('keydown', onKey, true);
      doc.body.style.overflow = prevOverflow;
      if (restore.current && restore.current.focus) restore.current.focus({ preventScroll: true });
    };
  }, [open, close]);

  if (mode === 'inline') {
    return (
      <aside
        data-kf-context="detail"
        className={cx(
          'flex min-w-0 flex-col bg-layer-surface border-ctl border-solid border-layer-border shadow-sm',
          'rounded-xl text-ctl-fg',
          className
        )}
        {...rest}
      >
        {title || description ? (
          <div className="flex flex-col gap-2 px-5 py-5 border-b-ctl border-solid border-layer-border">
            {title ? <h2 className="m-0 font-display text-lg font-semibold leading-snug text-ctl-fg text-pretty">{title}</h2> : null}
            {description ? <p className="m-0 text-sm text-ctl-fg-muted text-pretty">{description}</p> : null}
          </div>
        ) : null}
        <div className="flex-1 min-h-0 px-5 py-4 text-sm leading-relaxed">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-3 px-5 py-4 border-t-ctl border-solid border-layer-border">{footer}</div> : null}
      </aside>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-overlay-scrim animate-scrim-in"
        onClick={closeOnScrim ? close : undefined}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cx(
          'absolute w-full flex flex-col outline-none',
          s.pos,
          SIZES[size] || SIZES.md,
          'bg-layer-surface border-solid border-layer-border shadow-lg text-ctl-fg',
          s.edge,
          s.anim,
          className
        )}
        {...rest}
      >
        {title || showClose ? (
          <ContentHeader
            title={title}
            subtitle={description}
            titleAs="h2"
            className="px-5 py-5 border-0 border-b border-solid border-layer-border"
            actions={showClose ? (
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 grid place-items-center w-8 h-8 -mr-1 -mt-1 rounded-md bg-transparent border-0 text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
              >
                <CloseIcon />
              </button>
            ) : null}
          />
        ) : null}

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 text-sm leading-relaxed">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-0 border-t border-solid border-layer-border">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { Drawer };
export default Drawer;
