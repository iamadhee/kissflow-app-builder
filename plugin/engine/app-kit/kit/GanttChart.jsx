// GENERATED from starter/src/components/kit/GanttChart.jsx (sha256:91c38369df78a222). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import React from "react";
import { cn as cx } from "./cn.js";

/**
 * GanttChart — date overlap for a small, decision-ready plan set.
 *
 * The active theme chooses between a compact status timeline and a richer
 * approval-aware schedule. Both views share this task contract:
 *   { id, name, start, end, status, approved?, tone?, color?, ink? }
 *
 * Dates are normalized in UTC so bars do not move by a day when a prototype is
 * opened in a different timezone. The component is intentionally read-only by
 * default; pass onTaskClick when the schedule is also a navigation surface.
 */

const DAY = 24 * 60 * 60 * 1000;
const APPROVED_STATUSES = new Set(["approved", "in progress", "completed"]);

function dateValue(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  const raw = String(value || "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const stamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(stamp) ? stamp : null;
}

const monthStart = (stamp) => {
  const date = new Date(stamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
};

const addMonths = (stamp, count = 1) => {
  const date = new Date(stamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1);
};

const pct = (stamp, start, span) => Math.max(0, Math.min(100, (stamp - start) / span * 100));
const monthLabel = (stamp) => new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(stamp));
const dayLabel = (stamp) => new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" }).format(new Date(stamp));
const shortDate = (stamp) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(stamp));

function taskTone(task) {
  if (task.tone) return task.tone;
  const status = task.status.toLowerCase();
  if (status === "approved" || status === "completed") return "success";
  if (status === "in progress") return "progress";
  if (status === "submitted") return "warning";
  if (status === "sent back" || status === "rejected") return "danger";
  return "neutral";
}

function toneFill(task) {
  if (task.color) return task.color;
  return {
    success: "var(--success-600)",
    progress: "color-mix(in oklab, var(--success-600) 76%, var(--ctl-fg))",
    warning: "var(--warning-600)",
    danger: "var(--danger-600)",
    info: "var(--info-600)",
    neutral: "var(--chart-1)",
  }[taskTone(task)] || "var(--chart-1)";
}

function toneInk(task) {
  if (task.ink) return task.ink;
  return {
    success: "var(--success-fg, var(--ctl-surface))",
    progress: "var(--success-fg, var(--ctl-surface))",
    warning: "var(--warning-fg, var(--ctl-fg))",
    danger: "var(--danger-fg, var(--ctl-surface))",
    info: "var(--info-fg, var(--ctl-surface))",
    neutral: "var(--chart-1-fill-ink, var(--ctl-fg))",
  }[taskTone(task)] || "var(--chart-1-fill-ink, var(--ctl-fg))";
}

