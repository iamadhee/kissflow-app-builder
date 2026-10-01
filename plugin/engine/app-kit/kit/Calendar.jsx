// GENERATED from starter/src/components/kit/Calendar.jsx (sha256:53f1f11bccae1f6b). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * Calendar — the month grid, standalone and also DatePicker's panel.
 *
 * Dates cross this boundary as ISO strings (YYYY-MM-DD), never Date objects: a
 * Date carries a time and a timezone, and a calendar day has neither. Every
 * comparison here is a string comparison, which is why there is no off-by-one
 * bug at midnight or across DST.
 *
 * Fixed width, not fluid — a 7-column grid that resizes stops lining its day
 * numbers up with its weekday headers.
 *
 * <Calendar mode="range" value={{start,end}} onChange={setRange} />
 */
const { useState } = React;


const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const pad = (n) => (n < 10 ? '0' + n : String(n));
const iso = (y, m, d) => y + '-' + pad(m + 1) + '-' + pad(d);
// "today" is the app's clock: in the preview the mock's frozen computation clock (window.__KF_CLOCK,
// set by the assembled index.html), so a calendar opens on the month the seed's records are in, not the
// machine's month — a port-call calendar once opened on an empty September over June's data
const todayIso = () => {
  const frozen = typeof window !== "undefined" && window.__KF_CLOCK ? new Date(window.__KF_CLOCK) : null;
  const n = frozen && Number.isFinite(frozen.getTime()) ? frozen : new Date();
  return iso(n.getFullYear(), n.getMonth(), n.getDate());
};
const parseIso = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
};
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
/** Monday-first column index, which is what DOW above is ordered as. */
const firstCol = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7;

