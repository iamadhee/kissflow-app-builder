// GENERATED from starter/src/components/kit/Pagination.jsx (sha256:1a20af2cf5987844). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Pagination — Table's other half.
 *
 * The page window is fixed width: first, last, a run around the current page,
 * and an ellipsis where pages were dropped. Fixed width matters because the
 * control must not reflow as the user pages through it — moving the Next button
 * under the cursor is the one thing pagination must never do.
 *
 * <Pagination page={p} pageCount={12} onChange={setP} />
 */

const SIZES = { sm: 'h-8 min-w-8 px-2 text-xs', md: 'h-10 min-w-10 px-3 text-sm' };

function Arrow({ dir }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-4 h-4">
      <path
        d={dir === 'prev' ? 'M10 3.5 6 8l4 4.5' : 'M6 3.5 10 8l-4 4.5'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** first · … · window · … · last, with no gaps of one (a lone "…" hiding page 4
    costs the same width as page 4 and tells you less). */
function pageWindow(page, count, span) {
  if (count <= span + 4) return Array.from({ length: count }, (_, i) => i + 1);
  const half = Math.floor(span / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(count - 1, start + span - 1);
  start = Math.max(2, Math.min(start, end - span + 1));
  const out = [1];
  if (start > 2) out.push('gap-l');
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < count - 1) out.push('gap-r');
  out.push(count);
  return out;
}

function Pagination({
  page = 1,
  pageCount = 1,
  onChange,
  size = 'md',
  span = 5,
  compact = false,
  totalLabel,
  className,
}) {
  const btn = cx(
    'inline-flex items-center justify-center shrink-0 font-medium tabular-nums',
    'bg-transparent border border-solid border-transparent rounded-lg cursor-pointer',
    'text-ctl-fg-muted transition-[background-color,border-color,color] ease-ctl duration-[var(--default-transition-duration)]',
    'hover:bg-ctl-raise hover:text-ctl-fg',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset',
    'disabled:opacity-[.45] disabled:cursor-not-allowed disabled:hover:bg-transparent',
    SIZES[size] || SIZES.md
  );

  const go = (n) => {
    const next = Math.min(pageCount, Math.max(1, n));
    if (next !== page && onChange) onChange(next);
  };

  return (
    <nav aria-label="Pagination" className={cx('flex items-center gap-3 flex-wrap', className)}>
      {totalLabel ? <span className="text-sm text-ctl-fg-muted mr-auto">{totalLabel}</span> : null}
      <div className="flex items-center gap-1">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
          <Arrow dir="prev" />
        </button>

        {compact ? (
          <span className="px-3 text-sm text-ctl-fg-muted tabular-nums">
            Page <span className="font-medium text-ctl-fg">{page}</span> of {pageCount}
          </span>
        ) : (
          pageWindow(page, pageCount, span).map((slot) =>
            typeof slot === 'number' ? (
              <button
                key={slot}
                type="button"
                onClick={() => go(slot)}
                aria-current={slot === page ? 'page' : undefined}
                className={cx(
                  btn,
                  slot === page && 'bg-field-selected border-brand-600 text-brand-text hover:bg-field-selected'
                )}
              >
                {slot}
              </button>
            ) : (
              <span key={slot} className="grid place-items-center w-6 text-ctl-fg-muted select-none" aria-hidden="true">
                …
              </span>
            )
          )
        )}

        <button type="button" className={btn} disabled={page >= pageCount} onClick={() => go(page + 1)} aria-label="Next page">
          <Arrow dir="next" />
        </button>
      </div>
    </nav>
  );
}

export { Pagination, pageWindow };
export default Pagination;
