// GENERATED from starter/src/components/kit/Skeleton.jsx (sha256:0fde4197435ffdbe). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Skeleton — a placeholder shaped like the thing that is loading.
 *
 * The sweep is a positioned sheen span, not an animated background-position, so
 * it needs no arbitrary background-size and works at any width. Reduced motion
 * drops the sweep and leaves the plain block: still a placeholder, no movement.
 *
 * A skeleton is only honest if it matches the real layout. SkeletonText takes a
 * line count and shortens the last line, the way a paragraph actually ends.
 *
 * <SkeletonText lines={3} /> · <Skeleton variant="circle" size="40px" />
 */

const RADIUS = { rect: 'rounded-md', text: 'rounded-sm', circle: 'rounded-full' };

function Skeleton({ variant = 'rect', width, height, size, animate = true, className, style }) {
  const box = size != null ? { width: size, height: size } : { width, height };
  return (
    <span
      aria-hidden="true"
      className={cx(
        'relative block overflow-hidden shrink-0 bg-skeleton-base',
        RADIUS[variant] || RADIUS.rect,
        variant === 'text' && 'h-4',
        className
      )}
      style={Object.assign({}, box, style)}
    >
      {animate ? (
        <span className="absolute inset-0 animate-skeleton bg-gradient-to-r from-transparent via-skeleton-sheen to-transparent motion-reduce:hidden" />
      ) : null}
    </span>
  );
}

function SkeletonText({ lines = 3, animate = true, className }) {
  return (
    <span role="status" aria-label="Loading" className={cx('flex flex-col gap-2 w-full', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          animate={animate}
          width={i === lines - 1 && lines > 1 ? '62%' : '100%'}
        />
      ))}
    </span>
  );
}

/** A row of the shape most lists actually have: avatar, two lines, trailing meta. */
function SkeletonRow({ animate = true, className }) {
  return (
    <span role="status" aria-label="Loading" className={cx('flex items-center gap-4 w-full', className)}>
      <Skeleton variant="circle" size="40px" animate={animate} />
      <span className="flex flex-col gap-2 flex-1 min-w-0">
        <Skeleton variant="text" width="40%" animate={animate} />
        <Skeleton variant="text" width="72%" animate={animate} />
      </span>
      <Skeleton variant="rect" width="64px" height="24px" animate={animate} />
    </span>
  );
}

export { Skeleton, SkeletonText, SkeletonRow };
export default Skeleton;
