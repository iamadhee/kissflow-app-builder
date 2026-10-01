// GENERATED from starter/src/components/kit/HeaderIdentity.jsx (sha256:903ef472be2860a2). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { cn as cx } from "./cn.js";
/**
 * HeaderIdentity — avatar plus name and role, pinned to the end of the header
 * behind a divider.
 *
 * The avatar color is deterministic for each name. `brand` switches that
 * treatment to the active brand fill without relying on important overrides.
 * Name and role text collapse below `sm`, leaving the avatar visible.
 *
 * <HeaderIdentity name="Ada Okafor" subtitle="Nordic equities · Lead" />
 */

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SERIES = [
  'var(--avatar-1)', 'var(--avatar-2)', 'var(--avatar-3)', 'var(--avatar-4)',
  'var(--avatar-5)', 'var(--avatar-6)', 'var(--avatar-7)', 'var(--avatar-8)',
];

function hue(name) {
  let h = 0;
  const value = String(name || '');
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) % 9973;
  return SERIES[h % SERIES.length];
}

export function HeaderIdentity({ name, subtitle, brand = false, divider = true, className }) {
  return (
    <div
      className={cx(
        'flex items-center gap-3',
        divider && 'border-0 border-l border-solid border-layer-border pl-3',
        className
      )}
    >
      <span
        className="grid w-8 h-8 shrink-0 place-items-center rounded-full text-sm font-medium leading-none"
        style={{
          background: brand ? 'var(--brand-600)' : hue(name),
          color: 'var(--brand-fg)',
        }}
        role="img"
        aria-label={name || undefined}
        title={name || undefined}
      >
        {initials(name)}
      </span>
      <div className="hidden text-left leading-tight sm:block">
        <div className="text-sm font-semibold text-ctl-fg">{name}</div>
        {subtitle ? <div className="text-xs text-ctl-fg-muted">{subtitle}</div> : null}
      </div>
    </div>
  );
}

export default HeaderIdentity;
