// GENERATED from starter/src/components/kit/CalendarView.jsx (sha256:a9196da47cde1119). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { TONES } from "./tones.js";
import { normalizedSeverity } from "./severity.js";

// A real month/week/day calendar, for the apps whose subject IS the date: leave, shifts, bookings,
// inspections, maintenance windows, interview slots.
//
// Timeline lays dated items across a rolling strip — good for a dashboard glance, useless for "what
// is happening on the 14th". GanttChart answers "what overlaps with what" over a project. This
// answers "what is on that day", which is a different question from either.
//
// The library's own stylesheet is imported (it has no exports map, so the deep path resolves), then
// the visual decisions are pulled back onto the theme tokens below — otherwise the calendar arrives
// in its own blue-and-grey and is the one element on the page not wearing the app's identity.

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { "en-US": enUS } });

const CALENDAR_VIEW_VARIANTS = new Set([
  "theme",
  "operational-grid",
  "adaptive-grid",
  "date-focus",
  "destination-cards",
  "today-reader",
]);
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarViewVariant = (value) => CALENDAR_VIEW_VARIANTS.has(value) ? value : "theme";
const dayKey = (value) => `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
const isSameDay = (a, b) => Boolean(a && b) && dayKey(a) === dayKey(b);
/* SEVERITY OUTRANKS TONE, because it is the more specific statement. A calendar is where a reader
   scans for what is worst, and `tone` cannot say which of danger/warning is worse — nothing in the
   categorical six ranks. `severity` (1..4, or ok/medium/high/critical) paints from --severity-1..4,
   the ordered scale every theme derives from its own hues at constant lightness with chroma rising by
   step, so a calendar ranks the same way a chip in a table does. `tone` still works and still means
   what it meant. */
const eventColor = (event) => {
  const step = normalizedSeverity(event?.severity);
  if (step) return `var(--severity-${step})`;
  return event?.tone ? (TONES[event.tone] || event.tone) : "var(--brand-600)";
};
const eventWash = (event) => {
  const step = normalizedSeverity(event?.severity);
  return step ? `var(--severity-${step}-wash)` : null;
};

function monthDays(value) {
  const first = new Date(value.getFullYear(), value.getMonth(), 1);
  const last = new Date(value.getFullYear(), value.getMonth() + 1, 0);
  const count = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
  const start = new Date(value.getFullYear(), value.getMonth(), 1 - first.getDay());
  return Array.from({ length: count }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function relativeDayLabel(value, now = new Date()) {
  const target = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target - today) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "in 1 day";
  if (days > 1) return `in ${days} days`;
  if (days === -1) return "1 day ago";
  return `${Math.abs(days)} days ago`;
}

/**
 * The YEAR, when the records are spread wider than a month.
 *
 * A month grid is the right instrument for density: seventeen editorial handoffs in four weeks, all
 * visible, each on its own day. It is the wrong one for eight print runs across a year — it shows one
 * and asks the reader to page through eleven empty months to find the other seven, which is exactly
 * what a generated press calendar did. The band trades the day for the month and shows the whole
 * spread at once; the detail below still answers "what is that one".
 */
function YearBand({ year, events, selectedDate, onSelectDay, onNavigate }) {
  const months = Array.from({ length: 12 }, (_, m) => {
    const inMonth = events.filter((e) => e.start.getFullYear() === year && e.start.getMonth() === m);
    return { m, label: format(new Date(year, m, 1), "MMM"), events: inMonth };
  });
  const selectedMonth = selectedDate && selectedDate.getFullYear() === year ? selectedDate.getMonth() : null;
  const carried = months.filter((x) => x.events.length).length;
  return (
    <>
      <CalendarHeader
        date={new Date(year, 0, 1)}
        title={String(year)}
        subtitle={`${events.length} scheduled · ${carried} of 12 months carry one or more`}
        onNavigate={onNavigate}
      />
      <div className="kf-calendar-year-track" data-calendar-year-track="">
        {months.map((month) => (
          <button
            key={month.m}
            type="button"
            className="kf-calendar-year-cell"
            aria-current={selectedMonth === month.m ? "true" : undefined}
            aria-label={`${month.label} ${year}, ${month.events.length} scheduled`}
            onClick={() => month.events.length && onSelectDay(month.events[0].start)}
          >
            <span className="kf-calendar-year-label">{month.label}</span>
            {month.events.slice(0, 2).map((event) => (
              <span
                key={event.id}
                className="kf-calendar-cell-event kf-calendar-year-run"
                style={{ "--calendar-event-color": eventColor(event), "--calendar-event-wash": eventWash(event) }}
              >
                <span className="kf-calendar-cell-event-title">{event.title}</span>
                <span className="kf-calendar-cell-event-meta">{format(event.start, "d MMM")}</span>
              </span>
            ))}
            {month.events.length > 2 ? (
              <span className="kf-calendar-year-more">+{month.events.length - 2} more</span>
            ) : null}
          </button>
        ))}
      </div>
    </>
  );
}

function CalendarHeader({ date, title, subtitle, meta, onNavigate }) {
  return (
    <div className="kf-calendar-custom-header">
      <div className="min-w-0">
        <h3 className="m-0 font-display text-xl font-semibold leading-tight text-ctl-fg">
          {title || format(date, "MMMM yyyy")}
        </h3>
        {subtitle ? <p className="m-0 mt-1 text-sm text-ctl-fg-subtle">{subtitle}</p> : null}
      </div>
      {meta ? <p className="kf-calendar-header-meta m-0 text-sm text-ctl-fg-muted">{meta}</p> : null}
      <div className="kf-calendar-nav" aria-label="Calendar navigation">
        <button type="button" onClick={() => onNavigate(-1)} aria-label="Previous month">Prev</button>
        <button type="button" onClick={() => onNavigate(1)} aria-label="Next month">Next</button>
      </div>
    </div>
  );
}

function eventPrimary(event, mode) {
  if (!event) return "";
  if (mode === "destination-cards") return event.destination || event.location || event.site || event.title;
  return event.title;
}

function eventSecondary(event) {
  if (!event) return "";
  if (event.meta) return event.meta;
  return [event.vendor, event.units, event.status].filter(Boolean).join(" · ");
}

function CalendarDetail({ date, event }) {
  if (!date) return null;
  return (
    <div className="kf-calendar-detail" data-calendar-detail="">
      <p className="m-0 font-display text-base font-semibold text-ctl-fg">
        {format(date, "EEE, MMM d")} · {relativeDayLabel(date)}
      </p>
      {event ? (
        <div className="kf-calendar-detail-row" style={{ "--calendar-event-color": eventColor(event), "--calendar-event-wash": eventWash(event) }}>
          <div className="min-w-0">
            <p className="m-0 truncate font-display text-base font-semibold text-ctl-fg">
              {event.title}{event.destination || event.location ? ` · ${event.destination || event.location}` : ""}
            </p>
            {eventSecondary(event) ? <p className="m-0 mt-1 truncate text-sm text-ctl-fg-muted">{eventSecondary(event)}</p> : null}
          </div>
        </div>
      ) : <p className="m-0 mt-3 text-sm text-ctl-fg-muted">No events on this day.</p>}
    </div>
  );
}

function MonthGrid({ date, eventsByDay, mode, selectedDate, nextEvent, onSelectDay }) {
  const days = monthDays(date);
  const today = new Date();
  const rows = days.length / 7;

  return (
    <div className={`kf-calendar-month-grid kf-calendar-month-grid--${mode}`} style={{ "--calendar-month-rows": rows }}>
      {WEEKDAYS.map((weekday) => <div className="kf-calendar-weekday" key={weekday}>{weekday}</div>)}
      {days.map((day) => {
        const dayEvents = eventsByDay.get(dayKey(day)) || [];
        const inMonth = day.getMonth() === date.getMonth();
        const selected = isSameDay(day, selectedDate);
        const todayCell = isSameDay(day, today);
        const firstEvent = dayEvents[0];
        return (
          <button
            type="button"
            key={dayKey(day)}
            className="kf-calendar-month-cell"
            data-in-month={inMonth ? "true" : "false"}
            data-selected={selected ? "true" : "false"}
            data-today={todayCell ? "true" : "false"}
            data-has-events={dayEvents.length ? "true" : "false"}
            onClick={() => onSelectDay(day, firstEvent)}
            aria-label={`${format(day, "MMMM d, yyyy")}${dayEvents.length ? `, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}` : ""}`}
          >
            <span className="kf-calendar-day-number">{day.getDate()}</span>
            {mode === "today-reader" && todayCell ? <span className="kf-calendar-today-label">Today</span> : null}
            {mode === "adaptive-grid" ? (
              <span className="kf-calendar-event-stack">
                {dayEvents.map((event) => (
                  <span
                    className="kf-calendar-solid-event"
                    key={event.id}
                    style={{ "--calendar-event-color": eventColor(event), "--calendar-event-wash": eventWash(event) }}
                  >
                    {event.title}
                  </span>
                ))}
              </span>
            ) : firstEvent ? (
              <span className="kf-calendar-cell-event" style={{ "--calendar-event-color": eventColor(firstEvent), "--calendar-event-wash": eventWash(firstEvent) }}>
                {mode === "destination-cards" ? <span className="kf-calendar-event-dot" /> : null}
                <span className="kf-calendar-cell-event-title">{eventPrimary(firstEvent, mode)}</span>
                {mode === "destination-cards" && (firstEvent.units || firstEvent.status) ? (
                  <span className="kf-calendar-cell-event-meta">{firstEvent.units || firstEvent.status}</span>
                ) : null}
                {mode === "today-reader" && nextEvent?.id === firstEvent.id ? <span className="kf-calendar-next-label">Next up</span> : null}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * events: [{ id, title, start: Date|ISO, end: Date|ISO, severity?, tone?, allDay?, destination?, vendor?, units?, status?, meta? }]
 * `severity` is the ORDERED axis (1..4 or ok/medium/high/critical) and outranks `tone`, which only distinguishes.
 * aspectRatio: defaults to 1, so the responsive calendar frame is square.
 * height: optional fixed-height override for compact or embedded layouts.
 * variant: theme | operational-grid | adaptive-grid | date-focus | destination-cards | today-reader.
 * title/subtitle: optional copy for the month-reading variants. The operational grid keeps the
 * library's familiar toolbar label so its established layout and controls remain unchanged.
 * onSelectEvent: (event) => void — open the record. Omit it and the calendar is read-only.
 */
export function CalendarView({
  events = [],
  height,
  aspectRatio = 1,
  defaultView = "month",
  defaultDate,
  defaultSelectedDate,
  title,
  subtitle,
  variant = "theme",
  onSelectEvent,
  onSelectSlot,
  emptyText = "Nothing scheduled.",
}) {
  const [view, setView] = useState(defaultView);
  const [date, setDate] = useState(() => {
    const initial = defaultDate instanceof Date ? defaultDate : new Date(defaultDate || Date.now());
    return isNaN(initial) ? new Date() : initial;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    if (!defaultSelectedDate) return null;
    const initial = defaultSelectedDate instanceof Date ? defaultSelectedDate : new Date(defaultSelectedDate);
    return isNaN(initial) ? null : initial;
  });
  const resolvedVariant = calendarViewVariant(variant);
  const frameStyle = height == null
    ? { width: "100%", aspectRatio }
    : { width: "100%", height };

  // Guard every date. react-big-calendar throws on an Invalid Date and takes the page down, and seed
  // data is exactly where a null or malformed date comes from.
  const safe = useMemo(() => events.reduce((out, e, i) => {
    const start = e?.start instanceof Date ? e.start : new Date(e?.start);
    const end = e?.end instanceof Date ? e.end : new Date(e?.end ?? e?.start);
    if (isNaN(start) || isNaN(end)) return out;
    out.push({ ...e, id: e.id ?? i, title: String(e.title ?? "Untitled"), start, end: end < start ? start : end });
    return out;
  }, []), [events]);

  const monthEvents = useMemo(() => safe
    .filter((event) => event.start.getFullYear() === date.getFullYear() && event.start.getMonth() === date.getMonth())
    .sort((a, b) => a.start - b.start), [safe, date]);
  const eventsByDay = useMemo(() => monthEvents.reduce((map, event) => {
    const key = dayKey(event.start);
    map.set(key, [...(map.get(key) || []), event]);
    return map;
  }, new Map()), [monthEvents]);
  const now = new Date();
  const nextEvent = monthEvents.find((event) => event.start >= now) || monthEvents[0] || null;
  const effectiveSelectedDate = selectedDate || nextEvent?.start || new Date(date.getFullYear(), date.getMonth(), 1);
  const selectedEvent = (eventsByDay.get(dayKey(effectiveSelectedDate)) || [])[0] || null;
  const busiestDay = Math.max(0, ...[...eventsByDay.values()].map((items) => items.length));
  const navigateMonth = (step) => setDate((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  const navigateYear = (step) => setDate((current) => new Date(current.getFullYear() + step, 0, 1));
  const selectDay = (day, event) => {
    setSelectedDate(day);
    onSelectSlot?.({ start: day, end: day, slots: [day], action: "select" });
    if (event) onSelectEvent?.(event);
  };
  const commonGridProps = {
    date,
    eventsByDay,
    selectedDate: effectiveSelectedDate,
    nextEvent,
    onSelectDay: selectDay,
  };

  if (!safe.length) {
    return (
      <div
        className="grid place-items-center rounded-lg border border-dashed border-ctl-border bg-ctl-surface text-sm text-ctl-fg-muted"
        data-kf-component="calendar-view"
        data-calendar-variant={resolvedVariant}
        style={height == null ? frameStyle : { width: "100%", height: Math.min(height, 220) }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div
      className="kf-cal rounded-lg border border-solid border-ctl-border bg-ctl-surface p-4 text-sm text-ctl-fg"
      data-kf-component="calendar-view"
      data-calendar-variant={resolvedVariant}
      style={frameStyle}
    >
      <div
        className="h-full min-h-0 w-full"
        style={{ display: "var(--calendar-operational-display, block)" }}
        data-calendar-view="operational-grid"
      >
        <Calendar
          localizer={localizer}
          events={safe}
          startAccessor="start" endAccessor="end"
          view={view} onView={setView}
          date={date} onNavigate={setDate}
          views={["month", "week", "day", "agenda"]}
          popup
          selectable={Boolean(onSelectSlot)}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          style={{ height: "100%" }}
          eventPropGetter={(event) => ({
            className: "rounded-sm",
            style: {
              background: eventColor(event),
              border: "1px solid color-mix(in oklab, currentColor 16%, transparent)",
              color: "var(--brand-fg)",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-weight-medium)",
              lineHeight: "var(--leading-snug)",
              padding: "2px 6px",
            },
          })}
        />
      </div>

      <section
        className="kf-calendar-recipe kf-calendar-adaptive"
        style={{ display: "var(--calendar-adaptive-display, none)" }}
        data-calendar-view="adaptive-grid"
      >
        <CalendarHeader
          date={date}
          title={title}
          meta={`Rows fit their busiest day · ${busiestDay ? "nothing hidden" : "month is clear"}`}
          onNavigate={navigateMonth}
        />
        <MonthGrid {...commonGridProps} mode="adaptive-grid" />
      </section>

      <section
        className="kf-calendar-recipe kf-calendar-focus"
        style={{ display: "var(--calendar-focus-display, none)" }}
        data-calendar-view="date-focus"
      >
        <CalendarHeader
          date={date}
          title={title}
          subtitle={subtitle || `${eventsByDay.size} scheduled ${eventsByDay.size === 1 ? "date" : "dates"} this month`}
          onNavigate={navigateMonth}
        />
        <MonthGrid {...commonGridProps} mode="date-focus" />
        <CalendarDetail date={effectiveSelectedDate} event={selectedEvent} />
      </section>

      <section
        className="kf-calendar-recipe kf-calendar-destinations"
        style={{ display: "var(--calendar-destinations-display, none)" }}
        data-calendar-view="destination-cards"
      >
        <CalendarHeader
          date={date}
          title={title}
          subtitle={subtitle || "Where each scheduled item is going — select a day for the full record"}
          onNavigate={navigateMonth}
        />
        <MonthGrid {...commonGridProps} mode="destination-cards" />
        <CalendarDetail date={effectiveSelectedDate} event={selectedEvent} />
      </section>

      <section
        className="kf-calendar-recipe kf-calendar-reader"
        style={{ display: "var(--calendar-reader-display, none)" }}
        data-calendar-view="today-reader"
      >
        <CalendarHeader
          date={date}
          title={title}
          subtitle={subtitle || (nextEvent
            ? `Today is ${format(now, "MMM d")} · next scheduled item on ${format(nextEvent.start, "MMM d")}`
            : `Today is ${format(now, "MMM d")} · no scheduled items this month`)}
          onNavigate={navigateMonth}
        />
        <MonthGrid {...commonGridProps} mode="today-reader" />
        <CalendarDetail date={effectiveSelectedDate} event={selectedEvent} />
      </section>

      <section
        className="kf-calendar-recipe kf-calendar-year"
        style={{ display: "var(--calendar-year-display, none)" }}
        data-calendar-view="year-band"
      >
        <YearBand
          year={date.getFullYear()}
          events={safe}
          selectedDate={effectiveSelectedDate}
          onSelectDay={selectDay}
          onNavigate={navigateYear}
        />
        <CalendarDetail date={effectiveSelectedDate} event={selectedEvent} />
      </section>
      <style>{`
        .kf-cal .rbc-calendar {
          background: var(--ctl-surface);
          color: var(--ctl-fg);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
        }
        .kf-cal .rbc-toolbar {
          gap: 12px;
          margin-bottom: 16px;
          font-size: var(--text-sm);
        }
        .kf-cal .rbc-btn-group {
          display: inline-flex;
        }
        .kf-cal .rbc-toolbar button {
          min-height: 32px;
          padding: 0 12px;
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border-color: var(--ctl-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          font-family: var(--font-sans);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          transition: background-color var(--default-transition-duration) var(--default-transition-timing-function), border-color var(--default-transition-duration) var(--default-transition-timing-function), color var(--default-transition-duration) var(--default-transition-timing-function), box-shadow var(--default-transition-duration) var(--default-transition-timing-function);
        }
        .kf-cal .rbc-toolbar button:hover {
          color: var(--ctl-fg);
          background: var(--ctl-raise);
          border-color: var(--ctl-border-strong);
        }
        .kf-cal .rbc-toolbar button:active,
        .kf-cal .rbc-toolbar button.rbc-active,
        .kf-cal .rbc-toolbar button.rbc-active:hover,
        .kf-cal .rbc-toolbar button.rbc-active:focus {
          color: var(--brand-fg);
          background: var(--brand-600);
          border-color: var(--brand-600);
          box-shadow: none;
        }
        .kf-cal .rbc-toolbar button:focus-visible,
        .kf-cal .rbc-event:focus-visible,
        .kf-cal .rbc-show-more:focus-visible {
          position: relative;
          z-index: 2;
          outline: none;
          box-shadow: 0 0 0 var(--ring-ctl) var(--brand-ring);
        }
        .kf-cal .rbc-toolbar-label {
          color: var(--ctl-fg);
          font-size: var(--text-base);
          font-weight: var(--font-weight-semibold);
        }
        .kf-cal .rbc-header, .kf-cal .rbc-time-header-content, .kf-cal .rbc-timeslot-group,
        .kf-cal .rbc-day-bg + .rbc-day-bg, .kf-cal .rbc-month-row + .rbc-month-row,
        .kf-cal .rbc-month-view, .kf-cal .rbc-time-view, .kf-cal .rbc-time-content,
        .kf-cal .rbc-header + .rbc-header,
        .kf-cal .rbc-time-header.rbc-overflowing,
        .kf-cal .rbc-time-header > .rbc-row:first-child,
        .kf-cal .rbc-time-header > .rbc-row.rbc-row-resource,
        .kf-cal .rbc-time-header-content > .rbc-row.rbc-row-resource,
        .kf-cal .rbc-time-view .rbc-allday-cell + .rbc-allday-cell,
        .kf-cal .rbc-time-content > * + * > *,
        .kf-cal .rbc-time-view-resources .rbc-time-gutter,
        .kf-cal .rbc-time-view-resources .rbc-time-header-gutter,
        .kf-cal .rbc-agenda-view table.rbc-agenda-table,
        .kf-cal .rbc-agenda-view table.rbc-agenda-table thead > tr > th,
        .kf-cal .rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td,
        .kf-cal .rbc-agenda-view table.rbc-agenda-table tbody > tr + tr {
          border-color: var(--ctl-border);
        }
        .kf-cal .rbc-month-row {
          flex: 0 0 120px;
          height: 120px;
        }
        .kf-cal .rbc-month-view,
        .kf-cal .rbc-time-view,
        .kf-cal .rbc-agenda-view table.rbc-agenda-table {
          overflow: hidden;
          border-radius: var(--radius-lg);
          background: var(--ctl-surface);
        }
        .kf-cal .rbc-header {
          padding: 10px 8px;
          color: var(--ctl-fg-muted);
          background: var(--ctl-raise);
          font-size: var(--text-2xs);
          font-weight: var(--font-weight-medium);
          letter-spacing: var(--tracking-wide);
          line-height: var(--leading-snug);
          text-transform: uppercase;
        }
        .kf-cal .rbc-date-cell {
          padding: 8px 8px 0;
          color: var(--ctl-fg-muted);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
        }
        .kf-cal .rbc-date-cell.rbc-now {
          color: var(--brand-text);
          font-weight: var(--font-weight-semibold);
        }
        .kf-cal .rbc-off-range,
        .kf-cal .rbc-time-gutter,
        .kf-cal .rbc-label {
          color: var(--field-placeholder);
        }
        .kf-cal .rbc-off-range-bg {
          background: color-mix(in srgb, var(--ctl-raise) 50%, transparent);
        }
        .kf-cal .rbc-day-slot .rbc-time-slot {
          border-color: color-mix(in srgb, var(--ctl-border) 45%, transparent);
        }
        .kf-cal .rbc-time-view-resources .rbc-time-gutter,
        .kf-cal .rbc-time-view-resources .rbc-time-header-gutter {
          background: var(--ctl-surface);
        }
        .kf-cal .rbc-today,
        .kf-cal .rbc-selected-cell {
          background: var(--cal-range);
        }
        .kf-cal .rbc-slot-selection {
          color: var(--brand-fg);
          background: color-mix(in oklab, var(--brand-600) 82%, transparent);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
        }
        .kf-cal .rbc-current-time-indicator {
          height: 1px;
          background: var(--brand-600);
        }
        .kf-cal .rbc-event {
          transition: filter var(--default-transition-duration) var(--default-transition-timing-function), box-shadow var(--default-transition-duration) var(--default-transition-timing-function);
        }
        .kf-cal .rbc-event:hover {
          filter: brightness(.96);
        }
        .kf-cal .rbc-event.rbc-selected {
          box-shadow: 0 0 0 var(--ring-ctl) var(--brand-ring);
          filter: brightness(.92);
        }
        .kf-cal .rbc-event-overlaps {
          box-shadow: var(--shadow-sm);
        }
        .kf-cal .rbc-event:focus {
          outline: none;
        }
        .kf-cal .rbc-show-more {
          color: var(--brand-text);
          background: color-mix(in srgb, var(--ctl-surface) 82%, transparent);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
        }
        .kf-cal .rbc-show-more:hover {
          color: var(--brand-700);
        }
        .kf-cal .rbc-overlay {
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border-color: var(--ctl-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }
        .kf-cal .rbc-overlay-header {
          color: var(--ctl-fg-muted);
          background: var(--ctl-raise);
          border-color: var(--ctl-border);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
        }
        .kf-cal .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          padding: 10px 12px;
          color: var(--ctl-fg-muted);
          background: var(--ctl-raise);
          font-size: var(--text-2xs);
          font-weight: var(--font-weight-medium);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
        }
        .kf-cal .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          padding: calc(var(--spacing) * 3) calc(var(--spacing) * 5);
          color: var(--ctl-fg);
          font-size: var(--text-sm);
        }
        .kf-cal .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover {
          background: var(--ctl-raise);
        }
        .kf-cal .kf-calendar-recipe {
          height: 100%;
          min-height: 0;
          flex-direction: column;
          font-family: var(--font-sans);
        }
        .kf-cal .kf-calendar-custom-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: start;
          gap: 10px 24px;
          margin-bottom: 18px;
        }
        .kf-cal .kf-calendar-header-meta {
          align-self: center;
          grid-column: 2;
          grid-row: 1;
          white-space: nowrap;
        }
        .kf-cal .kf-calendar-nav {
          display: inline-flex;
          grid-column: 2;
          grid-row: 1;
          justify-self: end;
          gap: 8px;
        }
        .kf-cal .kf-calendar-header-meta + .kf-calendar-nav {
          display: none;
        }
        .kf-cal .kf-calendar-nav button {
          min-height: 36px;
          padding: 0 16px;
          color: var(--ctl-fg);
          background: var(--ctl-surface);
          border: 1px solid var(--ctl-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
        }
        .kf-cal .kf-calendar-nav button:hover {
          background: var(--ctl-raise);
          border-color: var(--ctl-border-strong);
        }
        .kf-cal .kf-calendar-nav button:focus-visible,
        .kf-cal .kf-calendar-month-cell:focus-visible {
          position: relative;
          z-index: 3;
          outline: none;
          box-shadow: 0 0 0 var(--ring-ctl) var(--brand-ring);
        }
        .kf-cal .kf-calendar-month-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          grid-template-rows: auto repeat(var(--calendar-month-rows), minmax(0, 1fr));
          flex: 1;
          min-height: 0;
        }
        .kf-cal .kf-calendar-weekday {
          min-width: 0;
          padding: 10px 8px;
          color: var(--ctl-fg-subtle);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-semibold);
          letter-spacing: var(--tracking-wide);
          text-align: center;
        }
        .kf-cal .kf-calendar-month-cell {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 0;
          padding: 10px;
          overflow: hidden;
          color: var(--ctl-fg);
          background: transparent;
          border: 0;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }
        .kf-cal .kf-calendar-month-cell[data-in-month="false"] {
          color: var(--field-placeholder);
          background: color-mix(in srgb, var(--ctl-raise) 44%, transparent);
        }
        .kf-cal .kf-calendar-day-number {
          position: relative;
          z-index: 1;
          color: inherit;
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          line-height: var(--leading-snug);
        }
        .kf-cal .kf-calendar-event-stack {
          position: absolute;
          inset: 34px 8px 8px;
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 4px;
          overflow: auto;
        }
        .kf-cal .kf-calendar-solid-event {
          display: block;
          min-width: 0;
          padding: 3px 6px;
          overflow: hidden;
          color: var(--brand-fg);
          background: var(--calendar-event-color);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          line-height: var(--leading-snug);
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kf-cal .kf-calendar-month-grid--adaptive-grid {
          overflow: hidden;
          border-top: 1px solid var(--ctl-border);
          border-left: 1px solid var(--ctl-border);
          border-radius: var(--radius-lg);
        }
        .kf-cal .kf-calendar-month-grid--adaptive-grid .kf-calendar-weekday,
        .kf-cal .kf-calendar-month-grid--adaptive-grid .kf-calendar-month-cell {
          border-right: 1px solid var(--ctl-border);
          border-bottom: 1px solid var(--ctl-border);
        }
        .kf-cal .kf-calendar-month-grid--adaptive-grid .kf-calendar-weekday {
          color: var(--ctl-fg-muted);
          background: var(--ctl-raise);
          text-transform: uppercase;
        }
        .kf-cal .kf-calendar-month-grid--adaptive-grid .kf-calendar-month-cell[data-today="true"] {
          color: var(--brand-text);
          background: var(--cal-range);
        }
        .kf-cal .kf-calendar-focus .kf-calendar-month-grid,
        .kf-cal .kf-calendar-destinations .kf-calendar-month-grid,
        .kf-cal .kf-calendar-reader .kf-calendar-month-grid {
          gap: 8px;
        }
        .kf-cal .kf-calendar-focus .kf-calendar-weekday,
        .kf-cal .kf-calendar-destinations .kf-calendar-weekday,
        .kf-cal .kf-calendar-reader .kf-calendar-weekday {
          padding-top: 0;
          padding-bottom: 8px;
          text-transform: none;
        }
        .kf-cal .kf-calendar-focus .kf-calendar-month-cell,
        .kf-cal .kf-calendar-destinations .kf-calendar-month-cell,
        .kf-cal .kf-calendar-reader .kf-calendar-month-cell {
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
        }
        .kf-cal .kf-calendar-focus .kf-calendar-month-cell[data-has-events="true"],
        .kf-cal .kf-calendar-destinations .kf-calendar-month-cell,
        .kf-cal .kf-calendar-reader .kf-calendar-month-cell {
          border-color: var(--ctl-border);
          box-shadow: var(--shadow-sm);
        }
        .kf-cal .kf-calendar-focus .kf-calendar-month-cell[data-has-events="true"][data-selected="true"],
        .kf-cal .kf-calendar-destinations .kf-calendar-month-cell[data-selected="true"],
        .kf-cal .kf-calendar-reader .kf-calendar-month-cell[data-selected="true"] {
          color: var(--brand-text);
          background: var(--cal-range);
          border-color: var(--brand-600);
          box-shadow: inset 0 0 0 1px var(--brand-600);
        }
        .kf-cal .kf-calendar-destinations .kf-calendar-month-cell[data-in-month="false"],
        .kf-cal .kf-calendar-reader .kf-calendar-month-cell[data-in-month="false"] {
          border-color: transparent;
          box-shadow: none;
        }
        .kf-cal .kf-calendar-cell-event {
          position: absolute;
          inset: 34px 10px 8px;
          display: flex;
          min-width: 0;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          overflow: hidden;
          color: var(--calendar-event-color);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-semibold);
          line-height: var(--leading-snug);
        }
        /* A RANKED event reads as a step: its wash behind it and its own ink on the leading edge.
           eventWash() returns null for an unranked event and React then omits the property entirely,
           so the attribute selector is the conditional — a tone-only event keeps exactly the flat
           treatment it had, and nothing in the base rule depends on a value that may not exist. */
        /* ── the year band ── one row of twelve, so a sparse year is one screen not twelve ── */
        .kf-cal .kf-calendar-year-track {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 1px;
          background: var(--ctl-border);
          border: 1px solid var(--ctl-border);
          border-radius: calc(var(--radius) * 0.6);
          overflow: hidden;
          min-height: 6rem;
        }
        .kf-cal .kf-calendar-year-cell {
          display: flex;
          flex-direction: column;
          gap: calc(var(--spacing) * 1);
          min-width: 0;
          padding: calc(var(--spacing) * 2);
          border: 0;
          background: var(--ctl-surface);
          font: inherit;
          text-align: start;
          cursor: pointer;
        }
        .kf-cal .kf-calendar-year-cell:hover { background: var(--ctl-raise); }
        .kf-cal .kf-calendar-year-cell[aria-current="true"] {
          background: var(--brand-100);
          box-shadow: inset 0 0 0 1px var(--brand-600);
        }
        .kf-cal .kf-calendar-year-label {
          font-family: var(--font-mono);
          font-size: var(--text-2xs);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ctl-fg-muted);
        }
        /* inside a twelfth of the width a run gets its name and its date and nothing else */
        .kf-cal .kf-calendar-year-run {
          position: static;
          inset: auto;
          gap: 2px;
        }
        .kf-cal .kf-calendar-year-more {
          font-size: var(--text-2xs);
          color: var(--ctl-fg-muted);
        }
        @media (max-width: 1100px) {
          .kf-cal .kf-calendar-year-track { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }
        @media (max-width: 680px) {
          .kf-cal .kf-calendar-year-track { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        .kf-cal .kf-calendar-cell-event[style*="--calendar-event-wash"] {
          background: var(--calendar-event-wash);
          border-inline-start: 3px solid var(--calendar-event-color);
          border-radius: calc(var(--radius) * 0.4);
          padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
        }
        .kf-cal .kf-calendar-cell-event-title,
        .kf-cal .kf-calendar-cell-event-meta {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .kf-cal .kf-calendar-cell-event-meta {
          color: var(--ctl-fg-muted);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-regular);
          -webkit-line-clamp: 1;
        }
        .kf-cal .kf-calendar-event-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 auto;
          border-radius: 999px;
          background: var(--calendar-event-color);
        }
        .kf-cal .kf-calendar-destinations .kf-calendar-cell-event {
          display: grid;
          grid-template-columns: 7px minmax(0, 1fr);
          align-content: start;
          align-items: baseline;
          column-gap: 6px;
        }
        .kf-cal .kf-calendar-destinations .kf-calendar-cell-event-meta {
          grid-column: 1 / span 2;
        }
        .kf-cal .kf-calendar-destinations .kf-calendar-cell-event-title {
          -webkit-line-clamp: 1;
        }
        .kf-cal .kf-calendar-today-label,
        .kf-cal .kf-calendar-next-label {
          color: var(--brand-text);
          font-size: var(--text-2xs);
          font-weight: var(--font-weight-semibold);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
        }
        .kf-cal .kf-calendar-today-label {
          position: absolute;
          top: 10px;
          right: 10px;
        }
        .kf-cal .kf-calendar-next-label {
          margin-top: 2px;
          color: var(--success-600);
        }
        .kf-cal .kf-calendar-reader .kf-calendar-month-cell[data-today="true"] {
          color: var(--brand-text);
          border-color: var(--brand-600);
          box-shadow: inset 0 0 0 1px var(--brand-600);
        }
        .kf-cal .kf-calendar-detail {
          flex: 0 0 auto;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--ctl-border);
        }
        .kf-cal .kf-calendar-detail-row {
          position: relative;
          margin-top: 10px;
          padding-left: 18px;
        }
        .kf-cal .kf-calendar-detail-row::before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 4px;
          content: "";
          background: var(--calendar-event-color);
          border-radius: 999px;
        }
        @media (max-width: 767px) {
          .kf-cal .rbc-toolbar {
            align-items: stretch;
          }
          .kf-cal .rbc-toolbar-label {
            order: -1;
            padding-block: 4px;
          }
          .kf-cal .rbc-btn-group {
            justify-content: center;
          }
          .kf-cal .kf-calendar-custom-header {
            grid-template-columns: minmax(0, 1fr);
          }
          .kf-cal .kf-calendar-header-meta,
          .kf-cal .kf-calendar-nav {
            grid-column: 1;
            grid-row: auto;
            justify-self: start;
          }
          .kf-cal .kf-calendar-weekday,
          .kf-cal .kf-calendar-month-cell {
            padding-inline: 5px;
          }
          .kf-cal .kf-calendar-cell-event,
          .kf-cal .kf-calendar-event-stack {
            inset-inline: 5px;
          }
          .kf-cal .kf-calendar-cell-event {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
}
