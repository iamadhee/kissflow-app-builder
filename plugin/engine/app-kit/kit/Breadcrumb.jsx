// GENERATED from starter/src/components/kit/Breadcrumb.jsx (sha256:b895bfb4963acfa1). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Breadcrumb — where you are, and the way back out.
 *
 * Collapses the middle when the trail is longer than `max`: first crumb, an
 * ellipsis, then the last two. Truncating the end instead would hide the one
 * segment that says where the user actually is.
 *
 * The current page is a plain span with aria-current, not a link — a link to
 * the page you are on is a dead control.
 *
 * <Breadcrumb items={[{label:'Workspaces', href:'/'}, …]} />
 */

function Slash() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="w-3.5 h-3.5 shrink-0 text-ctl-fg-muted">
      <path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const LINK =
  'rounded-sm px-1 -mx-1 !text-ctl-fg-muted no-underline transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:!text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';

function Breadcrumb({ items = [], max = 4, size = 'md', className }) {
  const text = size === 'sm' ? 'text-sm' : 'text-base';
  let trail = items;
  let collapsed = false;

  if (items.length > max) {
    trail = [items[0]].concat(items.slice(items.length - 2));
    collapsed = true;
  }

  return (
    <nav aria-label="Breadcrumb" className={cx('flex items-center min-w-0', text, className)}>
      <ol className="flex items-center gap-2 m-0 p-0 list-none min-w-0">
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          const showEllipsis = collapsed && i === 1;
          return (
            <li key={(item.href || item.label) + i} className="flex items-center gap-2 min-w-0">
              {i > 0 ? <Slash /> : null}
              {showEllipsis ? (
                <span className="flex items-center gap-2">
                  <span className="px-1 text-ctl-fg-muted leading-none" title={items.slice(1, -2).map((c) => c.label).join(' / ')}>
                    …
                  </span>
                  <Slash />
                </span>
              ) : null}
              {last ? (
                <span aria-current="page" className="font-medium text-ctl-fg truncate">
                  {item.label}
                </span>
              ) : (
                <a href={item.href || '#'} onClick={item.onClick} className={cx(LINK, 'truncate')}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb };
export default Breadcrumb;
