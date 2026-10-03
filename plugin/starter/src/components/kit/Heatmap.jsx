import React from "react";

/**
 * Heatmap — intensity across a grid.
 *
 * Quantised into 4 fixed buckets, not a continuous gradient — the "Less →
 * More" key stays legible without hovering every cell, and the system stays
 * single-hue rather than a rainbow scale.
 *
 * <Heatmap data={days} weekdays />
 */
const cx = (...p) => p.filter(Boolean).join(' ');
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Heatmap({ data = [], columns = 7, weekdays = false, className }) {
  const items = (Array.isArray(data) ? data : []).filter((d) => d && typeof d.value === 'number' && isFinite(d.value));
  if (!items.length) {
    return (
      <div className={cx('flex w-full items-center justify-center h-24 text-sm text-ctl-fg-muted', 'border border-dashed border-ctl-border rounded-lg', className)}>
        No data
      </div>
    );
  }
  const cols = Number(columns) > 0 ? Number(columns) : 7;
  const max = Math.max(...items.map((d) => d.value)) || 1;
  const bucket = (v) => {
    if (v <= max * 0.02) return 0;
    const share = v / max;
    return share <= 1 / 3 ? 1 : share <= 2 / 3 ? 2 : 3;
  };
  const fills = ['var(--ctl-track)', 'color-mix(in oklab, var(--brand-600) 33%, var(--ctl-track))', 'color-mix(in oklab, var(--brand-600) 66%, var(--ctl-track))', 'var(--brand-600)'];
  const showAxis = weekdays && cols % 7 === 0;
  const span = cols / 7;
  const template = 'repeat(' + cols + ', minmax(0,1fr))';

  return (
    <div className={cx('flex w-full flex-col gap-2', className)}>
      <div className="grid gap-1" style={{ gridTemplateColumns: template }}>
        {items.map((d, i) => (
          <div key={d.label ?? i} className="aspect-square rounded-sm" style={{ background: fills[bucket(d.value)] }} title={(d.label ? d.label + ': ' : '') + d.value} />
        ))}
      </div>
      {showAxis && (
        <div className="grid gap-1" style={{ gridTemplateColumns: template }}>
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-center text-sm text-ctl-fg-muted" style={{ gridColumn: 'span ' + span }}>{w}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export { Heatmap };
export default Heatmap;