function normalizeTasks(tasks) {
  return (Array.isArray(tasks) ? tasks : [])
    .map((task, index) => {
      if (!task) return null;
      const start = dateValue(task.start);
      const end = dateValue(task.end);
      if (start == null || end == null) return null;
      const status = String(task.status || "Draft");
      return {
        ...task,
        id: String(task.id ?? index),
        name: String(task.name || "Untitled plan"),
        status,
        start: Math.min(start, end),
        end: Math.max(start, end),
        unapproved: task.approved == null
          ? !APPROVED_STATUSES.has(status.toLowerCase())
          : !Boolean(task.approved),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start || a.end - b.end || a.name.localeCompare(b.name));
}

function GanttChart({
  tasks = [],
  variant = "theme",
  title = "Plan schedule",
  subtitle,
  today = new Date(),
  startDate,
  endDate,
  height,
  onTaskClick,
  className,
}) {
  const items = normalizeTasks(tasks);

  if (!items.length) {
    return (
      <div
        className={cx("grid min-h-40 place-items-center rounded-lg border border-dashed border-ctl-border text-sm text-ctl-fg-muted", className)}
        style={{ minHeight: height }}
        data-kf-component="gantt-chart"
        data-gantt-variant={variant}
      >
        Nothing scheduled yet.
      </div>
    );
  }

  const firstTask = Math.min(...items.map((task) => task.start));
  const lastTask = Math.max(...items.map((task) => task.end));
  const requestedStart = dateValue(startDate);
  const requestedEnd = dateValue(endDate);
  const rangeStart = requestedStart ?? monthStart(firstTask);
  const rangeEndCandidate = requestedEnd ?? lastTask;
  const rangeEnd = Math.max(rangeStart + DAY, rangeEndCandidate);
  const span = rangeEnd - rangeStart;
  const todayStamp = dateValue(today);
  const todayPosition = todayStamp != null && todayStamp >= rangeStart && todayStamp <= rangeEnd
    ? pct(todayStamp, rangeStart, span)
    : null;

  const months = [];
  for (let cursor = monthStart(rangeStart); cursor < rangeEnd;) {
    const next = addMonths(cursor);
    const visibleStart = Math.max(cursor, rangeStart);
    const visibleEnd = Math.min(next, rangeEnd);
    months.push({
      label: monthLabel(cursor),
      left: pct(visibleStart, rangeStart, span),
      width: Math.max(0, (visibleEnd - visibleStart) / span * 100),
    });
    cursor = next;
  }

  const ticks = [];
  for (let cursor = rangeStart; cursor <= rangeEnd; cursor += 14 * DAY) {
    ticks.push({ value: cursor, left: pct(cursor, rangeStart, span) });
  }

  const unapprovedCount = items.filter((task) => task.unapproved).length;
  const rangeSummary = subtitle || `${items.length} open plan${items.length === 1 ? "" : "s"} · ${shortDate(firstTask)} to ${shortDate(lastTask)}`;
  const accessibleLabel = items
    .map((task) => `${task.name}: ${shortDate(task.start)} to ${shortDate(task.end)}, ${task.status}${task.unapproved ? ", not approved" : ""}`)
    .join("; ");

  return (
    <div
      className={cx("min-w-0 text-ctl-fg", className)}
      style={{ minHeight: height }}
      data-kf-component="gantt-chart"
      data-gantt-variant={variant}
      role="group"
      aria-label={`${title}. ${accessibleLabel}`}
    >
      <div
        className="mb-5 items-start justify-between gap-4"
        style={{ display: "var(--gantt-header-display, none)", gridTemplateColumns: "minmax(0, 1fr) auto" }}
      >
        <div className="min-w-0">
          <h3 className="m-0 font-display text-xl font-semibold tracking-tight text-ctl-fg">{title}</h3>
          <p className="m-0 mt-1 text-sm text-ctl-fg-muted">{rangeSummary}</p>
        </div>
        {unapprovedCount ? (
          <span className="rounded-full bg-danger-100 px-3 py-2 text-sm font-semibold text-danger-text">
            {unapprovedCount} start unapproved
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <div className="w-full" style={{ minWidth: "var(--gantt-min-width, 58rem)" }}>
          <div
            className="grid gap-x-6"
            style={{
              gridTemplateColumns: "var(--gantt-label-column, minmax(15rem, 22rem)) minmax(0, 1fr)",
              borderBottom: "1px solid var(--ctl-track)",
            }}
          >
            <span aria-hidden="true" />
            <div className="relative" style={{ height: "var(--gantt-axis-height, 5rem)" }}>
              {months.map((month) => (
                <span
                  key={`${month.label}-${month.left}`}
                  className="absolute top-0 font-data-emphasis font-semibold uppercase tracking-[.08em] text-ctl-fg-muted"
                  style={{ left: `${month.left}%`, width: `${month.width}%`, fontSize: "var(--gantt-month-size, var(--text-sm))" }}
                >
                  {month.label}
                </span>
              ))}
              <div className="absolute inset-x-0 bottom-2 h-5" style={{ display: "var(--gantt-ticks-display, none)" }}>
                {ticks.map((tick) => (
                  <span
                    key={tick.value}
                    className="absolute -translate-x-1/2 text-xs tabular-nums text-ctl-fg-muted"
                    style={{ left: `${tick.left}%` }}
                  >
                    {dayLabel(tick.value)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div role="list" aria-label="Scheduled plans">
            {items.map((task) => {
              const left = pct(task.start, rangeStart, span);
              const width = Math.max(0.75, (task.end - task.start) / span * 100);
              const barProps = onTaskClick
                ? { as: "button", type: "button", onClick: () => onTaskClick(task) }
                : { as: "div" };
              const Bar = barProps.as;
              const taskColor = toneFill(task);
              const taskInk = toneInk(task);
              return (
                <div
                  key={task.id}
                  role="listitem"
                  className="grid gap-x-6"
                  style={{
                    gridTemplateColumns: "var(--gantt-label-column, minmax(15rem, 22rem)) minmax(0, 1fr)",
                    minHeight: "var(--gantt-row-height, 4.75rem)",
                  }}
                >
                  <div
                    className="flex min-w-0 items-center"
                    style={{
                      borderBottom: "var(--gantt-row-border-width, 0px) solid var(--ctl-track)",
                      color: task.unapproved ? "var(--gantt-unapproved-label-color, var(--ctl-fg-muted))" : "var(--ctl-fg-muted)",
                    }}
                    title={task.name}
                  >
                    <span className={cx("truncate text-sm", task.unapproved && "font-medium")}>{task.name}</span>
                  </div>
                  <div
                    className="relative"
                    style={{ borderBottom: "var(--gantt-row-border-width, 0px) solid var(--ctl-track)" }}
                  >
                    {ticks.map((tick) => (
                      <span
                        key={tick.value}
                        aria-hidden="true"
                        className="absolute inset-y-0 w-px bg-ctl-track"
                        style={{ display: "var(--gantt-grid-display, none)", left: `${tick.left}%` }}
                      />
                    ))}
                    {todayPosition != null ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 z-10 w-0.5 bg-danger-600"
                        style={{ left: `${todayPosition}%` }}
                      />
                    ) : null}
                    <Bar
                      {...(barProps.as === "button" ? { type: barProps.type, onClick: barProps.onClick } : {})}
                      className={cx(
                        "absolute top-1/2 z-20 flex -translate-y-1/2 items-center overflow-hidden px-3 text-left text-sm font-semibold transition-opacity",
                        onTaskClick && "cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring",
                      )}
                      style={{
                        "--gantt-task-color": taskColor,
                        "--gantt-task-ink": taskInk,
                        left: `${left}%`,
                        width: `${width}%`,
                        minWidth: "4.5rem",
                        maxWidth: `calc(100% - ${left}%)`,
                        height: "var(--gantt-bar-height, 2.5rem)",
                        borderRadius: "var(--gantt-bar-radius, var(--radius-lg))",
                        background: task.unapproved ? "var(--gantt-unapproved-bg, var(--gantt-task-color))" : taskColor,
                        borderColor: task.unapproved ? "var(--gantt-unapproved-border, var(--gantt-task-color))" : taskColor,
                        borderWidth: task.unapproved ? "var(--gantt-unapproved-border-width, 0px)" : "0px",
                        borderStyle: task.unapproved ? "var(--gantt-unapproved-border-style, solid)" : "solid",
                        color: task.unapproved
                          ? "var(--gantt-unapproved-ink, var(--gantt-bar-ink, oklch(1 0 0)))"
                          : "var(--gantt-bar-ink, oklch(1 0 0))",
                      }}
                      aria-label={`${task.name}, ${task.status}, ${shortDate(task.start)} to ${shortDate(task.end)}`}
                    >
                      <span className="truncate" style={{ display: "var(--gantt-status-display, block)" }}>{task.status}</span>
                      {task.unapproved ? (
                        <span className="truncate" style={{ display: "var(--gantt-unapproved-label-display, none)" }}>
                          {task.status.toLowerCase() === "draft" ? "Draft, not approved" : "Not approved"}
                        </span>
                      ) : null}
                    </Bar>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export { GanttChart };
export default GanttChart;
