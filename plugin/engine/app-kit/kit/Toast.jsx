// GENERATED from starter/src/components/kit/Toast.jsx (sha256:840de1ffaf87d1b7). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Toast — presentational stack plus a tiny store.
 *
 * Deliberately split: ToastStack renders whatever array it is handed, so it can
 * be screenshotted, storybooked and reviewed in a gallery, while createToastStore
 * holds the queue for real apps. No context provider, no hook that only works
 * inside one — a store the host can own, subscribe to and test.
 *
 *   const toasts = createToastStore();
 *   toasts.push({ tone: 'success', title: 'Saved' });
 *   <ToastStack items={items} onDismiss={toasts.dismiss} />
 */
const { useEffect } = React;


// Tone used to be a 2px edge; it's now a 20px chip carrying a glyph, because a bare hue bar
// gives a colourblind reader nothing but the text. The tone now says itself twice on purpose —
// the chip's shape for someone who can't see hue, the title's ink for someone scanning a stack
// of six at a glance — two different readers, not one signal repeated. Every chip is a light
// tint under dark ink (bg-tone-*-bg / text-*-ink), never a raw -600 swatch under text: white on
// raw --danger-600 is 3.91:1 and fails AA. Neutral is the one tone that opts out of the whole
// scheme — there's no hue for "nothing happened", so its chip and its title both stay plain ink,
// exactly as before.
const TONES = {
  neutral: {
    ink: 'text-ctl-fg',
    chipBg: 'bg-ctl-track',
    glyph: (
      <>
        <path d="M8 3.2a2.8 2.8 0 0 0-2.8 2.8v1.9L4 10.3h8L10.8 7.9V6a2.8 2.8 0 0 0-2.8-2.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M6.6 11.6a1.4 1.4 0 0 0 2.8 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
  },
  accent: {
    ink: 'text-brand-text',
    chipBg: 'bg-brand-100',
    glyph: <circle cx="8" cy="8" r="3" fill="currentColor" />,
  },
  success: {
    ink: 'text-success-text',
    chipBg: 'bg-success-100',
    glyph: <path d="M3.5 8.4 6.3 11.2 12.5 5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />,
  },
  warning: {
    ink: 'text-warning-text',
    chipBg: 'bg-warning-100',
    glyph: (
      <>
        <path d="M8 2.6 14 13.4H2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M8 6.6v3.2M8 11.6h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  info: {
    ink: 'text-info-text',
    chipBg: 'bg-info-100',
    glyph: (
      <>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 7.3v4M8 5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  danger: {
    ink: 'text-danger-text',
    chipBg: 'bg-danger-100',
    glyph: (
      <>
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
};

const POSITIONS = {
  'bottom-right': 'bottom-0 right-0 items-end',
  'bottom-left': 'bottom-0 left-0 items-start',
  'top-right': 'top-0 right-0 items-end',
  'top-left': 'top-0 left-0 items-start',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
};

function Toast({ tone = 'neutral', title, description, action, onDismiss, duration, id }) {
  const t = TONES[tone] || TONES.neutral;

  useEffect(() => {
    if (!duration || !onDismiss) return undefined;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="group flex w-full max-w-toast overflow-hidden bg-layer-surface border border-solid border-layer-border rounded-xl shadow-lg animate-toast-in"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0 px-3 py-3">
        {/* Centred on the title's own line box, not nudged by a fixed pixel: --text-sm scales with
            --font-scale (per theme/density) while the chip's h-5 does not, so a hand-tuned margin
            is only ever right at one scale. This offset is that gap, halved, so the chip re-centres
            itself on the first line at any scale instead of drifting off it. */}
        <span
          className={cx(
            'mt-[calc((var(--text-sm)*var(--leading-snug)-1.25rem)/2)] grid h-5 w-5 shrink-0 place-items-center rounded-full',
            t.chipBg,
            t.ink
          )}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            {t.glyph}
          </svg>
        </span>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {title ? (
            // Truncates to one line instead of wrapping — the trade that keeps a terse toast a
            // ~46px one-liner. A title longer than the card loses words to an ellipsis rather
            // than growing the card: measured against the source mock, a 45-character title
            // gets 294px of the 322px it wants.
            <span className={cx('text-sm font-medium leading-snug truncate min-w-0', t.ink)}>{title}</span>
          ) : null}
          {description ? (
            <span className="text-sm leading-relaxed text-ctl-fg-muted text-pretty">{description}</span>
          ) : null}
          {action ? <span className="pt-2">{action}</span> : null}
        </div>
        {onDismiss ? (
          // Hidden until the card is hovered or holds keyboard focus, then faded in over the
          // shared duration-[var(--default-transition-duration)]/ease-ctl pair — which already resolves to 150ms
          // cubic-bezier(0,0,0.2,1), so the reveal needs no timing value of its own. On a touch
          // device there is no hover, so a mouse-only reveal would leave the dismiss invisible
          // yet still tappable — an undiscoverable control. pointer-coarse keeps it visible
          // wherever hover doesn't exist; it stays in the tab order either way, and its own
          // focus ring is unaffected by the opacity toggle.
          <button
            type="button"
            onClick={() => onDismiss(id)}
            aria-label="Dismiss"
            className="shrink-0 grid place-items-center w-6 h-6 -mr-1 rounded-sm bg-transparent border-0 text-ctl-fg-muted cursor-pointer opacity-0 transition-[opacity,background-color,color] duration-[var(--default-transition-duration)] ease-ctl motion-reduce:transition-none group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100 hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ToastStack({ items = [], onDismiss, position = 'bottom-right', inset = true, className }) {
  if (!items.length) return null;
  return (
    <div
      className={cx(
        'absolute z-[60] flex flex-col gap-3 pointer-events-none',
        POSITIONS[position] || POSITIONS['bottom-right'],
        inset && 'p-6',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto w-full max-w-toast">
          <Toast {...item} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

/** Queue with a cap — the oldest falls off rather than stacking forever. */
function createToastStore({ limit = 3, duration = 5000 } = {}) {
  let items = [];
  let seq = 0;
  const subs = new Set();
  const emit = () => subs.forEach((fn) => fn(items));

  return {
    subscribe(fn) {
      subs.add(fn);
      fn(items);
      return () => subs.delete(fn);
    },
    push(toast) {
      seq += 1;
      const next = Object.assign({ id: 't' + seq, duration }, toast);
      items = items.concat(next).slice(-limit);
      emit();
      return next.id;
    },
    dismiss(id) {
      items = items.filter((t) => t.id !== id);
      emit();
    },
    clear() {
      items = [];
      emit();
    },
    get items() {
      return items;
    },
  };
}

export { Toast, ToastStack, createToastStore };
export default ToastStack;
