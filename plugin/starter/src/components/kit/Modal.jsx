import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Modal — scrim plus panel, fixed to the viewport.
 *
 * Three things it does that a styled div does not: returns focus to whatever
 * opened it, traps Tab inside the panel while open, and locks body scroll.
 * Those are the whole reason this is a component.
 *
 * Not portalled, matching Popover: position:fixed against the viewport is
 * enough unless an ancestor is transformed. If a host app has transformed
 * containers, wrap the app's modal host at the root and render there.
 *
 * <Modal open={open} onClose={close} title="Delete project" footer={…}>…</Modal>
 */
const { useEffect, useRef, useCallback } = React;


const SIZES = { sm: 'max-w-modal-sm', md: 'max-w-modal-md', lg: 'max-w-modal-lg' };

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Modal({
  open = false,
  onClose,
  title,
  description,
  icon = null,
  footer,
  children,
  size = 'md',
  closeOnScrim = true,
  showClose = true,
  className,
}) {
  const panel = useRef(null);
  const restore = useRef(null);

  const close = useCallback(() => onClose && onClose(), [onClose]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
          'relative w-full flex flex-col max-h-full overflow-hidden outline-none',
          SIZES[size] || SIZES.md,
          'bg-layer-surface border border-solid border-layer-border rounded-xl shadow-lg',
          'text-ctl-fg animate-modal-in',
          className
        )}
      >
        {title || showClose ? (
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
            <div className="flex items-start gap-4 min-w-0">
              {/* Identity chip: names the action at a glance. A brand wash, never a solid fill —
                  the dialog's one accent stays on the primary action in the footer. */}
              {icon ? (
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-brand-text"
                  style={{ background: 'color-mix(in srgb, var(--brand-600) 11%, var(--layer-surface, var(--ctl-surface)))' }}
                >
                  {icon}
                </span>
              ) : null}
              <div className="flex flex-col gap-1 min-w-0">
                {title ? <h2 className="m-0 font-display text-lg font-semibold leading-snug">{title}</h2> : null}
                {description ? <p className="m-0 text-xs leading-relaxed text-ctl-fg-muted">{description}</p> : null}
              </div>
            </div>
            {showClose ? (
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 grid place-items-center size-9 rounded-lg bg-transparent border border-solid border-field-border text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="px-5 py-1 overflow-y-auto text-sm leading-relaxed">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-3 px-5 pt-4 pb-5 mt-5 border-0 border-t border-solid border-layer-border bg-ctl-offset">
            {footer}
          </div>
        ) : (
          <div className="pb-5" />
        )}
      </div>
    </div>
  );
}

export { Modal };
export default Modal;
