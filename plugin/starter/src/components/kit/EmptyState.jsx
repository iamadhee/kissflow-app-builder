import React from "react";
import { cn as cx } from "./cn.js";

/**
 * EmptyState — the panel a list shows when it has nothing.
 *
 * Three distinct cases, and they are not interchangeable:
 *   first-run  nothing exists yet        → the primary action creates one
 *   filtered   things exist, none match  → the action clears the filter
 *   error      the fetch failed          → the action retries
 * `tone` picks the mark's colour; the copy and the action are the caller's,
 * because only the caller knows which case it is in.
 *
 * <EmptyState title="No claims yet" description="…">{<Button>New claim</Button>}</EmptyState>
 */

const SIZES = {
  sm: { pad: 'py-8 px-6', mark: 'w-10 h-10', title: 'text-base', body: 'text-sm', gap: 'gap-3' },
  md: { pad: 'py-14 px-8', mark: 'w-12 h-12', title: 'text-lg', body: 'text-base', gap: 'gap-4' },
};

const TONES = {
  neutral: 'bg-ctl-track text-ctl-fg-muted',
  accent: 'bg-brand-100 text-brand-600',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-600',
};

function DefaultMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="w-1/2 h-1/2">
      <rect x="4" y="5.5" width="16" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EmptyState({
  title,
  description,
  children,
  icon,
  tone = 'neutral',
  size = 'md',
  bordered = true,
  className,
}) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div
      data-kf-component="empty-state"
      className={cx(
        'flex flex-col items-center text-center w-full',
        s.pad,
        s.gap,
        bordered && 'bg-layer-surface border border-dashed border-layer-border rounded-xl',
        className
      )}
    >
      <span className={cx('grid place-items-center shrink-0 rounded-full', s.mark, TONES[tone] || TONES.neutral)}>
        {icon || <DefaultMark />}
      </span>
      {title ? <h3 className={cx('m-0 font-display font-semibold leading-snug text-ctl-fg', s.title)}>{title}</h3> : null}
      {description ? (
        <p className={cx('m-0 max-w-prose leading-relaxed text-ctl-fg-muted text-pretty', s.body)}>{description}</p>
      ) : null}
      {children ? <div className="flex items-center gap-3 flex-wrap justify-center pt-2">{children}</div> : null}
    </div>
  );
}

export { EmptyState };
export default EmptyState;
