// GENERATED from starter/src/components/kit/Avatar.jsx (sha256:33f20ea49cb07b87). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Avatar and AvatarGroup.
 *
 * The initials tint is picked by hashing the name across --chart-1..8 rather
 * than stored per user: the same person is the same colour in every view, with
 * nothing to migrate and no colour field on the record. Those are the same eight
 * categorical values the charts read, so a workspace never shows a ninth hue.
 *
 * <Avatar name="Ada Okafor" size="md" status="online" />
 * <AvatarGroup max={3} people={people} />
 */

const SIZES = {
  xs: { box: 'w-6 h-6 text-2xs', dot: 'w-1.5 h-1.5', ring: 'ring-1' },
  sm: { box: 'w-8 h-8 text-xs', dot: 'w-2 h-2', ring: 'ring-2' },
  md: { box: 'w-10 h-10 text-sm', dot: 'w-2.5 h-2.5', ring: 'ring-2' },
  lg: { box: 'w-12 h-12 text-base', dot: 'w-3 h-3', ring: 'ring-2' },
};

const SERIES = [
  'var(--avatar-1)',
  'var(--avatar-2)',
  'var(--avatar-3)',
  'var(--avatar-4)',
  'var(--avatar-5)',
  'var(--avatar-6)',
  'var(--avatar-7)',
  'var(--avatar-8)',
];

const STATUS = {
  online: 'bg-success-600',
  busy: 'bg-danger-600',
  away: 'bg-warning-600',
  offline: 'bg-ctl-fg-muted',
};

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hue(name) {
  let h = 0;
  const s = String(name || '');
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 9973;
  return SERIES[h % SERIES.length];
}

function Avatar({ name, src, size = 'md', status, square = false, className, ...rest }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <span className={cx('relative inline-flex shrink-0', className)} {...rest}>
      <span
        className={cx(
          'grid place-items-center overflow-hidden select-none font-medium leading-none',
          'text-brand-fg',
          square ? 'rounded-md' : 'rounded-full',
          s.box
        )}
        style={src ? undefined : { background: hue(name) }}
        aria-label={name || undefined}
        role={src ? undefined : 'img'}
        title={name || undefined}
      >
        {src ? <img src={src} alt={name || ''} className="w-full h-full object-cover" /> : initials(name)}
      </span>
      {status ? (
        <span
          className={cx(
            'absolute bottom-0 right-0 rounded-full ring-ctl-offset',
            s.dot,
            s.ring,
            STATUS[status] || STATUS.offline
          )}
          aria-label={status}
        />
      ) : null}
    </span>
  );
}

/** Overlapping stack with a +N remainder. Order is the caller's. */
function AvatarGroup({ people = [], max = 4, size = 'md', className }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  const s = SIZES[size] || SIZES.md;
  return (
    <span className={cx('inline-flex items-center', className)}>
      {shown.map((p, i) => (
        <span
          key={p.id != null ? p.id : p.name + i}
          className={cx('relative inline-flex shrink-0 rounded-full border-2 border-solid border-white', i > 0 && '-ml-2')}
        >
          <Avatar name={p.name} src={p.src} size={size} />
        </span>
      ))}
      {rest > 0 ? (
        <span
          className={cx(
            'relative grid shrink-0 place-items-center -ml-2 rounded-full border-2 border-solid border-white',
            'bg-ctl-track text-ctl-fg-muted font-medium leading-none tabular-nums',
            s.box
          )}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

export { Avatar, AvatarGroup };
export default Avatar;
