// GENERATED from starter/src/components/kit/Icon.jsx (sha256:9cbda9af9c082a34). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Icon — the placeholder every other component has been drawing locally.
 *
 * One component, one 16-unit grid, one stroke weight. Glyphs are path data in a
 * plain object, so adding one is a line rather than a file, and swapping the set
 * for a licensed library later means replacing this map and nothing else.
 *
 * Two rules the whole set follows: geometry is drawn in a 16×16 box and scaled
 * by font size, and every path uses currentColor with a 1.6 stroke. That is what
 * makes an icon inherit its context — a danger button's icon is danger-coloured
 * without anyone passing a colour.
 *
 * Size is em-based, so an icon set in a text-sm row is smaller than the same
 * icon in a text-lg row without either caller doing arithmetic.
 *
 * <Icon name="search" /> · <Icon name="trash" size="lg" />
 */

/* 16×16 grid, 1.6 stroke, round caps and joins. Alphabetical. */
const PATHS = {
  alert: 'M8 5.5v4M8 12h.01M8 1.8 1.5 13.2h13L8 1.8Z',
  archive: 'M2.5 5.5h11M3.5 5.5v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7M2.5 3.5h11v2h-11zM6.5 8.5h3',
  arrowDown: 'M8 3v10M4 9l4 4 4-4',
  arrowLeft: 'M13 8H3M7 4 3 8l4 4',
  arrowRight: 'M3 8h10M9 4l4 4-4 4',
  arrowUp: 'M8 13V3M4 7l4-4 4 4',
  bell: 'M4.5 7a3.5 3.5 0 0 1 7 0c0 3 1 4 1 4h-9s1-1 1-4ZM6.5 13a1.5 1.5 0 0 0 3 0',
  calendar: 'M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2M3.5 3.5h9a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z',
  check: 'M3 8.4 6.2 11.6 13 4.8',
  chevronDown: 'M4 6.5 8 10.5l4-4',
  chevronLeft: 'M10 3.5 6 8l4 4.5',
  chevronRight: 'M6 3.5 10 8l-4 4.5',
  chevronUp: 'M4 9.5 8 5.5l4 4',
  clock: 'M8 4.5V8l2.5 1.5M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8Z',
  close: 'M4 4l8 8M12 4l-8 8',
  copy: 'M5.5 5.5V3.6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1.9M3.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z',
  download: 'M8 2.5v8M5 7.5 8 10.5l3-3M2.5 13.5h11',
  edit: 'M9.5 3 13 6.5 6 13.5H2.5v-3.4L9.5 3Z',
  external: 'M9.5 2.5h4v4M13.5 2.5 8 8M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3',
  eye: 'M8 3.5c3.5 0 6 4.5 6 4.5s-2.5 4.5-6 4.5S2 8 2 8s2.5-4.5 6-4.5ZM8 6.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z',
  file: 'M9 2.5H4.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6l-3.5-3.5ZM9 2.5V6h3.5',
  filter: 'M2.5 4h11M4.5 8h7M6.5 12h3',
  folder: 'M2.5 5.5V4a1 1 0 0 1 1-1h2.6l1.4 1.5h4a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-6.5Z',
  info: 'M8 7.5v4M8 4.7h.01M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8Z',
  link: 'M6.5 9.5 9.5 6.5M6 4.5 7.5 3a2.8 2.8 0 0 1 4 4L10 8.5M6 7.5 4.5 9a2.8 2.8 0 0 0 4 4L10 11.5',
  lock: 'M4.5 7.2V5.5a3.5 3.5 0 0 1 7 0v1.7M3.5 7.2h9v5.3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V7.2Z',
  menu: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h11',
  minus: 'M3.5 8h9',
  more: 'M4 8h.01M8 8h.01M12 8h.01',
  plus: 'M8 3.5v9M3.5 8h9',
  refresh: 'M13 8a5 5 0 1 1-1.6-3.7M13.5 2.5v3h-3',
  search: 'M10.4 10.4 14 14M7 2.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z',
  settings: 'M8 5.9a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM8 1.8v1.6M8 12.6v1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M1.8 8h1.6M12.6 8h1.6M3.6 12.4l1.1-1.1M11.3 4.7l1.1-1.1',
  star: 'M8 2.4 9.8 6l4 .6-2.9 2.8.7 4L8 11.5l-3.6 1.9.7-4L2.2 6.6l4-.6L8 2.4Z',
  trash: 'M2.5 4.5h11M6 4.5V3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1.5M4 4.5l.6 8a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8',
  upload: 'M8 10.5v-8M5 5.5 8 2.5l3 3M2.5 13.5h11',
  user: 'M8 2.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2ZM3 13.5a5 5 0 0 1 10 0',
  warning: 'M8 5.5v4M8 12h.01M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8Z',
};

/* em, not px: an icon in a text-sm row is smaller than the same icon in text-lg
   without either caller doing arithmetic. */
const SIZES = { xs: '0.875em', sm: '1em', md: '1.15em', lg: '1.4em', xl: '1.75em' };

function Icon({ name, size = 'md', label, className, style, ...rest }) {
  const d = PATHS[name];
  const dim = SIZES[size] || size;

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      className={cx('inline-block shrink-0 align-[-0.125em]', className)}
      style={Object.assign({ width: dim, height: dim }, style)}
      {...rest}
    >
      {d ? (
        <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        /* An unknown name draws a dashed box rather than nothing — a missing
           icon should be visible in review, not silently absent. */
        <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
      )}
    </svg>
  );
}

const iconNames = Object.keys(PATHS).sort();

export { Icon, iconNames, PATHS };
export default Icon;
