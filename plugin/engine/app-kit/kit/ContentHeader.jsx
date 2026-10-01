// GENERATED from starter/src/components/kit/ContentHeader.jsx (sha256:76d000615a79b90d). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";


/**
 * Shared content-surface header used by Card and Drawer.
 *
 * Keeping the complete Tailwind contract here prevents the two surfaces from
 * drifting in title scale, weight, supporting-text scale, or vertical rhythm.
 */
function ContentHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  titleAs: TitleTag = 'span',
  hasFollowingContent = false,
  className,
}) {
  return (
    <div
      className={cx(
        'flex items-start justify-between gap-x-4 gap-y-3 flex-wrap shrink-0',
        hasFollowingContent && 'pb-4',
        className
      )}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {eyebrow != null ? (
          <span className="mb-1 text-[11px] font-semibold uppercase leading-none tracking-[.14em] text-brand-600">{eyebrow}</span>
        ) : null}
        {title != null ? (
          <TitleTag className="m-0 font-display text-xl font-medium leading-snug text-ctl-fg text-pretty">{title}</TitleTag>
        ) : null}
        {subtitle != null ? (
          <span className="text-xs-plus text-ctl-fg-muted opacity-70 text-pretty">{subtitle}</span>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2 min-w-0 max-w-full overflow-x-auto">{actions}</div> : null}
    </div>
  );
}

export { ContentHeader };
export default ContentHeader;