function Chev({ dir }) {
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

function Calendar({
  mode = 'single',
  value,
  onChange,
  month: monthProp,
  onMonthChange,
  min,
  max,
  weekStart = 'monday',
  bordered = true,
  className,
  events,
  onSelectEvent,
  maxEventsPerDay = 3,
}) {
  const [expandedDay, setExpandedDay] = useState(null);
  const scheduling = Array.isArray(events);
  const anchor =
    parseIso(mode === 'range' ? (value && value.start) || monthProp : value || monthProp) || parseIso(todayIso());
  const [view, setView] = useState({ y: anchor.y, m: anchor.m });
  const cur = monthProp ? parseIso(monthProp) || view : view;
  const today = todayIso();

  const start = mode === 'range' ? value && value.start : value;
  const end = mode === 'range' ? value && value.end : null;

  const step = (delta) => {
    const next = new Date(cur.y, cur.m + delta, 1);
    const v = { y: next.getFullYear(), m: next.getMonth() };
    setView(v);
    if (onMonthChange) onMonthChange(iso(v.y, v.m, 1));
  };

  const pick = (day) => {
    if (!onChange) return;
    if (mode !== 'range') {
      onChange(day);
      return;
    }
    if (!start || (start && end)) onChange({ start: day, end: null });
    else if (day < start) onChange({ start: day, end: start });
    else onChange({ start, end: day });
  };

  const cells = [];
  const lead = weekStart === 'sunday' ? (firstCol(cur.y, cur.m) + 1) % 7 : firstCol(cur.y, cur.m);
  /* daysIn(y, -1) resolves to December of the previous year on its own, since
     new Date(y, 0, 0) is the last day of the prior month. */
  const prevCount = daysIn(cur.y, cur.m - 1);
  for (let i = lead; i > 0; i -= 1) cells.push({ day: prevCount - i + 1, outside: true });
  for (let d = 1; d <= daysIn(cur.y, cur.m); d += 1) cells.push({ day: d, date: iso(cur.y, cur.m, d) });
  /* Trailing filler counts from 1 — these are the first days of the next
     month, not a continuation of this one's numbering. */
  let trail = 1;
  while (cells.length % 7 !== 0) cells.push({ day: trail++, outside: true });

  const headers = weekStart === 'sunday' ? [DOW[6]].concat(DOW.slice(0, 6)) : DOW;

  const navBtn =
    'grid place-items-center w-8 h-8 rounded-md bg-transparent border-0 text-ctl-fg-muted cursor-pointer transition-colors ease-ctl duration-[var(--default-transition-duration)] hover:bg-ctl-raise hover:text-ctl-fg outline-none focus-visible:ring-2 focus-visible:ring-brand-ring disabled:opacity-[.45] disabled:cursor-not-allowed';

  return (
    <div
      className={cx(
        scheduling ? 'w-full min-w-0 select-none' : 'w-calendar shrink-0 select-none',
        bordered && 'p-3 bg-layer-surface border border-solid border-layer-border rounded-xl',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-2">
        <button type="button" className={navBtn} onClick={() => step(-1)} aria-label="Previous month">
          <Chev dir="prev" />
        </button>
        <span className="text-sm font-medium text-ctl-fg tabular-nums">
          {MONTHS[cur.m]} {cur.y}
        </span>
        <button type="button" className={navBtn} onClick={() => step(1)} aria-label="Next month">
          <Chev dir="next" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1" data-kf-component="calendar" data-calendar-scheduling={scheduling || undefined}>
        {headers.map((d) => (
          /* the day names are a LABEL: whatever this theme does to labels, it does here */
          <span key={d} data-kf-block="label" className="grid place-items-center h-8">
            {d}
          </span>
        ))}

        {cells.map((cell, i) => {
          if (cell.outside)
            return (
              <span key={'o' + i} className="grid place-items-center h-8 text-sm text-cal-outside tabular-nums">
                {cell.day}
              </span>
            );

          const date = cell.date;
          const disabled = (min && date < min) || (max && date > max);
          const isStart = date === start;
          const isEnd = date === end;
          const inRange = mode === 'range' && start && end && date > start && date < end;
          const isSel = isStart || isEnd || (mode !== 'range' && date === start);

          if (scheduling) {
            const items = events.filter(event => String(event.start || '').slice(0, 10) <= date && String(event.end || event.start || '').slice(0, 10) >= date);
            const limit = Math.max(1, Math.floor(Number(maxEventsPerDay) || 3));
            const shown = expandedDay === date ? items : items.slice(0, limit);
            return <div key={date} className="min-w-0" data-calendar-day={date} data-calendar-today={date === today ? "" : undefined}>
              <button type="button" disabled={disabled} onClick={() => pick(date)} aria-label={date} aria-current={date === today ? 'date' : undefined} className={navBtn}>{cell.day}</button>
              <div className="flex min-w-0 flex-col gap-1">
                {shown.map(event => <button key={event.id} type="button" title={event.title} aria-label={event.title} onClick={() => onSelectEvent?.(event)} data-kf-block="badge" className="block w-full min-w-0 truncate text-left" data-calendar-event={event.id}>{event.title}</button>)}
                {items.length > limit && <button type="button" aria-expanded={expandedDay === date} onClick={() => setExpandedDay(expandedDay === date ? null : date)} className="text-sm text-ctl-fg-muted">{expandedDay === date ? 'Show less' : `+${items.length - limit} more`}</button>}
              </div>
            </div>;
          }

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              aria-pressed={isSel || undefined}
              aria-current={date === today ? 'date' : undefined}
              onClick={() => pick(date)}
              className={cx(
                'grid place-items-center h-8 text-sm tabular-nums cursor-pointer border-0 bg-transparent',
                'transition-colors ease-ctl duration-[var(--default-transition-duration)] outline-none',
                'focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ctl-offset',
                'disabled:opacity-[.45] disabled:cursor-not-allowed',
                /* Range middles keep square sides so the run reads as one band;
                   the endpoints round only on their outer edge. */
                inRange && 'bg-cal-range text-ctl-fg rounded-none',
                isSel && 'bg-cal-selected text-cal-selected-fg font-medium',
                isSel && mode === 'range' && isStart && end && 'rounded-l-md rounded-r-none',
                isSel && mode === 'range' && isEnd && 'rounded-r-md rounded-l-none',
                !inRange && !isSel && 'rounded-md text-ctl-fg hover:bg-ctl-raise',
                isSel && !(mode === 'range' && end) && 'rounded-md',
                date === today && !isSel && 'ring-1 ring-cal-today'
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar, iso, parseIso, todayIso };
export default Calendar;
